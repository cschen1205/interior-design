/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
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
  { id: "1", name: "Model A", path: "/models/modelA.glb" },
  { id: "2", name: "Model B", path: "/models/modelB.glb" },
];

// function Model({ model, position, onMove }) {
//   const { scene } = useGLTF(model.path);
//   return (
//       <Clone object={scene} position={position} />
//   );
// }




function App() {
  return (
    <DndProvider backend={HTML5Backend}>
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
