import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Select } from "@react-three/drei";

const DraggingObject2 = forwardRef(({ model: Model, position, id }, ref) => {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  // Expose functions to parent (Scene)
  useImperativeHandle(ref, () => ({
    startDragging: () => setIsDragging(true),
    stopDragging: () => setIsDragging(false),
    setPosition: (x, z) => {
      if (meshRef.current) {
        meshRef.current.position.x = x;
        meshRef.current.position.z = z;
      }
    },
  }));

  return (
    <Select enabled={isDragging}>
      <mesh ref={meshRef} position={position} userData={{ isDraggingObject: true, id }}>
        <Model />
      </mesh>
    </Select>
  );
});

export default DraggingObject;
