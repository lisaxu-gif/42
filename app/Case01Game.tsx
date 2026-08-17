"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import {audioManager} from "./case01/AudioManager";

type Mode = "title" | "gate" | "playing" | "ending";
type Modal = { title: string; body: string; kind?: "keypad" } | null;

const OBJECTIVES = [
  "调查校门，找到能够通过认证的方法",
  "取下优秀学生墙上的川上富江照片",
  "将照片放到人脸识别摄像头前",
  "进入美术室，归位三幅掉落的画",
  "调查讲台下的旧报纸",
  "从应急手电中取出电池",
  "为录音机供电并输入四位时间",
  "观察镜中的自画像",
  "拿走出现的宿舍钥匙",
  "前往女生宿舍",
  "根据物品标记依次归位四个娃娃",
  "调查没有姓名牌的第五个娃娃",
  "掀开宿舍镜子上的蒙布",
  "靠近镜子，确认自己的身份",
];

function canvasTexture(draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, w=512, h=512) {
  const el=document.createElement("canvas"); el.width=w; el.height=h;
  const c=el.getContext("2d")!; draw(c,w,h);
  const t=new THREE.CanvasTexture(el); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t;
}

const GATE_ASSETS={main:"/gate-scene/gate-main.png",access:"/gate-scene/access-closeup.jpg",board:"/gate-scene/honor-board.png",gate:"/gate-scene/gate-closeup.jpg",bag:"/gate-scene/bag-closeup.jpg",bicycle:"/gate-scene/bicycle-closeup.jpg"};
type GateView="access"|"gate"|"board"|"school"|"bag"|"tomie"|"student"|null;

export function GateScene({onComplete,onPhoto}:{onComplete:()=>void;onPhoto:()=>void}){
  const [view,setView]=useState<GateView>(null);const [photo,setPhoto]=useState(false);const [bagOpen,setBagOpen]=useState(false);const [gateOpen,setGateOpen]=useState(false);const [status,setStatus]=useState("");const [notice,setNotice]=useState("");const [flicker,setFlicker]=useState(false);const [authMode,setAuthMode]=useState<"choose"|"student"|"face">("choose");const [studentId,setStudentId]=useState("");const [boardStage,setBoardStage]=useState<"overview"|"detail">("overview");
  const resetAuth=useCallback(()=>{setStatus("");setStudentId("");setAuthMode("choose")},[]);const close=useCallback(()=>{if(status==="正在识别……")return;setView(null);setBagOpen(false);resetAuth()},[resetAuth,status]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="Escape")close();if(view==="access"&&authMode==="student"){if(/^\d$/.test(e.key))setStudentId(v=>(v+e.key).slice(0,12));if(e.key==="Backspace")setStudentId(v=>v.slice(0,-1));if(e.key==="Enter"){setStatus("身份认证失败");setTimeout(()=>setStatus(""),1600)}}};addEventListener("keydown",key);return()=>removeEventListener("keydown",key)},[authMode,close,view]);
  const takePhoto=()=>{setPhoto(true);onPhoto();setNotice("获得：川上富江的照片");setTimeout(()=>setNotice(""),1700);setFlicker(true);setTimeout(()=>setFlicker(false),420);setView("board")};
  const verify=()=>{if(!photo){setStatus("未检测到有效身份");setTimeout(()=>setStatus(""),1700);return}setStatus("正在识别……");setTimeout(()=>{audioManager.playEffect("accessOpen");setStatus("身份验证通过")},1100);setTimeout(()=>setStatus("欢迎回来"),2100);setTimeout(()=>{audioManager.playEffect("gateOpen");setStatus("");setView(null);setGateOpen(true);setNotice("门开了。");setTimeout(()=>setNotice(""),1800)},4200)};const failStudentId=()=>{setStatus("身份认证失败");setTimeout(()=>setStatus(""),1700)};
  const mainHotspots=[
    {id:"access",label:"互动",style:{left:"28.5%",top:"52.5%",width:"6.5%",height:"23%"}},
    {id:"gate",label:gateOpen?"进入":"调查",style:{left:"37.5%",top:"52%",width:"27%",height:"31%"}},
    {id:"board",label:"调查",style:{left:"72%",top:"51.5%",width:"15%",height:"22%"}},
    {id:"school",label:"调查",style:{left:"42%",top:"17%",width:"42%",height:"25%"}},
    {id:"bag",label:"调查",style:{left:"43%",top:"86%",width:"13%",height:"11%"}},
  ];
  const openMain=(id:string)=>{audioManager.playEffect();if(id==="gate"&&gateOpen){onComplete();return}if(id==="access")resetAuth();if(id==="board")setBoardStage("overview");setView(id as GateView)};
  const thought=view==="access"?"老旧门禁仍然通电。":
    view==="gate"?"被铁链拴住的门。除了通过门禁，应该没有其他办法打开了。":view==="board"?"这些是以前的优秀学生吗……完全不记得了。":
    view==="tomie"?"为什么这个名字……有点熟悉。":view==="student"?"没什么印象。":view==="school"?"教学楼里一片漆黑……但好像还有一扇窗户亮着。":view==="bag"?(bagOpen?"美术部？":"已经湿透了。里面几乎什么都没有。青苔味很重。 一张折起来的纸压在最上面。 🆂") :"";
  return <section className={`gate-scene ${gateOpen?"is-open":""}`} aria-label="废弃学校校门固定镜头调查场景">
    <img className="gate-bg" src={GATE_ASSETS.main} alt="雨中的废弃日式高中校门"/><div className="gate-rain"/><div className={`window-glow ${flicker?"flicker":""}`}/>
    {!view&&mainHotspots.map(h=><button key={h.id} className="hotspot" style={h.style} aria-label={`${h.id}-${h.label}`} onClick={()=>openMain(h.id)}><span>{h.label}</span></button>)}
    {view&&<div className="focus-layer" onClick={e=>{if(e.currentTarget===e.target)close()}}>
      <div className="focus-content">
        {view==="school"?<div className="school-crop"/>:view==="tomie"?<div className="tomie-crop"><span>川上富江<br/>20011128</span></div>:<img className="focus-image" src={view==="access"?GATE_ASSETS.access:view==="gate"?GATE_ASSETS.gate:view==="board"||view==="student"?GATE_ASSETS.board:GATE_ASSETS.bag} alt="调查特写"/>}
        {view==="board"&&<div className="board-zones"><button className="student-zone s1" aria-label="查看普通学生田中太郎" onClick={()=>setView("student")}/><button className="student-zone s2" aria-label="查看普通学生佐藤健" onClick={()=>setView("student")}/><button className="student-zone s3" aria-label="查看普通学生田中澪" onClick={()=>setView("student")}/>{boardStage==="overview"&&!photo&&<span className="concealed-photo">历届优秀学生</span>}{boardStage==="detail"&&!photo&&<button className="student-zone tomie" aria-label="调查川上富江照片" onClick={()=>setView("tomie")}/>} {photo&&<span className="empty-photo">照片被取走了</span>}</div>}
        {view==="access"&&status&&<div className="access-status">{status}</div>}
        {view==="access"&&authMode==="face"&&status&&photo&&<div className="held-photo"/>}
        <p className="focus-thought">{view==="tomie"&&<><span>川上富江……</span><br/></>}{thought}</p>
        {view==="access"&&<div className="auth-panel">{authMode==="choose"&&<><h3>请选择认证方式</h3><button onClick={()=>setAuthMode("student")}>学号认证</button><button onClick={()=>setAuthMode("face")}>人脸识别</button></>}{authMode==="student"&&<><h3>请输入学号</h3><output>{studentId||"_"}</output><div className="auth-keypad">{[1,2,3,4,5,6,7,8,9,0].map(n=><button key={n} onClick={()=>setStudentId(v=>(v+n).slice(0,12))}>{n}</button>)}</div><button onClick={()=>setStudentId(v=>v.slice(0,-1))}>删除</button><button onClick={failStudentId}>确认</button><button onClick={resetAuth}>返回</button></>}{authMode==="face"&&<><h3>人脸识别</h3><p>请将有效身份置于识别区域</p>{!status&&<button onClick={verify}>{photo?"使用照片":"开始扫描"}</button>}<button onClick={resetAuth}>返回</button></>}</div>}
        <div className="focus-actions">{view==="board"&&boardStage==="overview"&&<button onClick={()=>setBoardStage("detail")}>继续查看</button>}{view==="tomie"&&!photo&&<button onClick={takePhoto}>取下照片</button>}{view==="bag"&&!bagOpen&&<button onClick={()=>setBagOpen(true)}>继续查看</button>}<button onClick={close}>返回</button></div>
      </div>
    </div>}
    {notice&&<div className="gate-notice">{notice}</div>}<div className="gate-help">移动鼠标寻找可调查的位置　·　退出键返回</div>
  </section>
}

