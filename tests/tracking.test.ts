import {test} from 'node:test';
import assert from 'node:assert/strict';
import {measureHead, relativeOffset, smooth, clamp} from '../src/tracking/math.ts';
test('head translation uses landmark position, not rotation',()=>{
 const face=Array.from({length:478},()=>({x:.5,y:.5,z:0}));
 face[33]={x:.4,y:.5,z:0};face[263]={x:.6,y:.5,z:0};
 const a=measureHead(face)!;
 const b=measureHead(face.map(p=>({...p,x:p.x+.04,y:p.y-.02})))!;
 const offset=relativeOffset(b,a);
 assert.ok(offset.x>0);assert.ok(offset.y>0);
 assert.deepEqual(relativeOffset(a,a),{x:0,y:0});
});
test('invalid or tiny face never produces unsafe offsets',()=>{
 assert.equal(measureHead([]),null);
 assert.equal(measureHead(Array.from({length:478},()=>({x:.5,y:.5,z:0}))),null);
 assert.equal(measureHead(Array.from({length:478},()=>({x:NaN,y:0,z:0}))),null);
 assert.deepEqual(relativeOffset({x:99,y:-99,scale:.2},{x:.5,y:.5,scale:.2}),{x:1,y:1});
 assert.equal(clamp(NaN),0);assert.equal(clamp(-9),-1);assert.equal(clamp(9),1);
});
test('smoothing is stable across frame rates and handles stalled tabs',()=>{
 const once=smooth(0,1,.1);let many=0;for(let i=0;i<10;i++)many=smooth(many,1,.01);
 assert.ok(Math.abs(once-many)<1e-6);assert.equal(smooth(0,1,0),0);
 assert.ok(smooth(0,1,10)<=1);
});
