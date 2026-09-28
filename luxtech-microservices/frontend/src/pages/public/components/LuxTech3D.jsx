import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { useRef } from "react";

function DataCore() {
  const group = useRef(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.12;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.035;
  });

  return (
    <group ref={group}>
      <RoundedBox args={[2.9, 2.9, 2.9]} radius={0.18} smoothness={5}>
        <meshStandardMaterial
          color="#102f53"
          metalness={0.45}
          roughness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        args={[2.25, 2.25, 2.25]}
        radius={0.12}
        smoothness={5}
        rotation={[0.1, 0.16, 0]}
      >
        <meshStandardMaterial
          color="#0b5fc6"
          metalness={0.55}
          roughness={0.24}
        />
      </RoundedBox>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.035, 14, 80]} />
        <meshStandardMaterial
          color="#00bcd4"
          emissive="#00bcd4"
          emissiveIntensity={1.1}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      <mesh rotation={[0.85, 0.5, 0.25]}>
        <torusGeometry args={[1.45, 0.025, 12, 90]} />
        <meshStandardMaterial
          color="#46d8ea"
          emissive="#46d8ea"
          emissiveIntensity={0.7}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>

      {[
        [-1.65, 0, 0],
        [1.65, 0, 0],
        [0, -1.65, 0],
        [0, 1.65, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial
            color="#00bcd4"
            emissive="#00bcd4"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}

const LuxTech3D = () => (
  <Canvas
    dpr={[1, 1.5]}
    camera={{ position: [0, 0.2, 7.5], fov: 34 }}
    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
  >
    <ambientLight intensity={1.5} />
    <directionalLight position={[4, 5, 6]} intensity={2.2} color="#ffffff" />
    <pointLight position={[-3, 1, 2]} intensity={18} distance={12} color="#00bcd4" />
    <pointLight position={[3, -2, 1]} intensity={10} distance={10} color="#0b5fc6" />

    <DataCore />

    <OrbitControls
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI * 0.35}
      maxPolarAngle={Math.PI * 0.65}
      autoRotate
      autoRotateSpeed={0.55}
    />
  </Canvas>
);

export default LuxTech3D;
