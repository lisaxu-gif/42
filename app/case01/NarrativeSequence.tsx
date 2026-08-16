"use client";

import {useEffect,useState} from "react";

export type NarrativePage={text:string;hold?:number};

export default function NarrativeSequence({pages,onComplete,className="",charDelay=42}:{pages:NarrativePage[];onComplete:()=>void;className?:string;charDelay?:number}){
 const [page,setPage]=useState(0),[length,setLength]=useState(0),[fading,setFading]=useState(false);
 useEffect(()=>{
  const current=pages[page];
  if(!current){onComplete();return}
  setLength(0);setFading(false);
  let interval:number|undefined,fadeTimer:number|undefined,nextTimer:number|undefined;
  interval=window.setInterval(()=>setLength(value=>{
   if(value<current.text.length)return value+1;
   if(interval)window.clearInterval(interval);
   fadeTimer=window.setTimeout(()=>setFading(true),current.hold??1100);
   nextTimer=window.setTimeout(()=>{if(page===pages.length-1)onComplete();else setPage(value=>value+1)},(current.hold??1100)+750);
   return value;
  }),charDelay);
  return()=>{if(interval)window.clearInterval(interval);if(fadeTimer)window.clearTimeout(fadeTimer);if(nextTimer)window.clearTimeout(nextTimer)};
 },[charDelay,onComplete,page,pages]);
 const current=pages[page];
 return <section className={`narrative-sequence ${fading?"is-fading":""} ${className}`} aria-live="polite"><p>{current?.text.slice(0,length)}</p></section>;
}
