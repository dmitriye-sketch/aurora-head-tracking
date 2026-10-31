export interface Landmark { x:number; y:number; z?:number }
export interface HeadPosition { x:number; y:number; scale:number }
export const clamp=(v:number)=>Number.isFinite(v)?Math.max(-1,Math.min(1,v)):0;
export function measureHead(points:readonly Landmark[]):HeadPosition|null {
 const left=points[33],right=points[263];
 if(!left||!right||![left.x,left.y,right.x,right.y].every(Number.isFinite))return null;
 const scale=Math.hypot(left.x-right.x,left.y-right.y);
 if(scale<.025)return null;
 return {x:(left.x+right.x)/2,y:(left.y+right.y)/2,scale};
}
export function relativeOffset(head:HeadPosition,center:HeadPosition){
 // Translation of eye midpoint in camera space; normalized by calibrated face size.
 return {x:clamp((head.x-center.x)/Math.max(.025,center.scale)*2),y:clamp((center.y-head.y)/Math.max(.025,center.scale)*2)};
}
export function smooth(current:number,target:number,seconds:number){
 return current+(target-current)*(1-Math.exp(-Math.max(0,Math.min(seconds,.1))*10));
}
