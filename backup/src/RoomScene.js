import { useState, useEffect, useCallback, useRef } from "react"
import { debounce, set } from "lodash"
import { useGLTF, useEnvironment, Html, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing"
import { Price } from "./Price"
import { DraggingObject } from "./DraggingObject"



export function RoomScene(props) {
    const objectRefs = useRef({}); // Store all DraggingObject refs in a dictionary
    const { camera, raycaster, mouse, scene } = useThree();
    const [selectedObjId, setSelectedObjId] = useState(null);
    const [dragOffset, setDragOffset] = useState(null);
    const [dragging, setDragging] = useState(false);
    // const [showGallery, setShowGallery] = useState(true);
    // Load model
    const { nodes, materials } = useGLTF("/kitchen-transformed.glb")
    // Load environment (using it only on the chairs, for reflections)
    const env = useEnvironment({ preset: "city" })

    // const [objects, setObjects] = useState([{ id: 1, type: "box", position: [0, 1, 0] }]);

  const galleryObjects = [
    { id: "TABLE", name: "Table", geometry: nodes.table.geometry, material: materials.walls, image: "/thumbnails/table.png" },
    { id: "CHAIR", name: "Chair", geometry: nodes.chairs_1.geometry, material: materials.walls, image: "/thumbnails/chair.png" },
    { id: "VASE", name: "Vase", geometry: nodes.vase.geometry, material: materials.gray, image: "/thumbnails/vase.png" }
];

  useEffect(() => {
    // console.log("Updated dragOffset: ", dragOffset, selectedObjId);
  }, [dragOffset, selectedObjId]);

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

  const onPointerDown = (event) => {
    event.stopPropagation();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object; // Closest object
      if (clickedObject.userData.draggable) {
        const id = clickedObject.userData.id;
        if(objectRefs.current[id]){
            const floorIntersect = intersects.find(intersect => intersect.object.name === "floor");
            if(floorIntersect && dragOffset == null){
              setDragOffset(floorIntersect.point.clone());
              // console.log("move start: ", floorIntersect.point, dragOffset);
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

  const handleDelete = (id) => {
    setObjects((prevObjects) => prevObjects.filter((obj) => obj.id !== id));
  };

  // const handleReplace = (id, newType) => {
  //   setObjects((prevObjects) =>
  //     prevObjects.map((obj) => (obj.id === id ? { ...obj, type: newType } : obj))
  //   );
  // };

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
  // Get the priced item
  const price = { KNOXHULT: 5999, BRÖNDEN: 433, SKAFTET: 77, FANBYN: 255, VOXLÖV: 1699, LIVSVERK: 44 }[hovered] ?? 5999
  return (
    <>
      {/* {selectedObjId == null && (
        <Html>
          <OrbitControls />
        </Html>
      )} */}
      <group onPointerDown={onPointerDown} onPointerUp={onPointerUp} {...props}  >
        <mesh geometry={nodes.vase1.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.bottle.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.walls_1.geometry} material={materials.floor} userData={{name:"f1"}} />
        <mesh geometry={nodes.walls_2.geometry} material={materials.walls} />
        <mesh geometry={nodes.plant_1.geometry} material={materials.potted_plant_01_leaves} />
        <mesh geometry={nodes.plant_2.geometry} material={materials.potted_plant_01_pot} /> 
        <mesh geometry={nodes.cuttingboard.geometry} material={materials.walls} />
        <mesh geometry={nodes.bowl.geometry} material={materials.walls} />
        <mesh geometry={nodes.carpet.geometry} material={materials.carpet} />
        {/* <DraggingObject id="BRÖNDEN" geometry={nodes.carpet.geometry} material={materials.carpet} env_map={env} 
        position={[0, 0, 0]} onDelete={handleDelete} onReplace={handleReplace} onDeselect={() => setSelectedId(null)}/> */}
        {/* <mesh name="table3" geometry={nodes.table.geometry} material={materials.walls} material-envMap={env} material-envMapIntensity={0.5} /> */}
        <DraggingObject id="VOXLÖV" name="table" ref={(el) => (objectRefs.current["VOXLÖV"] = el)} geometry={nodes.table.geometry} material={materials.walls} env_map={env} 
        envMapIntensity={0.5} onDelete={handleDelete} onReplace={handleReplace} onDeselect={() => setSelectedId(null)}/>
        {/* <Select enabled={hovered === "VOXLÖV"} onPointerOver={over("VOXLÖV")} onPointerOut={() => debouncedHover(null)}>
          <mesh geometry={nodes.table.geometry} material={materials.walls} material-envMap={env} material-envMapIntensity={0.5} />
        </Select> */}
        <mesh geometry={nodes.chairs_1.geometry} material={materials.walls} />
        <mesh geometry={nodes.chairs_2.geometry} material={materials.plastic} material-color="#1a1a1a" material-envMap={env} />
        {/* <Select enabled={hovered === "LIVSVERK"} onPointerOver={over("LIVSVERK")} onPointerOut={() => debouncedHover(null)}> */}
          <mesh geometry={nodes.vase.geometry} material={materials.gray} material-envMap={env} />
        {/* </Select> */}
        {/* <Select enabled={hovered === "SKAFTET"} onPointerOver={over("SKAFTET")} onPointerOut={() => debouncedHover(null)}> */}
          <mesh geometry={nodes.lamp_socket.geometry} material={materials.gray} material-envMap={env} />
          <mesh geometry={nodes.lamp.geometry} material={materials.gray} />
          <mesh geometry={nodes.lamp_cord.geometry} material={materials.gray} material-envMap={env} />
        {/* </Select>  */}
        <mesh name="kitchen" geometry={nodes.kitchen.geometry} material={materials.walls} /> 
        <mesh geometry={nodes.sink.geometry} material={materials.chrome} material-envMap={env} />
        <mesh name = "floor" position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1000, 1000]} /> {/* Large size */}
            <meshStandardMaterial color="white" opacity={1} />
        </mesh>
      </group>
      {/* <Text position={[1, 1.25, 0]} color="black" fontSize={0.15} font="Inter-Regular.woff" letterSpacing={-0.05}>
        {hovered ? hovered : "KNOXHULT"}
      </Text> */}
      {/** Forward the price to the ticker component */}
      {/* <Price value={price} position={[-2, 0.3, -3.25]} /> */}
    </>
  )
}
