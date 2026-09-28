import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  PerspectiveCamera,
  RoundedBox,
  Sparkles,
  Line,
} from "@react-three/drei";
import { useRef } from "react";

const nodes = [
  {
    position: [-2.8, 1.5, 0],
    label: "PMS",
    color: "#2563eb",
  },
  {
    position: [2.8, 1.4, 0],
    label: "TAMS",
    color: "#06b6d4",
  },
  {
    position: [-3, -1.3, 0],
    label: "HÔTELS",
    color: "#6366f1",
  },
  {
    position: [3, -1.2, 0],
    label: "AGENCES",
    color: "#0ea5e9",
  },
  {
    position: [0, 2.8, 0],
    label: "CRM",
    color: "#7c3aed",
  },
];

function Node({ position, color }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.elapsedTime;

    ref.current.position.y =
      position[1] + Math.sin(t * 1.2 + position[0]) * 0.12;

    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.5;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.25}
        />
      </mesh>

      <mesh scale={1.8}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

function CentralPlatform({ scrollProgress }) {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const scroll = scrollProgress?.get?.() || 0;

    group.current.rotation.y =
      t * 0.15 + scroll * Math.PI * 0.8;

    group.current.rotation.x =
      Math.sin(t * 0.4) * 0.04 + scroll * 0.12;

    group.current.position.y =
      Math.sin(t * 0.8) * 0.08 - scroll * 0.4;
  });

  return (
    <group ref={group}>

      {/* Glow */}
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Bottom layer */}
      <RoundedBox
        args={[2.7, 0.25, 2.7]}
        radius={0.18}
        smoothness={5}
        position={[0, -0.28, 0]}
      >
        <meshStandardMaterial
          color="#172554"
          metalness={0.7}
          roughness={0.25}
        />
      </RoundedBox>

      {/* Main platform */}
      <RoundedBox
        args={[2.5, 0.38, 2.5]}
        radius={0.18}
        smoothness={5}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.55}
          roughness={0.22}
          emissive="#1d4ed8"
          emissiveIntensity={0.25}
        />
      </RoundedBox>

      {/* Inner platform */}
      <RoundedBox
        args={[1.8, 0.18, 1.8]}
        radius={0.15}
        smoothness={5}
        position={[0, 0.28, 0]}
      >
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.4}
          roughness={0.2}
          emissive="#4f46e5"
          emissiveIntensity={0.5}
        />
      </RoundedBox>

      {/* Central core */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={2}
          metalness={0.2}
          roughness={0.15}
        />
      </mesh>

    </group>
  );
}

function EcosystemConnections() {
  const connections = nodes.map((node) => [
    [0, 0, 0],
    node.position,
  ]);

  return (
    <>
      {connections.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#38bdf8"
          transparent
          opacity={0.35}
          lineWidth={1}
        />
      ))}
    </>
  );
}

function Scene({ scrollProgress }) {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const scroll = scrollProgress?.get?.() || 0;

    group.current.rotation.y =
      Math.sin(t * 0.15) * 0.08 + scroll * 0.35;

    group.current.position.x =
      Math.sin(t * 0.2) * 0.08;

    group.current.position.y =
      Math.cos(t * 0.25) * 0.05;
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 9]}
        fov={42}
      />

      <ambientLight intensity={1.8} />

      <directionalLight
        position={[5, 6, 5]}
        intensity={3}
      />

      <pointLight
        position={[0, 2, 3]}
        intensity={5}
        color="#3b82f6"
      />

      <group ref={group}>

        <Float
          speed={1.4}
          rotationIntensity={0.15}
          floatIntensity={0.3}
        >
          <CentralPlatform
            scrollProgress={scrollProgress}
          />
        </Float>

        <EcosystemConnections />

        {nodes.map((node) => (
          <Node
            key={node.label}
            position={node.position}
            color={node.color}
          />
        ))}

      </group>

      <Sparkles
        count={80}
        scale={[8, 7, 5]}
        size={1.5}
        speed={0.3}
        opacity={0.35}
        color="#60a5fa"
      />
    </>
  );
}

export default function LuxTech3DScene({ scrollProgress }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}