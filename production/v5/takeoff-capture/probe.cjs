// Exploratory probe: open the SPA against the fixture server, screenshot, dump console.
const { chromium } = require(require.resolve('@playwright/test', { paths: ['/home/ubuntu/code/officeadmin-books'] }));
const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'out/probe.png');
const W = Number(process.argv[3] || 1920), H = Number(process.argv[4] || 1080), DSF = Number(process.argv[5] || 1);
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/ubuntu/.agent-browser/chrome-current',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF });
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === '127.0.0.1' || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
    if (u.pathname === '/api/telemetry') { try { for (const e of JSON.parse(route.request().postData()).events) console.log('TEL', e.kind, e.message, e.route||''); } catch {} return route.fulfill({status:204}); }
    console.log('BLOCKED', route.request().url());
    return route.abort();
  });
  const page = await ctx.newPage();
  page.on('console', (m) => console.log('console.' + m.type(), m.text().slice(0, 300)));
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto('http://127.0.0.1:4317/takeoff/?project=film-calder&workspace=ws-calder-e1&user=crew-ray&userName=Ray%20Ochoa');
  await page.waitForTimeout(Number(process.env.WAIT||30000));
  if (process.env.RELOAD) { console.log('--- RELOAD'); await page.reload(); await page.waitForTimeout(Number(process.env.WAIT||30000)); }
  await page.screenshot({ path: OUT });
  const gl = await page.evaluate(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl'); return g ? g.getParameter(g.RENDERER) : 'none'; });
  console.log('GL', gl);
  await browser.close();
})();
