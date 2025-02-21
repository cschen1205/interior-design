import { useState, useRef, forwardRef, useImperativeHandle, Suspense, Loading } from "react";
import { useGLTF, useEnvironment, Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree, useLoader  } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { DynamicModel } from "./DynamicModel.jsx";
import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { RotateCw, Copy, Trash2 } from "lucide-react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export const RoomScene = forwardRef(( props, ref) => {

  const objectRefs = useRef({}); // Store all DraggingObject refs in a dictionary
  const { camera, raycaster, mouse, scene } = useThree();
  const [selectedObjId, setSelectedObjId] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [placedModels, setPlacedModels] = useState({
    "49a8839f-ef2b-4894-a094-502a0d75e294": { id: "49a8839f-ef2b-4894-a094-502a0d75e294", model: { id: "4", path: "/models/table.glb", scale: 1, rotationY: -Math.PI/2, 
      size: {x: 1.6813350319862366, y: 1.3810616433620453, z: 2.5296454429626465} }, 
    position: new THREE.Vector3(-0.00007258669166232412, -0.019999999999999813, 0.00520734842973436) },
  });

  
  const env = useEnvironment({ preset: "apartment" })


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
    modelSelected: () => selectedObjId != null,
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
          console.log("New Model: ", newModel, placedModels);
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
    console.log("selectObject: ", id, camera.position, camera.rotation);
    if(selectedObjId != id){
      if(selectedObjId != null){
        objectRefs.current[selectedObjId]?.select(false);
      }
      setSelectedObjId(id);
      objectRefs.current[id]?.select(true);
      console.log("selected: ", id);
    }
  };


  const onPointerUp = (event) => {
    event.stopPropagation();
    if(selectedObjId != null){
        objectRefs.current[selectedObjId]?.stopDragging();
        console.log("move end: ", objectRefs.current[selectedObjId].getPosition());
        setDragOffset(null);
        setDragging(false);
    }
  };

  const handleReplace = () => {
    console.log("replace: ", selectedObjId, placedModels[selectedObjId]);
  };

  const handleRotate = () => {
    if (selectedObjId && objectRefs.current[selectedObjId] ){
      objectRefs.current[selectedObjId].setRotation(objectRefs.current[selectedObjId].getRotation() + Math.PI / 4);
    }
  };

  const handleCopy = () => {
    console.log("rotate: ", selectedObjId, placedModels[selectedObjId]);
    if (selectedObjId && objectRefs.current[selectedObjId] && placedModels[selectedObjId]) {
      const newModel = {
        ...placedModels[selectedObjId],
        id: uuidv4(),
        position: objectRefs.current[selectedObjId].getPosition().clone().add(new THREE.Vector3(Math.random() * 2, 0, Math.random() * 1)),
      };
      setPlacedModels((prev) => ({
        ...prev,
        [newModel.id]: newModel,
      }));
      console.log("New Model: ", placedModels);
    }
  };

  const handleDelete = () => {
    if (selectedObjId && objectRefs.current[selectedObjId]) {
      const newModels = { ...placedModels };
      delete newModels[selectedObjId];
      setPlacedModels(newModels);
      selectObject(null);
    }
  };

  return (
    <>
      {selectedObjId == null && (<OrbitControls />)}
      {/* <Suspense fallback={null}> */}
        <group onPointerDown={onPointerDown} onPointerUp={onPointerUp} {...props}>
        <Room />
          {Object.entries(placedModels).map(([k, m]) => (
            <Suspense key={k} fallback={<PlaceholderBox model={m} />} >
              <DynamicModel key={k} ref={(el) => (objectRefs.current[k]=el)} model={m}/>
            </Suspense>
          ))}
          <mesh name="floor" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="yellow" side={THREE.DoubleSide} opacity={0} transparent={true} />
            <shadowMaterial opacity={0.8} />
          </mesh>
        </group>
      {/* </Suspense> */}
      {selectedObjId != null && !dragging && (
        <Menu selectedObject={selectedObjId==null?null:objectRefs.current[selectedObjId]} onRotate={handleRotate} onCopy={handleCopy} onReplace={handleReplace} onDelete={handleDelete} />
      )}
    </> 
  )
});

