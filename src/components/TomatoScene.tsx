import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { TimerMode, TimerState } from '../hooks/usePomodoro';

interface Props {
  mode: TimerMode;
  timerState: TimerState;
  progress: number;
  onClick?: () => void;
}

const MODE_COLORS: Record<TimerMode, { tomato: number; light: number; pointer: number }> = {
  focus: { tomato: 0xef302f, light: 0xff3b30, pointer: 0xb91c1c },
  shortBreak: { tomato: 0x22a447, light: 0x22c55e, pointer: 0x166534 },
  longBreak: { tomato: 0x3b82f6, light: 0x3b82f6, pointer: 0x1e40af },
};

function Tomato({ mode, timerState, progress, onClick }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerRef = useRef<THREE.Group>(null);
  const tomatoMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const colors = MODE_COLORS[mode];

  // Update colors on mode change
  useEffect(() => {
    if (tomatoMatRef.current) {
      tomatoMatRef.current.color.set(colors.tomato);
    }
    if (lightRef.current) {
      lightRef.current.color.set(colors.light);
    }
  }, [colors]);

  // Update pointer rotation based on progress
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Gentle idle floating
      groupRef.current.position.y = 0.75 + Math.sin(time * 1.4) * 0.08;
      groupRef.current.rotation.y = Math.sin(time * 0.55) * 0.08;
    }

    if (pointerRef.current) {
      const startAngle = -Math.PI * 0.75;
      const endAngle = Math.PI * 0.75;
      const targetRotation = startAngle + progress * (endAngle - startAngle);
      pointerRef.current.rotation.z = THREE.MathUtils.lerp(
        pointerRef.current.rotation.z,
        targetRotation,
        0.1
      );
    }
  });

  // Create dial marks
  const dialMarks = useMemo(() => {
    const marks: { position: [number, number, number]; rotation: number; scale: [number, number, number] }[] = [];
    for (let i = 0; i < 25; i++) {
      const angle = -Math.PI * 0.75 + i * (Math.PI * 1.5 / 24);
      const radius = 1.02;
      const isMajor = i % 5 === 0;
      marks.push({
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.16],
        rotation: angle - Math.PI / 2,
        scale: [isMajor ? 0.06 : 0.035, isMajor ? 0.2 : 0.12, 0.035],
      });
    }
    return marks;
  }, []);

  // Create floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 7,
        Math.random() * 4 - 1,
        (Math.random() - 0.5) * 3,
      ] as [number, number, number],
    }));
  }, []);

  // Lobe positions for realistic tomato shape
  const lobes = useMemo(() => [
    [-1.05, -0.3, 0.3],
    [1.05, -0.3, 0.3],
    [0, -0.55, -0.65],
    [-0.5, -0.65, -0.7],
    [0.5, -0.65, -0.7],
  ] as [number, number, number][], []);

  // Leaf positions
  const leaves = useMemo(() => [
    [-0.55, 1.67, 0.05, -0.8],
    [0.55, 1.67, 0.05, 0.8],
    [0, 1.72, 0.38, 0],
    [0, 1.72, -0.38, Math.PI],
  ] as [number, number, number, number][], []);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={2.1} />
      <directionalLight
        position={[-4, 7, 6]}
        intensity={3.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        ref={lightRef}
        position={[3, 2, 4]}
        intensity={1.5}
        distance={8}
        color={colors.light}
      />

      {/* Tomato group */}
      <group ref={groupRef} position={[0, 0.75, 0]} onClick={onClick}>
        {/* Main body */}
        <mesh
          scale={[1.27, 0.92, 1.1]}
          position={[0, -0.15, 0]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[2.05, 64, 48]} />
          <meshStandardMaterial
            ref={tomatoMatRef}
            color={colors.tomato}
            roughness={0.38}
            metalness={0.04}
          />
        </mesh>

        {/* Lobes for realistic shape */}
        {lobes.map((pos, i) => (
          <mesh
            key={`lobe-${i}`}
            position={pos}
            scale={[0.75, 0.72, 0.65]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[1.35, 48, 32]} />
            <meshStandardMaterial
              color={colors.tomato}
              roughness={0.38}
              metalness={0.04}
            />
          </mesh>
        ))}

        {/* Stem */}
        <mesh
          position={[0, 1.75, 0]}
          rotation={[0, 0, -0.15]}
          castShadow
        >
          <cylinderGeometry args={[0.13, 0.22, 0.55, 20]} />
          <meshStandardMaterial color={0xb91c1c} roughness={0.45} />
        </mesh>

        {/* Leaves */}
        {leaves.map(([x, y, z, rot], i) => (
          <mesh
            key={`leaf-${i}`}
            position={[x, y, z]}
            rotation={[Math.PI / 2, 0, rot]}
            scale={[1, 0.45, 0.25]}
            castShadow
          >
            <coneGeometry args={[0.42, 1.15, 4]} />
            <meshStandardMaterial color={0x166534} roughness={0.5} />
          </mesh>
        ))}

        {/* Dial group */}
        <group position={[0, -0.35, 2.18]}>
          {/* Dial face */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.35, 1.35, 0.16, 64]} />
            <meshStandardMaterial color={0xfafaf9} roughness={0.35} metalness={0.15} />
          </mesh>

          {/* Dial ring */}
          <mesh position={[0, 0, 0.12]}>
            <torusGeometry args={[1.15, 0.08, 16, 64]} />
            <meshStandardMaterial color={0x57534e} roughness={0.5} />
          </mesh>

          {/* Dial marks */}
          {dialMarks.map((mark, i) => (
            <mesh
              key={`mark-${i}`}
              position={mark.position}
              rotation={[0, 0, mark.rotation]}
              scale={mark.scale}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={0x44403c} />
            </mesh>
          ))}

          {/* Pointer group */}
          <group ref={pointerRef} position={[0, 0, 0.24]}>
            {/* Pointer arm */}
            <mesh position={[0.52, 0, 0]} castShadow>
              <boxGeometry args={[1.05, 0.055, 0.07]} />
              <meshStandardMaterial color={colors.pointer} roughness={0.4} />
            </mesh>
            {/* Pointer center */}
            <mesh>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color={colors.pointer} roughness={0.4} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Floating platform */}
      <mesh position={[0, -1.65, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.25, 64]} />
        <meshStandardMaterial color={0xf5d0a9} roughness={0.7} />
      </mesh>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <mesh key={`particle-${i}`} position={p.position}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={0xf97316} transparent opacity={0.3} />
        </mesh>
      ))}
    </>
  );
}

export default function TomatoScene({ mode, timerState, progress, onClick }: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.1, 8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Tomato
        mode={mode}
        timerState={timerState}
        progress={progress}
        onClick={onClick}
      />
      <OrbitControls
        enableDamping
        enablePan={false}
        minDistance={5}
        maxDistance={11}
        target={[0, 0.8, 0]}
      />
    </Canvas>
  );
}
