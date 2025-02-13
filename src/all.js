import * as THREE from "three"
import React, { useRef, useState, useEffect,useCallback, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, Bvh, Html, useGLTF, useEnvironment, } from "@react-three/drei"
import { EffectComposer, Selection, Outline, Select, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { debounce, set } from "lodash"


export const App = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <GalleryPanel />
      <Canvas flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 1, 6], fov: 25, near: 1, far: 20 }}>
        <ambientLight intensity={1.5 * Math.PI} />
        <Sky />
        <Bvh firstHitOnly>
          <Selection>
            <Effects /> 
            <RoomScene rotation={[0, Math.PI / 2, 0]} position={[0, -1, -0.85]} />
          </Selection>
        </Bvh>
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
};

const GalleryPanel = () => {
  const galleryObjects = [
    { id: "TABLE", name: "Table", image: "/thumbnails/table.png" },
    { id: "CHAIR", name: "Chair", image: "/thumbnails/chair.png" },
    { id: "VASE", name: "Vase", image: "/thumbnails/vase.png" }
  ];

  return (
    <div style={{
      width: "250px", background: "#f8f8f8", padding: "10px", overflowY: "auto",
      borderRight: "2px solid #ddd", display: "flex", flexDirection: "column"
    }}>
      <h3>Gallery</h3>
      {galleryObjects.map((obj) => (
        <button
          key={obj.id}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px", border: "1px solid #ddd", cursor: "pointer" }}
        >
          <img src={obj.image} alt={obj.name} width="50" height="50" />
          <span>{obj.name}</span>
        </button>
      ))}
    </div>
  );
};


function Effects() {
  const { size } = useThree()
  // useFrame((state, delta) => {
  //   easing.damp3(state.camera.position, [state.pointer.x, 1 + state.pointer.y / 2, 8 + Math.atan(state.pointer.x * 2)], 0.3, delta)
  //   state.camera.lookAt(state.camera.position.x * 0.9, 0, -4)
  // })
  return (
    <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={4}>
      <N8AO halfRes aoSamples={5} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
      <Outline visibleEdgeColor="#FFD700" hiddenEdgeColor="#FFD700" blur width={size.width * 1.25} edgeStrength={20} />
      <TiltShift2 samples={5} blur={0.1} />
      <ToneMapping />
    </EffectComposer>
  )
}

