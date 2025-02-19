/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html } from "@react-three/drei";
import { Select } from "@react-three/postprocessing"
import * as THREE from "three";
import { set } from "lodash";


export const DynamicModel = forwardRef(({ model }, ref) => {
  const meshRef = useRef();
  const [position, setPosition] = useState(model.position);

  const { scene } = useGLTF(model.model.path);

  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showRotationSlider, setShowRotationSlider] = useState(false);

  const [rotationY, setRotationY] = useState(0);
  
  const [hovered, hover] = useState(null)
  let offset = new THREE.Vector3();

  useImperativeHandle(ref, () => ({
    startDragging: () => setIsDragging(true),
    stopDragging: () => setIsDragging(false),
    select: (flag) => setIsSelected(flag),
    getMesh: () => meshRef.current, // Expose mesh for interaction
    setPosition: (vector3) => setPosition(vector3),
    setOffset: (vector3) => offset = vector3,
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
    getDragging: () => isDragging,
  }));

  useEffect(() => {
    if(!isSelected || isDragging){
      setShowRotationSlider(false);
    }
    // console.log("show rotation slider: ", showRotationSlider, isSelected, isDragging);
  }, [showRotationSlider, isSelected, isDragging]);

  return (
    <>
      <Select enabled={hovered} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <primitive ref={meshRef} object={scene.clone()} position={position} userData={{ draggable: true, id: model.id }} />
      </Select>
    </>
  );
});

DynamicModel.displayName = 'DynamicModel';