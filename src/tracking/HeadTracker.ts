import { measureHead, relativeOffset, type HeadPosition } from './math';
import type { ViewOffset } from '../scene/SceneAdapter';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
export interface TrackingEvents { view:(view:ViewOffset)=>void; status:(message:string)=>void; failed:(error:unknown)=>void }
export class HeadTracker {
 private stream:MediaStream|null=null;
 private detector:FaceLandmarker|null=null;
 private video:HTMLVideoElement;
 private generation=0;
 private timer=0;
 private center:HeadPosition|null=null;
 private lastVideoTime=-1;
 private lastSeen=0;
 private lost=false;
 private interval=100;
 constructor(private events:TrackingEvents){
  this.video=document.createElement('video');this.video.muted=true;this.video.playsInline=true;
  this.video.setAttribute('aria-hidden','true');this.video.className='tracking-video';
  document.body.append(this.video);
 }
 async start(){
  this.stop(); const id=this.generation;
  try{
   if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('Camera needs HTTPS and a supported browser. Open this site in Safari.');
   // Start camera immediately in the user action; no model download precedes permission.
   const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}}});
   if(id!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
   this.stream=stream;this.video.srcObject=stream;
   stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(id===this.generation){this.stop();this.events.failed(new Error('Camera disconnected. Automatic motion is active.'));}},{once:true}));
   await this.video.play(); if(id!==this.generation)return;
   this.events.status('Loading on-device tracking…');
   const {FaceLandmarker,FilesetResolver}=await import('@mediapipe/tasks-vision');
   if(id!==this.generation)return;
   const base=import.meta.env.BASE_URL;
   const vision=await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);
   if(id!==this.generation)return;
   const detector=await FaceLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:`${base}mediapipe/face_landmarker.task`,delegate:'CPU'},runningMode:'VIDEO',numFaces:1});
   if(id!==this.generation){detector.close();return;}
   this.detector=detector;this.events.status('Look at the screen to set the center');
   this.tick(id);
  }catch(error){if(id!==this.generation)return;this.stop();this.events.failed(error);}
 }
 calibrate(){this.center=null;this.events.view({x:0,y:0});}
 private tick(id:number){
  if(id!==this.generation||!this.detector)return;
  if(document.hidden){this.stop();return;}
  try{
   const now=performance.now();
   if(this.video.readyState>=2&&this.video.currentTime!==this.lastVideoTime){
    this.lastVideoTime=this.video.currentTime;
    const started=performance.now();
    const face=this.detector.detectForVideo(this.video,now).faceLandmarks[0];
    const elapsed=performance.now()-started;
    this.interval=elapsed>65?200:100; // 5–10 Hz inference; render loop is independent.
    const head=face?measureHead(face):null;
    if(head){
     this.lastSeen=now;this.lost=false;
     if(!this.center){this.center=head;this.events.status('Head tracking on · move gently side to side');}
     this.events.view(relativeOffset(head,this.center));
    }else if(now-this.lastSeen>700&&!this.lost){
     this.lost=true;this.center=null;this.events.view({x:0,y:0});this.events.status('Face not visible · look toward the camera');
    }
   }
   this.timer=window.setTimeout(()=>this.tick(id),this.interval);
  }catch(error){this.stop();this.events.failed(error);}
 }
 stop(){
  this.generation++;window.clearTimeout(this.timer);this.timer=0;
  this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;
  this.video.pause();this.video.srcObject=null;
  this.detector?.close();this.detector=null;this.center=null;this.lastVideoTime=-1;
  this.lost=false;this.lastSeen=0;this.interval=100;
 }
 dispose(){this.stop();this.video.remove();}
}
export function cameraError(error:unknown){
 if(error instanceof DOMException){
  if(error.name==='NotAllowedError')return 'Camera access was not allowed. Auto is still running. Allow camera access in Safari to try again.';
  if(error.name==='NotFoundError')return 'No camera found. Auto is still running.';
  if(error.name==='NotReadableError')return 'Camera is busy. Close other camera apps and try again.';
 }
 return error instanceof Error?error.message:'Tracking could not start. Auto is still running.';
}
