import { useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Chair, Table, Bed } from "./models"; 
import DraggingObject from "./DraggingObject";
import * as THREE from "three";

const Scene = () => {
  const floorRef = useRef();
  const objectRefs = useRef({}); // Store all DraggingObject refs in a dictionary
  const { raycaster, mouse, camera, scene } = useThree();

  const [selectedObjId, setSelectedObjId] = useState(null);

  useFrame(() => {
    if (selectedObjId && objectRefs.current[selectedObjId]) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const floorIntersect = intersects.find(intersect => intersect.object.name === "floor");
        if (floorIntersect) {
          objectRefs.current[selectedObjId]?.setPosition(floorIntersect.point.x, floorIntersect.point.z);
        }
      }
    }
  });

  // Handle mouse down (select an object)
  const onPointerDown = (event) => {
    event.stopPropagation();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;

      if (clickedObject.userData.isDraggingObject) {
        const id = clickedObject.userData.id;

        if (objectRefs.current[id]) {
          objectRefs.current[selectedObjId]?.stopDragging(); // Stop previous selection
          setSelectedObjId(id); // Set new selected object
          objectRefs.current[id]?.startDragging();
        }
      } else {
        objectRefs.current[selectedObjId]?.stopDragging();
        setSelectedObjId(null);
      }
    } else {
      objectRefs.current[selectedObjId]?.stopDragging();
      setSelectedObjId(null);
    }
  };

  // Handle mouse up (stop dragging)
  const onPointerUp = () => {
    objectRefs.current[selectedObjId]?.stopDragging();
    setSelectedObjId(null);
  };

  // Generate dynamic objects
  const dynamicObjects = [
    { id: "chair1", model: Chair, position: [-2, 1, 0] },
    { id: "table1", model: Table, position: [0, 1, 0] },
    { id: "bed1", model: Bed, position: [2, 1, 0] },
    { id: "chair2", model: Chair, position: [-4, 1, 2] }, // Extra object
    { id: "table2", model: Table, position: [2, 1, -2] }, // Extra object
  ];

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 50 }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <OrbitControls />

      {/* Floor */}
      <mesh ref={floorRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} name="floor">
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="lightgray" side={THREE.DoubleSide} />
      </mesh>

      {/* Dynamically Render Draggable Objects */}
      {dynamicObjects.map(({ id, model, position }) => (
        <DraggingObject key={id} ref={(el) => (objectRefs.current[id] = el)} model={model} position={position} id={id} />
      ))}
    </Canvas>
  );
};

export default Scene;
