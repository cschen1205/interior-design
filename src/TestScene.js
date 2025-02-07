import { useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Select } from "@react-three/drei";
import * as THREE from "three";

import { useGLTF } from "@react-three/drei";

function Chair(props) {
  const { scene } = useGLTF("/chair.glb"); // Load model
  return <primitive object={scene} {...props} />;
}

function Table(props) {
  const { scene } = useGLTF("/lamp.glb");
  return <primitive object={scene} {...props} />;
}



// Draggable and Selectable Object
const DraggingObject = ({ model: Model, position, name }) => {
  const meshRef = useRef();

  return (
    <Select>
      <mesh ref={meshRef} position={position} name={name} userData={{ isDraggingObject: true }}>
        <Model />
      </mesh>
    </Select>
  );
};

// Scene Component with Global Pointer Detection
export const TestScene = () => {
  const floorRef = useRef();
  const [selectObj, setSelectObj] = useState(null);
  const { raycaster, mouse, camera, scene } = useThree();

  // Global Pointer Down Handler
  const onPointerDown = (event) => {
    event.stopPropagation();

    // Perform raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object; // Closest object

      if (clickedObject.userData.isDraggingObject) {
        setSelectObj(clickedObject); // Select the DraggingObject
        console.log("Selected Object:", clickedObject.name);
      } else {
        setSelectObj(null); // Clicked outside, deselect
        console.log("No object selected.");
      }
    } else {
      setSelectObj(null);
    }
  };

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 50 }} onPointerDown={onPointerDown}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <OrbitControls />

      {/* Floor (Non-Selectable) */}
      <mesh ref={floorRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} name="floor">
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="lightgray" side={THREE.DoubleSide} />
      </mesh>

      {/* Draggable Objects */}
      <DraggingObject model={Chair} position={[-2, 1, 0]} name="Chair" />
      <DraggingObject model={Table} position={[0, 1, 0]} name="Table" />
    </Canvas>
  );
};
