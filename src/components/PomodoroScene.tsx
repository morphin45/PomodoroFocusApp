import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSceneProps {
  mode: TimerMode;
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  sessionsCompleted: number;
  longBreakInterval: number;
}

function PomodoroDevice({ mode, timeLeft, totalTime, isRunning, sessionsCompleted, longBreakInterval }: PomodoroSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const progressRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0;
  const dialRotation = progress * Math.PI * 2;

  const modeColors = {
    focus: { main: '#dc2626', dark: '#991b1b', accent: '#ef4444', glow: '#ff4444' },
    shortBreak: { main: '#16a34a', dark: '#166534', accent: '#22c55e', glow: '#44ff44' },
    longBreak: { main: '#2563eb', dark: '#1e40af', accent: '#3b82f6', glow: '#4488ff' },
  };

  const colors = modeColors[mode];

  // Gentle floating animation when running
  useFrame((state) => {
    if (groupRef.current) {
      if (isRunning) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        groupRef.current.rotation.y += 0.002;
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.05);
      }
    }
    if (dialRef.current) {
      dialRef.current.rotation.y = dialRotation;
    }
    if (glowRef.current) {
      glowRef.current.intensity = isRunning ? 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5 : 1;
    }
  });

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress ring geometry
  const progressGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 1.65;
    const startAngle = Math.PI / 2;
    const endAngle = startAngle - progress * Math.PI * 2;

    shape.absarc(0, 0, radius, startAngle, endAngle, true);
    shape.absarc(0, 0, radius - 0.12, endAngle, startAngle, false);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape, 64);
    return geometry;
  }, [progress]);

  return (
    <group ref={groupRef}>
      {/* Main body - tomato shape */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhysicalMaterial
          color={colors.main}
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          envMapIntensity={1}
        />
      </mesh>

      {/* Top indent (tomato crease) */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.08, 16, 32]} />
        <meshPhysicalMaterial color={colors.dark} roughness={0.5} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 16]} />
        <meshPhysicalMaterial color="#4a7c3f" roughness={0.6} />
      </mesh>

      {/* Leaf 1 */}
      <mesh position={[0.15, 1.6, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.4, 0.03, 0.12]} />
        <meshPhysicalMaterial color="#2d8a3e" roughness={0.5} />
      </mesh>

      {/* Leaf 2 */}
      <mesh position={[-0.1, 1.55, 0.1]} rotation={[0.3, 0.5, -0.3]} castShadow>
        <boxGeometry args={[0.35, 0.03, 0.1]} />
        <meshPhysicalMaterial color="#38a34a" roughness={0.5} />
      </mesh>

      {/* Dial base on top */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 32]} />
        <meshPhysicalMaterial
          color="#f5f5f5"
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>

      {/* Rotating dial indicator */}
      <group ref={dialRef} position={[0, 1.44, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.05, 0.45]} />
          <meshPhysicalMaterial color={colors.accent} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Dial center knob */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhysicalMaterial color={colors.dark} roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Display panel on front */}
      <group position={[0, 0, 1.45]}>
        <RoundedBox args={[1.4, 0.7, 0.1]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            roughness={0.1}
            metalness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Time display */}
        <Text
          position={[0, 0.05, 0.06]}
          fontSize={0.32}
          color={colors.glow}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {timeStr}
        </Text>

        {/* Mode label */}
        <Text
          position={[0, -0.22, 0.06]}
          fontSize={0.1}
          color="#888888"
          anchorX="center"
          anchorY="middle"
        >
          {mode === 'focus' ? 'FOCUS' : mode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
        </Text>
      </group>

      {/* Progress ring */}
      <mesh
        ref={progressRef}
        position={[0, 0, 1.5]}
        rotation={[0, 0, 0]}
        geometry={progressGeometry}
      >
        <meshPhysicalMaterial
          color={colors.accent}
          emissive={colors.glow}
          emissiveIntensity={isRunning ? 0.5 : 0.2}
          transparent
          opacity={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Background ring (track) */}
      <mesh position={[0, 0, 1.48]}>
        <torusGeometry args={[1.6, 0.06, 16, 64]} />
        <meshPhysicalMaterial
          color="#333333"
          roughness={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Session dots */}
      {Array.from({ length: longBreakInterval }).map((_, i) => {
        const angle = (i / longBreakInterval) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 1.9;
        const y = Math.sin(angle) * 1.9;
        const isCompleted = i < sessionsCompleted % longBreakInterval;
        return (
          <mesh key={i} position={[x, y, 1.4]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshPhysicalMaterial
              color={isCompleted ? colors.accent : '#444444'}
              emissive={isCompleted ? colors.glow : '#000000'}
              emissiveIntensity={isCompleted ? 0.5 : 0}
            />
          </mesh>
        );
      })}

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 2]}
        color={colors.glow}
        intensity={isRunning ? 2 : 0.5}
        distance={5}
      />

      {/* Base/stand */}
      <mesh position={[0, -1.6, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
    </mesh>
  );
}

export default function PomodoroScene(props: PomodoroSceneProps) {
  const modeColors = {
    focus: '#dc2626',
    shortBreak: '#16a34a',
    longBreak: '#2563eb',
  };

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 1, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0f0f1a']} />
        <fog attach="fog" args={['#0f0f1a', 8, 20]} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color={modeColors[props.mode]} />
        <pointLight position={[0, 3, 3]} intensity={0.5} color="#ffffff" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Device */}
        <PomodoroDevice {...props} />

        {/* Floor */}
        <Floor />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={!props.isRunning}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
