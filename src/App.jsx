import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Clone, Sky, Bvh } from "@react-three/drei";
import { Suspense, useState, useRef, forwardRef, userImperativeHandle } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { FunctionSquareIcon } from "lucide-react";
import { ModelItem } from "./ModelItem.jsx";
// import { RoomScene } from "./RoomScene.jsx";
import { EffectComposer, Selection, Outline, Select, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { MainScene } from "./MainScene.jsx";

const models = [
  { id: "1", name: "Armchair", path: "/models/armchair.glb", image: "models/armchair.jpg", scale: 1, rotationY: Math.PI, size: {x: 0.589072333678561, y: 0.7990447378360611, z: 0.8100951457615548} },
  { id: "2", name: "Chair", path: "/models/chair.glb", image: "models/chair.jpg", scale: 1, rotationY: 0, size: {x: 0.42364141888227846, y: 0.995995631887417, z: 0.48898744876250083} },
  { id: "3", name: "Round Table", path: "/models/round_table.glb", image: "models/round_table.png", scale: 0.008, rotationY: 0, size: {x: 148.36266689731409, y: 76.38273727893834, z: 148.20033380588987} },
  { id: "4", name: "Table", path: "/models/table.glb", image: "models/table.png", scale: 1, rotationY: -Math.PI/2, size: {x: 1.6813350319862366, y: 1.3810616433620453, z: 2.5296454429626465}},
];

// function Model({ model, position, onMove }) {
//   const { scene } = useGLTF(model.path);
//   return (
//       <Clone object={scene} position={position} />
//   );
// }




function App() {

  return (
    <DndProvider debugMode={true} backend={HTML5Backend}>
      <div className="flex h-screen w-screen">
        <div className="min-w-[300] max-w-[300px] p-4 bg-gray-100">
          <h2 className="text-lg font-bold mb-4">Models</h2>
          <div className="grid grid-cols-2 gap-4">
            {models.map((model) => (
              <ModelItem key={model.id} model={model} />
            ))}
          </div>
        </div>

        <div className="flex-grow">
          <MainScene />
        </div>
      </div>
    </DndProvider>
  );
}



export default App;
