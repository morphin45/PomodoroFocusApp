import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { TimerMode, TimerState } from '../hooks/usePomodoro';
import type { DeviceInfo, ConnectionState } from '../hooks/useDeviceSimulator';

interface SceneProps {
  mode: TimerMode;
  timerState: TimerState;
  timeLeft: number;
  totalTime: number;
  sessionsCompleted: number;
  longBreakInterval: number;
  servoAngle: number;
  device: DeviceInfo;
  connectionState: ConnectionState;
  onTomatoPress: () => void;
}

const MODE_COLORS = {
  focus: { main: '#dc2626', dark: '#991b1b', accent: '#ef4444', glow: '#ff4444', led: '#ef4444' },
  shortBreak: { main: '#16a34a', dark: '#166534', accent: '#22c55e', glow: '#44ff44', led: '#22c55e' },
  longBreak: { main: '#2563eb', dark: '#1e40af', accent: '#3b82f6', glow: '#4488ff', led: '#3b82f6' },
};

function LEDRing({ color, brightness, isPulsing, isRunning }: {
  color: string; brightness: number; isPulsing: boolean; isRunning: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const count = 24;

  useFrame((state) => {
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      let intensity = brightness;
      if (isPulsing) {
        intensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      } else if (isRunning) {
        intensity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      }
      mat.emissiveIntensity = intensity * 2;
    }
  });

  return (
    <group>
      {/* LED strip ring */}
      <mesh ref={ringRef} position={[0, -1.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.04, 8, count]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={brightness * 2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Individual LED dots */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 1.15,
              -1.52,
              Math.sin(angle) * 1.15,
            ]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={brightness * 3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ProgressArc({ progress, color }: { progress: number; color: string }) {
  const geometry = useMemo(() => {
    if (progress <= 0) return null;
    const shape = new THREE.Shape();
    const radius = 1.35;
    const startAngle = Math.PI / 2;
    const endAngle = startAngle - progress * Math.PI * 2;
    shape.absarc(0, 0, radius, startAngle, endAngle, true);
    shape.absarc(0, 0, radius - 0.06, endAngle, startAngle, false);
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 64);
  }, [progress]);

  if (!geometry) return null;

  return (
    <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function TomatoBody({ mode, servoAngle, isRunning, isPaused, onClick }: {
  mode: TimerMode; servoAngle: number; isRunning: boolean; isPaused: boolean; onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = MODE_COLORS[mode];

  useFrame((state) => {
    if (groupRef.current) {
      // Servo-driven rotation (the tomato rotates based on servo angle)
      const targetRotY = (servoAngle / 180) * Math.PI;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.05 // Smooth servo-like movement
      );

      // Gentle floating when running
      if (isRunning) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.05);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} onClick={onClick}>
      {/* Main tomato body */}
      <mesh castShadow>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial
          color={colors.main}
          roughness={0.25}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.15}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Tomato segments (creases) */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[0, angle, 0]}>
          <torusGeometry args={[1.18, 0.015, 8, 64, Math.PI]} />
          <meshPhysicalMaterial
            color={colors.dark}
            roughness={0.4}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* Top indent */}
      <mesh position={[0, 1.0, 0]}>
        <torusGeometry args={[0.25, 0.06, 16, 32]} />
        <meshPhysicalMaterial color={colors.dark} roughness={0.4} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.35, 12]} />
        <meshPhysicalMaterial color="#3d6b35" roughness={0.6} />
      </mesh>

      {/* Leaves */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.2,
            1.1,
            Math.sin(angle) * 0.2,
          ]}
          rotation={[0.3, angle, -0.4]}
          castShadow
        >
          <boxGeometry args={[0.3, 0.02, 0.08]} />
          <meshPhysicalMaterial
            color={i % 2 === 0 ? '#2d8a3e' : '#38a34a'}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Clickable button on top (physical press interaction) */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} />
        <meshPhysicalMaterial
          color="#e5e5e5"
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
        />
      </mesh>

      {/* Progress pointer arm */}
      <group position={[0, 1.45, 0]}>
        <mesh position={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.5]} />
          <meshPhysicalMaterial
            color={colors.accent}
            roughness={0.2}
            metalness={0.6}
            emissive={colors.glow}
            emissiveIntensity={isRunning ? 0.3 : 0}
          />
        </mesh>
      </group>

      {/* Display panel on front */}
      <group position={[0, 0, 1.15]}>
        <RoundedBox args={[1.0, 0.5, 0.05]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial
            color="#0a0a1a"
            roughness={0.05}
            metalness={0.4}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </RoundedBox>
      </group>

      {/* Glow light */}
      <pointLight
        position={[0, 0, 1.5]}
        color={colors.glow}
        intensity={isRunning ? 1.5 : isPaused ? 0.5 : 0.2}
        distance={4}
      />
    </group>
  );
}

