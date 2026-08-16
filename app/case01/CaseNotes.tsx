"use client";
export default function CaseNotes({notes,onClose}:{notes:string[];onClose:()=>void}){return <div className="case-notes"><div><h2>案件笔记</h2>{notes.length?notes.map((n,i)=><p key={i}>— {n}</p>):<p>还没有值得记录的事实。</p>}<button onClick={onClose}>收起</button></div></div>}
