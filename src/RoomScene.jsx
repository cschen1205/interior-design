import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, Clone, Suspense } from "react";
import { debounce, set } from "lodash";
import { useGLTF, useEnvironment, Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { DynamicModel } from "./DynamicModel.jsx";
import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";


export const RoomScene = forwardRef(( props, ref) => {

  const objectRefs = useRef({}); // Store all DraggingObject refs in a dictionary
  const loadedModels = {};
  const { camera, raycaster, mouse, scene } = useThree();
  const [selectedObjId, setSelectedObjId] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [placedModels, setPlacedModels] = useState({});

  const { nodes, materials } = useGLTF("/models/kitchen-transformed.glb")
  const env = useEnvironment({ preset: "city" })


  // useEffect(() => {
  //   if(dropItem){
  //     requestAnimationFrame(()=>handleMouseClick(dropItem));
  //   }
  //   // console.log("Updated dragOffset: ", dragOffset, selectedObjId);
  // }, [dropItem]);

  useFrame(() => {
    if (dragging && selectedObjId && objectRefs.current[selectedObjId]) {
      // console.log("selectedObjId: ", selectedObjId);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const floorIntersect = intersects.find(intersect => intersect.object.name === "floor");
        if (floorIntersect) {
            const p = floorIntersect.point.clone().sub(dragOffset);
            // console.log("floor intersect: ", floorIntersect.point, p, dragOffset);
          objectRefs.current[selectedObjId]?.addPosition(p);
          setDragOffset(floorIntersect.point.clone());
        }
      }
    }
  });

  useImperativeHandle(ref, () => ({
    onDrop: (model, offset) => handleItemDrop(model, offset),
  }));


  function handleItemDrop(model, offset){
    if(model){
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      // Convert screen coordinates to normalized device coordinates (-1 to 1)
      mouse.x = ((offset.x-200) / (window.innerWidth-200)) * 2 - 1;
      mouse.y = -(offset.y / window.innerHeight) * 2 + 1;
      // Set the raycaster and get intersection with the ground plane
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const floorIntersect = intersects.find(intersect => intersect.object.name === "floor");
        if (floorIntersect) {
          const newModel = {
            ...model,
            id: uuidv4(),
            position: floorIntersect.point,
          };
          setPlacedModels((prev) => ({
            ...prev,
            [newModel.id]: newModel,
          }));
          console.log("New Model: ", newModel);
        }
      }
    }
  }

  const onPointerDown = (event) => {
    event.stopPropagation();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      let clickedObject = intersects[0].object; // Closest object
      while (clickedObject && !clickedObject.userData.id && clickedObject.parent) {
        clickedObject = clickedObject.parent;
      }
      if (clickedObject.userData.draggable) {
        const id = clickedObject.userData.id;
        if(objectRefs.current[id]){
            const floorIntersect = intersects.find(intersect => intersect.object.name === "floor");
            if(floorIntersect && dragOffset == null){
              setDragOffset(floorIntersect.point.clone());
              console.log("move start: ", floorIntersect.point, dragOffset);
            }else{
              console.log("floor intersect not found");
            }
            setDragging(true);
            selectObject(id); // Set new selected object
            objectRefs.current[id]?.startDragging();
            return;
        }
      }
    }
    objectRefs.current[selectedObjId]?.stopDragging();
    selectObject(null);
  };

  const selectObject = (id) => {
    if(selectedObjId != id){
      if(selectedObjId != null){
        objectRefs.current[selectedObjId]?.select(false);
      }
      setSelectedObjId(id);
      objectRefs.current[id]?.select(true);
      console.log("selected: ", id);
    }
  };


  const onPointerUp = () => {
    if(selectedObjId != null){
        objectRefs.current[selectedObjId]?.stopDragging();
        console.log("move end: ", objectRefs.current[selectedObjId].getPosition());
        setDragOffset(null);
        setDragging(false);
    }
  };

  const handleReplace = (geometry, material) => {
    if (selectedObjId && objectRefs.current[selectedObjId]) {
      objectRefs.current[selectedObjId].getMesh().geometry = geometry;
      objectRefs.current[selectedObjId].getMesh().material = material;
    }
  };

  // Hover state
  const [hovered, hover] = useState(null)
  // Debounce hover a bit to stop the ticker from being erratic
  const debouncedHover = useCallback(debounce(hover, 30), [])
  const over = (name) => (e) => (e.stopPropagation(), debouncedHover(name))
  return (
    <>
      <Suspense fallback={null}>
        <group onPointerDown={onPointerDown} onPointerUp={onPointerUp}  >
            {/* <mesh geometry={nodes.lamp_socket.geometry} material={materials.gray} material-envMap={env} />
            <mesh geometry={nodes.lamp.geometry} material={materials.gray} />
            <mesh geometry={nodes.lamp_cord.geometry} material={materials.gray} material-envMap={env} /> */}
          {/* </Select>  */}
          {/* <mesh name="kitchen" geometry={nodes.kitchen.geometry} material={materials.walls} />  */}
          {/* <mesh geometry={nodes.sink.geometry} material={materials.chrome} material-envMap={env} /> */}
          {Object.entries(placedModels).map(([k, m]) => (
            <DynamicModel key={k} ref={(el) => (objectRefs.current[k]=el)} model={m}/>
          ))}
              <mesh name="floor"
                rotation={[-Math.PI / 2, 0, 0]} // Flat on ground
                position={[0, 0, 0]}
              >
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="yellow" side={THREE.DoubleSide} />
              </mesh>

          {/* <mesh name = "floor" position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1000, 1000]} /> 
              <meshStandardMaterial color="white" opacity={1} />
          </mesh> */}
        </group>
      </Suspense>
    </> 
  )
});

RoomScene.displayName = "RoomScene";
