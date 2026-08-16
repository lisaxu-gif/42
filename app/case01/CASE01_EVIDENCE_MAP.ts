import type {InvestigationId} from "./InvestigationData";

export type EvidenceCategory="key"|"supporting"|"optional"|"suspect"|"monologue"|"reference";
export type EvidenceAsset={
 evidenceId:string;
 sourceFileName:string;
 asset:string;
 category:EvidenceCategory;
 investigationId?:InvestigationId;
 prerequisiteEvidenceId?:string;
};

// Evidence ID 必须与用户提供的原始文件名（不含扩展名）完全一致。
export const CASE01_EVIDENCE_ASSETS=[
 {evidenceId:"关键谜题1：素描本",sourceFileName:"关键谜题1：素描本.png",asset:"/assets/evidence/case01/key-puzzle-01-sketchbook.png",category:"key",investigationId:"sketchbook"},
 {evidenceId:"关键谜题1：三张画",sourceFileName:"关键谜题1：三张画.png",asset:"/assets/evidence/case01/key-puzzle-01-three-sketches.png",category:"key",investigationId:"floor_sketches",prerequisiteEvidenceId:"关键谜题1：素描本"},
 {evidenceId:"关键谜题2：合照一",sourceFileName:"关键谜题2：合照一.png",asset:"/assets/evidence/case01/key-puzzle-02-photo-01.png",category:"key",investigationId:"bulletin"},
 {evidenceId:"关键谜题2：合照二",sourceFileName:"关键谜题2：合照二.png",asset:"/assets/evidence/case01/key-puzzle-02-photo-02.png",category:"key",investigationId:"bulletin"},
 {evidenceId:"关键谜题2：合照三",sourceFileName:"关键谜题2：合照三.png",asset:"/assets/evidence/case01/key-puzzle-02-photo-03.png",category:"key",investigationId:"bulletin"},
 {evidenceId:"关键谜题3：包一",sourceFileName:"关键谜题3：包一.png",asset:"/assets/evidence/case01/key-puzzle-03-bag-01.png",category:"key",investigationId:"bag_a"},
 {evidenceId:"关键谜题3：包二",sourceFileName:"关键谜题3：包二.png",asset:"/assets/evidence/case01/key-puzzle-03-bag-02.png",category:"key",investigationId:"bag_b"},
 {evidenceId:"关键谜题3：包二带刀",sourceFileName:"关键谜题3：包二带刀.png",asset:"/assets/evidence/case01/key-puzzle-03-bag-02-cutter.png",category:"key",investigationId:"bag_b"},
 {evidenceId:"关键谜题4",sourceFileName:"关键谜题4.png",asset:"/assets/evidence/case01/key-puzzle-04-grades.png",category:"key",investigationId:"grades"},
 {evidenceId:"男人的脚印",sourceFileName:"男人的脚印.png",asset:"/assets/evidence/case01/evidence-male-footprint.png",category:"supporting",investigationId:"male_footprint"},
 {evidenceId:"非关键谜题1",sourceFileName:"非关键谜题1.png",asset:"/assets/evidence/case01/optional-puzzle-01.png",category:"optional",investigationId:"dismissal_notice"},
 {evidenceId:"不重要信息谜题2",sourceFileName:"不重要信息谜题2.png",asset:"/assets/evidence/case01/minor-info-puzzle-02.png",category:"optional"},
 {evidenceId:"非关键谜题4",sourceFileName:"非关键谜题4.png",asset:"/assets/evidence/case01/optional-puzzle-04.png",category:"optional"},
 {evidenceId:"非关键谜题5(1)",sourceFileName:"非关键谜题5(1).png",asset:"/assets/evidence/case01/optional-puzzle-05-01.png",category:"optional",investigationId:"newspaper"},
 {evidenceId:"非关键谜题6",sourceFileName:"非关键谜题6.png",asset:"/assets/evidence/case01/optional-puzzle-06.png",category:"optional"},
 {evidenceId:"宫本线索1",sourceFileName:"宫本线索1.png",asset:"/assets/evidence/case01/suspect-miyamoto-01.png",category:"suspect"},
 {evidenceId:"神谷线索2",sourceFileName:"神谷线索2.png",asset:"/assets/evidence/case01/suspect-kamiya-02.png",category:"suspect"},
 {evidenceId:"富江森川聊天记录",sourceFileName:"富江森川聊天记录.png",asset:"/assets/evidence/case01/chat-tomie-ryoko.png",category:"reference"},
 {evidenceId:"森川凉子证件照",sourceFileName:"森川凉子证件照.png",asset:"/assets/evidence/case01/portrait-ryoko-morikawa.png",category:"reference"},
 {evidenceId:"独白：森川学习",sourceFileName:"独白：森川学习.png",asset:"/assets/evidence/case01/monologue-ryoko-study.png",category:"monologue"},
 {evidenceId:"独白：森川成绩",sourceFileName:"独白：森川成绩.png",asset:"/assets/evidence/case01/monologue-ryoko-grades.png",category:"monologue"},
 {evidenceId:"独白：森川偷窥",sourceFileName:"独白：森川偷窥.png",asset:"/assets/evidence/case01/monologue-ryoko-watching.png",category:"monologue"},
 {evidenceId:"独白：森川握刀",sourceFileName:"独白：森川握刀.png",asset:"/assets/evidence/case01/monologue-ryoko-knife.png",category:"monologue"},
 {evidenceId:"独白：森川表情",sourceFileName:"独白：森川表情.png",asset:"/assets/evidence/case01/monologue-ryoko-expression.png",category:"monologue"}
] as const satisfies readonly EvidenceAsset[];

export const CASE01_EVIDENCE_BY_ID=new Map(CASE01_EVIDENCE_ASSETS.map(item=>[item.evidenceId,item]));

export function evidenceAsset(evidenceId:string){
 const item=CASE01_EVIDENCE_BY_ID.get(evidenceId as never);
 if(!item)throw new Error(`CASE01 Evidence 资源未映射：${evidenceId}`);
 return item.asset;
}
