# CASE 01 Asset Replacement List

The current playable build uses procedural Three.js blockout geometry and Canvas/DOM placeholders. Gameplay references stable English Asset IDs from `app/case01/AssetConfig.ts`.

| Asset ID | Group | Final filename | Type | Current path / placeholder | Position / use | Collision | Interaction | Priority |
|---|---|---|---|---|---|---|---|---|
| character_ryoko | Character | CASE01_角色_森川凉子_01.png | UI texture | placeholder portrait | CASE intro | No | No | P0 |
| texture_case01_key1_sketchbook | Key Puzzle 1 | CASE01_关键谜题1_速写本封面_01.png | Texture | Canvas placeholder | central desk | No | Inspect | P0 |
| texture_case01_key1_sketch_front | Key Puzzle 1 | CASE01_关键谜题1_富江素描正面_01.png | Texture | paper plane | floor left | No | Inspect | P0 |
| texture_case01_key1_sketch_side | Key Puzzle 1 | CASE01_关键谜题1_富江素描侧面_02.png | Texture | paper plane | floor center | No | Inspect | P0 |
| texture_case01_key1_sketch_threequarter | Key Puzzle 1 | CASE01_关键谜题1_富江素描三分之二角度_03.png | Texture | paper plane | floor right | No | Inspect | P0 |
| texture_case01_key2_class_photo | Key Puzzle 2 | CASE01_关键谜题2_班级合照_01.png | Texture | notice board hotspot | left wall | No | Inspect | P0 |
| texture_case01_key2_two_girls | Key Puzzle 2 | CASE01_关键谜题2_双人合照_02.png | Texture | notice board hotspot | left wall | No | Inspect | P0 |
| texture_case01_key2_four_girls | Key Puzzle 2 | CASE01_关键谜题2_四人合照_03.png | Texture | notice board hotspot | left wall; must show Ryoko's black bag | No | Inspect | P0 |
| texture_case01_key4_grade_semester1 | Key Puzzle 4 | CASE01_关键谜题4_第一学期成绩单_01.png | Texture | paper plane | teacher desk | No | Inspect | P0 |
| texture_case01_key4_grade_semester2 | Key Puzzle 4 | CASE01_关键谜题4_第二学期成绩单_02.png | Texture | paper plane | teacher desk | No | Inspect | P0 |
| model_case01_key3_black_bag | Key Puzzle 3 | CASE01_模型_黑色公文书包_01.glb | Model | cabinet UI placeholder | lower storage cabinet | No | Open/inspect | P0 |
| model_case01_key3_rivet_bag | Key Puzzle 3 | CASE01_模型_铆钉书包_01.glb | Model | cabinet UI placeholder | lower storage cabinet | No | Inspect | P0 |
| model_case01_key3_cutter | Key Puzzle 3 | CASE01_模型_美工刀_01.glb | Model | UI placeholder | inside black bag | No | Take/inspect | P0 |
| texture_case01_newspaper | Non-key 5 | CASE01_非关键谜题5_案件报纸_01.png | Texture | paper plane | teacher desk | No | Inspect | P0 |
| texture_case01_phone | Non-key 3 | CASE01_非关键谜题3_富江手机界面_01.png | UI texture | box placeholder | right sink | No | Inspect | P0 |
| texture_case01_teacher_notice | Non-key 1 | CASE01_非关键谜题1_神谷革职公告_01.png | Texture | fallen easel hotspot | left area | No | Inspect | P0 |
| texture_case01_cctv | Non-key 2 | CASE01_非关键谜题2_监控画面_01.png | Texture/video | box placeholder | high left rear wall | No | Battery/inspect | P0 |
| model_case01_student_desk | Environment | CASE01_模型_学生桌_01.glb | Model | Formal GLB installed | central clusters; 0.60×0.70×0.40m | Yes, simple box | No | COMPLETE |
| model_case01_student_chair | Environment | CASE01_模型_学生椅_01.glb | Model | Formal GLB installed | paired behind each desk; 0.40×0.78×0.40m | Yes, reduced box | No | COMPLETE |
| model_case01_easel | Environment | CASE01_模型_木质画架_01.glb | Model | BoxGeometry | central clusters | Yes | Some inspect | P1 |
| model_case01_storage | Environment | CASE01_模型_大型储物柜_01.glb | Model | BoxGeometry | right wall | Yes | Open | P1 |
| texture_case01_wall | Material | CASE01_材质_老旧墙面_01.png | Texture | flat rough material | room shell | Yes | No | P1 |
| texture_case01_floor | Material | CASE01_材质_木地板磨损_01.png | Texture | flat rough material | floor | No | No | P1 |

## Reference-image requirements

- Models: Japanese student desk/chair, wooden easel, model chair, teacher desk/chair, large storage cabinet, small drawers, long sink, plaster bust, black school briefcase, riveted backpack, utility knife, old phone, CCTV, bins, brush cup, paint box. Use white/light-gray background with front and 3/4 views.
- Textures: every evidence sheet should be straight-on, complete-edged, high-resolution and legible. Include 3–5 subtly distorted student portraits, one attractive and non-horrorized Tomie portrait, ordinary student art, notices and schedules.
- Characters: Ryoko should appear neat, restrained, quietly tense and ordinary-pretty—not evil. Tomie, Kamiya and Miyamoto need consistent portrait references for later evidence replacements.
