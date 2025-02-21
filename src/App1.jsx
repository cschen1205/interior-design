import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function HDRCube() {
  const { scene } = useThree();

  // Load HDR images for the six faces of the cube
  const hdrCubeTexture = useLoader(THREE.CubeTextureLoader, [
    "/hdr/px.hdr", // +X
    "/hdr/nx.hdr", // -X
    "/hdr/py.hdr", // +Y
    "/hdr/ny.hdr", // -Y
    "/hdr/pz.hdr", // +Z
    "/hdr/nz.hdr", // -Z
  ]);

  scene.background = hdrCubeTexture; // Set as skybox
  return null;
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <HDRCube />

      {/* Example Object inside the Cube */}
      <mesh>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial metalness={1} roughness={0} />
      </mesh>

      <ambientLight intensity={0.5} />
      <OrbitControls />
    </Canvas>
  );
}
