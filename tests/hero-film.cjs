const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, process.env.TEST_DIST ? '../dist' : '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
const launch = { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true };
const clipTime = page => page.evaluate(() => document.querySelector('video[data-sc-scrub]').currentTime);
const scrollHero = (page, f) => page.evaluate(f => {
  const hero = document.querySelector('[data-hero]');
  window.scrollTo({ top: Math.round((hero.offsetHeight - innerHeight) * f), behavior: 'instant' });
}, f);
const ctaVisible = page => page.locator('.hero-actions .button').evaluate(el => {
  const box = el.getBoundingClientRect();
  return box.top >= 0 && box.bottom <= innerHeight && Number(getComputedStyle(el).opacity) === 1 && /wa\.me/.test(el.href);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch(launch);

    // Desktop: the film advances with scroll and rewinds with it; copy and CTA stay put.
    for (const [width, height, mobile] of [[1440, 900, false], [390, 844, true]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference', isMobile: mobile, hasTouch: mobile });
      const clips = [];
      page.on('request', request => { if (new URL(request.url()).pathname.endsWith('.mp4')) clips.push(path.basename(new URL(request.url()).pathname)); });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('.hero-film-video.sc-has-clip'), null, { timeout: 15000 });
      assert.ok(await page.locator('[data-hero]').evaluate(el => el.classList.contains('is-film')), 'Hero mounts the scroll film');
      assert.deepEqual(clips, [mobile ? 'hero-filme-m.mp4' : 'hero-filme.mp4'], 'Each device loads only its own clip');
      const titleTop = await page.locator('#hero-title').evaluate(el => el.getBoundingClientRect().top);
      assert.ok(await ctaVisible(page), 'CTA visible on the first frame: ' + width);
      await scrollHero(page, .5);
      await page.waitForTimeout(900);
      const middle = await clipTime(page);
      assert.ok(middle > 1.5, 'Scrolling advances the film: ' + middle);
      assert.ok(await ctaVisible(page), 'CTA stays visible while the film plays: ' + width);
      assert.ok(Math.abs(await page.locator('#hero-title').evaluate(el => el.getBoundingClientRect().top) - titleTop) < 2, 'Headline does not jump when the stage pins');
      await scrollHero(page, 0);
      await page.waitForTimeout(900);
      assert.ok(await clipTime(page) < .4, 'Scrolling back rewinds the film');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow: ' + width);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: film scrubs forward and back on desktop and phone, own clip per device, CTA always visible.');

    // Reduced motion: static poster, no clip download, no extra scroll.
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const clips = [];
      page.on('request', request => { if (new URL(request.url()).pathname.endsWith('.mp4')) clips.push(request.url()); });
      await page.goto(base, { waitUntil: 'networkidle' });
      assert.deepEqual(clips, [], 'Reduced motion never fetches the film');
      const state = await page.evaluate(() => {
        const hero = document.querySelector('[data-hero]'), poster = hero.querySelector('.hero-film-poster');
        return { film: hero.classList.contains('is-film'), height: hero.offsetHeight, poster: poster.complete && poster.naturalWidth > 0 && getComputedStyle(poster).opacity === '1' };
      });
      assert.equal(state.film, false);
      assert.ok(state.poster, 'Poster shows the composition');
      assert.ok(state.height <= 1100, 'No pinned scroll span without motion: ' + state.height);
      assert.ok(await ctaVisible(page), 'CTA visible without motion: ' + width);
      await page.close();
    }
    console.log('PASS: reduced motion keeps a complete static hero without the film or extra scroll.');

    // Without JavaScript the hero is still complete.
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    await plain.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await plain.locator('#hero-title').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
    assert.ok(await plain.locator('.hero-film-poster').evaluate(el => el.complete && el.naturalWidth > 0));
    assert.ok(await plain.locator('.hero-actions .button').isVisible());
    await plain.close();
    console.log('PASS: without JavaScript the poster, headline and CTA remain.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
