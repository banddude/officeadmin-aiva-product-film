// Drive headless Chrome against the fixture server and capture the real takeoff SPA.
//
// usage: node capture.cjs <shot> [outPath]
//   shots: desktop | zoom | mobile | build-N (N = 0..6) | all
// Requires server.mjs running on 127.0.0.1:4317.
const { chromium } = require(require.resolve('@playwright/test', { paths: ['/home/ubuntu/code/officeadmin-books'] }));
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.resolve(__dirname, '../../..');
const UI = path.join(ROOT, 'public/ui-v5');
const QA = path.join(ROOT, 'qa/v5');
const BASE = 'http://127.0.0.1:4317';
const URL_ = `${BASE}/takeoff/?project=film-calder&workspace=ws-calder-e1&user=crew-ray&userName=Ray%20Ochoa`;
const CHROME = '/home/ubuntu/.agent-browser/chrome-current';
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--font-render-hinting=none'];
const ZOOM = 1.5; // SPA RENDER_ZOOM (world px per PDF pt)
const SHEET = { w: 1728 * ZOOM, h: 1296 * ZOOM };
const log = [];
const say = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };

const getJson = (u) => new Promise((res, rej) => http.get(u, (r) => { let b = ''; r.on('data', (d) => (b += d)); r.on('end', () => res(JSON.parse(b))); }).on('error', rej));

async function openSpa(browser, { width, height, dsf, mobile }) {
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: dsf,
    ...(mobile ? { isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1' } : {}),
    colorScheme: 'light',
  });
  const events = [];
  // Hard network fence: only the local fixture server. The SPA's telemetry
  // beacon (https://officeadmin.io/api/telemetry) is intercepted in-browser and
  // answered 204 locally (recorded, never sent). Everything else external is aborted.
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.origin === BASE || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
    if (u.hostname === 'officeadmin.io' && u.pathname === '/api/telemetry') {
      try { for (const e of JSON.parse(route.request().postData()).events) events.push(e.message + ' ' + (e.route || '')); } catch { /* ignore */ }
      return route.fulfill({ status: 204 });
    }
    say('BLOCKED external', route.request().url());
    return route.abort();
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => say('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) say('console.error', m.text().slice(0, 200)); });
  await page.goto(URL_);
  const t0 = Date.now();
  while (!events.some((e) => e.startsWith('takeoff:page-load-end'))) {
    if (Date.now() - t0 > 120000) throw new Error('plan never rendered: ' + events.join(' | '));
    await page.waitForTimeout(500);
  }
  say(`plan rendered in ${Date.now() - t0}ms`);
  await page.waitForTimeout(2500);
  return { ctx, page, events };
}

// Track the SPA's world transform analytically. After the SPA's own fitToScreen:
//   scale = min(W/sheetW, H/sheetH) * 0.9, centered (CanvasMap fitToScreen).
function fitTransform(W, H) {
  const s = Math.min(W / SHEET.w, H / SHEET.h) * 0.9;
  return { s, x: (W - SHEET.w * s) / 2, y: (H - SHEET.h * s) / 2 };
}

// Move the view so world rect (PDF points) fills screen rect, using only the
// SPA's own wheel handlers: ctrl+wheel = zoom about cursor, plain wheel = pan.
async function frame(page, T, worldPt, screen) {
  const wx0 = worldPt.x0 * ZOOM, wy0 = worldPt.y0 * ZOOM, wx1 = worldPt.x1 * ZOOM, wy1 = worldPt.y1 * ZOOM;
  const target = Math.min((screen.x1 - screen.x0) / (wx1 - wx0), (screen.y1 - screen.y0) / (wy1 - wy0));
  // zoom about canvas point (100,100)
  const ax = 100, ay = 100;
  await page.mouse.move(ax, ay);
  await page.keyboard.down('Control');
  let guard = 0;
  while (Math.abs(target / T.s - 1) > 0.002 && guard++ < 80) {
    const k = target / T.s;
    let dy, f;
    if (k > 1) { const kk = Math.min(k, 1.3); dy = -(kk - 1) / 0.007; f = kk; } else { const kk = Math.max(k, 1 / 1.3); dy = (1 / kk - 1) / 0.007; f = kk; }
    await page.mouse.wheel(0, dy);
    await page.waitForTimeout(120);
    const wx = (ax - T.x) / T.s, wy = (ay - T.y) / T.s;
    T.s = T.s * f; T.x = ax - wx * T.s; T.y = ay - wy * T.s;
  }
  await page.keyboard.up('Control');
  // pan: center world rect in screen rect
  const cxW = (wx0 + wx1) / 2, cyW = (wy0 + wy1) / 2;
  const cxS = (screen.x0 + screen.x1) / 2, cyS = (screen.y0 + screen.y1) / 2;
  const wantX = cxS - cxW * T.s, wantY = cyS - cyW * T.s;
  await page.mouse.move(ax, ay);
  await page.mouse.wheel(T.x - wantX, T.y - wantY);
  T.x = wantX; T.y = wantY;
  await page.waitForTimeout(6000); // hi-res tile re-render
  return T;
}


// Phone framing through the SPA's own touch handlers: two-finger pinch about a
// fixed midpoint (pure zoom), then a one-finger drag (pure pan).
async function touchFrame(page, T, worldPt, screen) {
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1 })) });
  const wx0 = worldPt.x0 * ZOOM, wy0 = worldPt.y0 * ZOOM, wx1 = worldPt.x1 * ZOOM, wy1 = worldPt.y1 * ZOOM;
  const target = Math.min((screen.x1 - screen.x0) / (wx1 - wx0), (screen.y1 - screen.y0) / (wy1 - wy0));
  const M = [215, 466];
  let guard = 0;
  while (Math.abs(target / T.s - 1) > 0.003 && guard++ < 10) {
    const k = Math.min(Math.max(target / T.s, 1 / 3), 3);
    const d0 = k >= 1 ? 60 : 180, d1 = d0 * k;
    const at = (d) => [[M[0] - d / 2, M[1]], [M[0] + d / 2, M[1]]];
    await touch('touchStart', at(d0));
    for (let i = 1; i <= 12; i++) { await touch('touchMove', at(d0 + (d1 - d0) * i / 12)); await page.waitForTimeout(16); }
    await touch('touchEnd', []);
    await page.waitForTimeout(150);
    const wx = (M[0] - T.x) / T.s, wy = (M[1] - T.y) / T.s;
    T.s *= k; T.x = M[0] - wx * T.s; T.y = M[1] - wy * T.s;
  }
  const wantX = (screen.x0 + screen.x1) / 2 - ((wx0 + wx1) / 2) * T.s;
  const wantY = (screen.y0 + screen.y1) / 2 - ((wy0 + wy1) / 2) * T.s;
  const dx = wantX - T.x, dy = wantY - T.y;
  const S = [215, 466];
  await touch('touchStart', [S]);
  for (let i = 1; i <= 15; i++) { await touch('touchMove', [[S[0] + dx * i / 15, S[1] + dy * i / 15]]); await page.waitForTimeout(16); }
  await touch('touchEnd', []);
  T.x = wantX; T.y = wantY;
  await page.waitForTimeout(6000);
  return T;
}