export function RoomScene(props) {
    const objectRefs = useRef({}); // Store all DraggingObject refs in a dictionary
    const { camera, raycaster, mouse, scene } = useThree();
    const [selectedObjId, setSelectedObjId] = useState(null);
    const [dragOffset, setDragOffset] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [showGallery, setShowGallery] = useState(true);
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
      <group onPointerDown={onPointerDown} onPointerUp={onPointerUp} {...props}>
        {/* <mesh geometry={nodes.vase1.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.bottle.geometry} material={materials.gray} material-envMap={env} /> */}
        {/* <mesh geometry={nodes.walls_1.geometry} material={materials.floor} userData={{name:"f1"}} /> */}
        {/* <mesh geometry={nodes.walls_2.geometry} material={materials.walls} />
        <mesh geometry={nodes.plant_1.geometry} material={materials.potted_plant_01_leaves} />
        <mesh geometry={nodes.plant_2.geometry} material={materials.potted_plant_01_pot} /> 
        <mesh geometry={nodes.cuttingboard.geometry} material={materials.walls} />
        <mesh geometry={nodes.bowl.geometry} material={materials.walls} /> */}
        {/* <Select enabled={hovered === "BRÖNDEN"} onPointerOver={over("BRÖNDEN")} onPointerOut={() => debouncedHover(null)}> */}
          {/* <mesh name="carpet" geometry={nodes.carpet.geometry} material={materials.carpet} userData={{name:"c1"}} /> */}
        {/* </Select> */}
        {/* <DraggingObject id="BRÖNDEN" geometry={nodes.carpet.geometry} material={materials.carpet} env_map={env} 
        position={[0, 0, 0]} onDelete={handleDelete} onReplace={handleReplace} onDeselect={() => setSelectedId(null)}/> */}
        {/* <mesh name="table3" geometry={nodes.table.geometry} material={materials.walls} material-envMap={env} material-envMapIntensity={0.5} /> */}
        <DraggingObject id="VOXLÖV" name="table" ref={(el) => (objectRefs.current["VOXLÖV"] = el)} geometry={nodes.table.geometry} material={materials.walls} env_map={env} 
        envMapIntensity={0.5} onDelete={handleDelete} onReplace={handleReplace} onDeselect={() => setSelectedId(null)}/>
        {/* <Select enabled={hovered === "VOXLÖV"} onPointerOver={over("VOXLÖV")} onPointerOut={() => debouncedHover(null)}>
          <mesh geometry={nodes.table.geometry} material={materials.walls} material-envMap={env} material-envMapIntensity={0.5} />
        </Select>
        <Select enabled={hovered === "FANBYN"} onPointerOver={over("FANBYN")} onPointerOut={() => debouncedHover(null)}>
          <mesh geometry={nodes.chairs_1.geometry} material={materials.walls} />
          <mesh geometry={nodes.chairs_2.geometry} material={materials.plastic} material-color="#1a1a1a" material-envMap={env} />
        </Select>
        <Select enabled={hovered === "LIVSVERK"} onPointerOver={over("LIVSVERK")} onPointerOut={() => debouncedHover(null)}>
          <mesh geometry={nodes.vase.geometry} material={materials.gray} material-envMap={env} />
        </Select>
        <Select enabled={hovered === "SKAFTET"} onPointerOver={over("SKAFTET")} onPointerOut={() => debouncedHover(null)}>
          <mesh geometry={nodes.lamp_socket.geometry} material={materials.gray} material-envMap={env} />
          <mesh geometry={nodes.lamp.geometry} material={materials.gray} />
          <mesh geometry={nodes.lamp_cord.geometry} material={materials.gray} material-envMap={env} />
        </Select> */}
        {/* <mesh name="kitchen" geometry={nodes.kitchen.geometry} material={materials.walls} /> 
        <mesh geometry={nodes.sink.geometry} material={materials.chrome} material-envMap={env} /> */}
        <mesh name = "floor" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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

export const DraggingObject = forwardRef(({ id, geometry, material, envMap, envMapIntensity, position, onDelete, onReplace, onDeselect, name}, ref) => {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showRotationSlider, setShowRotationSlider] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [hovered, hover] = useState(null)

  useImperativeHandle(ref, () => ({
    startDragging: () => setIsDragging(true),
    stopDragging: () => setIsDragging(false),
    select: (flag) => setIsSelected(flag),
    getMesh: () => meshRef.current, // Expose mesh for interaction
    addPosition: (vector3) => {
      if (meshRef.current && vector3.equals(new THREE.Vector3(0, 0, 0)) === false) {
          // Convert world coordinates to local if necessary
          const worldPos = new THREE.Vector3();
          meshRef.current.getWorldPosition(worldPos);
          worldPos.add(vector3);
          meshRef.current.parent?.worldToLocal(worldPos);
          worldPos.y = meshRef.current.position.y; // Keep Y constant
          meshRef.current.position.copy(worldPos);
      }
    },
    getPosition: () => {
      if (meshRef.current) {
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        return worldPos;
      }
      return null;
    },
    getDragging: () => isDragging,
  }));

  useEffect(() => {
    if(!isSelected || isDragging){
      setShowRotationSlider(false);
    }

    console.log("show rotation slider: ", showRotationSlider, isSelected, isDragging);
  }, [showRotationSlider, isSelected, isDragging]);

  return (
    <>
      <Select enabled={hovered} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} >
        <mesh
            ref={meshRef}
            name={name}
            geometry = {geometry}
            material = {material}
            material-envMap = {envMap}
            position={position}
            rotation={[0, rotationY, 0]}
            castShadow
            receiveShadow
            userData={{ draggable: true, id }}
        />
      </Select>

      {isSelected && !isDragging && (
        <Html position={[meshRef.current.position.x, meshRef.current.position.y + 1.5, meshRef.current.position.z]}>
        <div
          style={{
            background: "black",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            display: "flex",
            gap: "5px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.2)"
          }}
        >
          <button onClick={() => setShowRotationSlider(!showRotationSlider)}>🔄 Rotate</button>
          <button>⮀ Replace</button>
          <button>📑 Duplicate</button>
          <button>🗑️ Remove</button>
        </div>
      </Html>
      )}

      {isSelected && !isDragging && showRotationSlider && (
        <Html position={[meshRef.current.position.x, meshRef.current.position.y + 1.8, meshRef.current.position.z]}>
          <div
            style={{ background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
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

      {/* Gallery Panel for Replacing Objects */}
      {isSelected && showGallery && (
        <Html position={[worldPosition.x, worldPosition.y + 2.5, worldPosition.z]} center>
          <div
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <h4>Select a Replacement</h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {geometries.map((geo, index) => (
                <button key={index} onClick={() => handleReplace(geo, materials[index])} style={{ padding: "5px" }}>
                  <img src={`/thumbnails/object${index + 1}.png`} alt={`Object ${index + 1}`} width="50" />
                </button>
              ))}
            </div>
          </div>
        </Html>
      )}
    </>
  );
});
