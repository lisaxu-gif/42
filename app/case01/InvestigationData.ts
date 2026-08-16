export type KeyClueId="sketch_identity"|"bulletin_photo"|"bag_cutter"|"grade_motive";
export type SupportingClueId="male_footprint"|"dismissal_notice"|"old_newspaper";
export type InvestigationId="sketchbook"|"floor_sketches"|"bulletin"|"cabinet"|"bag_a"|"bag_b"|"grades"|"dismissal_notice"|"newspaper"|"male_footprint";

export const CASE01_PEOPLE={
 ryoko:{name:"森川凉子",studentId:"20011110"},
 tomie:{name:"川上富江",studentId:"20011128"},
 yusuke:{name:"宫本悠介",studentId:"19980327"}
} as const;

export type KeyClue={id:KeyClueId;title:string;image:string;summary:string};
export type SupportingClue={id:SupportingClueId;title:string;image:string;summary:string};
export type Investigation={id:InvestigationId;title:string;image:string;gallery?:string[];body:string;keyClue?:KeyClueId;supportingClue?:SupportingClueId};

export const SUPPORTING_CLUES:Record<SupportingClueId,SupportingClue>={
 male_footprint:{id:"male_footprint",title:"入口附近的男鞋印",image:"/assets/evidence/case01/evidence-male-footprint.png",summary:"地面留下了一枚尺寸明显偏大的鞋印。它只能证明曾有男性进入过这里，身份仍然未知。"},
 dismissal_notice:{id:"dismissal_notice",title:"神谷直树革职公告",image:"/assets/evidence/case01/optional-puzzle-01.png",summary:"校方已解除美术教师神谷直树的聘用关系，相关情况另行调查。"},
 old_newspaper:{id:"old_newspaper",title:"旧报纸：美术室死亡事件",image:"/assets/evidence/case01/optional-puzzle-05-01.png",summary:"多年前川上富江死于校园，现场疑似使用美工刀，监控异常且没有明显搏斗痕迹。"}
};

export const KEY_CLUES:Record<KeyClueId,KeyClue>={
 sketch_identity:{id:"sketch_identity",title:"素描本与三张人物素描",image:"/assets/evidence/case01/key-puzzle-01-three-sketches.png",summary:"速写本编号20011110属于森川凉子。缺失的三页全是川上富江，反复描摹暴露了她的执念。"},
 bulletin_photo:{id:"bulletin_photo",title:"公告栏照片",image:"/assets/evidence/case01/key-puzzle-02-photo-03.png",summary:"旧照片里的森川凉子背着黑色日式学生包。这一外观能与柜中书包对应。"},
 bag_cutter:{id:"bag_cutter",title:"黑色书包与美工刀",image:"/assets/evidence/case01/key-puzzle-03-bag-02-cutter.png",summary:"柜中的黑色书包与照片一致，夹层里藏着带暗红污迹的美工刀。"},
 grade_motive:{id:"grade_motive",title:"两学期成绩单",image:"/assets/evidence/case01/key-puzzle-04-grades.png",summary:"第一学期森川第一；富江转学后，第二学期富江第一、森川第二。"}
};

export const INVESTIGATIONS:Record<InvestigationId,Investigation>={
 sketchbook:{id:"sketchbook",title:"血迹斑驳的速写本",image:"/assets/evidence/case01/key-puzzle-01-sketchbook.png",body:"封面残留着编号：20011110。署名磨损严重，内页恰好缺少三张人物练习。"},
 floor_sketches:{id:"floor_sketches",title:"散落的三张人物素描",image:"/assets/evidence/case01/key-puzzle-01-three-sketches.png",body:"三张画分别记录了同一个黑发女生的正面、侧面和斜侧面。眼下的痣说明她是川上富江。",keyClue:"sketch_identity"},
 bulletin:{id:"bulletin",title:"褪色的公告栏照片",image:"/assets/evidence/case01/key-puzzle-02-photo-01.png",gallery:["/assets/evidence/case01/key-puzzle-02-photo-01.png","/assets/evidence/case01/key-puzzle-02-photo-02.png","/assets/evidence/case01/key-puzzle-02-photo-03.png"],body:"三组旧合照记录着学生关系。森川凉子站在人群边缘，她肩上的黑色日式学生包很醒目。",keyClue:"bulletin_photo"},
 cabinet:{id:"cabinet",title:"入口右侧储物柜",image:"/assets/evidence/case01/key-puzzle-03-bag-01.png",body:"柜中并排放着两个包，需要选择其中一个仔细检查。"},
 bag_a:{id:"bag_a",title:"包A：铆钉学生包",image:"/assets/evidence/case01/key-puzzle-03-bag-01.png",body:"一只沾着暗红污迹的铆钉学生包。夹层里只有零散纸屑，没有发现凶器。"},
 bag_b:{id:"bag_b",title:"包B：黑色日式学生包",image:"/assets/evidence/case01/key-puzzle-03-bag-02.png",gallery:["/assets/evidence/case01/key-puzzle-03-bag-02.png","/assets/evidence/case01/key-puzzle-03-bag-02-cutter.png"],body:"这只黑色书包与公告栏照片中的外观一致。打开夹层后，发现一把残留暗红污迹的美工刀。",keyClue:"bag_cutter"},
 grades:{id:"grades",title:"公告栏左侧的成绩单",image:"/assets/evidence/case01/key-puzzle-04-grades.png",body:"第一学期：森川凉子（20011110）第一名。\n第二学期：川上富江（20011128）第一名，森川凉子第二名。",keyClue:"grade_motive"},
 dismissal_notice:{id:"dismissal_notice",title:"公告栏右侧的革职公告",image:"/assets/evidence/case01/optional-puzzle-01.png",body:"美术教师神谷直树因涉嫌多项违规行为，被校方解除聘用关系。公告注明相关情况已移交进一步调查。",supportingClue:"dismissal_notice"},
 newspaper:{id:"newspaper",title:"旧报纸",image:"/assets/evidence/case01/optional-puzzle-05-01.png",body:"多年前，学校发生一起学生死亡事件。\n\n死者：川上富江。\n\n女学生在校园内死亡，疑似遭受锐器伤害，使用工具疑似美工刀。现场没有明显剧烈冲突痕迹，案发时间附近监控出现异常。调查人员认为熟人作案的可能性较高。",supportingClue:"old_newspaper"},
 male_footprint:{id:"male_footprint",title:"入口附近的男鞋印",image:"/assets/evidence/case01/evidence-male-footprint.png",body:"地面上怎么会留下男生的鞋印？这里曾经有人来过。",supportingClue:"male_footprint"}
};
