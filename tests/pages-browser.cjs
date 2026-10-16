const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '../dist');
const prefix = '/legatto-site/';
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith(prefix)) { res.writeHead(404); res.end(); return; }
  const file = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    const ext = err ? '.html' : path.extname(file);
    res.writeHead(err ? 404 : 200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' })[ext] || 'application/octet-stream' });
    res.end(err ? fs.readFileSync(path.join(root, '404.html')) : data);
  });
});

(async () => {
  let browser;
  const remote = process.argv[2];
  if (!remote) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = remote || 'http://127.0.0.1:' + server.address().port + prefix;
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().includes('missing/test')) errors.push(r.status() + ': ' + r.url()); });
      assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200);
      const services = await page.locator('[data-service-details]').evaluateAll(links => links.map(a => a.href));
      assert.equal(new Set(services).size, 6);
      for (const url of [base, ...services]) {
        assert.equal((await page.goto(url, { waitUntil: 'networkidle' })).status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        assert.ok(canonical.startsWith('https://rodneyberthault27-lgtm.github.io/legatto-site/'));
        await page.locator('img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
        await page.waitForFunction(() => [...document.images].every(img => img.complete));
        assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(img => !img.naturalWidth).map(img => img.src)), []);
        const contact = new URL(await page.locator('.whatsapp-float').getAttribute('href'));
        assert.equal(contact.hostname, 'wa.me');
        assert.equal(contact.pathname, '/5511971371823');
        await page.locator('.accordion summary').first().click();
        assert.ok(await page.locator('.accordion details[open]').isVisible());
      }
      const response = await page.goto(base + 'missing/test', { waitUntil: 'networkidle' });
      assert.equal(response.status(), 404);
      assert.ok(await page.locator('h1').isVisible());
      assert.equal(await page.locator('.brand').getAttribute('href'), '/legatto-site/index.html');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: GitHub project path, home + six services, images, WhatsApp, FAQ, mobile, and nested 404: ' + base);
  } finally {
    if (browser) await browser.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
