const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp'};
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
    for (const width of [1440,768,390,320]) {
      const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
      await page.goto('http://127.0.0.1:' + server.address().port, {waitUntil:'networkidle'});
      const quote = page.getByRole('link', {name:'Cotar meu Seguro Auto',exact:true});
      assert.equal(await quote.count(),1,'O visitante precisa encontrar a cotação de Seguro Auto');
      await quote.scrollIntoViewIfNeeded();
      assert.ok(await quote.isVisible());
      const url = new URL(await quote.getAttribute('href'));
      assert.equal(url.hostname,'wa.me');
      assert.equal(url.pathname,'/5511971371823');
      assert.match(url.searchParams.get('text'),/seguro auto/i);
      await page.waitForFunction(()=>{const img=document.querySelector('#seguro-auto img');return img && img.complete && img.naturalWidth>0;},{},{timeout:10000});
      const cards = await page.locator('.solution-card').evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,width:r.width,right:r.right,top:r.top};}));
      assert.equal(cards.length,6);
      assert.ok(cards.every(card=>card.left>=0 && card.right<=width+1),'Cartões não podem ultrapassar a tela');
      assert.ok(cards.every(card=>Math.abs(card.width-cards[0].width)<2),'As seis categorias devem ocupar colunas iguais');
      const rows = Object.values(cards.reduce((groups,card)=>{const row=Math.round(card.top);groups[row]=(groups[row]||0)+1;return groups;},{}));
      const expected = width===1440 ? [3,3] : width===768 ? [2,2,2] : [1,1,1,1,1,1];
      assert.deepEqual(rows,expected,'Grid precisa respeitar o número de colunas em cada tela');
      await page.locator('[data-priority="auto"]').click();
      assert.equal(await page.locator('[data-priority="auto"]').getAttribute('aria-pressed'),'true');
      assert.match(new URL(await page.locator('#priority-link').getAttribute('href')).searchParams.get('text'),/seguro auto/i);
      const question = page.locator('.accordion summary').filter({hasText:'Seguro Auto'});
      assert.equal(await question.count(),1,'Dúvida de Auto precisa estar disponível');
      await question.click();
      assert.ok(await page.locator('.accordion details[open]').isVisible());
      await page.close();
    }
    console.log('PASS: Seguro Auto, cotação contextual, prioridades, FAQ e grid em quatro larguras.');
  } finally { if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
