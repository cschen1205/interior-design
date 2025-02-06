import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";


const DraggableObject = ({ id, type, position, onDelete, onReplace, onDeselect }) => {
  const meshRef = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState([0, 0, 0]);
  const [showMenu, setShowMenu] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [showRotationSlider, setShowRotationSlider] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const hideTimeoutRef = useRef(null);

  const resetHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowRotationSlider(false);
      setShowGallery(false);
    }, 3000);
  };

  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsSelected(true);
    setIsDragging(true);
    setShowMenu(false);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setShowMenu(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const point = event.intersections[0].point;
    meshRef.current.position.set(
      point.x + offset[0],
      point.y + offset[1],
      point.z + offset[2]
    );
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

  return (
    <>
      <Select enabled={hovered === "BRÖNDEN"} onPointerOver={over("BRÖNDEN")} onPointerOut={() => debouncedHover(null)}>
        <mesh
            ref={meshRef}
            position={position}
            rotation={[0, rotationY, 0]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerMissed={handleDeselect}
            castShadow
            receiveShadow
        >
            {type === "box" && <boxGeometry args={[1, 1, 1]} />}
            {type === "sphere" && <sphereGeometry args={[0.7, 32, 32]} />}
            {type === "cone" && <coneGeometry args={[0.7, 1.2, 32]} />}
            <meshStandardMaterial color="orange" />
        </mesh>
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
};