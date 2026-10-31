import type {SceneAdapter,ViewOffset} from './scene/SceneAdapter';
import {HeadTracker,cameraError} from './tracking/HeadTracker';
import {smooth} from './tracking/math';
type Mode='auto'|'head'|'touch';
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
export class AppController{
 private mode:Mode='auto';private target:ViewOffset={x:0,y:0};private view:ViewOffset={x:0,y:0};
 private tracker:HeadTracker;private intensity=.65;private frame=0;private last=0;private phase=0;
 private alive=true;private scene:SceneAdapter|null=null;private ready=false;private dragging=false;
 private observer:ResizeObserver;private abort=new AbortController();private reduce=matchMedia('(prefers-reduced-motion: reduce)');
 constructor(){
  this.tracker=new HeadTracker({view:v=>{this.target=v},status:m=>this.status(m),failed:e=>{this.setMode('auto');this.status(cameraError(e))}});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(element('scene'));
  this.bind();this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 attach(scene:SceneAdapter){if(!this.alive){scene.dispose();return;}this.scene=scene;this.ready=true;this.resize();this.status(this.autoMessage());}
 fallback(){this.tracker.stop();this.ready=false;this.status('Photo loaded. Depth motion is unavailable in this browser.');document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.disabled=true);}
 private autoMessage(){return this.reduce.matches?'Reduced motion is on · choose Auto to animate':'Automatic motion · no interaction needed';}
 private status(message:string){element('status').textContent=message;}
 private setMode(mode:Mode){
  this.tracker.stop();this.mode=mode;this.target={x:0,y:0};
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  element('scene').style.touchAction=mode==='touch'?'none':'pan-y';
  this.status(mode==='auto'?this.autoMessage():mode==='touch'?'Drag the photograph to look around':'Requesting camera access…');
 }
 private explicitAuto=false;
 private bind(){
  const signal=this.abort.signal;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
   const mode=button.dataset.mode as Mode;if(mode==='auto')this.explicitAuto=true;
   this.setMode(mode);if(mode==='head')void this.tracker.start();
  },{signal}));
  element<HTMLInputElement>('intensity').addEventListener('input',e=>{
   const value=Number((e.target as HTMLInputElement).value);this.intensity=Math.max(0,Math.min(1,value/100));element('intensity-value').textContent=`${value}%`;
  },{signal});
  element('reset').addEventListener('click',()=>{this.target={x:0,y:0};this.view={x:0,y:0};this.phase=0;if(this.mode==='head'){this.tracker.calibrate();this.status('Look at the screen to reset the center');}},{signal});
  element('hide').addEventListener('click',()=>{document.body.classList.add('ui-hidden');element('show').hidden=false;element('show').focus();this.resize()},{signal});
  element('show').addEventListener('click',()=>{document.body.classList.remove('ui-hidden');element('show').hidden=true;element('hide').focus();this.resize()},{signal});
  const scene=element('scene');
  scene.addEventListener('pointerdown',e=>{if(this.mode!=='touch')return;this.dragging=true;scene.setPointerCapture(e.pointerId);this.pointer(e)},{signal});
  scene.addEventListener('pointermove',e=>{if(this.dragging&&this.mode==='touch')this.pointer(e)},{signal});
  const release=()=>{this.dragging=false};scene.addEventListener('pointerup',release,{signal});scene.addEventListener('pointercancel',release,{signal});
  scene.addEventListener('keydown',e=>{if(this.mode!=='touch')return;const directions:Record<string,ViewOffset>={ArrowLeft:{x:-.6,y:0},ArrowRight:{x:.6,y:0},ArrowUp:{x:0,y:.6},ArrowDown:{x:0,y:-.6}};if(directions[e.key]){e.preventDefault();this.target=directions[e.key]}},{signal});scene.tabIndex=0;
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.tracker.stop();cancelAnimationFrame(this.frame);this.frame=0;this.last=0;if(this.mode==='head'){this.setMode('auto');this.status('Camera stopped while away. Auto is active.');}}else if(!this.frame)this.frame=requestAnimationFrame(t=>this.animate(t));},{signal});
  window.addEventListener('pagehide',e=>{if(e.persisted){this.tracker.stop();cancelAnimationFrame(this.frame);this.frame=0;this.last=0;}else this.dispose()},{signal});
  window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()},{signal});
 }
 private pointer(e:PointerEvent){const r=element('scene').getBoundingClientRect();this.target={x:Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y:Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2))};}
 private resize(){const area=element('scene');this.scene?.resize(area.clientWidth,area.clientHeight)}
 private animate(time:number){
  if(!this.alive)return;
  const delta=this.last?Math.min((time-this.last)/1000,.1):0;this.last=time;
  if(this.mode==='auto'){
   if(!this.reduce.matches||this.explicitAuto)this.phase+=delta;
   this.target=this.reduce.matches&&!this.explicitAuto?{x:0,y:0}:{x:Math.sin(this.phase*.32)*.85,y:Math.sin(this.phase*.23)*.45};
  }
  this.view={x:smooth(this.view.x,this.target.x,delta),y:smooth(this.view.y,this.target.y,delta)};
  this.scene?.setView(this.view,this.intensity);this.scene?.render();
  if(this.ready)element('scene').dataset.offset=`${this.view.x.toFixed(3)},${this.view.y.toFixed(3)}`;
  this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 dispose(){if(!this.alive)return;this.alive=false;cancelAnimationFrame(this.frame);this.abort.abort();this.observer.disconnect();this.tracker.dispose();this.scene?.dispose()}
}
