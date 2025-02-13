import * as THREE from "three"
import { easing } from "maath"
import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, Bvh, OrbitControls, Environment } from "@react-three/drei"
import { EffectComposer, Selection, Outline, Select, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { Scene } from "./Scene"
import { RoomScene } from "./RoomScene"

export const App = () => {
  const [controlsEnabled, setControlsEnabled] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <GalleryPanel />
      <Canvas flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 1, 6], fov: 25, near: 1, far: 20 }}>
        <ambientLight intensity={1.4 * Math.PI} />
        <Sky />
        <Bvh firstHitOnly>
          <Selection>
            <Effects /> 
            <RoomScene rotation={[0, Math.PI / 2, 0]} position={[0, -1, -0.85]} />
          </Selection>
        </Bvh>
        <OrbitControls enabled={controlsEnabled} />
      </Canvas>
    </div>
  );
};

const GalleryPanel = () => {
  const galleryObjects = [
    { id: "TABLE", name: "Table", image: "/thumbnails/table.png" },
    { id: "CHAIR", name: "Chair", image: "/thumbnails/chair.png" },
    { id: "VASE", name: "Vase", image: "/thumbnails/vase.png" }
  ];

  return (
    <div style={{
      width: "250px", background: "#f8f8f8", padding: "10px", overflowY: "auto",
      borderRight: "2px solid #ddd", display: "flex", flexDirection: "column"
    }}>
      <h3>Gallery</h3>
      {galleryObjects.map((obj) => (
        <button
          key={obj.id}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px", border: "1px solid #ddd", cursor: "pointer" }}
        >
          <img src={obj.image} alt={obj.name} width="50" height="50" />
          <span>{obj.name}</span>
        </button>
      ))}
    </div>
  );
};


function Effects() {
  const { size } = useThree()
  // useFrame((state, delta) => {
  //   easing.damp3(state.camera.position, [state.pointer.x, 1 + state.pointer.y / 2, 8 + Math.atan(state.pointer.x * 2)], 0.3, delta)
  //   state.camera.lookAt(state.camera.position.x * 0.9, 0, -4)
  // })
  return (
    <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={4}>
      <N8AO halfRes aoSamples={5} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
      <Outline visibleEdgeColor="#FFD700" hiddenEdgeColor="#FFD700" blur width={size.width * 1.25} edgeStrength={20} />
      <TiltShift2 samples={5} blur={0.1} />
      <ToneMapping />
    </EffectComposer>
  )
}