function Menu({ selectedObject, onRotate, onCopy, onReplace, onDelete }) {
  if (!selectedObject) return null;

  function handleUIClick(e, action) {
    if (e?.stopPropagation) {
      e.stopPropagation(); // Prevents event bubbling
    }else{
      console.log("No stopPropagation method found");
    }
    console.log("Clicked");
    if(action) action();
  }

  return (
    <Html position={selectedObject.getPosition().toArray()} >
      <div className="absolute -translate-x-1/2 -translate-y-full bg-white shadow-md p-2 rounded-lg flex space-x-2"
      style={{ pointerEvents: "auto" }} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <Button onClick={(e) => handleUIClick(e, onRotate)} variant="outline"><RotateCw size={18} /></Button>
        <Button onClick={(e) => handleUIClick(e, onCopy)} variant="outline"><Copy size={18} /></Button>
        {/* <Button onClick={(e) => handleUIClick(e, onReplace)} variant="outline"><RefreshCw size={18} /></Button> */}
        <Button onClick={(e) => handleUIClick(e, onDelete)} variant="outline" className="text-red-500"><Trash2 size={18} /></Button>
      </div>
    </Html>
  );
}

function Room({env}) {
  const { nodes, materials } = useGLTF("/models/kitchen-transformed.glb")

  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <mesh geometry={nodes.lamp_socket.geometry} material={materials.gray} material-envMap={env} receiveShadow/>
      <mesh geometry={nodes.lamp.geometry} material={materials.gray} receiveShadow/>
      <mesh geometry={nodes.lamp_cord.geometry} material={materials.gray} material-envMap={env} receiveShadow/>
      <mesh name="kitchen" geometry={nodes.kitchen.geometry} material={materials.walls} receiveShadow/>
      <mesh geometry={nodes.sink.geometry} material={materials.chrome} material-envMap={env} receiveShadow/>
      <mesh geometry={nodes.vase1.geometry} material={materials.gray} material-envMap={env} receiveShadow/>
      <mesh geometry={nodes.bottle.geometry} material={materials.gray} material-envMap={env} receiveShadow/>
      <mesh geometry={nodes.walls_1.geometry} material={materials.floor} userData={{name:"f1"}} receiveShadow/>
      <mesh geometry={nodes.walls_2.geometry} material={materials.walls} receiveShadow/>
      {/* <mesh geometry={nodes.plant_1.geometry} material={materials.potted_plant_01_leaves} receiveShadow/> */}
      {/* <mesh geometry={nodes.plant_2.geometry} material={materials.potted_plant_01_pot} receiveShadow/> */}
      <mesh geometry={nodes.cuttingboard.geometry} material={materials.walls} receiveShadow/>
      <mesh geometry={nodes.bowl.geometry} material={materials.walls} receiveShadow/>
      <mesh geometry={nodes.carpet.geometry} material={materials.carpet} material-envMap={env} material-envMapIntensity={0.5} receiveShadow/>
      {/* <mesh geometry={nodes.table.geometry} material={materials.walls} material-envMap={env} material-envMapIntensity={0.5} receiveShadow/> */}
      <mesh geometry={nodes.chairs_1.geometry} material={materials.walls} receiveShadow/>
      <mesh geometry={nodes.chairs_2.geometry} material={materials.plastic} material-color="#1a1a1a" material-envMap={env} receiveShadow/>
      {/* <mesh geometry={nodes.vase.geometry} material={materials.gray} material-envMap={env} receiveShadow/> */}
    </group>
  );
}

function PlaceholderBox({model}) {
  return (
    <mesh position={model.position.clone().add(new THREE.Vector3(0, model.model.size.y/2, 0))} scale={new THREE.Vector3(model.model.size.x, model.model.size.y, model.model.size.z)} >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

RoomScene.displayName = "RoomScene";
