"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type BagId = "bag_a" | "bag_b";

function BagPreview({ asset }: { asset: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1.7, 0.01, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(340, 200, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc8d8e8, 0x151719, 1.4));
    const key = new THREE.DirectionalLight(0xe2edf8, 2.1);
    key.position.set(3, 4, 5);
    scene.add(key);

    let model: THREE.Object3D | null = null;
    let frame = 0;
    let disposed = false;

    new GLTFLoader().load(asset, (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);
      const radius = Math.max(size.x, size.y, size.z, 0.1);
      camera.position.set(radius * 1.35, radius * 0.75, radius * 1.85);
      camera.lookAt(0, 0, 0);
    });

    const render = () => {
      frame = requestAnimationFrame(render);
      if (model) model.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [asset]);

  return <div className="bag-preview" ref={host} aria-hidden="true" />;
}

export default function BagSelection({
  onSelect,
  onClose,
}: {
  onSelect: (id: BagId) => void;
  onClose: () => void;
}) {
  return (
    <div className="bag-select-overlay" role="dialog" aria-modal="true" aria-label="储物柜调查">
      <section className="bag-select-panel">
        <p className="eyebrow">LOCKER / INVESTIGATION</p>
        <h2>请选择调查物品</h2>
        <div className="bag-select-grid">
          <button type="button" className="bag-card" onClick={() => onSelect("bag_a")}>
            <BagPreview asset="/assets/models/CASE01_rivet_bag_01.glb" />
            <strong>包 A</strong>
            <span>带铆钉的旧学生包</span>
          </button>
          <button type="button" className="bag-card" onClick={() => onSelect("bag_b")}>
            <BagPreview asset="/assets/models/CASE01_ryoko_black_bag_01.glb" />
            <strong>包 B</strong>
            <span>黑色日式学生包</span>
          </button>
        </div>
        <button type="button" className="secondary-button bag-close" onClick={onClose}>
          返回教室
        </button>
      </section>
    </div>
  );
}
