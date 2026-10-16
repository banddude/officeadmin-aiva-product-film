// Local fixture server for the vendored OfficeAdmin takeoff SPA (ProTakeoff).
//
// Serves, on 127.0.0.1 only:
//   /takeoff/*             -> spa-copy/ (byte copy of officeadmin-books public/takeoff)
//   /electrical-symbols/*  -> symbols-copy/ (byte copy of officeadmin-books public/electrical-symbols)
//   GET /api/v1/projects/:id/takeoff                    -> { workspaces: [...] }
//   GET /api/v1/projects/:id/takeoff/:workspaceId       -> { workspace: { ..., data } }
//   GET /api/v1/projects/:id/takeoff/files/:fileId?raw=1 -> plan PDF bytes (Range aware)
//   GET /__stage/:n        control: which build stage the workspace blob reflects (0..6)
// Every non-GET request is rejected (405) and logged. Unknown routes 404 and are logged.
//
// Usage: node server.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || 4317);
const STORY = JSON.parse(fs.readFileSync(path.join(HERE, '../story-data.json'), 'utf8'));
const SYM = JSON.parse(fs.readFileSync(path.join(HERE, 'out/plan-symbols.json'), 'utf8'));
const PDF = fs.readFileSync(path.join(HERE, 'out/plan-e1.pdf'));
const LOG = path.join(HERE, 'out/server-requests.log');
fs.writeFileSync(LOG, '');

const PROJECT_ID = STORY.project.id; // film-calder
const WORKSPACE_ID = 'ws-calder-e1';
const FILE_ID = 'file-calder-e1';
const PAGE_ID = `${FILE_ID}:0`;
const LAYER_ID = 'layer-takeoff-calder';
const ZOOM = 1.5; // RENDER_ZOOM: world units = PDF points * 1.5

// Order = build order of the progression sequence. Names come from story-data.
const ITEMS = [
  { key: 'lights', symbolId: 'light-recessed', shape: 'light', group: 'Lighting', color: '#2563eb' },
  { key: 'gfci', symbolId: 'receptacle-gfci', shape: 'receptacle', group: 'Devices', color: '#16a34a' },
  { key: 'undercab', symbolId: 'light-linear', shape: 'light', group: 'Lighting', color: '#0891b2' },
  { key: 'dedicated', symbolId: 'receptacle-240v', shape: 'receptacle', group: 'Power & Distribution', color: '#9333ea' },
  { key: 'dimmers', symbolId: 'switch-dimmer', shape: 'switch', group: 'Devices', color: '#ea580c' },
  { key: 'ev', symbolId: 'ev-charger', shape: 'square', group: 'Power & Distribution', color: '#dc2626' },
];
const counts = STORY.takeoff.counts;
if (counts.length !== ITEMS.length) throw new Error('story-data counts mismatch');
ITEMS.forEach((it, i) => {
  it.name = counts[i].item;
  it.expected = counts[i].count;
  if (SYM.symbols[it.key].length !== it.expected) {
    throw new Error(`${it.key}: plan has ${SYM.symbols[it.key].length}, story says ${it.expected}`);
  }
});

let stage = ITEMS.length; // default: everything placed

