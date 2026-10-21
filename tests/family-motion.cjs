const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const sharp = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
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
const position = stage => stage.evaluate(el => {
  const image = el.querySelector('img'), photo = image.getBoundingClientRect(), frame = el.getBoundingClientRect();
  return { x: photo.left - frame.left, y: photo.top - frame.top, width: photo.width, opacity: Number(getComputedStyle(image).opacity), loaded: image.complete && image.naturalWidth > 0 };
});
(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:' + server.address().port + '/';
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const slow = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    let releasePhoto;
    const heldPhoto = new Promise(resolve => { releasePhoto = resolve; });
    await slow.route('**/assets/hero-familia-recorte.webp', async route => { await heldPhoto; await route.continue(); });
    await slow.goto(base, { waitUntil: 'domcontentloaded' });
    await slow.waitForTimeout(1600);
    releasePhoto();
    await slow.waitForFunction(() => { const image = document.querySelector('.hero-stage img'); return image.complete && image.naturalWidth > 0; });
    const justLoaded = await position(slow.locator('.hero-stage'));
    await slow.waitForTimeout(550);
    const afterLoad = await position(slow.locator('.hero-stage'));
    assert.ok(Math.abs(afterLoad.x - justLoaded.x) > 4, 'On a slow image request, the family entrance must start after the photo loads, not finish before it appears');
    await slow.close();
    console.log('PASS: even a delayed photo gets a visible entrance after loading.');
    const page = await browser.newPage({ viewport: { width: 390, height: 540 }, reducedMotion: 'no-preference', hasTouch: true, isMobile: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const stage = page.locator('.hero-stage');
    assert.ok((await stage.boundingBox()).y >= 540, 'Fixture must start with the family below the fold');
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const first = await position(stage);
    await page.waitForTimeout(550);
    const second = await position(stage);
    assert.ok(first.loaded && second.loaded && first.opacity === 1 && second.opacity === 1, 'Family must stay loaded and visible throughout its entrance');
    assert.ok(Math.abs(second.x - first.x) > 4, 'Family must visibly move when it first enters the viewport, not finish its entrance while below the fold');
    await page.waitForTimeout(1000);
    const settled = await position(stage);
    await page.waitForTimeout(150);
    assert.deepEqual(await position(stage), settled, 'Entrance must settle without a perpetual animation loop');
    await page.evaluate(() => window.scrollBy({ top: 100, behavior: 'instant' }));
    await page.waitForTimeout(500);
    const scrolled = await position(stage);
    assert.ok(Math.abs(scrolled.y - settled.y) > 1, 'Scrolling on a touch device must give the family visible depth without requiring a mouse');
    assert.deepEqual(errors, []);
    await page.close();
    console.log('PASS: the family enters on first visibility, stays visible, settles and responds to touch scrolling.');
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    await desktop.addInitScript(() => {
      window.familyVisibilitySamples = [];
      const sample = () => {
        const image = document.querySelector('.hero-stage img');
        if (image?.complete && image.naturalWidth) {
          let node = image, opacity = 1;
          while (node) { opacity *= Number(getComputedStyle(node).opacity); node = node.parentElement; }
          window.familyVisibilitySamples.push(opacity);
        }
        if (performance.now() < 2500) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await desktop.goto(base, { waitUntil: 'networkidle' });
    await desktop.waitForTimeout(1600);
    const visibility = await desktop.evaluate(() => window.familyVisibilitySamples);
    assert.ok(visibility.length && visibility.every(opacity => opacity >= .99), 'An ancestor animation must not hide the family during its own entrance');
    const desktopStage = desktop.locator('.hero-stage');
    const bounds = await desktopStage.boundingBox();
    await desktop.mouse.move(bounds.x + bounds.width * .15, bounds.y + bounds.height * .5);
    await desktop.waitForTimeout(500);
    const left = await position(desktopStage);
    await desktop.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .5);
    await desktop.waitForTimeout(500);
    const right = await position(desktopStage);
    assert.ok(Math.abs(right.x - left.x) > 5, 'Moving over the family must create visible depth after the entrance has finished');
    await desktop.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    await desktop.waitForTimeout(100);
    await desktop.mouse.move(bounds.x + bounds.width * .15, bounds.y + bounds.height * .5);
    await desktop.waitForTimeout(500);
    const restoredLeft = await position(desktopStage);
    await desktop.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .5);
    await desktop.waitForTimeout(500);
    const restoredRight = await position(desktopStage);
    assert.ok(Math.abs(restoredRight.x - restoredLeft.x) > 5, 'Restoring a cached page must re-enable family depth without needing a new intersection');
    await desktop.close();
    console.log('PASS: mouse movement creates visible family depth, including after cached-page lifecycle restoration.');
    const live = await browser.newPage({ viewport: { width: 390, height: 540 }, reducedMotion: 'no-preference' });
    const liveErrors = [];
    live.on('pageerror', error => liveErrors.push(error.message));
    await live.goto(base, { waitUntil: 'networkidle' });
    await live.waitForTimeout(1500);
    await live.locator('.hero-stage').scrollIntoViewIfNeeded();
    await live.waitForTimeout(150);
    await live.emulateMedia({ reducedMotion: 'reduce' });
    await live.waitForTimeout(150);
    assert.deepEqual(liveErrors, [], 'Changing motion preference during the entrance must not throw or leave a hidden family');
    assert.equal(await live.locator('.hero-stage img').evaluate(el => getComputedStyle(el).transform), 'none');
    assert.equal(await live.locator('.hero-family').evaluate(el => getComputedStyle(el).transform), 'none');
    assert.equal((await position(live.locator('.hero-stage'))).opacity, 1);
    await live.close();
    console.log('PASS: live reduced motion safely ends the entrance and depth effect, leaving the photo visible.');
    const source = await sharp(path.join(root, 'assets/hero-familia-recorte.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const body = { left: source.info.width, top: source.info.height, right: 0, bottom: 0 };
    for (let y = 0; y < source.info.height; y++) for (let x = 0; x < source.info.width; x++) {
      if (source.data[(y * source.info.width + x) * 4 + 3] < 200) continue;
      body.left = Math.min(body.left, x); body.right = Math.max(body.right, x);
      body.top = Math.min(body.top, y); body.bottom = Math.max(body.bottom, y);
    }
    for (const width of [1440, 768, 390, 320]) {
      const framing = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
      await framing.goto(base, { waitUntil: 'networkidle' });
      await framing.waitForTimeout(1600);
      const frame = framing.locator('.hero-stage');
      await frame.evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top + el.clientHeight * .4, behavior: 'instant' }));
      const frameBox = await frame.boundingBox();
      await framing.mouse.move(frameBox.x + frameBox.width * .98, frameBox.y + frameBox.height * .98);
      await framing.waitForTimeout(550);
      const photo = await framing.locator('.hero-stage img').boundingBox();
      const pixels = { left: photo.x + body.left / source.info.width * photo.width, right: photo.x + body.right / source.info.width * photo.width, top: photo.y + body.top / source.info.height * photo.height, bottom: photo.y + body.bottom / source.info.height * photo.height };
      assert.ok(pixels.left >= frameBox.x - .5 && pixels.right <= frameBox.x + frameBox.width + .5 && pixels.top >= frameBox.y - .5 && pixels.bottom <= frameBox.y + frameBox.height + .5, 'Motion must keep every person inside the stage at width ' + width + ': ' + JSON.stringify({ pixels, frameBox }));
      await framing.close();
    }
    console.log('PASS: full family composition survives combined scroll and pointer motion at four widths.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
