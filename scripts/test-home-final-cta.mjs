import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {startStaticServer} from './lib/static-server.mjs';
import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
const dir='reports/home-gold-logo-2026-11-01';
await mkdir(dir, {recursive:true});
const server=await startStaticServer(process.cwd());
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
try {
const page=await browser.newPage(),baseline=await browser.newPage();
await baseline.route('**/css/site.css',r=>r.fulfill({contentType:'text/css',body:execFileSync('git',['show','HEAD:css/site.css'],{encoding:'utf8'})}));
for(const p of [page,baseline]){await p.goto(server.baseUrl,{waitUntil:'networkidle'});await p.evaluate(async()=>{await document.fonts.ready;document.querySelector('#sf-cookie-inline')?.remove();document.querySelector('#sf-floating-inline')?.remove();});await p.addStyleTag({content:'* { animation: none !important; transition: none !important; }'});}
const results=[];
const measure=section=>{
 const panel=section.querySelector('.sf-bottom-cta__inner'),actions=section.querySelector('.sf-home-final-cta__actions'),content=section.querySelector('.sf-home-final-cta__content');
 const rect=panel.getBoundingClientRect(),ar=actions.getBoundingClientRect(),cr=content.getBoundingClientRect();
 const mark=getComputedStyle(actions,'::before');
 return {viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,panelHeight:rect.height,columnsOverlap:innerWidth>=768&&cr.right>ar.left,mark:{content:mark.content,width:mark.width,opacity:mark.opacity},buttons:[...actions.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect();return {text:a.textContent.trim(),href:a.getAttribute('href'),width:r.width,height:r.height,inside:r.left>=rect.left&&r.right<=rect.right&&r.top>=rect.top&&r.bottom<=rect.bottom};})};
};
for(const width of [320,375,430,768,1024,1280,1440,1920,2560]){
 await page.setViewportSize({width,height:1000});await page.waitForTimeout(200);
 const result=await page.locator('#begin-with-a-conversation').evaluate(measure);
 assert(!result.overflow,`${width}: overflow`);assert(!result.columnsOverlap,`${width}: overlap`);for(const b of result.buttons){assert(b.inside,`${width}: clipping`);assert(b.height>=44);}
 if(width<768){await baseline.setViewportSize({width,height:1000});await baseline.waitForTimeout(200);const before=await baseline.locator('#begin-with-a-conversation').evaluate(measure);assert.deepEqual(result,before);const a=await page.locator('#begin-with-a-conversation').screenshot({animations:'disabled'}),b=await baseline.locator('#begin-with-a-conversation').screenshot({animations:'disabled'});result.mobilePixelIdentical=a.equals(b);assert(result.mobilePixelIdentical,`${width}: pixels differ`);}else{assert.equal(result.mark.opacity,'1');assert.equal(result.mark.content,'""');}
 await page.locator('#begin-with-a-conversation').screenshot({path:`${dir}/${width}.png`});results.push(result);
}
await page.locator('#begin-with-a-conversation .sf-button--primary').focus();assert(await page.locator('#begin-with-a-conversation .sf-button--primary').evaluate(e=>e===document.activeElement));
await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2)+'\n');console.log(results);
}finally{await browser.close();await server.close();}
