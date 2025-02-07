import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Select } from "@react-three/postprocessing"
import * as THREE from "three";


export const DraggingObject = forwardRef(({ id, geometry, material, envMap, envMapIntensity, position, onDelete, onReplace, onDeselect, name}, ref) => {
  const meshRef = useRef();
  const { camera, raycaster, mouse, scene } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  // const [selected, setSelected] = useState(false);


  const [isSelected, setIsSelected] = useState(false);
  const [offset, setOffset] = useState([0, 0, 0]);
  const [showMenu, setShowMenu] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [showRotationSlider, setShowRotationSlider] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [hovered, hover] = useState(null)
  const hideTimeoutRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startDragging: () => setIsDragging(true),
    stopDragging: () => setIsDragging(false),
    getMesh: () => meshRef.current, // Expose mesh for interaction
    addPosition: (vector3) => {
      if (meshRef.current) {
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
  }));

  const resetHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowRotationSlider(false);
      setShowGallery(false);
    }, 3000);
  };

  // const handlePointerDown = (event) => {
  //   event.stopPropagation();
  //   setIsSelected(true);
  //   setIsDragging(true);
  //   setShowMenu(false);
  // };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setShowMenu(true);
    }
  };

  const handlePointerMove = (event) => {
    // if (!isDragging) return;
    // const point = event.intersections[0].point;
    // meshRef.current.position.set(
    //   point.x + offset[0],
    //   meshRef.current.position.y,
    //   point.z + offset[2]
    // );
  };

  const handleDeselect = (event) => {
    event.stopPropagation();
    setIsSelected(false);
    setShowMenu(false);
    setShowRotationSlider(false);
    setShowGallery(false);
    onDeselect();
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useFrame(() => {
    if (isDragging) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      for (let intersect of intersects) {
        // console.log("intersect: ", intersect.object.name);
        if (intersect.object.name === "floor") {
          // Move object on XZ plane, keep Y constant
          meshRef.current.position.x = -intersect.point.z;
          meshRef.current.position.z = intersect.point.x;
          break;
        }
      }
    }
  });

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
        <Html position={[0, 1.2, 0]} center>
          <div style={{ background: "white", padding: "5px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)" }}>
            <button onClick={() => setShowMenu(!showMenu)}>⚙️ Options</button>
          </div>
        </Html>
      )}

      {showMenu && !isDragging && (
        <Html position={[0, 1.6, 0]} center>
          <div style={{ background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", display: "flex", gap: "10px" }}>
            <button onClick={onDelete}>🗑 Delete</button>
            <button
              onMouseEnter={() => {
                setShowRotationSlider(true);
                resetHideTimer();
              }}
              onMouseLeave={resetHideTimer}
            >
              🔄 Rotate
            </button>
            <button
              onMouseEnter={() => {
                setShowGallery(true);
                resetHideTimer();
              }}
              onMouseLeave={resetHideTimer}
            >
              🔄 Replace
            </button>
          </div>
        </Html>
      )}

      {showRotationSlider && (
        <Html position={[0, 2, 0]} center>
          <div
            onMouseEnter={resetHideTimer}
            onMouseLeave={resetHideTimer}
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
    </>
  );
});