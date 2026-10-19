const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const shots = path.resolve(root, '../legatto-visual-qa');
    fs.mkdirSync(shots, { recursive: true });
    for (const width of [1920, 1440, 1024, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.locator('img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
      await page.waitForFunction(() => [...document.images].every(img => img.complete));
      const photos = await page.locator('.hero-visual img,.solution-card figure img').evaluateAll(images => images.map(img => {
        const box = img.getBoundingClientRect();
        return { src: img.currentSrc, natural: img.naturalWidth / img.naturalHeight, rendered: box.width / box.height, loaded: img.naturalWidth > 0 };
      }));
      assert.equal(photos.length, 7);
      for (const photo of photos) {
        assert.ok(photo.loaded, 'Image loads: ' + photo.src);
        assert.ok(Math.abs(photo.natural - photo.rendered) < .015, 'Photo must retain full composition without cutting people: ' + width + ' ' + photo.src);
      }
      const caption = await page.locator('.hero-visual').evaluate(figure => ({ imageBottom: figure.querySelector('img').getBoundingClientRect().bottom, captionTop: figure.querySelector('figcaption').getBoundingClientRect().top }));
      assert.ok(caption.captionTop >= caption.imageBottom - 1, 'Caption must not cover the family');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if ([1440, 390].includes(width)) {
        await page.screenshot({ path: path.join(shots, 'jornada-hero-' + width + '.png') });
        await page.locator('.solutions-grid').screenshot({ path: path.join(shots, 'jornada-solutions-' + width + '.png'), style: '.site-header,.whatsapp-float{visibility:hidden}' });
        await page.locator('.protection-journey').screenshot({ path: path.join(shots, 'jornada-map-' + width + '.png'), style: '.site-header,.whatsapp-float{visibility:hidden}' });
      }
      await page.close();
    }
    console.log('PASS: seven uncropped photos, caption outside image, six responsive widths.');
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(base + '/?t=0', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.protection-journey a').count(), 4, 'Four areas connected by a useful, navigable protection journey');
    const targets = await page.locator('.protection-journey a').evaluateAll(links => links.map(a => a.pathname));
    for (const target of targets) assert.equal((await page.request.get(base + '/dist' + target)).status(), 200);
    await page.waitForFunction(() => window.LegattoMotion?.ready === true);
    const initial = await page.locator('.journey-trace').evaluate(el => el.getBoundingClientRect().width);
    await page.evaluate(() => window.LegattoMotion.seek(2));
    const final = await page.locator('.journey-trace').evaluate(el => el.getBoundingClientRect().width);
    assert.ok(final > initial + 200, 'Protection line visibly progresses across the four areas');
    assert.equal(await page.locator('#hero-title').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
    for (const time of [0, .7, 2]) {
      await page.evaluate(t => window.LegattoMotion.seek(t), time);
      await page.locator('.protection-journey').screenshot({ path: path.join(shots, 'jornada-frame-' + time + '.png') });
    }
    const client = await page.context().newCDPSession(page);
    await page.locator('img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
    await page.waitForFunction(() => [...document.images].every(img => img.complete));
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.journey-canvas').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const events = [];
    client.on('Tracing.dataCollected', data => events.push(...data.value));
    await client.send('Tracing.start', { categories: 'devtools.timeline,blink.user_timing', transferMode: 'ReportEvents' });
    await page.evaluate(() => { performance.mark('legatto-motion-profile'); gsap.getById('legatto-protection').restart(); });
    await page.waitForTimeout(1700);
    const complete = new Promise(resolve => client.once('Tracing.tracingComplete', resolve));
    await client.send('Tracing.end');
    await complete;
    const start = events.find(event => event.name === 'legatto-motion-profile').ts;
    const steady = events.filter(event => event.ts > start + 250000 && event.ts < start + 1200000);
    const layout = steady.filter(event => event.name === 'Layout').length;
    const paint = steady.filter(event => event.name === 'Paint').length;
    console.log('PROFILE: steady animation window; Layout=' + layout + ', Paint=' + paint);
    assert.ok(layout < 3, 'No recurring per-frame layout during the connection animation: ' + layout);
    assert.ok(paint < 8, 'No recurring per-frame repaint during the connection animation: ' + paint);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    const finalWidth = await page.locator('.journey-trace').evaluate(el => ({ actual: el.getBoundingClientRect().width, expected: el.parentElement.getBoundingClientRect().width * .75 }));
    assert.ok(Math.abs(finalWidth.actual - finalWidth.expected) < 1, 'Live reduced-motion preference must show full static path');
    assert.equal(await page.locator('#hero-title').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
    await page.locator('.protection-journey').screenshot({ path: path.join(shots, 'jornada-reduced.png') });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(100);
    assert.ok(await page.locator('.scroll-progress span').evaluate(el => el.getBoundingClientRect().width) > 1400, 'Progress must keep working after a live reduced-motion switch');
    await page.close();
    const service = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await service.goto(base + '/dist/seguro-auto.html', { waitUntil: 'networkidle' });
    await service.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await service.waitForTimeout(100);
    assert.ok(await service.locator('.scroll-progress span').evaluate(el => el.getBoundingClientRect().width) > 1400, 'Service pages without native timeline CSS must use a working fallback');
    await service.close();
    console.log('PASS: custom connected journey, navigable links, deterministic timeline, live reduced-motion fallback.');
    for (const withoutJavaScript of [true, false]) {
      const fallback = await browser.newPage({ javaScriptEnabled: !withoutJavaScript });
      if (!withoutJavaScript) await fallback.route('**/gsap-3.15.0.min.js', route => route.abort());
      await fallback.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await fallback.locator('#hero-title').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
      assert.equal(await fallback.locator('.protection-journey a:visible').count(), 4);
      assert.ok(await fallback.locator('.hero-actions a').first().isVisible());
      await fallback.close();
    }
    console.log('PASS: useful, visible content without JavaScript or animation library.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
