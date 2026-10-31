import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HeadTracker} from '../src/tracking/HeadTracker';
test('stop resets no-face state so repeated tracking sessions can report loss',()=>{
 const video={muted:false,playsInline:false,className:'',setAttribute(){},pause(){},remove(){},srcObject:null};
 const original=globalThis.document;
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>video,body:{append(){}}}});
 Object.defineProperty(globalThis,'window',{configurable:true,value:{clearTimeout(){}}});
 try{
  const tracker=new HeadTracker({view(){},status(){},failed(){}});
  const state=tracker as unknown as {lost:boolean;lastSeen:number;interval:number};
  state.lost=true;state.lastSeen=999;state.interval=200;
  tracker.stop();assert.equal(state.lost,false);assert.equal(state.lastSeen,0);assert.equal(state.interval,100);
 }finally{Object.defineProperty(globalThis,'document',{configurable:true,value:original});delete (globalThis as {window?:unknown}).window;}
});
