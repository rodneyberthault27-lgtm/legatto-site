const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, 'dist', file), 'utf8');
const build = site => execFileSync(process.execPath, ['scripts/build-static.cjs'], {
  cwd: root, env: { ...process.env, SITE_URL: site }, stdio: 'pipe'
});

// Catches ignoring the deployment base path or leaking the original host into metadata.
try {
  build('https://rodneyberthault27-lgtm.github.io/legatto-site/');
  for (const file of ['index.html', 'seguro-auto.html', 'privacidade.html']) {
    const html = read(file);
    const suffix = file === 'index.html' ? '' : file;
    assert.ok(html.includes(`rel="canonical" href="https://rodneyberthault27-lgtm.github.io/legatto-site/${suffix}"`), 'Canonical must use deployment URL: ' + file);
    assert.ok(html.includes('content="https://rodneyberthault27-lgtm.github.io/legatto-site/assets/'), 'Share image must use deployment URL');
  }
  assert.ok(read('sitemap.xml').includes('<loc>https://rodneyberthault27-lgtm.github.io/legatto-site/seguro-auto.html</loc>'));
  assert.ok(read('robots.txt').includes('Sitemap: https://rodneyberthault27-lgtm.github.io/legatto-site/sitemap.xml'));
  const errorPage = read('404.html');
  assert.ok(errorPage.includes('href="/legatto-site/styles.css?'));
  assert.ok(errorPage.includes('href="/legatto-site/index.html#solucoes"'));
  assert.ok(errorPage.includes('src="/legatto-site/assets/legatto-logo.webp"'));
  assert.ok(fs.existsSync(path.join(root, 'dist/.nojekyll')));
  // Every local home stylesheet/script must be in the actual release package.
  for (const [, resource] of read('index.html').matchAll(/(?:href|src)="([^"?#]+\.(?:css|js))(?:[?#][^"]*)?"/g)) {
    if (/^https?:/.test(resource)) continue;
    assert.ok(fs.existsSync(path.join(root, 'dist', resource)), 'Missing release asset: ' + resource);
    assert.equal(read(resource), fs.readFileSync(path.join(root, resource), 'utf8'), 'Stale release asset: ' + resource);
  }
  build('');
  assert.ok(read('seguro-auto.html').includes('href="https://legatto-consultoria.rodead.chatgpt.site/seguro-auto.html"'), 'Default Sites build must remain supported');
  assert.ok(read('404.html').includes('href="/styles.css?'), 'Root-domain 404 must retain root paths');
  console.log('PASS: project-path hosting, metadata, sitemap, robots, 404, and default Sites build.');
} finally {
  build('');
}
