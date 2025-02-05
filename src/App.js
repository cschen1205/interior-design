import * as THREE from "three"
import { easing } from "maath"
import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, Bvh, OrbitControls, Html } from "@react-three/drei"
import { EffectComposer, Selection, Outline, Select, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { Scene } from "./Scene"

const DraggableBox = ({ position, onDelete, onReplace, onDeselect }) => {
  const meshRef = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState([0, 0, 0]);
  const [showMenu, setShowMenu] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [showRotationSlider, setShowRotationSlider] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsSelected(true);
    setIsDragging(true);
    setShowMenu(false); // Hide menu while dragging

    const point = event.intersections[0].point;
    setOffset([
      meshRef.current.position.x - point.x,
      meshRef.current.position.y - point.y,
      meshRef.current.position.z - point.z,
    ]);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setShowMenu(true); // Show menu after releasing
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const point = event.intersections[0].point;
    meshRef.current.position.set(
      point.x + offset[0],
      point.y + offset[1],
      point.z + offset[2]
    );
  };

  const handleDeselect = (event) => {
    event.stopPropagation();
    setIsSelected(false);
    setShowMenu(false);
    setShowRotationSlider(false);
    setShowGallery(false);
    onDeselect();
  };

  return (
    <>
      <mesh
        ref={meshRef}
        position={position}
        rotation={[0, rotationY, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerMissed={handleDeselect} // Deselect when clicking outside
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {isSelected && !isDragging && (
        <Html position={[0, 1.2, 0]} center>
          <div style={{ background: "white", padding: "5px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)" }}>
            <button onClick={() => setShowMenu(!showMenu)}>⚙️ Options</button>
          </div>
        </Html>
      )}

      {showMenu && !isDragging && (
        <Html position={[0, 1.6, 0]} center>
          <div style={{ background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", display: "flex", gap: "10px" }}>
            <button onClick={onDelete}>🗑 Delete</button>
            <button
              onMouseEnter={() => setShowRotationSlider(true)}
              onMouseLeave={() => setShowRotationSlider(false)}
            >
              🔄 Rotate
            </button>
            <button
              onMouseEnter={() => setShowGallery(true)}
              onMouseLeave={() => setShowGallery(false)}
            >
              🔄 Replace
            </button>
          </div>
        </Html>
      )}

      {showRotationSlider && (
        <Html position={[0, 2, 0]} center>
          <div style={{ background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label>Rotation</label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={rotationY}
              onChange={(e) => setRotationY(parseFloat(e.target.value))}
            />
          </div>
        </Html>
      )}

      {showGallery && (
        <Html position={[0, 2.5, 0]} center>
          <div style={{ background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", textAlign: "center", display: "flex", gap: "10px" }}>
            <button onClick={() => onReplace("box")}>🟥 Box</button>
            <button onClick={() => onReplace("sphere")}>⚪ Sphere</button>
            <button onClick={() => onReplace("cone")}>🔺 Cone</button>
          </div>
        </Html>
      )}
    </>
  );
};

export const App = () => {
  const [objects, setObjects] = useState([{ id: 1, type: "box", position: [0, 1, 0] }]);

  const handleDelete = (id) => {
    setObjects((prevObjects) => prevObjects.filter((obj) => obj.id !== id));
  };

  const handleReplace = (id, newType) => {
    setObjects((prevObjects) =>
      prevObjects.map((obj) => (obj.id === id ? { ...obj, type: newType } : obj))
    );
  };

  return (
    <Canvas camera={{ position: [0, 3, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} castShadow />

      {objects.map((obj) => (
        <DraggableBox
          key={obj.id}
          position={obj.position}
          onDelete={() => handleDelete(obj.id)}
          onReplace={(newType) => handleReplace(obj.id, newType)}
          onDeselect={() => {}}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>

      {/* <OrbitControls /> */}
    </Canvas>
  );
}


export const App1 = () => (
  <Canvas flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 1, 6], fov: 25, near: 1, far: 20 }}>
    <ambientLight intensity={1.5 * Math.PI} />
    <Sky />
    <Bvh firstHitOnly>
      <Selection>
        <Effects /> 
        <Scene rotation={[0, Math.PI / 2, 0]} position={[0, -1, -0.85]} />
      </Selection>
    </Bvh>
    <OrbitControls />
  </Canvas>
)

function Effects() {
  const { size } = useThree()
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [state.pointer.x, 1 + state.pointer.y / 2, 8 + Math.atan(state.pointer.x * 2)], 0.3, delta)
    state.camera.lookAt(state.camera.position.x * 0.9, 0, -4)
  })
  return (
    <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={4}>
      <N8AO halfRes aoSamples={5} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
      <Outline visibleEdgeColor="white" hiddenEdgeColor="white" blur width={size.width * 1.25} edgeStrength={10} />
      <TiltShift2 samples={5} blur={0.1} />
      <ToneMapping />
    </EffectComposer>
  )
}
