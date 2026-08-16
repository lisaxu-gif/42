"use client";
import {useState} from "react";
export default function DeductionSystem({onClose,onSolved}:{onClose:()=>void;onSolved:()=>void}){
 const [started,setStarted]=useState(false),[q,setQ]=useState(0),[wrong,setWrong]=useState(false);
 const questions=[
  {text:"现场留下致命伤的是？",answers:["美工刀","金属画框","画笔"],correct:0},
  {text:"速写本真正属于谁？",answers:["川上富江","森川凉子","神谷直树"],correct:1},
  {text:"真正凶手是谁？",answers:["森川凉子","宫本悠介","神谷直树"],correct:0}
 ];
 const choose=(index:number)=>{if(index!==questions[q].correct){setWrong(true);return}setWrong(false);if(q===questions.length-1)onSolved();else setQ(value=>value+1)};
 const marks=["A","B","C"];
 return <div className="deduction"><div>{!started?<><small>寻找真相</small><div className="deduction-prologue"><p>你已经在这所废弃学校里寻找了许久。</p><p>散落的照片、留下的物品、被遗忘的记忆……</p><p>真相，就藏在这些碎片之中。</p></div><button onClick={()=>setStarted(true)}>开始推理</button><button className="deduction-close" onClick={onClose}>返回现场</button></>:<><small>真相推理　{q+1}/3</small><h2>{questions[q].text}</h2>{questions[q].answers.map((answer,index)=><button key={answer} onClick={()=>choose(index)}>{marks[index]}　{answer}</button>)}{wrong&&<p>不对……这些证据还指向另一个答案。</p>}<button className="deduction-close" onClick={onClose}>退出推理</button></>}</div></div>;
}
