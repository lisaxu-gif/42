"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Inspect = { title:string; body:string; image?:string; actions?:{label:string;run:()=>void}[] } | null;
type Hotspot = { id:string; label:string; yaw:number; pitch:number };

const DEBUG_HOTSPOTS=false;
const ASSETS={
  panorama:"/art-panorama/sphere.jpg",
  tomie:"/gate-scene/honor-board.png",
  newspaper:"/gate-scene/bag-closeup.jpg",
};
const HOTSPOTS:Hotspot[]=[
  {id:"floor1",label:"调查地上的画",yaw:-1.08,pitch:-.48},{id:"floor2",label:"调查地上的画",yaw:.18,pitch:-.52},{id:"floor3",label:"调查地上的画",yaw:1.12,pitch:-.46},
  {id:"slotA",label:"调查空画框 A",yaw:-.72,pitch:.05},{id:"slotB",label:"调查空画框 B",yaw:0,pitch:.07},{id:"slotC",label:"调查空画框 C",yaw:.72,pitch:.05},
  {id:"chair",label:"调查模特椅",yaw:Math.PI,pitch:-.18},{id:"newspaper",label:"调查旧报纸",yaw:2.35,pitch:-.32},
  {id:"clock",label:"调查墙上时钟",yaw:-2.3,pitch:.25},{id:"torch",label:"调查应急手电",yaw:1.82,pitch:-.25},
  {id:"recorder",label:"调查旧录音机",yaw:2.72,pitch:-.22},{id:"portrait",label:"调查女生自画像",yaw:-1.72,pitch:.08},
];

function direction(yaw:number,pitch:number,r=96){return new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(r)}

