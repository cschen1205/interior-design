import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useState, useRef } from "react";
import * as THREE from "three";

function DraggableBox({ position }) {
  const meshRef = useRef();
  const { camera, raycaster, gl } = useThree();
  const [selected, setSelected] = useState(false);
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });

  // Convert 3D position to screen coordinates
  const updateScreenPos = () => {
    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(meshRef.current.matrixWorld);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * gl.domElement.clientWidth;
    const y = (-(vector.y * 0.5 - 0.5)) * gl.domElement.clientHeight;
    
    setScreenPos({ x, y });
  };

  useFrame(() => {
    if (selected) updateScreenPos();
  });

  // Click to Select
  const onPointerDown = (event) => {
    event.stopPropagation();
    setSelected(true);
  };

  // Click outside to Deselect
  const onPointerMissed = () => {
    setSelected(false);
  };

  return (
    <>
      <mesh ref={meshRef} position={position} onPointerDown={onPointerDown}>
        <cylinderGeometry args={[1, 0.05, 0.5, 32]} />
        <meshStandardMaterial color={selected ? "yellow" : "gray"} />
      </mesh>

      {selected && (
        <Html position={[0, 0, 0]}>
          <div
            style={{
              position: "absolute",
              top: `${screenPos.y - 50}px`,
              left: `${screenPos.x - 100}px`,
              background: "black",
              color: "white",
              padding: "10px",
              borderRadius: "10px",
              display: "flex",
              gap: "10px",
            }}
          >
            <button>🛍️ Add to Bag</button>
            <button>↻ Rotate</button>
            <button>🔄 Replace</button>
            <button>📑 Copy</button>
            <button>🗑️ Remove</button>
          </div>
        </Html>
      )}
    </>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <DraggableBox position={[0, 1, 0]} />
      <OrbitControls />
    </Canvas>
  );
}
