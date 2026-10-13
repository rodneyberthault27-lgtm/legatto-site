const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('C:/Users/rodne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'text/plain');res.end(data);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    const origin='http://127.0.0.1:'+server.address().port;
    for(const width of [1440,390,320]){
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];const analytics=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/googletagmanager|google-analytics/.test(r.url()))analytics.push(r.url());});
      await page.goto(origin,{waitUntil:'networkidle'});
      assert.equal(await page.locator('[data-service-details]').count(),6,'As categorias devem abrir seis páginas completas');
      const urls=await page.locator('[data-service-details]').evaluateAll(links=>links.map(a=>a.href));
      assert.equal(new Set(urls).size,6);
      const ratios=await page.locator('.solutions h2 em,.priorities h2 em,.editorial h2 em,.faq h2 em,.market-brands h2 em').evaluateAll(elements=>{
        const luminance=color=>{const values=color.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*values[0]+.7152*values[1]+.0722*values[2];};
        return elements.map(el=>{let parent=el;let bg='rgba(0, 0, 0, 0)';while(parent&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(parent).backgroundColor;parent=parent.parentElement;}const a=luminance(getComputedStyle(el).color),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);});
      });
      assert.ok(ratios.every(value=>value>=3),'Contraste dos títulos grandes em seções claras deve atingir 3:1');
      for(const url of urls){
        const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200);
        assert.equal(await page.locator('h1').count(),1);
        assert.ok(await page.locator('[data-service-contact]').isVisible(),'Contato específico deve estar visível');
        const contact=new URL(await page.locator('[data-service-contact]').first().getAttribute('href'));
        assert.equal(contact.hostname,'wa.me');assert.equal(contact.pathname,'/5511971371823');assert.ok(contact.searchParams.get('text').length>20);
        await page.locator('.accordion summary').first().click();assert.ok(await page.locator('.accordion details[open]').isVisible());
        assert.ok(await page.locator('link[rel="canonical"]').count());assert.ok(await page.locator('meta[property="og:image"]').count());
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Sem overflow '+width);
        const broken=await page.locator('a[href]').evaluateAll(links=>links.filter(a=>a.origin===location.origin&&!a.hash).map(a=>a.pathname));
        for(const target of new Set(broken)){const r=await page.request.get(origin+target);assert.equal(r.status(),200,'Destino válido '+target);}
        if(url.endsWith('seguro-auto.html')){
          await page.evaluate(()=>window.scrollTo(0,0));
          await page.screenshot({path:path.resolve(root,'../../legatto-visual-qa/service-auto-'+width+'.png')});
        }
      }
      assert.deepEqual(errors,[]);assert.deepEqual(analytics,[],'Analytics deve permanecer desativado');
      await page.close();
    }
    console.log('PASS: seis páginas navegáveis, contato contextual, FAQ, metadados, links e responsividade; sem Analytics ativo.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
