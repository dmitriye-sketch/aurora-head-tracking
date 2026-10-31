const {chromium}=require('/Volumes/vader/Codex/GitHubKit/tools/node_modules/playwright');
const {AxeBuilder}=require('/Volumes/vader/Codex/GitHubKit/tools/node_modules/@axe-core/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 const base=process.env.TEST_URL||'http://127.0.0.1:5178/aurora-head-tracking/';
 const results=[];
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},permissions:['camera']});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>!!document.querySelector('#scene').dataset.offset);
 assert.equal(await page.locator('#original').evaluate(i=>i.naturalWidth),854);
 const a=await page.locator('#scene').getAttribute('data-offset');await page.waitForTimeout(600);assert.notEqual(a,await page.locator('#scene').getAttribute('data-offset'));results.push('Auto moves on entry without input');
 await page.screenshot({path:'work/mobile-final.png',fullPage:true});
 const axe=await new AxeBuilder({page}).analyze();fs.writeFileSync('work/axe.json',JSON.stringify(axe.violations,null,2));assert.deepEqual(axe.violations.map(v=>v.id),[]);results.push('axe initial mobile: no violations');
 await page.getByRole('button',{name:'Touch',exact:true}).click();const scene=page.locator('#scene');await scene.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert.ok(Number((await scene.getAttribute('data-offset')).split(',')[0])>.2);results.push('Touch mode keyboard input');
 await page.getByRole('button',{name:'Reset center'}).click();await page.waitForTimeout(50);assert.equal(await scene.getAttribute('data-offset'),'0.000,0.000');
 await page.getByRole('button',{name:'Hide controls'}).click();assert.equal(await page.locator('#controls').isVisible(),false);await page.getByRole('button',{name:'Show controls'}).click();assert.equal(await page.locator('#controls').isVisible(),true);results.push('Reset and hide/show controls');
 await page.getByRole('button',{name:'Head tracking',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Face not visible'),{},{timeout:90000});assert.equal(await page.locator('video').evaluate(v=>v.srcObject.getVideoTracks()[0].readyState),'live');results.push('Real bundled MediaPipe model/WASM initialized on fake camera; no-face state');
 await page.locator('video').evaluate(v=>window.__track=v.srcObject.getVideoTracks()[0]);await page.getByRole('button',{name:'Auto',exact:true}).click();assert.equal(await page.evaluate(()=>window.__track.readyState),'ended');results.push('Switching mode stops camera');
 await page.getByRole('button',{name:'Head tracking',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Face not visible'),{},{timeout:90000});await page.locator('video').evaluate(v=>window.__track=v.srcObject.getVideoTracks()[0]);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await page.evaluate(()=>window.__track.readyState),'ended');results.push('Background visibility change stops camera');
 await page.reload();await page.waitForFunction(()=>!!document.querySelector('#scene').dataset.offset);
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'work/landscape-final.png',fullPage:true});results.push('Landscape no overflow');
 const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('Denied','NotAllowedError'))});const dp=await denied.newPage();await dp.goto(base);await dp.waitForFunction(()=>!!document.querySelector('#scene').dataset.offset);await dp.getByRole('button',{name:'Head tracking',exact:true}).click();await dp.waitForFunction(()=>document.querySelector('#status').textContent.includes('Camera access was not allowed'));assert.equal(await dp.getByRole('button',{name:'Auto',exact:true}).getAttribute('aria-pressed'),'true');assert.equal(await dp.locator('video').evaluate(v=>v.srcObject),null);results.push('Denied camera falls back to Auto');
 await dp.emulateMedia({reducedMotion:'reduce'});await dp.reload();await dp.waitForFunction(()=>!!document.querySelector('#scene').dataset.offset);await dp.waitForTimeout(200);assert.equal(await dp.locator('#scene').getAttribute('data-offset'),'0.000,0.000');await dp.getByRole('button',{name:'Auto',exact:true}).click();await dp.waitForTimeout(500);assert.notEqual(await dp.locator('#scene').getAttribute('data-offset'),'0.000,0.000');results.push('Reduced motion respected; explicit Auto starts');
 const fallback=await browser.newContext();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args)}});const fp=await fallback.newPage();await fp.goto(base);await fp.waitForFunction(()=>document.querySelector('#status').textContent.includes('unavailable'));assert.ok(await fp.locator('#original').evaluate(i=>i.complete&&i.naturalWidth>0));results.push('No WebGL: original photograph remains visible');
 assert.deepEqual(errors,[]);results.push('No page JavaScript errors');
 console.log(JSON.stringify({base,results},null,2));fs.writeFileSync('work/browser-results.json',JSON.stringify({base,results},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