export default function Case01Game() {
  const mount=useRef<HTMLDivElement>(null);
  const engine=useRef<{dispose:()=>void; lock:()=>void; reset:()=>void}|null>(null);
  const stepRef=useRef(0);
  const [mode,setMode]=useState<Mode>("title");
  const [step,setStepState]=useState(0);
  const [prompt,setPrompt]=useState("");
  const [subtitle,setSubtitle]=useState("");
  const [toast,setToast]=useState("");
  const [modal,setModal]=useState<Modal>(null);
  const [code,setCode]=useState("");
  const [inventory,setInventory]=useState<string[]>([]);
  const [artLoading,setArtLoading]=useState(true);
  const [artLoadError,setArtLoadError]=useState(false);
  const timers=useRef<number[]>([]);

  const later=useCallback((fn:()=>void,ms:number)=>{const id=window.setTimeout(fn,ms);timers.current.push(id);},[]);
  const say=useCallback((s:string,ms=3300)=>{setSubtitle(s);later(()=>setSubtitle(""),ms)},[later]);
  const flash=useCallback((s:string,ms=2300)=>{setToast(s);later(()=>setToast(""),ms)},[later]);
  const setStep=useCallback((n:number)=>{stepRef.current=n;setStepState(n)},[]);
  const addItem=useCallback((s:string)=>setInventory(v=>v.includes(s)?v:[...v,s]),[]);

  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);

  useEffect(()=>{
    if(!mount.current) return;
    const host=mount.current;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x182329); scene.fog=new THREE.FogExp2(0x1b292d,.018);
    const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.08,120); camera.position.set(0,1.65,28);
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
    renderer.domElement.tabIndex=0;
    renderer.domElement.setAttribute("aria-label","第一人称游戏画面，点击锁定鼠标");
    host.appendChild(renderer.domElement);
    const controls=new PointerLockControls(camera,renderer.domElement);
    controls.disconnect();
    let splatViewer:GaussianSplats3D.Viewer|null=null;let splatReady=false;
    const ambient=new THREE.HemisphereLight(0x9cb2b8,0x18221f,.82); scene.add(ambient);
    const moon=new THREE.DirectionalLight(0xb7cbd0,1.65); moon.position.set(-7,10,8); moon.castShadow=true; scene.add(moon);
    const flashlight=new THREE.SpotLight(0xdce8dc,3.3,18,Math.PI/7,.45,1.4); flashlight.position.set(0,-.05,.15); flashlight.target.position.set(0,0,-4); camera.add(flashlight,flashlight.target); scene.add(camera);
    const concreteTex=canvasTexture((c,w,h)=>{c.fillStyle="#69716f";c.fillRect(0,0,w,h);for(let i=0;i<6000;i++){const v=50+Math.random()*90;c.fillStyle=`rgba(${v},${v+4},${v+2},${Math.random()*.08})`;c.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3)}for(let i=0;i<22;i++){const x=Math.random()*w;c.fillStyle="rgba(25,40,36,.12)";c.fillRect(x,0,2+Math.random()*11,h*(.25+Math.random()*.75))}c.strokeStyle="rgba(35,43,41,.22)";c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();let x=Math.random()*w,y=Math.random()*h;c.moveTo(x,y);for(let j=0;j<5;j++){x+=Math.random()*35-17;y+=Math.random()*45;c.lineTo(x,y)}c.stroke()}},512,512);concreteTex.wrapS=concreteTex.wrapT=THREE.RepeatWrapping;concreteTex.repeat.set(3,1);
    const asphaltTex=canvasTexture((c,w,h)=>{c.fillStyle="#202827";c.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=55+Math.random()*70;c.fillStyle=`rgba(${v},${v+3},${v+2},${Math.random()*.09})`;c.fillRect(Math.random()*w,Math.random()*h,1.5,1.5)}c.strokeStyle="rgba(6,11,10,.55)";c.lineWidth=3;for(let i=0;i<12;i++){c.beginPath();let x=Math.random()*w,y=0;c.moveTo(x,y);for(let j=0;j<8;j++){x+=Math.random()*30-15;y+=h/7;c.lineTo(x,y)}c.stroke()}},512,512);asphaltTex.wrapS=asphaltTex.wrapT=THREE.RepeatWrapping;asphaltTex.repeat.set(4,12);
    const mats={
      wall:new THREE.MeshStandardMaterial({color:0x7a8380,map:concreteTex,roughness:.96}), floor:new THREE.MeshStandardMaterial({color:0x34413e,map:asphaltTex,roughness:.34,metalness:.08}),
      wood:new THREE.MeshStandardMaterial({color:0x392d26,roughness:.82}), metal:new THREE.MeshStandardMaterial({color:0x35423f,roughness:.6,metalness:.45}),
      paper:new THREE.MeshStandardMaterial({color:0xa8aaa0,roughness:.9}), red:new THREE.MeshStandardMaterial({color:0x65151b,roughness:.8}),
      black:new THREE.MeshStandardMaterial({color:0x080c0b,roughness:.66}), skin:new THREE.MeshStandardMaterial({color:0xb9a59b,roughness:.9})
    };
    const interactives:THREE.Object3D[]=[]; let hovered:THREE.Object3D|null=null; let locked=false,fallbackActive=false,dragging=false,dragMoved=false,started=false;
    let fallbackYaw=0,fallbackPitch=0,lastPointerX=0,lastPointerY=0;
    let velocity=new THREE.Vector3(); const keys:Record<string,boolean>={}; const ray=new THREE.Raycaster(); ray.far=3.1;
    const box=(name:string,pos:[number,number,number],scale:[number,number,number],mat:THREE.Material=mats.wall)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...scale),mat);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m};
    const plane=(name:string,pos:[number,number,number],scale:[number,number],mat:THREE.Material,rotY=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(...scale),mat);m.name=name;m.position.set(...pos);m.rotation.y=rotY;scene.add(m);return m};
    const mark=(o:THREE.Object3D,label:string,id:string)=>{o.userData={label,id};interactives.push(o);return o};
    const textTex=(lines:string[],bg="#c7c6b8",fg="#202723")=>canvasTexture((c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.fillStyle=fg;c.textAlign="center";c.font="bold 28px serif";lines.forEach((s,i)=>c.fillText(s,w/2,70+i*52));for(let i=0;i<24;i++){c.globalAlpha=.08;c.fillRect(Math.random()*w,Math.random()*h,Math.random()*90+15,2)}c.globalAlpha=1});
    const portraitTex=(tomie=false,variant=0)=>canvasTexture((c,w,h)=>{c.fillStyle="#9a9b91";c.fillRect(0,0,w,h);c.strokeStyle="#2b302e";c.lineWidth=7;c.beginPath();c.ellipse(w*.5,h*.42,94,122,0,0,Math.PI*2);c.stroke();c.fillStyle="#171b1a";c.beginPath();c.moveTo(125,310);c.quadraticCurveTo(120,55,256+(variant*7),58);c.quadraticCurveTo(405,70,390,330);c.quadraticCurveTo(320,240,256,260);c.quadraticCurveTo(190,240,125,310);c.fill();c.fillStyle="#b6aaa0";c.beginPath();c.ellipse(256,225,64,94,0,0,Math.PI*2);c.fill();c.fillStyle="#202423";c.fillRect(220,210,16,5);c.fillRect(276,210,16,5);c.fillStyle="#7b2027";c.fillRect(241,273,34,6);if(tomie){c.fillStyle="#171b1a";c.beginPath();c.arc(294,247,4.5,0,7);c.fill()}c.globalAlpha=.2;c.font="18px monospace";c.fillText(String(variant+1).padStart(2,"0")+" / K.F.",22,485)});

    // Architectural spine: broad exterior road narrows into the impossible interior after the gate.
    box("ground",[0,-.12,1],[24,.2,78],mats.floor);
    box("outdoor left boundary",[-11.7,1.1,23],[.35,2.2,18],mats.wall);box("outdoor right boundary",[11.7,1.1,23],[.35,2.2,18],mats.wall);
    box("left wall",[-7,2,-8],[.3,4.4,42]); box("right wall",[7,2,-8],[.3,4.4,42]);
    box("ceiling",[0,4.15,-8],[14.3,.18,42],mats.wall);
    for(let z=-28;z<30;z+=5){const l=new THREE.PointLight(z%10===0?0xc5ded7:0x91aaa3,.65,8,2);l.position.set(0,3.65,z);scene.add(l);box("fluorescent",[0,3.92,z],[2.2,.08,.18],new THREE.MeshBasicMaterial({color:0xb6cec7}));}
    // SCENE 01: wet Japanese school approach, inferred as a full explorable space from the reference.
    box("left gate wall",[-8,1.2,13],[8,2.4,.55],mats.wall);box("right gate wall",[8,1.2,13],[8,2.4,.55],mats.wall);
    box("left gate pillar",[-4.25,1.5,13],[.65,3,.75],mats.wall);box("right gate pillar",[4.25,1.5,13],[.65,3,.75],mats.wall);
    const gateLeft=new THREE.Group(),gateRight=new THREE.Group();gateLeft.name="GateLeft";gateRight.name="GateRight";scene.add(gateLeft,gateRight);
    const gateRust=new THREE.MeshStandardMaterial({color:0x4b4d48,roughness:.84,metalness:.62});
    const gatePart=(g:THREE.Group,x:number)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.11,2.35,.18),gateRust);m.position.set(x,1.18,13);m.castShadow=true;g.add(m)};
    for(let x=-3.85;x<0;x+=.38)gatePart(gateLeft,x);for(let x=.05;x<3.9;x+=.38)gatePart(gateRight,x);
    [-3.75,-1.9,.15,2.05].forEach(x=>box("gate brace",[x,1.2,13],[1.8,.11,.2],gateRust));
    const schoolSign=plane("学校名称牌",[-7.45,1.65,12.69],[5.2,.72],new THREE.MeshStandardMaterial({map:textTex(["县立御狱高等学校"],"#252a29","#aeb5b0"),roughness:.65}));mark(schoolSign,"查看校牌","school-sign");
    const scannerBody=box("人脸识别摄像头",[-4.8,1.35,12.52],[.62,1.35,.42],mats.metal);mark(scannerBody,"使用人脸识别","scanner");
    const scannerCanvas=document.createElement("canvas");scannerCanvas.width=384;scannerCanvas.height=256;const scannerCtx=scannerCanvas.getContext("2d")!;const scannerTexture=new THREE.CanvasTexture(scannerCanvas);scannerTexture.colorSpace=THREE.SRGBColorSpace;
    const setScanner=(line1:string,line2:string,color="#79b796")=>{scannerCtx.fillStyle="#07120f";scannerCtx.fillRect(0,0,384,256);scannerCtx.strokeStyle="#203d34";for(let y=0;y<256;y+=8){scannerCtx.beginPath();scannerCtx.moveTo(0,y);scannerCtx.lineTo(384,y);scannerCtx.stroke()}scannerCtx.fillStyle=color;scannerCtx.textAlign="center";scannerCtx.font="bold 34px monospace";scannerCtx.fillText(line1,192,105);scannerCtx.font="25px monospace";scannerCtx.fillText(line2,192,157);scannerTexture.needsUpdate=true};setScanner("学号认证","人脸识别");
    plane("动态门禁屏幕",[-4.8,1.48,12.285],[.45,.3],new THREE.MeshBasicMaterial({map:scannerTexture}));
    const scanGlow=new THREE.MeshBasicMaterial({color:0x8b181e});plane("scanner lens",[-4.8,1.86,12.28],[.2,.14],scanGlow);
    for(let k=0;k<12;k++){const key=box("keypad",[-4.95+(k%3)*.12,.98-Math.floor(k/3)*.11,12.27],[.07,.065,.025],mats.black);key.castShadow=false}box("card reader",[-4.63,.78,12.27],[.17,.3,.035],mats.black);
    // Glass excellence display on the right. Twelve portraits; Tomie is deliberately unremarkable.
    box("优秀学生展示栏",[7.2,1.65,12.52],[5.6,2.55,.34],mats.metal);plane("展示栏背板",[7.2,1.65,12.32],[5.2,2.18],new THREE.MeshStandardMaterial({color:0x26322d,roughness:.75}));
    for(let i=0;i<12;i++){const x=5.12+(i%4)*1.38,y=2.15-Math.floor(i/4)*.7;const p=plane("优秀学生照片",[x,y,12.28],[.56,.63],new THREE.MeshStandardMaterial({map:portraitTex(i===7,i),roughness:.72}));if(i===7)mark(p,"查看学生照片","tomie-photo");}
    plane("优秀学生",[7.2,2.77,12.27],[2.8,.28],new THREE.MeshStandardMaterial({map:textTex(["歴代優秀生徒"],"#c8c5b5","#2a332f"),roughness:.8}));
    // Four-storey teaching block with only the art-room window lit.
    const buildingMat=new THREE.MeshStandardMaterial({color:0x66716e,map:concreteTex,roughness:.94});box("教学楼左翼",[-5.3,6,-2],[8.4,12,3.2],buildingMat);box("教学楼右翼",[5.3,6,-2],[8.4,12,3.2],buildingMat);box("教学楼连廊",[0,10,-2],[3,4,3.2],buildingMat);
    const darkWindow=new THREE.MeshStandardMaterial({color:0x101817,roughness:.25,metalness:.25});const litWindow=new THREE.MeshBasicMaterial({color:0xc89757});
    for(let floor=0;floor<4;floor++)for(let col=-5;col<=5;col++){if(Math.abs(col)<2&&floor<2)continue;const lit=floor===2&&col===4;plane(lit?"亮着的美术室":"黑暗窗户",[col*1.35,2.1+floor*2.55,-.34],[.88,1.15],lit?litWindow:darkWindow);}
    box("教学楼入口顶",[0,3.35,-.4],[3.2,.35,1.6],buildingMat);box("教学楼入口左",[-1.35,1.55,-.45],[.4,3.1,1.4],buildingMat);box("教学楼入口右",[1.35,1.55,-.45],[.4,3.1,1.4],buildingMat);
    // Utility poles and sagging wires.
    const wireMat=new THREE.LineBasicMaterial({color:0x151b1a});for(const px of [-10,10]){for(const pz of [16,27]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,9,10),mats.metal);pole.position.set(px,4.4,pz);scene.add(pole);box("pole arm",[px,7.8,pz],[2.2,.1,.1],mats.metal)}for(let wi=0;wi<4;wi++){const pts=[];for(let s=0;s<=16;s++){const t=s/16;pts.push(new THREE.Vector3(px-1+wi*.6,7.8-Math.sin(t*Math.PI)*.6,13+t*18))}scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wireMat))}}
    // Puddles, weeds, bicycle, rack, notice board and bins.
    const puddleMat=new THREE.MeshStandardMaterial({color:0x718b8a,transparent:true,opacity:.34,roughness:.12,metalness:.28});[[-5,24,1.9],[4,20,1.4],[-2,16,.9],[7,27,1.2]].forEach(([x,z,s])=>{const p=new THREE.Mesh(new THREE.CircleGeometry(s,28),puddleMat);p.rotation.x=-Math.PI/2;p.position.set(x,.012,z);scene.add(p)});
    const weedMat=new THREE.MeshStandardMaterial({color:0x293c32,roughness:1});for(let i=0;i<55;i++){const h=.18+Math.random()*.55;const w=new THREE.Mesh(new THREE.ConeGeometry(.035,h,5),weedMat);w.position.set((Math.random()>.5?1:-1)*(8.8+Math.random()*2),h/2,13+Math.random()*18);w.rotation.z=(Math.random()-.5)*.45;scene.add(w)}
    const bicycle=new THREE.Group();bicycle.position.set(-7.8,.45,17);bicycle.rotation.y=.25;scene.add(bicycle);for(const bx of [-.72,.72]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.42,.035,8,24),gateRust);wheel.rotation.y=Math.PI/2;wheel.position.x=bx;bicycle.add(wheel)}const frame=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,6,3),gateRust);frame.rotation.set(Math.PI/2,0,Math.PI/2);bicycle.add(frame);
    for(let i=0;i<5;i++){const rack=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,8,18,Math.PI),gateRust);rack.rotation.set(0,Math.PI/2,0);rack.position.set(5.5+i*.8,.4,15);scene.add(rack)}
    box("公告栏",[9.7,1.2,18],[2.8,2.4,.35],mats.metal);plane("公告",[9.7,1.3,17.8],[2.45,1.85],new THREE.MeshStandardMaterial({map:textTex(["学校行事","立入禁止","美術部 21:42"],"#b8b6a7","#313936"),roughness:.8}));
    box("垃圾桶",[9.8,.65,22],[1.1,1.3,.9],new THREE.MeshStandardMaterial({color:0x263633,roughness:.75}));box("垃圾桶",[8.5,.65,22],[1.1,1.3,.9],new THREE.MeshStandardMaterial({color:0x263633,roughness:.75}));

    // Art room zone z 2 to -9.
    box("art divider left",[-5.8,2,2],[2.4,4,.2]);box("art divider right",[5.8,2,2],[2.4,4,.2]);
    const blackboard=plane("黑板",[0,2.35,-9.83],[7.2,2.2],new THREE.MeshStandardMaterial({color:0x162b27,roughness:.92}));
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=-4.5+c*3,z=-1-r*2.5;box("画架",[x,.78,z],[1.35,.12,.8],mats.wood);box("画架腿",[x-.46,.35,z],[.09,.75,.09],mats.wood);box("画架腿",[x+.46,.35,z],[.09,.75,.09],mats.wood);}
    for(let i=0;i<5;i++){const p=plane("富江肖像",[-4+i*2,2.2,-9.69],[1.45,1.8],new THREE.MeshStandardMaterial({map:portraitTex(true,i+10),roughness:.9}));p.userData.painting=true;}
    const chair=box("空模特椅",[0,.88,-7.3],[1.1,.12,1.1],mats.wood);box("椅背",[0,1.48,-7.72],[1.1,1.1,.12],mats.wood);box("黑色长发",[0,.98,-7.3],[.05,.04,.82],mats.black).rotation.y=.3;
    const fallenPositions:[number,number,number][]=[[-4,.04,-4],[1,.04,-1],[4,.04,-5.5]];
    fallenPositions.forEach((p,i)=>{const m=plane("掉落的画",p,[1.25,1.55],new THREE.MeshStandardMaterial({map:portraitTex(true,20+i)}));m.rotation.x=-Math.PI/2;mark(m,"将画归位",`painting-${i}`)});
    const newspaper=mark(plane("旧报纸",[-2,.23,-8.4],[1.4,1],new THREE.MeshStandardMaterial({map:textTex(["女学生校内坠亡","川上——　美术部","多名学生在场","21：__"],"#aaa99b","#222724")})),"阅读旧报纸","newspaper");newspaper.rotation.x=-Math.PI/2;
    const clockTex=canvasTexture((c,w,h)=>{c.fillStyle="#ddd9c8";c.fillRect(0,0,w,h);c.strokeStyle="#202724";c.lineWidth=18;c.strokeRect(5,5,w-10,h-10);c.fillStyle="#141817";c.font="bold 130px monospace";c.textAlign="center";c.fillText("21:42",w/2,305)});
    plane("停止的钟",[4.4,3.05,-9.68],[2.1,1.05],new THREE.MeshBasicMaterial({map:clockTex}));
    const torch=mark(box("应急手电",[3.8,.74,-3.5],[.25,.25,.75],mats.metal),"拆下手电电池","battery");
    const recorder=mark(box("旧录音机",[-3.6,.82,-5.8],[1.3,.42,.8],mats.black),"操作录音机","recorder");
    const selfPortrait=mark(plane("普通女生自画像",[5.4,2.05,-9.67],[1.35,1.7],new THREE.MeshStandardMaterial({map:portraitTex(false,32)})),"用镜片观察自画像","self-portrait");
    const keyObj=mark(box("宿舍钥匙",[0,.08,-7.3],[.42,.05,.14],new THREE.MeshStandardMaterial({color:0x9f8b53,metalness:.8,roughness:.25})),"拿走宿舍钥匙","dorm-key");keyObj.visible=false;
    // Dormitory z -14 to -28.
    const door=mark(box("女生宿舍门",[0,1.8,-12],[2.3,3.6,.22],mats.wood),"使用宿舍钥匙","dorm-door");
    const beds:number[]=[]; for(let i=0;i<4;i++){const side=i%2?-1:1;const z=-16-Math.floor(i/2)*5;box("床",[side*4,.65,z],[3.3,.4,2],mats.metal);box("床垫",[side*4,.95,z],[3.1,.25,1.8],new THREE.MeshStandardMaterial({color:i===2?0x4b4343:0x59635f,roughness:1}));beds.push(z);box("储物柜",[side*6,1.35,z],[1.1,2.7,1.1],mats.metal)}
    const dollGroup=new THREE.Group();scene.add(dollGroup);
    const dollColors=[0x6f3438,0x384e64,0x655c38,0x4a604c];
    for(let i=0;i<4;i++){const g=new THREE.Group();const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),mats.skin);head.position.y=.5;const body=new THREE.Mesh(new THREE.ConeGeometry(.28,.65,12),new THREE.MeshStandardMaterial({color:dollColors[i]}));body.position.y=.08;g.add(head,body);g.position.set(-1.2+i*.8,.55,-15);dollGroup.add(g);mark(g,`归位娃娃 ${i+1}`,`doll-${i}`)}
    const fifth=new THREE.Group();const fh=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),mats.skin);fh.position.y=.52;const fb=new THREE.Mesh(new THREE.ConeGeometry(.3,.7,12),new THREE.MeshStandardMaterial({color:0x651b21}));fb.position.y=.07;fifth.add(fh,fb);fifth.position.set(0,.6,-22);fifth.visible=false;scene.add(fifth);mark(fifth,"调查第五个娃娃","fifth-doll");
    const mirrorMat=new THREE.MeshStandardMaterial({color:0x82928d,metalness:.9,roughness:.12});const mirror=mark(plane("蒙布镜子",[0,2.05,-28.72],[2.6,3.5],new THREE.MeshStandardMaterial({color:0x343d3a,roughness:1})),"掀开蒙布","mirror");
    box("镜框上",[0,3.85,-28.65],[2.9,.13,.15],mats.wood);box("镜框下",[0,.25,-28.65],[2.9,.13,.15],mats.wood);
    // clues in dorm
    [[-5.95,2,-15.5],[5.95,2,-15.5],[-5.95,2,-20.5],[5.95,2,-20.5]].forEach((p,i)=>plane("学生照片",p as [number,number,number],[.8,1],new THREE.MeshStandardMaterial({map:portraitTex(i===2,40+i)}),p[0]<0?Math.PI/2:-Math.PI/2));
    const redLight=new THREE.PointLight(0x8f151a,0,10,2);redLight.position.set(0,2,-22);scene.add(redLight);

    // The uploaded environment is a 303,221-point 3D Gaussian Splat PLY (not a triangle mesh).
    // Hide only the legacy procedural art-room shell; gameplay props remain independent.
    const legacyArtNames=new Set(["art divider left","art divider right","黑板","画架","画架腿","富江肖像","空模特椅","椅背"]);
    scene.traverse(o=>{if(legacyArtNames.has(o.name))o.visible=false});
    splatViewer=new GaussianSplats3D.Viewer({selfDrivenMode:false,renderer,camera,useBuiltInControls:false,threeScene:scene,sharedMemoryForWorkers:false,gpuAcceleratedSort:false,enableSIMDInSort:true,integerBasedSort:true,halfPrecisionCovariancesOnGPU:true,dynamicScene:false,renderMode:GaussianSplats3D.RenderMode.Always,sceneRevealMode:GaussianSplats3D.SceneRevealMode.Instant,antialiased:false,sphericalHarmonicsDegree:0,inMemoryCompressionLevel:1,logLevel:GaussianSplats3D.LogLevel.None});
    splatViewer.addSplatScene("/art-room.ply",{splatAlphaRemovalThreshold:8,showLoadingUI:false,progressiveLoad:true,scale:[.22,.22,.22],rotation:[1,0,0,0],position:[.105,2.9,-4.4]}).then(()=>{splatReady=true;camera.position.set(0,1.65,-1.15);camera.rotation.set(0,0,0);velocity.set(0,0,0);setArtLoading(false);renderer.domElement.dataset.splat="ready"}).catch(err=>{console.error("Gaussian art-room PLY failed to load:",err);setArtLoadError(true);setArtLoading(false);renderer.domElement.dataset.splat="fallback"});

    function wrong(){flash("这里没有反应。也许还有线索尚未发现。")}
    const DEBUG_COLLISION=false;
    type Collider={name:string,minX:number,maxX:number,minZ:number,maxZ:number,enabled?:()=>boolean};
    const colliders:Collider[]=[
      {name:"GateWallLeft",minX:-12,maxX:-4.05,minZ:12.65,maxZ:13.35},{name:"GateWallRight",minX:4.05,maxX:12,minZ:12.65,maxZ:13.35},
      {name:"FaceReader",minX:-5.2,maxX:-4.4,minZ:12.05,maxZ:12.95},{name:"HonorBoard",minX:4.25,maxX:10.1,minZ:12.1,maxZ:12.95},
      {name:"NoticeBoard",minX:8.1,maxX:11.2,minZ:17.55,maxZ:18.45},{name:"Bins",minX:7.8,maxX:10.5,minZ:21.45,maxZ:22.6},
      {name:"SchoolLeft",minX:-9.6,maxX:-1.2,minZ:-3.7,maxZ:-.2},{name:"SchoolRight",minX:1.2,maxX:9.6,minZ:-3.7,maxZ:-.2},
      {name:"Gate",minX:-4.05,maxX:4.05,minZ:12.65,maxZ:13.35,enabled:()=>!gateOpen},
      {name:"DormDoor",minX:-1.35,maxX:1.35,minZ:-12.2,maxZ:-11.7,enabled:()=>!doorOpen},
    ];
    if(DEBUG_COLLISION){const dm=new THREE.MeshBasicMaterial({color:0xff294d,wireframe:true,transparent:true,opacity:.55});for(const c of colliders){const h=new THREE.Mesh(new THREE.BoxGeometry(c.maxX-c.minX,2,c.maxZ-c.minZ),dm);h.position.set((c.minX+c.maxX)/2,1,(c.minZ+c.maxZ)/2);scene.add(h)}}
    let paintings=0,dolls=0,hasPhoto=false,hasBattery=false,gateOpen=false,gateOpening=false,gateProgress=0,doorOpen=false;
    function act(id:string,o:THREE.Object3D){
      const s=stepRef.current;
      if(id==="school-sign"){setModal({title:"県立 御獄高等学校",body:"校牌被雨水和青苔侵蚀。最后一个“学校”下面，有人用指甲刻了一个很浅的：42。"})}
      else if(id==="tomie-photo"&&s<=1){if(s===0)setStep(1);hasPhoto=true;o.visible=false;addItem("川上富江的照片");flash("获得：川上富江的照片 / 学号 20011128");setStep(2);say("照片背后写着：别让她看见自己的脸。")}
      else if(id==="scanner"&&s===0){setScanner("认证失败","未检测到人脸","#c44f55");setStep(1);flash("认证失败 · 请出示在校生面孔");later(()=>setScanner("学号认证","人脸识别"),1800)}
      else if(id==="scanner"&&s===1&&!hasPhoto){setScanner("认证失败","人脸识别","#c44f55");flash("需要一张在校生照片");later(()=>setScanner("学号认证","人脸识别"),1600)}
      else if(id==="scanner"&&s===2&&hasPhoto){setScanner("身份验证通过","请稍候");scanGlow.color.set(0x4fa679);say("身份验证通过");later(()=>{setScanner("欢迎回来","川上富江");say("欢迎回来");gateOpening=true;setStep(3)},1000)}
      else if(id.startsWith("painting-")&&s===3){if(!o.visible)return;o.visible=false;paintings++;flash(`画作归位 ${paintings} / 3`);if(paintings===3){setStep(4);say("所有人的视线……都在看那把空椅子。")}}
      else if(id==="newspaper"&&s===4){setModal({title:"昭和晚报 · 残页",body:"女学生校内坠亡\n川上—— / 美术部\n多名学生在场\n死亡时间：21：__\n\n报纸边缘有被美工刀反复划过的痕迹。"});setStep(5)}
      else if(id==="battery"&&s===5){hasBattery=true;o.visible=false;addItem("旧电池");flash("获得：旧电池");setStep(6)}
      else if(id==="recorder"&&s===6&&hasBattery){setModal({title:"SONY TCM-42 · LOCKED",body:"磁带计数器需要四位数字。",kind:"keypad"});setCode("")}
      else if(id==="self-portrait"&&s===7){(o as THREE.Mesh).material=new THREE.MeshStandardMaterial({map:portraitTex(true,32)});say("镜片里的女孩长出了她的头发、她的红唇、她的痣。",4200);keyObj.visible=true;setStep(8)}
      else if(id==="dorm-key"&&s===8){o.visible=false;addItem("女子宿舍钥匙");setStep(9);flash("获得：女子宿舍 3-B 钥匙")}
      else if(id==="dorm-door"&&s===9){doorOpen=true;o.visible=false;setStep(10);camera.position.set(0,1.65,-14);say("四张床。四张照片。四个名字。")}
      else if(id.startsWith("doll-")&&s===10){const n=Number(id.split("-")[1]);if(n!==dolls){say("位置不对。发卡、香水、画册、学生证……顺序应当对应床铺。",2500);return}o.position.set((n%2?-1:1)*4,1.35,-16-Math.floor(n/2)*5);dolls++;flash(`娃娃归位 ${dolls} / 4`);if(dolls===4){ambient.intensity=.05;redLight.intensity=2.2;say("一个姑娘照镜子，镜里坐着一个她。少一个，又来一个。哪一个才是真的？",6200);later(()=>{fifth.visible=true;ambient.intensity=.24;redLight.intensity=.45;setStep(11)},2600)}}
      else if(id==="fifth-doll"&&s===11){
  say(
    "它没有姓名牌。校服内侧却缝着：20011128。",
    4200
  );

  later(()=>{
    fifth.visible=false;
    setStep(12);

    const mirrorMesh = mirror as THREE.Mesh;

    if(mirrorMesh.material){
      if(Array.isArray(mirrorMesh.material)){
        mirrorMesh.material.forEach(m=>m.dispose());
      }else{
        mirrorMesh.material.dispose();
      }
    }

    mirrorMesh.material = mirrorMat;

    mirror.userData.label="掀开蒙布";

  },1500);
}

else if(id==="mirror"&&s===12){

  const mirrorMesh = mirror as THREE.Mesh;

  mirrorMesh.material = mirrorMat;

  setStep(13);

  say(
    "镜中是一个普通女生。至少……现在是。",
    3800
  );

}
      else if(id==="mirror"&&s===13){locked=false;document.exitPointerLock();redLight.intensity=5;ambient.intensity=0;flashlight.intensity=.2;say("镜像慢了半秒。她的左眼下……有一颗痣。",4300);later(()=>setMode("ending"),3900)}
      else wrong();
    }
    function submitCode(value:string){
      if(value==="2142"){setModal(null);setCode("");setStep(7);say("“别学我。”　“你永远都不会是我。”",4200);later(()=>say("桌椅撞击。有人喊：小心——　随后，是坠落声。",4200),2600);for(const ob of scene.children)if(ob.userData.painting&&Math.random()>.45)(ob as THREE.Mesh).scale.x*=-1;}
      else {setCode("");flash("磁带没有转动。数字不对。")}
    }
    (window as unknown as {__caseSubmit?:(v:string)=>void}).__caseSubmit=submitCode;
    function interact(){if(hovered)act(hovered.userData.id,hovered)}
    const movementCodes=new Set(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","ShiftLeft","ShiftRight"]);
    const onKey=(e:KeyboardEvent)=>{if(movementCodes.has(e.code))e.preventDefault();if(e.code==="Escape"&&e.type==="keydown"&&fallbackActive){fallbackActive=false;velocity.set(0,0,0);Object.keys(keys).forEach(k=>keys[k]=false);renderer.domElement.dataset.control="released";return}keys[e.code]=e.type==="keydown";if(e.type==="keydown"&&e.code==="KeyE"&&!e.repeat)interact()};
    const onNativeLockChange=()=>{locked=document.pointerLockElement===renderer.domElement;if(locked){fallbackActive=false;renderer.domElement.dataset.control="pointer-lock";renderer.domElement.focus()}else if(!fallbackActive){velocity.set(0,0,0);Object.keys(keys).forEach(k=>keys[k]=false)}};
    const onNativeMouse=(e:MouseEvent)=>{if(!locked)return;fallbackYaw-=e.movementX*.0021;fallbackPitch=THREE.MathUtils.clamp(fallbackPitch-e.movementY*.0018,-1.25,1.25);camera.rotation.set(fallbackPitch,fallbackYaw,0,"YXZ")};
    document.addEventListener("pointerlockchange",onNativeLockChange);document.addEventListener("mousemove",onNativeMouse);
    const useFallback=()=>{fallbackActive=true;locked=false;fallbackYaw=camera.rotation.y;fallbackPitch=camera.rotation.x;renderer.domElement.dataset.control="drag-look";renderer.domElement.focus({preventScroll:true})};
    const lock=()=>{renderer.domElement.focus({preventScroll:true});fallbackYaw=camera.rotation.y;fallbackPitch=camera.rotation.x;try{const result=renderer.domElement.requestPointerLock();if(result&&"catch" in result)result.catch(()=>useFallback())}catch{useFallback()}};
    const onPointerDown=(e:PointerEvent)=>{if(!fallbackActive)return;dragging=true;dragMoved=false;lastPointerX=e.clientX;lastPointerY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId)};
    const onPointerMove=(e:PointerEvent)=>{if(!fallbackActive||!dragging)return;const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;lastPointerX=e.clientX;lastPointerY=e.clientY;if(Math.abs(dx)+Math.abs(dy)>1)dragMoved=true;fallbackYaw-=dx*.004;fallbackPitch=THREE.MathUtils.clamp(fallbackPitch-dy*.0035,-1.25,1.25);camera.rotation.set(fallbackPitch,fallbackYaw,0,"YXZ")};
    const onPointerUp=()=>{dragging=false};
    const onCanvasClick=()=>{if(!locked&&!fallbackActive)lock();else if(locked||!dragMoved)interact();dragMoved=false};
    renderer.domElement.addEventListener("click",onCanvasClick);
    renderer.domElement.addEventListener("pointerdown",onPointerDown);renderer.domElement.addEventListener("pointermove",onPointerMove);renderer.domElement.addEventListener("pointerup",onPointerUp);
    addEventListener("keydown",onKey,{passive:false});addEventListener("keyup",onKey,{passive:false});
    const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)};addEventListener("resize",resize);
    const clock=new THREE.Clock();
    let walkTime=0;
    function animate(){const dt=Math.min(clock.getDelta(),.04);if(gateOpening){gateProgress=Math.min(1,gateProgress+dt*.34);gateLeft.position.x=-gateProgress*4.15;gateRight.position.x=gateProgress*4.15;if(gateProgress>=1){gateOpen=true;gateOpening=false;flash("校门已开启 · 前往教学楼")}}
      if(started&&(locked||fallbackActive)){const sprint=keys.ShiftLeft||keys.ShiftRight;const speed=sprint?5.2:3.15;const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);const input=new THREE.Vector2(strafe,forward);if(input.lengthSq()>1)input.normalize();const targetVelocity=new THREE.Vector3(input.x*speed,0,input.y*speed);velocity.lerp(targetVelocity,Math.min(1,dt*13));const previous=camera.position.clone();if(Math.abs(velocity.z)>.001)controls.moveForward(velocity.z*dt);if(Math.abs(velocity.x)>.001)controls.moveRight(velocity.x*dt);
        const radius=.32;const outdoor=camera.position.z>12.4;camera.position.x=THREE.MathUtils.clamp(camera.position.x,outdoor?-11.33:-6.38,outdoor?11.33:6.38);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-28.25,31.5);
        const hits=colliders.some(c=>(!c.enabled||c.enabled())&&camera.position.x+radius>c.minX&&camera.position.x-radius<c.maxX&&camera.position.z+radius>c.minZ&&camera.position.z-radius<c.maxZ);
        if(hits){camera.position.copy(previous);velocity.multiplyScalar(.15)}
        if(input.lengthSq()>.01)walkTime+=dt*speed;camera.position.y=1.65+(input.lengthSq()>.01?Math.sin(walkTime*2.2)*.012:Math.sin(performance.now()*.0012)*.004);
      }else velocity.multiplyScalar(.72);renderer.domElement.dataset.x=camera.position.x.toFixed(3);renderer.domElement.dataset.y=camera.position.y.toFixed(3);renderer.domElement.dataset.z=camera.position.z.toFixed(3);renderer.domElement.dataset.speed=velocity.length().toFixed(3);renderer.domElement.dataset.locked=String(locked);renderer.domElement.dataset.fallback=String(fallbackActive);
      ray.setFromCamera(new THREE.Vector2(0,0),camera);const hits=ray.intersectObjects(interactives.filter(o=>o.visible),true);hovered=null;if(hits[0]){let q:THREE.Object3D|null=hits[0].object;while(q&&!q.userData.id)q=q.parent;if(q&&q.userData.id)hovered=q}setPrompt(hovered?.userData.label||"");
      if(splatReady&&splatViewer){splatViewer.update();splatViewer.render()}else renderer.render(scene,camera);requestAnimationFrame(animate)}animate();
    (window as unknown as {__caseControlState?:()=>unknown}).__caseControlState=()=>({locked:controls.isLocked,position:{x:camera.position.x,y:camera.position.y,z:camera.position.z},velocity:{x:velocity.x,y:velocity.y,z:velocity.z},speed:Number(velocity.length().toFixed(3)),gateOpen,doorOpen});
    engine.current={dispose(){if(document.pointerLockElement===renderer.domElement)document.exitPointerLock();splatViewer?.dispose();renderer.dispose();host.removeChild(renderer.domElement);renderer.domElement.removeEventListener("click",onCanvasClick);renderer.domElement.removeEventListener("pointerdown",onPointerDown);renderer.domElement.removeEventListener("pointermove",onPointerMove);renderer.domElement.removeEventListener("pointerup",onPointerUp);document.removeEventListener("pointerlockchange",onNativeLockChange);document.removeEventListener("mousemove",onNativeMouse);removeEventListener("keydown",onKey);removeEventListener("keyup",onKey);removeEventListener("resize",resize);delete (window as unknown as {__caseControlState?:()=>unknown}).__caseControlState},lock,reset(){camera.position.set(0,1.65,-1.15);camera.rotation.set(0,0,0);velocity.set(0,0,0);started=true;renderer.domElement.focus({preventScroll:true});lock()}};
    return()=>engine.current?.dispose();
  },[addItem,flash,later,say,setStep]);

  const begin=()=>{setMode("gate");setStep(0)};
  const enterArtRoom=()=>{setMode("playing");setStep(3);later(()=>{engine.current?.reset();say("美术室……这里所有人都画过同一个女孩。",3900)},120)};
  const keypad=(n:string)=>{const next=(code+n).slice(0,4);setCode(next);if(next.length===4)later(()=>{(window as unknown as {__caseSubmit?:(v:string)=>void}).__caseSubmit?.(next)},180)};
  return <main className="game" aria-label="案件 01 第四十二幅肖像">
    <div ref={mount}/><div className="grain"/><div className="vignette"/>
    {mode==="title"&&<section className="title"><div className="title-content"><div className="eyebrow">记忆档案 / 案件 01</div><h1>第四十二幅肖像</h1><h2>第四十二幅肖像</h2><p>废弃校舍的门禁认识一张死者的脸。你只需查明川上富江坠亡的真相——以及，自己为何会回到这里。</p><button className="start" onClick={begin}>进入旧校舍</button><div className="warning">建议佩戴耳机 · 移动鼠标观察 · 点击调查 · 退出键返回</div></div></section>}
    {mode==="gate"&&<GateScene onPhoto={()=>addItem("川上富江的照片")} onComplete={enterArtRoom}/>} 
    {mode==="playing"&&<><div className="hud"><div className="case">案件 01　/　21:42</div><div className="objective"><small>当前目标</small><span>{OBJECTIVES[step]||"继续调查"}</span></div><div className="crosshair"/><div className="prompt">{prompt}</div><div className="inventory">{inventory.length?<>携带物<br/>{inventory.join("　/　")}</>:"口袋是空的"}</div><div className="hint">方向键移动　·　加速键快走　·　互动键调查　·　退出键释放鼠标</div></div>{artLoading&&<div className="art-loading">正在进入美术室……</div>}{artLoadError&&<div className="splat-fallback">场景影像载入失败，已启用备用环境。</div>}</>}
    {subtitle&&<div className="subtitle">{subtitle}</div>}{toast&&<div className="toast">{toast}</div>}
    {modal&&<div className="modal"><div className="panel"><h3>{modal.title}</h3><p>{modal.body}</p>{modal.kind==="keypad"?<><div className="display">{code.padEnd(4,"·")}</div><div className="keypad">{"123456789".split("").map(n=><button key={n} onClick={()=>keypad(n)}>{n}</button>)}<button onClick={()=>setCode("")}>清除</button><button onClick={()=>keypad("0")}>0</button><button onClick={()=>setModal(null)}>退回</button></div></>:<button onClick={()=>{setModal(null);engine.current?.lock()}}>收起</button>}</div></div>}
    {mode==="ending"&&<section className="end"><div><div className="mirror"/><h2>记忆碎片</h2><h1><strong>01</strong> / 42</h1><p>镜片里闪过一只黑发女孩的眼睛。<br/>她在你眨眼之前，先眨了眼。</p><h2>案件 01 调查完成</h2><button onClick={()=>location.reload()}>重新进入记忆</button><div className="warning">下一案件 · 一双成年男人的手</div></div></section>}
  </main>;
}
