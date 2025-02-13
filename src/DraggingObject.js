import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Select } from "@react-three/postprocessing"
import * as THREE from "three";


export const DraggingObject = forwardRef(({ id, geometry, material, envMap, envMapIntensity, position, onDelete, onReplace, onDeselect, name}, ref) => {
  const meshRef = useRef();
  const { camera, raycaster, mouse, scene } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showRotationSlider, setShowRotationSlider] = useState(false);


  const [offset, setOffset] = useState([0, 0, 0]);
  const [showMenu, setShowMenu] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  
  const [hovered, hover] = useState(null)
  const hideTimeoutRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startDragging: () => setIsDragging(true),
    stopDragging: () => setIsDragging(false),
    select: (flag) => setIsSelected(flag),
    getMesh: () => meshRef.current, // Expose mesh for interaction
    addPosition: (vector3) => {
      if (meshRef.current && vector3.equals(new THREE.Vector3(0, 0, 0)) === false) {
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

  // const resetHideTimer = () => {
  //   if (hideTimeoutRef.current) {
  //     clearTimeout(hideTimeoutRef.current);
  //   }
  //   hideTimeoutRef.current = setTimeout(() => {
  //     setShowRotationSlider(false);
  //     setShowGallery(false);
  //   }, 3000);
  // };

  // const handleSelection = (flag) => {
  //   setIsSelected(flase);

  // };

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
            // onPointerDown={handlePointerDown}
            // onPointerUp={handlePointerUp}
            // onPointerMove={handlePointerMove}
            // onPointerMissed={handleDeselect}
            castShadow
            receiveShadow
            userData={{ draggable: true, id }}
        />
      </Select>

      {isSelected && !isDragging && (
        <Html position={[meshRef.current.position.x, meshRef.current.position.y + 1, meshRef.current.position.z]}>
        <div
          style={{
            background: "black",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            display: "flex",
            gap: "5px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
            pointerEvents: "auto"
          }}
        >
          <button onClick={(e) =>{e.stopPropagation(); console.log("on click!"); setShowRotationSlider(!showRotationSlider)}}>🔄 Rotate</button>
          <button>⮀ Replace</button>
          <button>📑 Duplicate</button>
          <button>🗑️ Remove</button>
        </div>
      </Html>
        // <Html position={[0, 1.6, 0]} center>
        //   <div style={{ background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", display: "flex", gap: "10px" }}>
        //     <button onClick={onDelete}>🗑 Delete</button>
        //     <button
        //       onMouseEnter={() => {
        //         setShowRotationSlider(true);
        //         resetHideTimer();
        //       }}
        //       onMouseLeave={resetHideTimer}
        //     >
        //       🔄 Rotate
        //     </button>
        //     <button
        //       onMouseEnter={() => {
        //         setShowGallery(true);
        //         resetHideTimer();
        //       }}
        //       onMouseLeave={resetHideTimer}
        //     >
        //       🔄 Replace
        //     </button>
        //   </div>
        // </Html>
      )}

      {isSelected && !isDragging && showRotationSlider && (
        <Html position={[meshRef.current.position.x, meshRef.current.position.y + 1.8, meshRef.current.position.z]}>
          <div
            // onMouseEnter={resetHideTimer}
            // onMouseLeave={resetHideTimer}
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

      {/* {isSelected && showGallery && (
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
      )} */}
    </>
  );
});