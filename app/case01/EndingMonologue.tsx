"use client";
import {useEffect,useState} from "react";

const slides=[
 ["study.png","「我真的……不想这样的。」"],["study.png","「我从来没有想过要杀人。」"],
 ["grades.png","「我努力了那么久。」"],["grades.png","「学习、成绩、讨好所有人。」"],["grades.png","「可是为什么……」"],["grades.png","「为什么富江什么都不用做，就能拥有一切？」"],
 ["watching.png","「我羡慕她。」"],["watching.png","「嫉妒她……」"],["watching.png","「甚至想成为她。」"],["watching.png","「可是当我看着她的时候。」"],["watching.png","「她的眼里从来没有我。」"],["watching.png","「那一刻我才明白……」"],["watching.png","「原来在她眼里，我从来都不重要。」"],
 ["knife.png","「所以……」"],["knife.png","「我拿起了那把刀。」"],["knife.png","「我以为杀了她。」"],["knife.png","「我就能成为她。」"],
 ["face.png","「可是为什么……」"],["face.png","「镜子里的那个人……」"],["face.png","「不是我。」"],
 ["face.png","富江死了。\n\n可是她的影子，\n住进了我的身体。"]
] as const;

export default function EndingMonologue({onComplete}:{onComplete:()=>void}){
 const [index,setIndex]=useState(0);
 useEffect(()=>{const timer=window.setTimeout(()=>index===slides.length-1?onComplete():setIndex(value=>value+1),index===slides.length-1?5200:3000);return()=>window.clearTimeout(timer)},[index,onComplete]);
 const [image,text]=slides[index];
 return <section className="ending-monologue"><img key={image+index} src={`/assets/ending/case01/${image}`} alt="森川凉子的记忆"/><div key={text}><small>森川凉子</small><p>{text}</p></div></section>;
}
