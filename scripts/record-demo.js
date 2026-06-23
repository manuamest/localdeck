// Record a Localdeck demo and convert it to a GIF for the README.
// Usage: node scripts/record-demo.js  (run from repo root)
'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'frontend', 'dist');
const VIDEOS_DIR = path.join(__dirname, '.videos');
const OUTPUT_GIF = path.join(ROOT, 'docs', 'demo.gif');
const PORT = 5055;

// ── static file server ──────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
      let file = path.join(DIST_DIR, urlPath);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        file = path.join(DIST_DIR, 'index.html');
      }
      try {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
      } catch {
        res.writeHead(404).end('not found');
      }
    });
    server.listen(PORT, () => resolve(server));
    server.on('error', reject);
  });
}

// ── mock data ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

function svc(id, title, port, runtime, framework, source = 'http_probe', ms = 12) {
  return {
    id, title,
    url: `http://localhost:${port}`,
    display_url: `http://localhost:${port}`,
    host: 'localhost',
    port,
    protocol: 'http',
    status_code: 200,
    response_time_ms: ms,
    favicon_url: null,
    source,
    runtime_hint: runtime,
    framework_hint: framework,
    confidence: 0.9,
    evidence: [],
    last_seen: now,
    last_checked: now,
    error: null,
  };
}

const SERVICES = [
  svc('http-localhost-3000', 'React App',      3000, 'javascript', 'react',   'http_probe', 14),
  svc('http-localhost-5173', 'Vite Dev Server',5173, 'javascript', 'vite',    'http_probe',  9),
  svc('http-localhost-8000', 'FastAPI',        8000, 'python',     'fastapi', 'http_probe',  8),
  svc('http-localhost-8080', 'Django Admin',   8080, 'python',     'django',  'http_probe', 21),
  svc('http-localhost-9443', 'Portainer',      9443, 'docker',     'unknown', 'docker',     18),
  svc('http-localhost-7860', 'Gradio',         7860, 'ml',         'gradio',  'http_probe', 35),
];

const RESPONSE = JSON.stringify({ scanned_at: now, scan_interval: 10, services: SERVICES });

// ── helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function typeSlowly(page, text, delay = 75) {
  await page.keyboard.type(text, { delay });
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting static server on port', PORT);
  const server = await startServer();

  fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 780 },
    recordVideo: { dir: VIDEOS_DIR, size: { width: 1280, height: 780 } },
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  // Intercept API routes (must match full URL — use glob patterns)
  await page.route('**/api/services', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: RESPONSE }));
  await page.route('**/api/scan',     (r) => r.fulfill({ status: 200, contentType: 'application/json', body: RESPONSE }));
  await page.route('**/health',       (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }));
  await page.route('**/api/favicon**',(r) => r.fulfill({ status: 404 }));

  // ── demo ──────────────────────────────────────────────────────────────────

  console.log('Loading app...');
  await page.goto(`http://localhost:${PORT}`);
  await page.waitForSelector('.service-card');

  // Show the full dashboard
  await sleep(2200);

  // Filter: JavaScript
  console.log('Filter → JavaScript');
  await page.click('button:has-text("JavaScript")');
  await sleep(1600);

  // Filter: Python
  console.log('Filter → Python');
  await page.click('button:has-text("Python")');
  await sleep(1600);

  // Filter: Docker
  console.log('Filter → Docker');
  await page.click('button:has-text("Docker")');
  await sleep(1300);

  // Filter: All
  console.log('Filter → All');
  await page.click('button:has-text("All")');
  await sleep(1000);

  // Sort: Name
  console.log('Sort → Name');
  await page.click('button:has-text("Name")');
  await sleep(1000);

  // Sort: Port
  console.log('Sort → Port');
  await page.click('button:has-text("Port")');
  await sleep(800);

  // Open add form
  console.log('Open + form');
  await page.click('button[aria-label="Add service"]');
  await sleep(700);

  // Type URL
  console.log('Type URL');
  await page.focus('input[placeholder*="URL"]');
  await typeSlowly(page, 'http://localhost:7777');
  await sleep(450);

  // Tab to name field
  await page.focus('input[placeholder*="Name"]');
  await typeSlowly(page, 'My Dev Tool');
  await sleep(450);

  // Submit
  console.log('Add service');
  await page.click('button[type="submit"]:has-text("Add")');
  await sleep(1600);

  // Star React App (first card)
  console.log('Star React App');
  const reactCard = page.locator('.service-card').first();
  await reactCard.locator('button[title="Add to favorites"]').click();
  await sleep(1600);

  // Star FastAPI
  console.log('Star FastAPI');
  const fastapiCard = page.locator('.service-card:has-text("FastAPI")');
  await fastapiCard.locator('button[title="Add to favorites"]').click();
  await sleep(2000);

  // ── save video ────────────────────────────────────────────────────────────

  await page.close();
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  server.close();

  console.log('Video:', videoPath);

  // ── convert to gif ────────────────────────────────────────────────────────

  console.log('Converting to GIF...');
  execSync(
    `ffmpeg -y -i "${videoPath}" \
      -vf "fps=15,scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
      -loop 0 "${OUTPUT_GIF}"`,
    { stdio: 'inherit' }
  );

  console.log('Done →', OUTPUT_GIF);
}

main().catch((err) => { console.error(err); process.exit(1); });
