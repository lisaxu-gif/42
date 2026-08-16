"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {CASE01_TEXTURES} from "./AssetConfig";
import emptyLayout from "./CASE01_ARTROOM_LAYOUT.json";
import DeductionSystem from "./DeductionSystem";
import ClueBag from "./ClueBag";
import BagSelection from "./BagSelection";
import {INVESTIGATIONS,type Investigation,type InvestigationId,type KeyClueId,type SupportingClueId} from "./InvestigationData";
import {audioManager} from "./AudioManager";

type Inspect=(Investigation&{blocked?:boolean})|null;
type MaterialKey="floor"|"ceiling"|"wall"|"metal"|"door"|"glass";
type LayoutObject={name:string;kind:"box";position:[number,number,number];size:[number,number,number];rotation:[number,number,number];scale:[number,number,number];material:MaterialKey;enabled:boolean;collider:boolean};
type PlacedAsset={name:string;asset:string;position:[number,number,number];rotation:[number,number,number];scale:[number,number,number];enabled:boolean;collider:boolean;interaction?:InvestigationId};
type ActiveLight={name:string;position:[number,number,number];color:string;intensity:number;distance:number;decay:number;enabled:boolean};
type Decal={name:string;texture:string;position:[number,number,number];rotation:[number,number,number];size:[number,number];enabled:boolean;interaction?:InvestigationId};