async function resizeTable(page, toY) {
  // drag the docked markup table's resize handle (top edge of the panel)
  const handle = page.locator('div.cursor-row-resize').first();
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + 400, box.y + 1);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, toY, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
}

async function assertNoErrors(page) {
  const bad = await page.evaluate(() => {
    const t = document.body.innerText;
    return ['Couldn\'t start the plan viewer', 'Failed to load', 'Sign in', 'Log in', 'Not saved', 'Save failed', 'error']
      .filter((w) => t.includes(w));
  });
  if (bad.length) say('WARN visible text:', bad.join(', '));
  return bad;
}

async function tableCounts(page) {
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll('tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => td.innerText.trim()));
    return rows.filter((r) => r.length >= 3 && /count$/.test(r[2] || '')).map((r) => `${r[1]}=${r[2]}`);
  });
}

async function shotDesktop(browser, out, { stage = 6, tableY = 690 } = {}) {
  await getJson(`${BASE}/__stage/${stage}`);
  const { ctx, page } = await openSpa(browser, { width: 1920, height: 1080, dsf: 2 });
  await resizeTable(page, tableY);
  const T = fitTransform(1920, 1080);
  // building plan incl. dimension strings, PDF pts
  await frame(page, T, { x0: 72, y0: 92, x1: 1392, y1: 832 }, { x0: 70, y0: 56, x1: 1910, y1: tableY - 8 });
  await page.mouse.move(30, 700);
  const counts = await tableCounts(page);
  say('table', JSON.stringify(counts));
  await assertNoErrors(page);
  await page.screenshot({ path: out });
  await ctx.close();
  return counts;
}

