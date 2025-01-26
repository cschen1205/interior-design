/* eslint-disable react/no-unknown-property */


const Lighting = () => {
  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={1.0} />

      {/* Directional Light */}
      <directionalLight
        castShadow
        intensity={1}
        position={[5, 10, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Point Light */}
      <pointLight
        intensity={0.8}
        position={[0, 5, 0]}
        distance={20}
        decay={2}
      />

      {/* Spot Light */}
      <spotLight
        intensity={0.7}
        position={[-5, 15, 5]}
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
};

export default Lighting;