function DeviceBase() {
  return (
    <group position={[0, -1.6, 0]}>
      {/* Main base */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.3, 1.4, 0.2, 48]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          roughness={0.2}
          metalness={0.8}
          clearcoat={0.5}
        />
      </mesh>

      {/* Base rim */}
      <mesh position={[0, 0.08, 0]}>
        <torusGeometry args={[1.3, 0.03, 8, 48]} />
        <meshPhysicalMaterial
          color="#333355"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Rubber feet */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 1.0,
            -0.12,
            Math.sin(angle) * 1.0,
          ]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function SessionDots({ completed, total, color }: { completed: number; total: number; color: string }) {
  return (
    <group position={[0, -1.35, 0]}>
      {Array.from({ length: total }).map((_, i) => {
        const angle = (i / total) * Math.PI - Math.PI / 2;
        const radius = 1.5;
        const isCompleted = i < completed % total;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color={isCompleted ? color : '#333333'}
              emissive={isCompleted ? color : '#000000'}
              emissiveIntensity={isCompleted ? 1 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function PomodoroDevice({ mode, timerState, timeLeft, totalTime, sessionsCompleted, longBreakInterval, servoAngle, device, onTomatoPress }: Omit<SceneProps, 'connectionState'>) {
  const colors = MODE_COLORS[mode];
  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0;
  const isRunning = timerState === 'running';
  const isPaused = timerState === 'paused';

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <group>
      {/* Tomato with servo movement */}
      <TomatoBody
        mode={mode}
        servoAngle={servoAngle}
        isRunning={isRunning}
        isPaused={isPaused}
        onClick={onTomatoPress}
      />

      {/* Device base */}
      <DeviceBase />

      {/* LED Ring */}
      <LEDRing
        color={device.ledColor}
        brightness={device.ledBrightness}
        isPulsing={device.isPulsing}
        isRunning={isRunning}
      />

      {/* Progress arc on base */}
      <ProgressArc progress={progress} color={colors.accent} />

      {/* Session dots */}
      <SessionDots
        completed={sessionsCompleted}
        total={longBreakInterval}
        color={colors.accent}
      />

      {/* Time display on front of base */}
      <Text
        position={[0, -1.42, 1.25]}
        fontSize={0.18}
        color={colors.glow}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {timeStr}
      </Text>

      {/* Mode label */}
      <Text
        position={[0, -1.58, 1.25]}
        fontSize={0.06}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {mode === 'focus' ? 'FOCUS' : mode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
      </Text>

      {/* Servo angle indicator */}
      <Text
        position={[0, -1.72, 1.25]}
        fontSize={0.04}
        color="#444444"
        anchorX="center"
        anchorY="middle"
      >
        {`SERVO: ${Math.round(servoAngle)}°`}
      </Text>
    </group>
  );
}

export default function PomodoroScene(props: SceneProps) {
  const { mode, connectionState } = props;
  const colors = MODE_COLORS[mode];

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color={colors.glow} />
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Device */}
        <PomodoroDevice {...props} />

        {/* Contact shadows */}
        <ContactShadows
          position={[0, -1.72, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.73, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#0f0f1a" roughness={0.9} />
        </mesh>

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={9}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={connectionState !== 'connected' || props.timerState === 'idle'}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Fog */}
        <fog attach="fog" args={['#0f0f1a', 10, 25]} />
      </Canvas>
    </div>
  );
}
