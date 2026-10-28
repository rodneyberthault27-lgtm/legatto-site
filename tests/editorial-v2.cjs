const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
const root = path.resolve(__dirname, '../dist');
const prefix = '/legatto-site/';
const server = http.createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname;
  if (!name.startsWith(prefix)) { res.writeHead(404); res.end(); return; }
  const file = path.resolve(root, name.slice(prefix.length) || 'index.html');
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream' });
    res.end(error ? 'Not found' : data);
  });
});
const out = process.env.QA_OUTPUT;
const capture = async (page, name) => { if (out) await page.screenshot({ path: path.join(out, name + '.png') }); };
const jump = async (page, selector) => {
  await page.locator(selector).evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 184, behavior: 'instant' }));
  await page.waitForTimeout(350);
};
(async () => {
  let browser;
  if (out) fs.mkdirSync(out, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:' + server.address().port + prefix;
  try {
    browser = await playwright.chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    for (const [width, height] of [[1440, 1000], [1024, 768], [390, 844], [360, 640], [320, 640]]) {
      for (const motion of ['no-preference', 'reduce']) {
        const page = await browser.newPage({ viewport: { width, height }, reducedMotion: motion });
        await page.addInitScript(() => { Element.prototype.requestPointerLock = () => {}; Element.prototype.setPointerCapture = () => {}; });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
        await page.goto(base, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1200);
        await capture(page, `${width}-${motion}-hero`);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        assert.equal(await page.locator('#solution-filter-status').evaluate(el => el.offsetHeight), 1, 'Status is available to screen readers without taking layout space');
        await jump(page, '#solucoes');
        const filters = page.locator('[data-solution-filter]');
        assert.equal(await filters.count(), 3);
        for (const [key, count] of [['pessoal', 5], ['empresarial', 1], ['todos', 6]]) {
          const button = page.locator(`[data-solution-filter="${key}"]`);
          await button.focus();
          await page.keyboard.press('Enter');
          assert.equal(await page.locator('.solutions-grid .solution-card:visible').count(), count);
          assert.equal(await button.getAttribute('aria-pressed'), 'true');
          const bounds = await button.boundingBox();
          assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1 && bounds.height >= 44, 'All filters fit and have adequate touch targets');
        }
        await capture(page, `${width}-${motion}-solutions`);
        await page.locator('[data-solution-filter="pessoal"]').click();
        await page.locator('[data-hero-profile="empresa"]').click();
        await page.waitForTimeout(1400);
        assert.equal(await page.locator('#empresa').isVisible(), true, 'Hero must unhide a previously filtered solution');
        assert.equal(await page.locator('#legatto-perfil').inputValue(), 'empresa');
        const target = await page.locator('#empresa').boundingBox();
        assert.ok(target.y >= (width >= 1024 ? 166 : width > 960 ? 92 : 76) && target.y < height, 'Hash target clears fixed navigation: ' + JSON.stringify({ width, height, target }));
        for (const profile of ['familia', 'empresa']) {
          await page.selectOption('#legatto-perfil', profile);
          for (const phase of ['conhecer', 'revisar', 'contratar']) {
            await page.selectOption('#legatto-momento', phase);
            const href = new URL(await page.locator('#profile-contact').getAttribute('href'));
            assert.equal(href.host, 'wa.me'); assert.equal(href.pathname, '/5511971371823');
            const message = href.searchParams.get('text');
            assert.ok(message.includes(profile === 'empresa' ? 'minha empresa' : 'minha família'));
            assert.ok(message.includes({ conhecer: 'conhecer as opções', revisar: 'quero revisar', contratar: 'contratar em breve' }[phase]));
          }
        }
        await jump(page, '#contato');
        await capture(page, `${width}-${motion}-contact`);
        for (const selector of ['.trust-intro', '.editorial-statement', '#como-funciona', '#sobre']) {
          await jump(page, selector); await capture(page, `${width}-${motion}-${selector.replace(/[^a-z-]/g, '')}`);
        }
        const assembly = await page.locator('.assembly').evaluate(el => ({ top: scrollY + el.getBoundingClientRect().top, height: el.offsetHeight, live: el.classList.contains('is-live'), offset: parseFloat(getComputedStyle(el.querySelector('.assembly-sticky')).top) || 0 }));
        if (motion === 'reduce') assert.equal(assembly.live, false);
        const transforms = [];
        for (const progress of [0, .25, .5, .75, 1]) {
          const y = assembly.live ? assembly.top - assembly.offset + progress * (assembly.height - height + assembly.offset) : assembly.top - 184;
          await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
          await page.waitForTimeout(200);
          transforms.push(await page.locator('.assembly-piece').first().evaluate(el => getComputedStyle(el).transform));
          if (assembly.live) {
            const heading = await page.locator('#journey-title').boundingBox();
            const frame = await page.locator('.assembly-frame').boundingBox();
            assert.ok(heading.y >= assembly.offset - 1 && heading.y + heading.height < height, 'Pinned copy clears both bars');
            assert.ok(frame.y >= assembly.offset - 1 && frame.y + frame.height <= height, 'Pinned photos fit the available screen');
          }
          await capture(page, `${width}-${motion}-assembly-${progress}`);
        }
        if (assembly.live) assert.ok(new Set(transforms).size >= 3, 'Assembly visibly progresses as the page scrolls');
        if (width < 961) {
          await page.locator('.menu-toggle').click();
          assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
          assert.equal(await page.locator('.menu-toggle').evaluate(el => el === document.activeElement), true);
        } else {
          await jump(page, '#solucoes');
          const header = await page.locator('.site-header').boundingBox(), chapters = await page.locator('.scroll-chapters').boundingBox();
          assert.ok(chapters.y >= header.y + header.height - 1, 'Chapter navigation cannot overlap the header');
        }
        assert.deepEqual(errors, []);
        await page.close();
        console.log(`PASS: editorial ${width}x${height}, ${motion}: filters, deep links, six diagnostic messages, sticky stage, menu, release assets.`);
      }
    }
    const fallback = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await fallback.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await fallback.locator('.solution-card:visible').count(), 6);
    assert.equal(await fallback.locator('.solution-filters').isVisible(), false);
    assert.equal(await fallback.locator('.diagnosis-strip').isVisible(), false);
    assert.equal(await fallback.locator('.contact-action a[href^="https://wa.me/"]').count(), 2);
    await fallback.close();
    console.log('PASS: no-JavaScript fallback retains solutions and direct contact without inactive scripted controls.');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
