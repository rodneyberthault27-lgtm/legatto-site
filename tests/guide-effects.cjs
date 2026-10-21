const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
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
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const shots = process.env.CAPTURE_GUIDE ? path.resolve(__dirname, '../../legatto-visual-qa') : null;
    if (shots) fs.mkdirSync(shots, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    const card = page.locator('.solution-card').first();
    await card.scrollIntoViewIfNeeded();
    const bounds = await card.boundingBox();
    await page.mouse.move(bounds.x + 40, bounds.y + 50);
    await page.waitForTimeout(80);
    const first = await card.evaluate(el => getComputedStyle(el, '::before').transform);
    await page.mouse.move(bounds.x + bounds.width - 40, bounds.y + 90);
    await page.waitForTimeout(80);
    const second = await card.evaluate(el => getComputedStyle(el, '::before').transform);
    assert.notEqual(first, second, 'Card light must follow the pointer inside the card');
    if (shots) await card.screenshot({ path: path.join(shots, 'guide-spotlight.png') });
    await card.locator('a').first().focus();
    assert.equal(await card.evaluate(el => el.matches(':focus-within')), true);
    assert.notEqual(await card.evaluate(el => getComputedStyle(el).outlineStyle), 'none', 'Keyboard users need a visible card focus treatment');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.move(bounds.x + 80, bounds.y + 100);
    const reduced = await card.evaluate(el => getComputedStyle(el, '::before').transform);
    await page.mouse.move(bounds.x + 200, bounds.y + 130);
    await page.waitForTimeout(80);
    assert.equal(await card.evaluate(el => getComputedStyle(el, '::before').transform), reduced, 'Reduced motion must disable pointer tracking');
    assert.deepEqual(errors, []);
    await page.close();
    console.log('PASS: pointer spotlight, keyboard focus and reduced-motion static treatment.');
    for (const preference of ['reduce', 'no-preference']) {
      const footer = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: preference });
      await footer.addInitScript(() => {
        window.particleDraws = 0;
        const clear = CanvasRenderingContext2D.prototype.clearRect;
        CanvasRenderingContext2D.prototype.clearRect = function (...args) {
          if (this.canvas.classList.contains('particle-canvas')) window.particleDraws++;
          return clear.apply(this, args);
        };
      });
      await footer.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await footer.locator('.particle-word .particle-label').count(), 1, 'Footer needs a semantic brand word beside its decorative canvas');
      assert.equal(await footer.locator('.particle-label').innerText(), 'LEGATTO');
      assert.equal(await footer.locator('.particle-canvas[aria-hidden="true"]').count(), 1);
      await footer.locator('.particle-word').scrollIntoViewIfNeeded();
      if (preference === 'no-preference') {
        await footer.waitForFunction(() => document.querySelector('.particle-word').dataset.state === 'animating');
        await footer.waitForFunction(() => {
          const canvas = document.querySelector('.particle-canvas');
          return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some((value, index) => index % 4 === 3 && value > 0);
        }, null, { timeout: 1000 });
        await footer.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await footer.waitForFunction(() => document.querySelector('.particle-word').dataset.state === 'paused');
        const paused = await footer.evaluate(() => window.particleDraws);
        await footer.waitForTimeout(180);
        assert.equal(await footer.evaluate(() => window.particleDraws), paused, 'Canvas must stop drawing when offscreen');
        await footer.locator('.particle-word').scrollIntoViewIfNeeded();
        if (shots) {
          await footer.waitForTimeout(1100);
          await footer.locator('.particle-word').screenshot({ path: path.join(shots, 'guide-particles.png') });
        }
      }
      await footer.waitForFunction(() => document.querySelector('.particle-word').dataset.state === 'complete');
      assert.equal(await footer.locator('.particle-label').evaluate(el => Number(getComputedStyle(el).opacity)), 1, 'Finished word must be crisp HTML, including reduced motion');
      const stopped = await footer.evaluate(() => window.particleDraws);
      await footer.waitForTimeout(180);
      assert.equal(await footer.evaluate(() => window.particleDraws), stopped, 'Finished effect must not keep a render loop running');
      if (shots && preference === 'no-preference') await footer.locator('footer').screenshot({ path: path.join(shots, 'guide-footer.png') });
      await footer.close();
    }
    console.log('PASS: visible particles form LEGATTO once, pause offscreen, stop completely and retain reduced-motion HTML.');
    const sections = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await sections.goto(base, { waitUntil: 'networkidle' });
    const heading = sections.locator('.faq .section-heading');
    await heading.scrollIntoViewIfNeeded();
    await sections.waitForFunction(() => document.querySelector('.faq .section-heading').dataset.revealState === 'animating', null, { timeout: 2500 });
    assert.ok(await heading.evaluate(el => Number(getComputedStyle(el).opacity)) >= .75, 'Section text must stay readable during its small entrance');
    await sections.waitForFunction(() => document.querySelector('.faq .section-heading').dataset.revealState === 'complete');
    assert.equal(await heading.evaluate(el => getComputedStyle(el).transform), 'none');
    await sections.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await heading.scrollIntoViewIfNeeded();
    assert.equal(await heading.getAttribute('data-reveal-state'), 'complete', 'Section entrance must not repeat');
    await sections.close();
    console.log('PASS: subtle section entrance remains readable, settles and runs once.');
    const source = await sharp(path.join(root, 'assets/hero-familia-recorte.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const body = { left: source.info.width, top: source.info.height, right: 0, bottom: 0 };
    for (let y = 0; y < source.info.height; y++) for (let x = 0; x < source.info.width; x++) {
      if (source.data[(y * source.info.width + x) * 4 + 3] < 200) continue;
      body.left = Math.min(body.left, x); body.top = Math.min(body.top, y);
      body.right = Math.max(body.right, x); body.bottom = Math.max(body.bottom, y);
    }
    for (const width of [1440, 768, 390, 320]) {
      const hero = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await hero.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await hero.locator('.hero-stage').count(), 1, 'Opening needs a composed, layered photo stage');
      assert.ok(await hero.locator('#hero-title').evaluate(el => parseFloat(getComputedStyle(el).fontSize)) >= 34, 'Hero typography should remain prominent');
      const image = await hero.locator('.hero-stage img').boundingBox();
      const stage = await hero.locator('.hero-stage').boundingBox();
      const pixels = { left: image.x + body.left / source.info.width * image.width, right: image.x + body.right / source.info.width * image.width, top: image.y + body.top / source.info.height * image.height, bottom: image.y + body.bottom / source.info.height * image.height };
      assert.ok(pixels.left >= stage.x - 2 && pixels.right <= stage.x + stage.width + 2 && pixels.top >= stage.y - 2 && pixels.bottom <= stage.y + stage.height + 2, 'People, including feet and heads, must fit in the composed stage: ' + width);
      assert.equal(await hero.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await hero.close();
    }
    console.log('PASS: layered hero, prominent type, complete people and no overflow across four widths.');
    const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await touch.goto(base, { waitUntil: 'networkidle' });
    const touchCard = touch.locator('.solution-card').first();
    await touchCard.locator('figure').tap();
    assert.equal(await touchCard.evaluate(el => getComputedStyle(el, '::before').opacity), '0', 'Touch interaction must not activate mouse-follow illumination');
    await touch.close();
    const keyboard = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await keyboard.goto(base, { waitUntil: 'networkidle' });
    await keyboard.locator('.menu-toggle').focus();
    await keyboard.keyboard.press('Enter');
    assert.equal(await keyboard.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await keyboard.keyboard.press('Escape');
    assert.equal(await keyboard.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await keyboard.locator('.accordion summary').first().focus();
    await keyboard.keyboard.press('Enter');
    assert.equal(await keyboard.locator('.accordion details').first().evaluate(el => el.open), true);
    await keyboard.close();
    const staticPage = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await staticPage.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await staticPage.locator('.particle-label').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await staticPage.locator('.hero-stage img').evaluate(el => el.complete && el.naturalWidth > 0), true);
    await staticPage.close();
    console.log('PASS: touch stays static, keyboard menu/FAQ work, and hero/footer remain useful without JavaScript.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
