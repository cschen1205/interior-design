// textureLoader.js example
import * as THREE from 'three';

export const loadTexture = (path) => {
  const loader = new THREE.TextureLoader();
  return loader.load(path);
};