export default function ArtRoomScene({onSolved}:{onSolved:()=>void}){
 const mount=useRef<HTMLDivElement>(null),engine=useRef<{lock:()=>void}|null>(null);
 const uiBlocked=useRef(false),notebookRef=useRef(false);
 const [prompt,setPrompt]=useState(""),[inspect,setInspect]=useState<Inspect>(null),[inspectPage,setInspectPage]=useState(0),[found,setFound]=useState<Set<KeyClueId>>(new Set()),[supporting,setSupporting]=useState<Set<SupportingClueId>>(new Set()),[notebookFound,setNotebookFound]=useState(false),[showBag,setShowBag]=useState(false),[cabinetOpen,setCabinetOpen]=useState(false),[deduce,setDeduce]=useState(false);
 const ready=found.size===4;
 useEffect(()=>{uiBlocked.current=!!inspect||showBag||cabinetOpen||deduce},[cabinetOpen,deduce,inspect,showBag]);
 useEffect(()=>{notebookRef.current=notebookFound},[notebookFound]);
 const openInvestigation=useCallback((id:InvestigationId)=>{audioManager.playEffect();document.exitPointerLock?.();setPrompt("");setInspectPage(0);if(id==="cabinet"){audioManager.playEffect("sinkBag");setCabinetOpen(true);return}const data=INVESTIGATIONS[id];if(id==="floor_sketches"&&!notebookRef.current){setInspect({...data,image:"",gallery:undefined,keyClue:undefined,blocked:true,body:"这些画看起来只是散落的作品，也许还缺少某些重要的信息。"});return}setInspect(data)},[]);
 const closeOverlay=useCallback(()=>{setInspect(null);setInspectPage(0);setShowBag(false);setCabinetOpen(false);window.setTimeout(()=>engine.current?.lock(),0)},[]);
 const collect=useCallback((item:Investigation)=>{audioManager.playEffect();if(item.id==="sketchbook"){notebookRef.current=true;setNotebookFound(true)}if(item.keyClue)setFound(previous=>new Set(previous).add(item.keyClue!));if(item.supportingClue)setSupporting(previous=>new Set(previous).add(item.supportingClue!));setInspect(null);window.setTimeout(()=>engine.current?.lock(),0)},[]);
 const openBag=useCallback(()=>{document.exitPointerLock?.();setShowBag(true)},[]);

 useEffect(()=>{
  if(!mount.current)return;
  const host=mount.current,scene=new THREE.Scene();
  scene.name=emptyLayout.name;
  scene.background=new THREE.Color(0x111715);
  scene.fog=new THREE.FogExp2(0x18211e,.014);
  const cam=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.08,80);
  cam.position.set(...(emptyLayout.spawn.position as [number,number,number]));
  cam.rotation.set(...(emptyLayout.spawn.rotation as [number,number,number]));
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.tabIndex=0;host.appendChild(renderer.domElement);
  const supportsPointerLock="pointerLockElement" in document&&typeof renderer.domElement.requestPointerLock==="function";
  const controls=supportsPointerLock?new PointerLockControls(cam,renderer.domElement):null;

  scene.add(new THREE.HemisphereLight(0x91a3a5,0x171a19,1.38));
  const light=new THREE.DirectionalLight(0xaabbbd,1.28);light.position.set(-3,8,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.radius=2;light.shadow.normalBias=.025;scene.add(light);
  for(const item of emptyLayout.activeLights as ActiveLight[]){if(!item.enabled)continue;const lamp=new THREE.PointLight(item.color,item.intensity,item.distance,item.decay);lamp.name=item.name;lamp.position.set(...item.position);lamp.castShadow=true;lamp.shadow.mapSize.set(512,512);lamp.shadow.bias=-.0004;scene.add(lamp)}

  const tx=new THREE.TextureLoader(),floorTx=tx.load(CASE01_TEXTURES.floor.path),wallTx=tx.load(CASE01_TEXTURES.wall.path),ceilingTx=tx.load(CASE01_TEXTURES.ceiling.path),rainTx=tx.load(CASE01_TEXTURES.rainOutside.path);
  floorTx.colorSpace=wallTx.colorSpace=ceilingTx.colorSpace=rainTx.colorSpace=THREE.SRGBColorSpace;
  wallTx.wrapS=wallTx.wrapT=ceilingTx.wrapS=ceilingTx.wrapT=THREE.RepeatWrapping;
  wallTx.repeat.set(...CASE01_TEXTURES.wall.repeat);ceilingTx.repeat.set(...CASE01_TEXTURES.ceiling.repeat);
  const materials:Record<MaterialKey,THREE.MeshStandardMaterial>={
   floor:new THREE.MeshStandardMaterial({map:floorTx,color:0x8b8176,roughness:.88,metalness:0}),
   ceiling:new THREE.MeshStandardMaterial({map:ceilingTx,color:0x9b9a94,roughness:.96}),
   wall:new THREE.MeshStandardMaterial({map:wallTx,color:0xaaa9a2,roughness:.96}),
   metal:new THREE.MeshStandardMaterial({color:0x303a38,roughness:.7,metalness:.35}),
   door:new THREE.MeshStandardMaterial({color:0x394541,roughness:.86,metalness:.16}),
   glass:new THREE.MeshStandardMaterial({color:0x647d83,transparent:true,opacity:.42,roughness:.28,metalness:.08})
  };
  const colliders:THREE.Box3[]=[],objects:THREE.Object3D[]=[];
  for(const item of emptyLayout.objects as LayoutObject[]){
   if(!item.enabled)continue;
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(...item.size),materials[item.material]);
   mesh.name=item.name;mesh.position.set(...item.position);mesh.rotation.set(...item.rotation);mesh.scale.set(...item.scale);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
   if(item.collider)colliders.push(new THREE.Box3().setFromObject(mesh));
  }
  for(const item of (emptyLayout.decals as Decal[])){if(!item.enabled)continue;const texture=tx.load(item.texture);texture.colorSpace=THREE.SRGBColorSpace;const decal=new THREE.Mesh(new THREE.PlaneGeometry(...item.size),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.03,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide}));decal.name=item.name;decal.position.set(...item.position);decal.rotation.set(...item.rotation);decal.renderOrder=4;if(item.interaction){decal.userData.interaction=item.interaction;decal.userData.label="【调查】";objects.push(decal)}scene.add(decal)}
  const modelLoader=new GLTFLoader();
  for(const item of emptyLayout.placedAssets as PlacedAsset[]){
   if(!item.enabled)continue;
   modelLoader.load(item.asset,gltf=>{const root=gltf.scene;root.name=item.name;root.position.set(...item.position);root.rotation.set(...item.rotation);root.scale.set(...item.scale);root.traverse(o=>{if((o as THREE.Mesh).isMesh){const mesh=o as THREE.Mesh;mesh.castShadow=true;mesh.receiveShadow=true;if(item.interaction){mesh.userData.interaction=item.interaction;mesh.userData.label="【调查】";objects.push(mesh)}}});root.updateMatrixWorld(true);scene.add(root);if(item.collider)colliders.push(new THREE.Box3().setFromObject(root))},undefined,error=>console.error(`固定模型加载失败：${item.name}`,error));
  }

  const rain=new THREE.Mesh(new THREE.PlaneGeometry(...(emptyLayout.exterior.rainPlane.size as [number,number])),new THREE.MeshBasicMaterial({map:rainTx,color:0x69767a,side:THREE.DoubleSide,fog:false}));
  rain.name="窗外雨天环境";rain.position.set(...(emptyLayout.exterior.rainPlane.position as [number,number,number]));rain.rotation.set(...(emptyLayout.exterior.rainPlane.rotation as [number,number,number]));scene.add(rain);

  const ray=new THREE.Raycaster(),keys:Record<string,boolean>={},moveDirection=new THREE.Vector3(),moveRightDirection=new THREE.Vector3();
  let hovered:THREE.Object3D|null=null,last=performance.now(),raf=0,fallback=false,drag=false,px=0,py=0,yaw=0,pitch=0;
  const interact=()=>{if(!hovered)return;const id=hovered.userData.interaction as InvestigationId|undefined;if(id)openInvestigation(id)};
  const key=(e:KeyboardEvent)=>{keys[e.code]=e.type==="keydown";if(e.type==="keydown"&&e.code==="KeyE"&&!e.repeat)interact();if(e.type==="keydown"&&e.code==="KeyN"&&!e.repeat)openBag()};
  addEventListener("keydown",key);addEventListener("keyup",key);
  const lock=()=>{renderer.domElement.focus({preventScroll:true});if(!supportsPointerLock){fallback=true;return}const p=renderer.domElement.requestPointerLock();p?.catch(()=>fallback=true)};
  const click=()=>{if(document.pointerLockElement!==renderer.domElement&&!fallback)lock();else interact()};
  const pd=(e:PointerEvent)=>{if(!fallback)return;drag=true;px=e.clientX;py=e.clientY};
  const pm=(e:PointerEvent)=>{if(!fallback||!drag)return;yaw-=(e.clientX-px)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-py)*.0035,-1.2,1.2);px=e.clientX;py=e.clientY;cam.rotation.set(pitch,yaw,0,"YXZ")};
  const pu=()=>drag=false;
  renderer.domElement.addEventListener("click",click);renderer.domElement.addEventListener("pointerdown",pd);renderer.domElement.addEventListener("pointermove",pm);renderer.domElement.addEventListener("pointerup",pu);
  const resize=()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)};addEventListener("resize",resize);

  const bounds=emptyLayout.movementBounds;
  const animate=()=>{const now=performance.now(),dt=Math.min(.04,(now-last)/1000);last=now;
   if((document.pointerLockElement===renderer.domElement||fallback)&&!uiBlocked.current){
    const prev=cam.position.clone(),speed=(keys.ShiftLeft?4.8:2.8)*dt;
    const moveForward=(distance:number)=>{if(controls){controls.moveForward(distance);return}cam.getWorldDirection(moveDirection);moveDirection.y=0;moveDirection.normalize();cam.position.addScaledVector(moveDirection,distance)};
    const moveRight=(distance:number)=>{if(controls){controls.moveRight(distance);return}moveRightDirection.setFromMatrixColumn(cam.matrix,0);moveRightDirection.y=0;moveRightDirection.normalize();cam.position.addScaledVector(moveRightDirection,distance)};
    if(keys.KeyW)moveForward(speed);if(keys.KeyS)moveForward(-speed);if(keys.KeyA)moveRight(-speed);if(keys.KeyD)moveRight(speed);
    cam.position.y=emptyLayout.spawn.position[1];cam.position.x=THREE.MathUtils.clamp(cam.position.x,bounds.minX,bounds.maxX);cam.position.z=THREE.MathUtils.clamp(cam.position.z,bounds.minZ,bounds.maxZ);
    const player=new THREE.Box3(new THREE.Vector3(cam.position.x-.3,.1,cam.position.z-.3),new THREE.Vector3(cam.position.x+.3,1.8,cam.position.z+.3));if(colliders.some(c=>c.intersectsBox(player)))cam.position.copy(prev)
   }
   const canInvestigate=(document.pointerLockElement===renderer.domElement||fallback)&&!uiBlocked.current;
   if(canInvestigate){ray.setFromCamera(new THREE.Vector2(),cam);const hit=ray.intersectObjects(objects.filter(o=>o.visible),false).find(h=>h.distance<2.45);const next=hit?.object||null;if(next!==hovered){hovered=next;setPrompt(hovered?.userData.label||"")}}else if(hovered){hovered=null;setPrompt("")}
   renderer.render(scene,cam);raf=requestAnimationFrame(animate)
  };
  animate();engine.current={lock};
  return()=>{cancelAnimationFrame(raf);removeEventListener("keydown",key);removeEventListener("keyup",key);removeEventListener("resize",resize);renderer.domElement.removeEventListener("click",click);renderer.domElement.removeEventListener("pointerdown",pd);renderer.domElement.removeEventListener("pointermove",pm);renderer.domElement.removeEventListener("pointerup",pu);renderer.dispose();host.removeChild(renderer.domElement)}
 },[openBag,openInvestigation]);

 const inspectImages=inspect?(inspect.gallery?.length?inspect.gallery:inspect.image?[inspect.image]:[]):[];
 const galleryComplete=inspectPage>=inspectImages.length-1;
 return <section className="artroom3d"><div ref={mount}/><div className="art-hud"><span>CASE01 · 碎片1</span><button onClick={openBag}>线索包　{found.size}/4</button><div className="art-crosshair">·</div><div className="art-prompt">{prompt}</div><small>WASD 移动　SHIFT 快走　鼠标观察　E / 点击调查　N 线索包</small></div>{ready&&!deduce&&!inspect&&!showBag&&!cabinetOpen&&<button className="organize" onClick={()=>{document.exitPointerLock?.();setDeduce(true)}}>寻找真相</button>}{showBag&&<ClueBag found={found} supporting={supporting} onClose={closeOverlay}/>} {cabinetOpen&&<BagSelection onClose={closeOverlay} onSelect={id=>{if(id==="bag_b")audioManager.playEffect("sinkBag");setCabinetOpen(false);setInspectPage(0);setInspect(INVESTIGATIONS[id])}}/>} {deduce&&<DeductionSystem onClose={()=>{setDeduce(false);engine.current?.lock()}} onSolved={onSolved}/>} {inspect&&<div className="investigate"><div>{inspectImages[inspectPage]&&<img src={inspectImages[inspectPage]} alt={`${inspect.title} ${inspectPage+1}`}/>} {inspectImages.length>1&&<div className="evidence-gallery-nav"><button disabled={inspectPage===0} onClick={()=>setInspectPage(page=>Math.max(0,page-1))}>上一张</button><span>{inspectPage+1} / {inspectImages.length}</span><button disabled={galleryComplete} onClick={()=>setInspectPage(page=>Math.min(inspectImages.length-1,page+1))}>下一张</button></div>}<small>调查记录</small><h2>{inspect.title}</h2><p>{inspect.body}</p>{inspect.blocked?<p className="dependency-hint">需要先找到与这些画对应的素描本。</p>:!galleryComplete?<p className="dependency-hint">继续查看全部记录后再收录线索。</p>:inspect.id==="sketchbook"&&!notebookFound?<button onClick={()=>collect(inspect)}>记录素描本编号</button>:inspect.keyClue&&!found.has(inspect.keyClue)?<button onClick={()=>collect(inspect)}>获得线索</button>:inspect.supportingClue&&!supporting.has(inspect.supportingClue)?<button onClick={()=>collect(inspect)}>获得线索</button>:<p className="collected-mark">已收录</p>}<button onClick={closeOverlay}>返回</button></div></div>}</section>
}
