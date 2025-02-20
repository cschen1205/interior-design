import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { useRef } from "react";
import { Environment, Sky, Bvh, Lightformer } from "@react-three/drei";
import { EffectComposer, Selection, Outline, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { RoomScene } from "./RoomScene.jsx";
import { easing } from "maath"
import { suspend } from 'suspend-react';

export const MainScene = (props) => {
    const sceneRef = useRef();

    const city = import('@pmndrs/assets/hdri/city.exr')

    // const [bad, set] = useState(false)
    // const { impl, debug, enabled, samples, ...config } = useControls({
    //     debug: true,
    //     enabled: true,
    //     size: { value: 35, min: 0, max: 100, step: 0.1 },
    //     focus: { value: 0.5, min: 0, max: 2, step: 0.1 },
    //     samples: { value: 16, min: 1, max: 40, step: 1 }
    // })
    
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
            <Canvas shadows flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [-1.2, 2.05, -6.34], fov: 25, near: 1, far: 20 }}>
                <ambientLight intensity={1 * Math.PI} />
                <Environment preset="apartment" >
                    <Lightformer form="rect" intensity={1} color="white" scale={[10, 5]} target={[0, 0, 0]} />
                </Environment>
                {/* <Environment files={suspend(city).default} /> */}
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
  

function Effects() {
    const { size } = useThree();

    return (
        <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={4}>
            <N8AO halfRes aoSamples={5} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
            <Outline visibleEdgeColor="blue" hiddenEdgeColor="blue" blur width={size.width * 1.25} edgeStrength={20} />
            <TiltShift2 samples={5} blur={0.1} />
            {/* <ToneMapping /> */}
        </EffectComposer>
    );
}