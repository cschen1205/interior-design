import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { Suspense, useState, useRef, forwardRef, userImperativeHandle } from "react";
import { Environment, OrbitControls, useGLTF, Clone, Sky, Bvh } from "@react-three/drei";
import { EffectComposer, Selection, Outline, Select, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { RoomScene } from "./RoomScene";
import { set } from "lodash";

export const MainScene = (props) => {
    const sceneRef = useRef();

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
            <Canvas flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 1, 6], fov: 25, near: 1, far: 20 }}>
                <ambientLight intensity={1.4 * Math.PI} />
                <Sky />
                <Bvh firstHitOnly>
                    <Selection>
                        <Effects /> 
                        <RoomScene ref={sceneRef} />
                    </Selection>
                </Bvh>
                {/* <OrbitControls/> */}
            </Canvas>
        </div>
    );
}

function Effects() {
    const { size } = useThree();

    return (
        <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={4}>
        <N8AO halfRes aoSamples={5} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
        <Outline visibleEdgeColor="blue" hiddenEdgeColor="#FFD700" blur width={size.width * 1.25} edgeStrength={20} />
        <TiltShift2 samples={5} blur={0.1} />
        <ToneMapping />
        </EffectComposer>
    );
}