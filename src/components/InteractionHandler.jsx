import { useFrame, useThree } from "@react-three/fiber";
import PropTypes from "prop-types";
import * as THREE from "three";

const InteractionHandler = ({ selectedObject, mouse, raycaster }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (selectedObject) {
      raycaster.current.setFromCamera(mouse.current, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0)); // Horizontal ground plane
      const intersection = raycaster.current.ray.intersectPlane(plane);
      if (intersection) {
        selectedObject.position.copy(intersection); // Move the object to the mouse
      }
    }
  });

  return null; // No visible output; used only for handling interactions
};

InteractionHandler.propTypes = {
  selectedObject: PropTypes.object, // The selected object (can be null or a Three.js Object3D)
  mouse: PropTypes.object.isRequired, // Mouse reference (THREE.Vector2)
  raycaster: PropTypes.object.isRequired, // Raycaster reference (THREE.Raycaster)
};

export default InteractionHandler;
