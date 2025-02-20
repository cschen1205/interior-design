/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import { Select } from "@react-three/postprocessing"
import * as THREE from "three";
import { get, set } from "lodash";


export const DynamicModel = forwardRef(({ model }, ref) => {
  const meshRef = useRef();
  const [position, setPosition] = useState(model.position);

  const { scene } = useGLTF(model.model.path);
  // const gltf = useLoader(GLTFLoader, "/model.glb");

  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const [rotationY, setRotationY] = useState(model.model.rotationY);
  
  const [hovered, hover] = useState(null)

  useImperativeHandle(ref, () => ({
    startDragging: () => setIsDragging(true),
    stopDragging: () => setIsDragging(false),
    select: (flag) => setIsSelected(flag),
    getMesh: () => meshRef.current, // Expose mesh for interaction
    setPosition: (vector3) => setPosition(vector3),
    addPosition: (vector3) => {
      if (meshRef.current && vector3.equals(new THREE.Vector3(0, 0, 0)) === false) {
          const worldPos = new THREE.Vector3();
          meshRef.current.getWorldPosition(worldPos);
          worldPos.add(vector3);
          meshRef.current.parent?.worldToLocal(worldPos);
          worldPos.y = meshRef.current.position.y; // Keep Y constant
          // meshRef.current.position.copy(worldPos);
          setPosition(worldPos);
      }
    },
    getPosition: () => {
      return position;
    },
    setRotation: (angle) => setRotationY(angle),
    getRotation: () => rotationY,
    getDragging: () => isDragging,
  }));

  useEffect(() => {
    if(isSelected && !isDragging){
      hover(true);
    }else{
      hover(false);
    }
    // console.log("show rotation slider: ", showRotationSlider, isSelected, isDragging);
  }, [isSelected, isDragging]);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true); // Deep clone to preserve materials
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);


  return (
    <>
      <Select enabled={hovered} onPointerOver={() => hover(true)} onPointerOut={() => hover(isSelected && !isDragging)}>
        <primitive ref={meshRef} object={clonedScene} scale={new THREE.Vector3(model.model.scale, model.model.scale, model.model.scale)} 
        position={position} rotation={[0, rotationY, 0]} userData={{ draggable: true, id: model.id }} />
      </Select>
    </>
  );
});

DynamicModel.displayName = 'DynamicModel';