export default function ArtPanorama({onComplete}:{onComplete:()=>void}){
  const mount=useRef<HTMLDivElement>(null); const cameraRef=useRef<THREE.PerspectiveCamera|null>(null);
  const [ready,setReady]=useState(false),[yaw,setYaw]=useState(0),[pitch,setPitch]=useState(0),[inspect,setInspect]=useState<Inspect>(null);
  const [held,setHeld]=useState<number|null>(null),[floor,setFloor]=useState([true,true,true]),[slots,setSlots]=useState<(number|null)[]>([null,null,null]);
  const [battery,setBattery]=useState(false),[powered,setPowered]=useState(false),[code,setCode]=useState(""),[recorded,setRecorded]=useState(false);
  const [seen,setSeen]=useState(new Set<string>()),[lockedPuzzle,setLockedPuzzle]=useState(false),[anomaly,setAnomaly]=useState(false),[finalEvent,setFinalEvent]=useState(false);
  const [screen,setScreen]=useState({w:innerWidth,h:innerHeight});
  const correct=slots[0]===1&&slots[1]===0&&slots[2]===2;
  const mark=useCallback((id:string)=>setSeen(s=>new Set(s).add(id)),[]);

  useEffect(()=>{if(correct&&!lockedPuzzle){setLockedPuzzle(true);setTimeout(()=>setAnomaly(true),500);setTimeout(()=>setAnomaly(false),1050)}},[correct,lockedPuzzle]);
  useEffect(()=>{if(recorded&&lockedPuzzle&&seen.has("chair")&&seen.has("portrait")&&!finalEvent){setFinalEvent(true);setTimeout(onComplete,5200)}},[recorded,lockedPuzzle,seen,finalEvent,onComplete]);

  useEffect(()=>{
    const host=mount.current;if(!host)return;const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,150);camera.rotation.order="YXZ";cameraRef.current=camera;
    const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
    const tex=new THREE.TextureLoader().load(ASSETS.panorama,()=>setReady(true));tex.colorSpace=THREE.SRGBColorSpace;const sphere=new THREE.Mesh(new THREE.SphereGeometry(100,64,40),new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide}));sphere.scale.x=-1;scene.add(sphere);
    let frame=0;const draw=()=>{renderer.render(scene,camera);frame=requestAnimationFrame(draw)};draw();
    const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);setScreen({w:innerWidth,h:innerHeight})};addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(frame);removeEventListener("resize",resize);tex.dispose();sphere.geometry.dispose();(sphere.material as THREE.Material).dispose();renderer.dispose();host.removeChild(renderer.domElement)};
  },[]);
  useEffect(()=>{cameraRef.current?.rotation.set(pitch,yaw,0,"YXZ")},[yaw,pitch]);

  const projected=useMemo(()=>HOTSPOTS.map(h=>{const cam=cameraRef.current;if(!cam)return {...h,show:false,x:0,y:0};cam.updateMatrixWorld();const v=direction(h.yaw,h.pitch);v.project(cam);return {...h,show:v.z>-1&&v.z<1&&v.x>-1.05&&v.x<1.05&&v.y>-1.05&&v.y<1.05,x:(v.x*.5+.5)*screen.w,y:(-.5*v.y+.5)*screen.h}}),[ready,yaw,pitch,screen]);
  const inspectPainting=(n:number)=>{mark(`tomie${n+1}`);setInspect({title:`人物画 ${n+1}`,image:ASSETS.tomie,body:n===0?"这个人……\n川上富江。":n===1?"又是她。":"还是同一个人。\n画法好像不太一样。",actions:floor[n]?[{label:held===null?"拿起":"先把手里的放下",run:()=>{if(held===null){setHeld(n);setFloor(f=>f.map((v,i)=>i===n?false:v));setInspect(null)}}}]:undefined})};
  const clickHotspot=(id:string)=>{
    if(id.startsWith("floor")){const n=Number(id.at(-1))-1;if(floor[n])inspectPainting(n);return}
    if(id.startsWith("slot")){const n="ABC".indexOf(id.at(-1)!);const placed=slots[n];if(placed!==null){inspectPainting(placed);setInspect({title:`墙上的人物画 ${placed+1}`,image:ASSETS.tomie,body:"她的视线像是越过了我。",actions:lockedPuzzle?undefined:[{label:"取下",run:()=>{if(held===null){setHeld(placed);setSlots(s=>s.map((v,i)=>i===n?null:v));setInspect(null)}}}]});return}setInspect({title:"空画框",body:"这里原本似乎挂着一幅画。",actions:held===null?undefined:[{label:"放置",run:()=>{setSlots(s=>s.map((v,i)=>i===n?held:v));setHeld(null);setInspect(null)}}]});return}
    mark(id);
    if(id==="chair")setInspect({title:"中央模特椅",body:"像是有人曾经一直坐在这里。\n\n黑色的长发……"});
    if(id==="newspaper")setInspect({title:"旧报纸",image:ASSETS.newspaper,body:"女学生校内坠亡\n川上——\n美术部\n多名学生在场\n事故时间：21：__"});
    if(id==="clock")setInspect({title:"停止的钟",body:"停在21:42。"});
    if(id==="torch")setInspect({title:"应急手电",body:battery?"电池仓已经空了。":"应急手电。",actions:battery?undefined:[{label:"取出电池",run:()=>{setBattery(true);setInspect(null)}}]});
    if(id==="recorder"){if(!battery){setInspect({title:"旧录音机",body:"没电。"});return}if(!powered){setInspect({title:"旧录音机",body:"电池槽还能打开。",actions:[{label:"装入电池",run:()=>{setPowered(true);setInspect(null)}}]});return}setInspect({title:"磁带录音机",body:"四位数字。"})}
    if(id==="portrait")setInspect({title:"女生自画像",image:ASSETS.tomie,body:recorded?"……\n刚才有这颗痣吗？":"这不是川上富江。\n但……为什么有点像？"});
  };
  const submit=()=>{if(code!=="2142"){setCode("");return}setRecorded(true);setInspect({title:"PLAY",body:"“别学我。”\n\n沙沙的杂音。\n\n“你永远都不会是我。”\n\n桌椅撞击。远处有人喊：“小心！”\n随后，是坠落声。"});setCode("");setTimeout(()=>setAnomaly(true),900);setTimeout(()=>setAnomaly(false),2600)};
  const drag=useRef({on:false,x:0,y:0,moved:false});
  const down=(e:React.PointerEvent)=>{if(inspect)return;drag.current={on:true,x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId)};
  const move=(e:React.PointerEvent)=>{if(!drag.current.on||inspect)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;drag.current.x=e.clientX;drag.current.y=e.clientY;drag.current.moved||=Math.abs(dx)+Math.abs(dy)>2;setYaw(v=>v-dx*.0045);setPitch(v=>THREE.MathUtils.clamp(v-dy*.0038,-1.18,1.18))};
  return <section className={`panorama ${finalEvent?"panorama-final":""}`} onPointerDown={down} onPointerMove={move} onPointerUp={()=>drag.current.on=false}>
    <div ref={mount} className="panorama-canvas"/>{!ready&&<div className="art-loading">沙……　沙……　沙……</div>}
    {ready&&!inspect&&projected.filter(h=>h.show).map(h=>{const slot=h.id.startsWith("slot")?slots["ABC".indexOf(h.id.at(-1)!)]:null;const visible=!h.id.startsWith("floor")||floor[Number(h.id.at(-1))-1];return visible&&<button key={h.id} className={`pano-hotspot ${DEBUG_HOTSPOTS?"debug":""}`} style={{left:h.x,top:h.y}} onPointerDown={e=>e.stopPropagation()} onClick={()=>clickHotspot(h.id)}>{slot!==null?`查看人物画 ${slot+1}`:h.label}</button>})}
    {held!==null&&<div className="held-painting">手中有一幅画 · {held+1}</div>}
    {lockedPuzzle&&<div className={`art-flicker ${anomaly?"on":""}`}/>} {finalEvent&&<div className="empty-frame-event"><span>铅笔落在了身后。</span></div>}
    <div className="pano-help">按住鼠标左键拖动观察　·　点击光点调查</div>
    {powered&&!recorded&&!inspect&&<div className="recorder-code"><div>索尼 TCM-42</div><input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" maxLength={4} placeholder="••••"/><button onClick={submit}>播放</button></div>}
    {inspect&&<div className="pano-inspect" onPointerDown={e=>e.stopPropagation()}><div className="pano-panel">{inspect.image&&<img src={inspect.image} alt="调查特写"/>}<h3>{inspect.title}</h3><p>{inspect.body}</p><div>{inspect.actions?.map(a=><button key={a.label} onClick={a.run}>{a.label}</button>)}<button onClick={()=>setInspect(null)}>返回</button></div></div></div>}
  </section>
}
