import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useGLTF, Html } from "@react-three/drei";
import { DynamicModel } from "./DynamicModel.jsx";

function Model() {
  // const gltf = useLoader(GLTFLoader, "/models/modelA.glb");

  const { scene } = useGLTF("/models/modelA.glb");

  // Clone and enable shadows
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true); // Deep clone to preserve materials
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

export default function App() {
  const models = [
    {model: { id: "1", name: "Model A", path: "/models/modelA.glb", image: "models/modelA.jpg" }, id: "1", position: [0, 0, 0]},
  ];

  return (
    <Canvas shadows camera={{ position: [3, 3, 3], fov: 50 }}>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        castShadow
        intensity={1}
        shadow-mapSize={[2048, 2048]}
      />

      {/* 3D Model */}
      <DynamicModel model={models[0]} />

      {/* Floor for shadows */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.5} />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}
