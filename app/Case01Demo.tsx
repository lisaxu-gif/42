"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {GateScene} from "./Case01Game";
import ArtRoomScene from "./case01/ArtRoomScene";
import NarrativeSequence,{type NarrativePage} from "./case01/NarrativeSequence";
import {playArtroomTransitionAudio} from "./case01/ArtroomTransitionAudio";
import {audioManager} from "./case01/AudioManager";
import EndingMonologue from "./case01/EndingMonologue";

type Mode="title"|"prologue"|"gate"|"transition"|"awakening"|"art"|"memory"|"mirror"|"ending";

export default function Case01Demo(){
 const [mode,setMode]=useState<Mode>("title"),[introPhase,setIntroPhase]=useState(0);
 const prologue=useMemo<NarrativePage[]>(()=>[
  {text:"一所被遗忘的学校。\n一段无人知晓的过去。\n\n多年前，一名女学生在这里离奇死亡。\n有人说，她曾在死后再次出现在校园中。\n没人相信。\n直到失踪的人越来越多。\n\n如今，你踏入这座被遗弃的学校，寻找隐藏在废墟中的真相。\n\n一张张照片。\n一件件遗留物。\n一段段被遗忘的记忆。\n\n但当过去逐渐拼凑完整时，你开始意识到——\n\n你寻找的，或许并不只是一个死亡事件。",hold:1300}
 ],[]);
 const enter=useCallback(()=>{audioManager.playEffect("artroomDoor");playArtroomTransitionAudio();setMode("transition");setIntroPhase(0);setTimeout(()=>setIntroPhase(1),350);setTimeout(()=>setMode("awakening"),3600);setTimeout(()=>setIntroPhase(3),3900);setTimeout(()=>setIntroPhase(4),5000);setTimeout(()=>setIntroPhase(5),6300);setTimeout(()=>setMode("art"),7900)},[]);
 const solved=useCallback(()=>{audioManager.lowerBackground();audioManager.playMonologue();setMode("memory")},[]);
 useEffect(()=>{audioManager.playBGM();const resume=()=>audioManager.playBGM();addEventListener("pointerdown",resume,{once:true});addEventListener("keydown",resume,{once:true});return()=>{removeEventListener("pointerdown",resume);removeEventListener("keydown",resume);audioManager.stopAudio()}},[]);
 return <main className="game"><div className="grain"/><div className="vignette"/>
  {mode==="title"&&<section className="title case01-title"><div className="title-content"><small className="eyebrow">PSYCHOLOGICAL HORROR · CASE 01</small><h1>《四十二块碎片》</h1><h2>THE FORTY-TWO FRAGMENTS</h2><p>每一件遗物，都是一段被遗忘的证词。</p><button className="start" onClick={()=>{audioManager.playBGM();setMode("prologue")}}>开始调查</button><div className="warning">建议佩戴耳机 · 本游戏包含心理恐怖内容</div></div></section>}
  {mode==="prologue"&&<NarrativeSequence pages={prologue} onComplete={()=>setMode("gate")} className="prologue" charDelay={24}/>}
  {mode==="gate"&&<GateScene onPhoto={()=>{}} onComplete={enter}/>}
  {mode==="transition"&&<section className={`artroom-entry p${introPhase}`}><div><small>《四十二块碎片》</small><h1>CASE01</h1><p>碎片1</p><i>雨落在空教室的窗外。脚步声停在门后。</i></div></section>}
  {mode==="awakening"&&<section className={`awakening p${introPhase}`}><img src="/assets/references/CASE01_scene_art_room_01.png" alt="废弃美术教室"/><div className="eyelid top"/><div className="eyelid bottom"/></section>}
  {mode==="art"&&<ArtRoomScene onSolved={solved}/>}
  {mode==="memory"&&<EndingMonologue onComplete={()=>setMode("ending")}/>}
  {mode==="mirror"&&<section className="ending-mirror" onAnimationEnd={event=>{if(event.animationName==="endingMirror")setMode("ending")}}><div className="ending-reflection"/><p>你真的记得自己是谁吗？</p></section>}
  {mode==="ending"&&<section className="case-complete"><div><small>《四十二块碎片》</small><h1>CASE01 COMPLETE</h1><h2>森川凉子</h2><p>调查完成</p><hr/><h3>真相已被记录</h3><button onClick={()=>{audioManager.stopAudio();location.reload()}}>重新开始</button></div></section>}
 </main>;
}
