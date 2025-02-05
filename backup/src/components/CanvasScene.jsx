/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Lighting from "./Lighting";
import Model from "./Model";

const CanvasScene = () => {
  const [selectedObject, setSelectedObject] = useState(null); // State for the selected object
  const raycaster = useRef(new THREE.Raycaster()); // Ref for raycaster
  const mouse = useRef(new THREE.Vector2()); // Ref for mouse position

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const { width, height } = event.target.getBoundingClientRect();
    mouse.current.x = (clientX / width) * 2 - 1;
    mouse.current.y = -(clientY / height) * 2 + 1;
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setSelectedObject(null)} // Deselect object on mouse up
    >
      <Canvas
        shadows
        camera={{ position: [5, 5, 10], fov: 60 }}
        onCreated={({ gl }) => gl.setPixelRatio(window.devicePixelRatio)}
      >
        {/* Scene Background */}
        <color attach="background" args={["#f0f0f0"]} />

        {/* Lighting */}
        <Lighting />

        {/* Interaction Handler */}
        <InteractionHandler
          selectedObject={selectedObject}
          setSelectedObject={setSelectedObject}
          mouse={mouse}
          raycaster={raycaster}
        />

        {/* Models */}
        <Model path="/assets/models/standard/chair.glb" position={[0, 0, 0]} />
        <Model path="/assets/models/standard/victorian_wooden_table.glb" position={[1.5, 0, 0]} />
        <Model path="/assets/models/standard/desk_lamp.glb" position={[-1.5, 0, 0]} />

        {/* Camera Controls */}
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
};

const InteractionHandler = ({ selectedObject, setSelectedObject, mouse, raycaster }) => {
  const { camera, scene } = useThree(); // Access the camera and scene

  const handleMouseDown = (event) => {
    if (event.button !== 0) return; // Only handle left mouse button

    // Perform raycasting to detect objects
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log("Object clicked:", intersects[0].object);
        setSelectedObject(intersects[0].object);
    }else{
        console.log("Object not click:");
    }
  };

  useFrame(() => {
    if (selectedObject) {
      raycaster.current.setFromCamera(mouse.current, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0)); // Horizontal ground plane
      const intersection = raycaster.current.ray.intersectPlane(plane);
      if (intersection) {
        selectedObject.position.copy(intersection); // Move the object to follow the mouse
      }
    }
  });

  return (
    <group onPointerDown={handleMouseDown}>
      {/* Interaction logic is attached here */}
    </group>
  );
};

export default CanvasScene;
