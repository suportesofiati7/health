import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './lib/static-server.mjs';
const server=process.env.TERMS_TEST_URL?null:await startStaticServer(fileURLToPath(new URL('../dist/',import.meta.url)));
const base=process.env.TERMS_TEST_URL||server.baseUrl;
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const output='reports/terms-redesign-2026-10-30';await mkdir(output,{recursive:true});const results=[];
try {
 for(const width of [320,360,390,768,1024,1440,1920,2560]){
  const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${base}/termos${server?'.html':''}`,{waitUntil:'networkidle'});
  await page.locator('.terms-procedure').last().waitFor({state:'attached'});
  const reject=page.locator('[data-cookie-reject]');if(await reject.isVisible())await reject.click();
  assert.equal(await page.locator('.terms-procedure').count(),17);
  assert(await page.locator('h1').isVisible());
  const check=async()=>page.evaluate(()=>{
   const main=document.querySelector('.terms-main');const paragraphs=[...main.querySelectorAll('.terms-document p')].filter(el=>el.getClientRects().length);
   const collapsed=[...main.querySelectorAll('.terms-procedure-heading')].filter(el=>el.getBoundingClientRect().width<150).length;
   return {overflow:document.documentElement.scrollWidth>innerWidth+1,collapsed,minParagraphWidth:Math.min(...paragraphs.map(el=>el.getBoundingClientRect().width)),mainWidth:main.getBoundingClientRect().width};
  });
  assert.equal((await check()).overflow,false,`Page overflow at ${width}`);
  await page.screenshot({path:`${output}/hero-${width}.png`});
  await page.locator('.terms-index a[href="#procedimentos"]').click();
  const first=page.locator('.terms-procedure').first();await first.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await first.getAttribute('open'),'');
  await first.locator('summary').click();assert.equal(await first.getAttribute('open'),null);
  for(const detail of await page.locator('.terms-procedure').all())await detail.locator('summary').click();
  const layout=await check();assert.equal(layout.overflow,false,`Expanded overflow at ${width}`);assert.equal(layout.collapsed,0,`Squeezed headings at ${width}`);assert(layout.minParagraphWidth>=220,`Squeezed document text at ${width}: ${layout.minParagraphWidth}`);
  const harmony=page.locator('#termo-harmony');await harmony.locator("summary").scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/reading-${width}.png`});
  assert.equal(await page.locator('.terms-main a[href="/formulario"]').count(),4);
  assert.deepEqual(errors,[]);results.push({width,...layout,passed:true});console.log(`PASS terms ${width}px: 17 expandable terms, readable widths, anchors, keyboard, form links, no overflow/errors`);await page.close();
 }
 await writeFile(`${output}/${server?'local':'live'}-results.json`,JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();if(server)await server.close();}
