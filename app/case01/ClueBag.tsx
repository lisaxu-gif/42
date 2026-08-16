"use client";

import {KEY_CLUES,SUPPORTING_CLUES,type KeyClueId,type SupportingClueId} from "./InvestigationData";

const ORDER:KeyClueId[]=["sketch_identity","bulletin_photo","bag_cutter","grade_motive"];

export default function ClueBag({found,supporting,onClose}:{found:Set<KeyClueId>;supporting:Set<SupportingClueId>;onClose:()=>void}){
 const supportingItems=[...supporting].map(id=>SUPPORTING_CLUES[id]);
 return <div className="clue-bag"><div><header><div><small>CASE 01</small><h2>线索包　{found.size}/4</h2></div><button onClick={onClose}>关闭</button></header><div className="clue-grid">{ORDER.map((id,index)=>{const clue=KEY_CLUES[id],unlocked=found.has(id);return <article className={unlocked?"is-found":"is-locked"} key={id}>{unlocked?<img src={clue.image} alt={clue.title}/>:<div className="clue-lock">?</div>}<div><small>关键线索 {index+1}</small><h3>{unlocked?clue.title:"尚未发现"}</h3>{unlocked&&<p>{clue.summary}</p>}</div></article>})}</div>{supportingItems.length>0&&<section className="supporting-clues"><h3>补充调查记录</h3>{supportingItems.map(item=><article key={item.id}><img src={item.image} alt={item.title}/><div><small>补充线索</small><h3>{item.title}</h3><p>{item.summary}</p></div></article>)}</section>}</div></div>;
}