function workspaceData() {
  const markups = ITEMS.map((it, i) => {
    const placed = i < stage;
    const pts = placed
      ? SYM.symbols[it.key].map(([x, y], j) => ({
          x: Math.round(x * ZOOM * 100) / 100,
          y: Math.round(y * ZOOM * 100) / 100,
          id: `${it.key}-${j + 1}`,
          // the third under-cabinet run is drawn vertically on the plan
          ...(it.key === 'undercab' && j === 2 ? { rotationDeg: 90 } : {}),
        }))
      : [];
    return {
      id: `mk-${it.key}`,
      type: 'count',
      paths: [pts],
      pageId: PAGE_ID,
      layerId: LAYER_ID,
      properties: {
        name: it.name,
        count: pts.length,
        shape: it.shape,
        color: it.color,
        group: it.group,
        unit: 'ea',
        unitCost: 0,
        qbItemName: null,
        ...(process.env.SYMBOLS === '1' ? { symbolId: it.symbolId } : {}),
      },
    };
  });
  return {
    id: WORKSPACE_ID,
    name: STORY.takeoff.workspace,
    pdfs: [{
      id: FILE_ID,
      name: 'Calder Residence E-1 Electrical Plan.pdf',
      pageCount: 1,
      url: `protakeoff://localhost/page/${FILE_ID}`,
      path: `books:${FILE_ID}`,
      fileSize: PDF.length,
      thumbnails: [],
      ingestionStatus: 'completed',
    }],
    markups: { [PAGE_ID]: markups },
    pageMetadata: {
      [PAGE_ID]: {
        name: 'E-1 Electrical Plan, Kitchen and Garage',
        scale: { id: 'arch-1-2', name: '1/2" = 1\'0"', category: 'architectural', pixelsPerFoot: 54, displayUnit: 'ft' },
        scaleAutoDetected: false,
        nameAutoDetected: false,
        scaleSymbolsToPlan: false,
      },
    },
    layers: [{
      id: LAYER_ID, name: 'Takeoff', ownerId: STORY.crew[0].id, ownerName: STORY.crew[0].name,
      color: '#2563eb', visible: true, isTakeoff: true,
    }],
    createdAt: '2026-10-13T16:05:00.000Z',
    // bump per stage so a revalidation would see the newer server copy
    updatedAt: new Date(Date.UTC(2026, 9, 13, 17, 0, stage)).toISOString(),
    oaVersion: 100 + stage,
  };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/plain' };

function log(line) { fs.appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`); }

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

function serveStatic(res, root, rel) {
  const p = path.normalize(path.join(root, rel));
  if (!p.startsWith(root)) return false;
  let f = p;
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) return false;
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    log(`REJECT ${req.method} ${req.url}`);
    return sendJson(res, 405, { error: 'read-only fixture server' });
  }
  let m;
  if ((m = p.match(/^\/__stage\/(\d+)$/))) {
    stage = Math.max(0, Math.min(ITEMS.length, Number(m[1])));
    log(`STAGE ${stage}`);
    return sendJson(res, 200, { stage });
  }
  if (p.startsWith('/takeoff/') || p === '/takeoff') {
    log(`STATIC ${p}`);
    if (serveStatic(res, path.join(HERE, 'spa-copy'), p.replace(/^\/takeoff\/?/, ''))) return;
  }
  if (p.startsWith('/electrical-symbols/')) {
    log(`STATIC ${p}`);
    if (serveStatic(res, path.join(HERE, 'symbols-copy'), p.replace(/^\/electrical-symbols\//, ''))) return;
  }
  const base = `/api/v1/projects/${PROJECT_ID}/takeoff`;
  if (p === base) {
    log(`API index`);
    const d = workspaceData();
    return sendJson(res, 200, { workspaces: [{ id: d.id, name: d.name, createdAt: d.createdAt, updatedAt: d.updatedAt }] });
  }
  if (p === `${base}/${WORKSPACE_ID}`) {
    log(`API workspace stage=${stage}`);
    const d = workspaceData();
    return sendJson(res, 200, { workspace: { id: d.id, projectId: PROJECT_ID, name: d.name, data: d, version: d.oaVersion, createdAt: d.createdAt, updatedAt: d.updatedAt } });
  }
  if (p === `${base}/files/${FILE_ID}`) {
    log(`API file ${url.search} range=${req.headers.range || '-'}`);
    const total = PDF.length;
    const range = req.headers.range && /bytes=(\d+)-(\d*)/.exec(req.headers.range);
    const headers = { 'Content-Type': 'application/pdf', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': end - start + 1 });
      return res.end(PDF.subarray(start, end + 1));
    }
    res.writeHead(200, { ...headers, 'Content-Length': total });
    return res.end(PDF);
  }
  log(`404 ${req.url}`);
  return sendJson(res, 404, { error: 'not stubbed' });
});

server.listen(PORT, '127.0.0.1', () => console.log(`fixture server on http://127.0.0.1:${PORT}`));
