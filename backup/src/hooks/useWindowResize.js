// useWindowResize.js example
import { useEffect } from 'react';

export const useWindowResize = (camera, renderer) => {
  useEffect(() => {
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [camera, renderer]);
};
