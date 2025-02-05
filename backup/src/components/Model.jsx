import { useRef } from "react";
// import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import PropTypes from "prop-types";

const Model = ({ path, position }) => {
  const { scene } = useGLTF(path);
  const ref = useRef();

  // useFrame(() => {
  //   if (ref.current.userData.isSelected) {
  //     ref.current.scale.set(1.1, 1.1, 1.1); // Slightly enlarge the object
  //   } else {
  //     ref.current.scale.set(1, 1, 1); // Reset the scale
  //   }
  // });

  return <primitive ref={ref} object={scene} position={position} />;
};


Model.propTypes = {
  path: PropTypes.string.isRequired, // Validates that `path` is a required string
  position: PropTypes.arrayOf(PropTypes.number), // Validates that `position` is an array of numbers
};

Model.defaultProps = {
  position: [0, 0, 0],
};

export default Model;
