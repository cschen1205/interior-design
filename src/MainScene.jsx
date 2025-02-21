import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { useRef } from "react";
import { Environment, Sky, Bvh, Lightformer } from "@react-three/drei";
import { EffectComposer, Selection, Outline, N8AO, TiltShift2, ToneMapping, Bloom, SSAO, ChromaticAberration, Vignette } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing";
import { RoomScene } from "./RoomScene.jsx";
import { easing } from "maath"
import { suspend } from 'suspend-react';
import { Vector2, EquirectangularReflectionMapping } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export const MainScene = (props) => {
    const sceneRef = useRef();

    const hdri = useLoader(RGBELoader, "/hdr/environment.hdr");
    
    const [, drop] = useDrop(() => ({
        accept: "MODEL",
        drop: (item, monitor) => {
            console.log("Drop", item.model);
            const dragOffset = monitor.getClientOffset();
            sceneRef.current.onDrop(item.model, dragOffset);
        },
    }));

    return (
        <div ref={drop} className="relative w-full h-screen">
            <Canvas shadows flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 2.1, -6.5], fov: 25, near: 1, far: 20 }}>
                <ambientLight intensity={1.4 * Math.PI} />
                {/* <Environment preset="apartment" background={true} /> */}
                <HDRSky hdrPath="/hdr/environment.hdr" />
                <directionalLight
                    castShadow
                    position={[5, 5, 5]}
                    // rotation={[Math.PI / 2, 0, 0]}
                    intensity={1}
                    shadow-mapSize={[2048, 2048]} // High-res shadows
                    />
                <Sky />
                <Bvh firstHitOnly>
                    <Selection>
                        <Effects /> 
                        <RoomScene ref={sceneRef} />
                    </Selection>
                </Bvh>
            </Canvas>
        </div>
    );
}

function Light() {
    const ref = useRef()
    useFrame((state, delta) => {
      easing.dampE(ref.current.rotation, [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0], 0.2, delta)
    })
    return (
      <group ref={ref}>
        <directionalLight position={[5, 5, -8]} castShadow intensity={5} shadow-mapSize={2048} shadow-bias={-0.001}>
          <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
        </directionalLight>
      </group>
    )
  }

function HDRSky({ hdrPath }) {
    const { scene, renderer } = useThree();
    const hdri = useLoader(RGBELoader, hdrPath);

    // Set HDR as environment & background
    hdri.mapping = EquirectangularReflectionMapping;
    scene.background = hdri; // Set as sky
    scene.environment = hdri; // Set as light source

    // renderer.toneMapping = ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1.5;
    // renderer.outputEncoding = sRGBEncoding;

    return null;
}
  

function Effects() {
    const { size } = useThree();

    return (
        <EffectComposer stencilBuffer enableNormalPass autoClear={false} multisampling={4}>
            <N8AO halfRes aoSamples={5} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
            <Outline visibleEdgeColor="blue" hiddenEdgeColor="blue" blur width={size.width * 1.25} edgeStrength={20} />
            {/* <TiltShift2 samples={5} blur={0.1} /> */}
            <ToneMapping />
            {/* <Bloom intensity={0.15} luminanceThreshold={0.6} luminanceSmoothing={0.3} /> */}
            <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
    );
}