async function shotZoom(browser, out) {
  await getJson(`${BASE}/__stage/6`);
  const { ctx, page } = await openSpa(browser, { width: 1920, height: 1080, dsf: 2 });
  await resizeTable(page, 650);
  await page.getByTitle('Collapse Panel').click();
  await page.waitForTimeout(1000);
  const T = fitTransform(1920, 1080);
  // kitchen: north counter to island, PDF pts
  await frame(page, T, { x0: 585, y0: 140, x1: 1352, y1: 660 }, { x0: 60, y0: 52, x1: 1920, y1: 1050 });
  await page.mouse.move(1700, 24); // park over the toolbar; the canvas draws a guide at the pointer
  say('table', JSON.stringify(await tableCounts(page)));
  await assertNoErrors(page);
  await page.screenshot({ path: out });
  await ctx.close();
}

async function shotMobile(browser, out) {
  await getJson(`${BASE}/__stage/6`);
  const { ctx, page } = await openSpa(browser, { width: 430, height: 932, dsf: 3, mobile: true });
  const cr = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  say('mobile canvas rect', JSON.stringify(cr));
  const T = fitTransform(cr.w, cr.h); T.x += cr.x; T.y += cr.y; // client coords
  await touchFrame(page, T, { x0: 572, y0: 0, x1: 1364, y1: 1296 }, { x0: 0, y0: 100, x1: 430, y1: 900 });
  await assertNoErrors(page);
  await page.screenshot({ path: out });
  // open the phone item list (bottom-left list button) to show the counts
  const listBtn = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button')].filter((b) => { const r = b.getBoundingClientRect(); return r.left < 100 && r.top > 800; });
    return els.map((b) => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, b.getAttribute('aria-label') || b.title || b.innerText]; });
  });
  say('mobile bottom-left buttons', JSON.stringify(listBtn));
  if (listBtn.length) {
    await page.touchscreen.tap(listBtn[0][0], listBtn[0][1]);
    await page.waitForTimeout(1200);
    const expand = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, b.getAttribute('aria-label') || b.title || b.innerText.trim()]; }).filter((x) => x[1] > 800));
    say('mobile chip buttons', JSON.stringify(expand));
    const ex = expand.find((x) => /^open markup list/i.test(x[2]));
    if (ex) { await page.touchscreen.tap(ex[0], ex[1]); await page.waitForTimeout(1500); }
    say('mobile list', JSON.stringify(await page.evaluate(() => document.body.innerText.split('\n').filter((l) => /count|ea\b|^\d+$/.test(l)).slice(0, 30))));
    await assertNoErrors(page);
    await page.screenshot({ path: out.replace('.png', '-list.png') });
  }
  fs.writeFileSync(path.join(__dirname, 'out/mobile-dom.txt'), await page.evaluate(() => document.body.innerText));
  await ctx.close();
}

(async () => {
  const shot = process.argv[2] || 'desktop';
  const browser = await chromium.launch({ executablePath: CHROME, args: ARGS });
  try {
    if (shot === 'desktop' || shot === 'all') await shotDesktop(browser, process.argv[3] || path.join(UI, 'takeoff-desktop.png'));
    if (shot === 'zoom' || shot === 'all') await shotZoom(browser, process.argv[3] || path.join(UI, 'takeoff-desktop-zoom.png'));
    if (shot === 'mobile' || shot === 'all') await shotMobile(browser, process.argv[3] || path.join(UI, 'takeoff-mobile.png'));
    if (shot === 'build' || shot === 'all') {
      for (let n = 0; n <= 6; n++) {
        // build-00 = items listed at 0, nothing placed; build-0N = first N items placed.
        await shotDesktop(browser, path.join(UI, `takeoff-build-${String(n).padStart(2, '0')}.png`), { stage: n });
      }
    }
  } finally {
    await browser.close();
    await getJson(`${BASE}/__stage/6`).catch(() => {});
    fs.appendFileSync(path.join(QA, 'takeoff-capture.log'), `\n# ${new Date().toISOString()} shot=${shot}\n${log.join('\n')}\n`);
  }
})();
