import './style.css';
import {AppController} from './AppController';
const image=document.getElementById('original') as HTMLImageElement;
const imageError=document.getElementById('image-error')!;
const app=new AppController();
image.src=`${import.meta.env.BASE_URL}aurora.jpg`;
async function boot(){
 try{await image.decode();}catch{imageError.hidden=false;app.fallback();return;}
 try{
  const {PhotoDepthScene}=await import('./scene/PhotoDepthScene');
  const scene=await PhotoDepthScene.create(document.getElementById('webgl')!,image.src);
  app.attach(scene);
  const canvas=document.querySelector('canvas')!;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.style.display='none';app.fallback();});
 }catch{app.fallback();}
}
void boot();
