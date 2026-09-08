import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused';

interface SceneProps {
  mode: TimerMode;
  timerState: TimerState;
  progress: number; // 0 to 1
  onClick: () => void;
}

const MODE_COLORS = {
  focus: { main: '#dc2626', dark: '#991b1b', accent: '#ef4444', glow: '#ff4444', light: 0xef4444 },
  shortBreak: { main: '#16a34a', dark: '#166534', accent: '#22c55e', glow: '#44ff88', light: 0x22c55e },
  longBreak: { main: '#2563eb', dark: '#1e40af', accent: '#3b82f6', glow: '#4488ff', light: 0x3b82f6 },
};

function TomatoDevice({ mode, timerState, progress, onClick }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const pointerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const tickRef = useRef<number>(0);

  // Initialize pointer rotation
  useEffect(() => {
    if (pointerRef.current) {
      pointerRef.current.rotation.z = -Math.PI * 0.75;
    }
  }, []);

  const colors = MODE_COLORS[mode];

  // Physical ticking vibration when running
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    if (timerState === 'running') {
      // Subtle ticking vibration (like a mechanical clock)
      const tick = Math.sin(t * 8) * 0.003;
      groupRef.current.position.y = tick + Math.sin(t * 1.2) * 0.01;
      groupRef.current.rotation.z = Math.sin(t * 8) * 0.002;
    } else if (timerState === 'paused') {
      // Gentle breathing when paused
      groupRef.current.position.y = Math.sin(t * 2) * 0.02;
      groupRef.current.rotation.z = 0;
    } else {
      // Idle - very subtle float
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.005;
      groupRef.current.rotation.z = 0;
    }

    // Smooth pointer rotation with easing
    if (pointerRef.current) {
      const targetAngle = -Math.PI * 0.75 + progress * Math.PI * 1.5;
      pointerRef.current.rotation.z = THREE.MathUtils.lerp(
        pointerRef.current.rotation.z,
        targetAngle,
        0.08
      );
    }

    // Dial rotation (wound-up spring effect)
    if (dialRef.current && timerState === 'running') {
      dialRef.current.rotation.y += delta * 0.3;
    }
  });

  // Tomato body material - glossy with subsurface feel
  const tomatoMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: colors.main,
      roughness: 0.25,
      metalness: 0.0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      sheen: 1.0,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(colors.accent),
      envMapIntensity: 1.2,
    });
  }, [colors]);

  // Dark crease material
  const creaseMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: colors.dark,
      roughness: 0.5,
      metalness: 0.0,
      clearcoat: 0.3,
    });
  }, [colors]);

  // Metallic materials
  const metalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#c0c0c0',
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.5,
    });
  }, []);

  const darkMetalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#3a3a3a',
      roughness: 0.3,
      metalness: 0.9,
      envMapIntensity: 1.0,
    });
  }, []);

  // Pointer material (changes with mode)
  const pointerMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: colors.accent,
      roughness: 0.2,
      metalness: 0.7,
      emissive: colors.glow,
      emissiveIntensity: timerState === 'running' ? 0.4 : 0.1,
    });
  }, [colors, timerState]);

  // Bell/dome material
  const bellMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#e8e8e8',
      roughness: 0.1,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.0,
    });
  }, []);

  // Create tomato segments (creases running vertically)
  const creases = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      items.push({ angle, key: i });
    }
    return items;
  }, []);

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Main tomato body - scaled to be tomato-shaped */}
      <group scale={[1.15, 0.88, 1.05]}>
        <mesh ref={bodyRef} castShadow receiveShadow material={tomatoMaterial}>
          <sphereGeometry args={[1.6, 64, 48]} />
        </mesh>

        {/* Vertical creases (segments) */}
        {creases.map(({ angle, key }) => (
          <mesh
            key={key}
            position={[
              Math.cos(angle) * 1.58,
              0,
              Math.sin(angle) * 1.58,
            ]}
            rotation={[0, -angle, 0]}
            material={creaseMaterial}
          >
            <boxGeometry args={[0.04, 2.8, 0.15]} />
          </mesh>
        ))}

        {/* Top dimple */}
        <mesh position={[0, 1.55, 0]} material={creaseMaterial}>
          <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>

        {/* Bottom dimple */}
        <mesh position={[0, -1.55, 0]} rotation={[Math.PI, 0, 0]} material={creaseMaterial}>
          <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* Stem - mechanical looking */}
      <group position={[0, 1.45, 0]}>
        {/* Stem base ring */}
        <mesh material={darkMetalMaterial} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.12, 32]} />
        </mesh>

        {/* Stem cylinder */}
        <mesh position={[0, 0.2, 0]} material={metalMaterial} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.4, 16]} />
        </mesh>

        {/* Stem cap */}
        <mesh position={[0, 0.42, 0]} material={darkMetalMaterial} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
        </mesh>
      </group>

      {/* Leaves - mechanical style */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={i} position={[0, 1.4, 0]} rotation={[0, angle, 0]}>
            <mesh
              position={[0.3, 0.05, 0]}
              rotation={[0, 0, -0.4]}
              material={darkMetalMaterial}
              castShadow
            >
              <boxGeometry args={[0.5, 0.04, 0.15]} />
            </mesh>
            <mesh
              position={[0.55, 0.15, 0]}
              rotation={[0, 0, -0.6]}
              material={darkMetalMaterial}
              castShadow
            >
              <boxGeometry args={[0.3, 0.03, 0.1]} />
            </mesh>
          </group>
        );
      })}

      {/* WINDING DIAL ON TOP - the key physical element */}
      <group ref={dialRef} position={[0, 1.9, 0]}>
        {/* Dial base */}
        <mesh material={metalMaterial} castShadow>
          <cylinderGeometry args={[0.35, 0.38, 0.2, 32]} />
        </mesh>

        {/* Dial knob with ridges */}
        <mesh position={[0, 0.15, 0]} material={darkMetalMaterial} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 0.15, 32]} />
        </mesh>

        {/* Dial ridges (grip texture) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.3, 0.15, Math.sin(a) * 0.3]}
              rotation={[0, -a, 0]}
              material={metalMaterial}
            >
              <boxGeometry args={[0.03, 0.14, 0.05]} />
            </mesh>
          );
        })}

        {/* Dial top indicator */}
        <mesh position={[0, 0.24, 0.2]} material={pointerMaterial}>
          <boxGeometry args={[0.04, 0.04, 0.12]} />
        </mesh>
      </group>

      {/* FRONT DIAL / CLOCK FACE */}
      <group position={[0, -0.1, 1.65]}>
        {/* Clock face background */}
        <mesh material={bellMaterial} castShadow>
          <cylinderGeometry args={[1.0, 1.0, 0.08, 64]} />
          <mesh rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.0, 1.0, 0.08, 64]} />
          <meshPhysicalMaterial
            color="#fafafa"
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.5}
          />
        </mesh>

        {/* Clock face rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.06, 16, 64]} />
          <meshPhysicalMaterial
            color={colors.dark}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Tick marks - 25 marks for 25 minutes */}
        {Array.from({ length: 25 }).map((_, i) => {
          const angle = -Math.PI * 0.75 + (i / 24) * Math.PI * 1.5;
          const isMajor = i % 5 === 0;
          const innerR = isMajor ? 0.72 : 0.8;
          const outerR = 0.92;
          const midR = (innerR + outerR) / 2;
          const len = outerR - innerR;

          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * midR, Math.sin(angle) * midR, 0.05]}
              rotation={[0, 0, angle - Math.PI / 2]}
            >
              <boxGeometry args={[isMajor ? 0.04 : 0.02, len, 0.02]} />
              <meshPhysicalMaterial
                color={isMajor ? '#1a1a1a' : '#666666'}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>
          );
        })}

        {/* Numbers at major ticks */}
        {[0, 5, 10, 15, 20, 25].map((num, i) => {
          const angle = -Math.PI * 0.75 + (i / (25 / 5)) * Math.PI * 1.5;
          const r = 0.6;
          return (
            <Text
              key={num}
              position={[Math.cos(angle) * r, Math.sin(angle) * r, 0.06]}
              fontSize={0.12}
              color="#1a1a1a"
              anchorX="center"
              anchorY="middle"
              font={undefined}
            >
              {num.toString()}
            </Text>
          );
        })}

        {/* Center hub */}
        <mesh position={[0, 0, 0.06]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* POINTER HAND - sweeps with progress */}
        <group position={[0, 0, 0.1]} ref={pointerRef}>
          {/* Main pointer arm */}
          <mesh position={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 0.04, 0.03]} />
            <meshPhysicalMaterial
              color={colors.accent}
              roughness={0.2}
              metalness={0.7}
              emissive={colors.glow}
              emissiveIntensity={timerState === 'running' ? 0.5 : 0.1}
            />
          </mesh>
          {/* Pointer tail (counterweight) */}
          <mesh position={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.06, 0.03]} />
            <meshPhysicalMaterial
              color={colors.dark}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          {/* Center cap over pointer */}
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshPhysicalMaterial
              color={colors.accent}
              roughness={0.1}
              metalness={0.9}
              emissive={colors.glow}
              emissiveIntensity={timerState === 'running' ? 0.6 : 0.1}
            />
          </mesh>
        </group>

        {/* Glass cover */}
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.98, 0.98, 0.02, 64]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.0}
            metalness={0.0}
            transmission={0.95}
            thickness={0.5}
            transparent
            opacity={0.15}
            clearcoat={1.0}
          />
        </mesh>
      </group>

      {/* BELL on top (rings when done) */}
      <group position={[0.5, 1.7, 0]}>
        <mesh material={bellMaterial} castShadow>
          <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, -0.02, 0]} material={bellMaterial}>
          <cylinderGeometry args={[0.15, 0.18, 0.08, 16]} />
        </mesh>
      </group>

      {/* Second bell */}
      <group position={[-0.5, 1.7, 0]}>
        <mesh material={bellMaterial} castShadow>
          <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, -0.02, 0]} material={bellMaterial}>
          <cylinderGeometry args={[0.15, 0.18, 0.08, 16]} />
        </mesh>
      </group>

      {/* Hammer between bells */}
      <mesh position={[0, 1.85, 0]} rotation={[0, 0, timerState === 'running' ? Math.sin(Date.now() * 0.01) * 0.2 : 0]} material={darkMetalMaterial}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
      </mesh>
      <mesh position={[0, 2.1, 0]} material={darkMetalMaterial}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>

      {/* STATUS LED */}
      <mesh position={[0.8, 0.8, 1.3]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshPhysicalMaterial
          color={colors.accent}
          emissive={colors.glow}
          emissiveIntensity={timerState === 'running' ? 2 : timerState === 'paused' ? 0.8 : 0.3}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* LED glow */}
      <pointLight
        position={[0.8, 0.8, 1.5]}
        color={colors.light}
        intensity={timerState === 'running' ? 1.5 : 0.3}
        distance={2}
      />

      {/* BASE / STAND */}
      <group position={[0, -1.55, 0]}>
        {/* Rubber feet ring */}
        <mesh material={darkMetalMaterial} receiveShadow>
          <cylinderGeometry args={[1.2, 1.3, 0.15, 32]} />
        </mesh>
        {/* Base plate */}
        <mesh position={[0, -0.12, 0]} material={metalMaterial} receiveShadow>
          <cylinderGeometry args={[1.35, 1.4, 0.1, 32]} />
        </mesh>
        {/* Feet */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 1.1, -0.22, Math.sin(a) * 1.1]}
            >
              <cylinderGeometry args={[0.08, 0.1, 0.08, 8]} />
              <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* Screws on body */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
        return (
          <group
            key={`screw-${i}`}
            position={[Math.cos(a) * 1.65, -1.2, Math.sin(a) * 1.65]}
            rotation={[0, -a, 0]}
          >
            <mesh material={metalMaterial}>
              <cylinderGeometry args={[0.04, 0.04, 0.03, 6]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SceneContent({ mode, timerState, progress, onClick }: SceneProps) {
  return (
    <>
      {/* Warm desk lamp lighting */}
      <ambientLight intensity={0.4} color="#fff5e6" />
      
      {/* Main desk lamp - warm directional light from upper left */}
      <directionalLight
        position={[-4, 6, 4]}
        intensity={3.0}
        color="#fff0d4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light from right - cooler */}
      <directionalLight position={[4, 3, -2]} intensity={0.6} color="#e8f0ff" />
      
      {/* Rim light from behind */}
      <pointLight position={[0, 2, -4]} intensity={0.8} color="#ffddaa" distance={10} />
      
      {/* Subtle under-light for drama */}
      <pointLight position={[0, -1, 2]} intensity={0.2} color="#ffffff" distance={5} />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* The tomato device */}
      <TomatoDevice
        mode={mode}
        timerState={timerState}
        progress={progress}
        onClick={onClick}
      />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
      />

      {/* Wooden desk surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.82, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial
          color="#d4a574"
          roughness={0.7}
          metalness={0.0}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Subtle wood grain lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-15 + i * 1.5, -1.81, 0]}
        >
          <planeGeometry args={[0.02, 30]} />
          <meshBasicMaterial color="#b8865a" transparent opacity={0.15} />
        </mesh>
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function TomatoScene(props: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
