import React, { useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function ClickablePlane({ onClick }) {
  const planeRef = useRef();

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]} // Flat on ground
      position={[0, 0, 0]}
      onClick={(event) => onClick(event)}
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="yellow" side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene() {
  const { camera, raycaster, mouse, gl, scene } = useThree();
  const [clickPositions, setClickPositions] = useState([]);

  // Function to calculate world position from mouse click
  const handleMouseClick = (event) => {
    // const raycaster = new THREE.Raycaster();
    // const mouse = new THREE.Vector2();

    // Convert screen coordinates to normalized device coordinates (-1 to 1)
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with mouse position and camera
    raycaster.setFromCamera(mouse, camera);

    // Get objects in the scene to check for intersections
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const worldPosition = intersects[0].point; // The world position where ray intersects
      console.log("World Position:", worldPosition);

      // Store the clicked position in state
      setClickPositions((prev) => [...prev, worldPosition]);
    }
  };

  return (
    <>
      <ClickablePlane onClick={handleMouseClick} />

      {/* Display spheres at clicked positions */}
      {clickPositions.map((pos, index) => (
        <mesh key={index} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
    </>
  );
}

export default function App() {
  return (
    <div className="flex h-screen w-screen">
            <div className="min-w-[180px] max-w-[300px] p-4 bg-gray-100">
            </div>
        <div className="flex-grow">
        <div className="relative w-full h-screen">
            <Canvas camera={{ position: [5, 5, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls />
                <Scene />
            </Canvas>
            </div>
        </div>
    </div>
  );
}
