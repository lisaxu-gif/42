# CASE01_ARTROOM_EMPTY_LAYOUT

- World scale: 1 unit = 1 meter.
- Runtime layout: `app/case01/CASE01_ARTROOM_LAYOUT.json`.
- Room: 4.8m wide (X), 5.8m long (Z), 3.1m high (Y).
- Spawn: `(0, 1.65, 2.15)`, facing the front wall.
- Walkable controller bounds: X `-2.0..2.0`, Z `-2.5..2.5`.
- Retained: floor, ceiling, four closed walls, closed rear door, three right-wall window groups, rainy exterior, fog, lighting, controller, collision, raycast, UI and Evidence framework.
- Active placed assets: fixed furniture, two student desk/chair stations using the model-chair asset, three standing easels, corner CCTV, bloody sketchbook, fallen easel, teacher-desk books/skull, wall-1 clock, four ceiling fixtures with one dim cool light active, three floor sketches, student-desk palette, CCTV-side bucket, and right-corner paint set. The former center model chair is removed.
- Asset files and `AssetConfig.ts` mappings are intentionally retained for later layout passes.
- Furniture, art props, story props, Evidence meshes, interaction hitboxes and their object colliders are not instantiated in this layout.

Future assets must be added through `CASE01_ARTROOM_LAYOUT.json` with explicit `position`, `rotation`, `scale`, `enabled`, and `collider` fields. Model replacement must remain independent from layout placement.
