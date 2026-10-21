const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, process.env.TEST_DIST ? '../dist' : '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto(process.env.SITE_TEST_URL || 'http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 390, 430, 768, 900, 960, 1024, 1100, 1280, 1366, 1440, 1600, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const lines = await page.locator('#hero-title').evaluate(el => {
        const nodes = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = nodes.nextNode())) {
          const start = node.textContent.indexOf('protegê-la.');
          if (start < 0) continue;
          const range = document.createRange();
          range.setStart(node, start); range.setEnd(node, start + 'protegê-la.'.length);
          return [...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top));
        }
        return [];
      });
      assert.equal(new Set(lines).size, 1, 'The word protegê-la must stay together at width ' + width + ': ' + JSON.stringify(lines));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow at ' + width);
    }
    console.log('PASS: protegê-la stays together without overflow at 14 responsive widths.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
