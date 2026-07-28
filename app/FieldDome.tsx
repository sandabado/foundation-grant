"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type ComponentRef,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

const OBSIDIAN = "#080a08";
const BONE = "#f5f0e1";
const FIELD_GREEN = "#84a66e";
const MINERAL_GREEN = "#2d4f3a";
const DOUGLAS_FIR = "#8a5a38";
const COPPER = "#b87333";

type CameraCommand = {
  id: number;
  key: string;
};

function buildDomeStructure() {
  const source = new THREE.IcosahedronGeometry(3, 1);
  source.scale(1, 0.82, 1);
  const edges = new THREE.EdgesGeometry(source, 1);
  const positions = edges.attributes.position.array;
  const segments: [THREE.Vector3, THREE.Vector3][] = [];

  for (let index = 0; index < positions.length; index += 6) {
    const start = new THREE.Vector3(
      positions[index],
      positions[index + 1],
      positions[index + 2],
    );
    const end = new THREE.Vector3(
      positions[index + 3],
      positions[index + 4],
      positions[index + 5],
    );
    if (start.y >= 0.1 && end.y >= 0.1) {
      segments.push([start, end]);
    }
  }

  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    segments.push([
      new THREE.Vector3(Math.cos(angle) * 3, 0.04, Math.sin(angle) * 3),
      new THREE.Vector3(
        Math.cos(angle) * 2.48,
        0.82,
        Math.sin(angle) * 2.48,
      ),
    ]);
  }

  const struts = segments.map(([start, end]) => {
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { midpoint, quaternion, length: direction.length() };
  });

  const jointMap = new Map<string, THREE.Vector3>();
  segments.forEach(([start, end]) => {
    [start, end].forEach(point => {
      const key = `${point.x.toFixed(2)}:${point.y.toFixed(2)}:${point.z.toFixed(2)}`;
      jointMap.set(key, point);
    });
  });

  edges.dispose();
  source.dispose();

  return {
    struts,
    joints: Array.from(jointMap.values()),
  };
}

function AcousticField({ motionEnabled }: { motionEnabled: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const elapsed = clock.getElapsedTime();
    group.current.children.forEach((child, index) => {
      const ring = child as THREE.Mesh<
        THREE.RingGeometry,
        THREE.MeshStandardMaterial
      >;
      const phase = motionEnabled
        ? (elapsed * 0.18 + index * 0.22) % 1
        : index * 0.18;
      ring.scale.setScalar(0.86 + phase * 0.22);
      ring.material.opacity = 0.3 * (1 - phase);
    });
  });

  return (
    <group ref={group} position={[0, 0.035, 0]}>
      {[0.65, 1.05, 1.45, 1.85, 2.25].map(radius => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.025, 64]} />
          <meshStandardMaterial
            color={FIELD_GREEN}
            emissive={FIELD_GREEN}
            emissiveIntensity={0.42}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function DomeStructure({ motionEnabled }: { motionEnabled: boolean }) {
  const model = useMemo(() => buildDomeStructure(), []);
  const dome = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!dome.current) return;
    dome.current.rotation.y = motionEnabled
      ? Math.sin(clock.getElapsedTime() * 0.12) * 0.035
      : 0;
  });

  return (
    <group ref={dome}>
      <mesh position={[0, 0, 0]} scale={[1, 0.82, 1]} receiveShadow>
        <icosahedronGeometry args={[3, 1]} />
        <meshPhysicalMaterial
          color={BONE}
          transparent
          opacity={0.055}
          roughness={0.5}
          transmission={0.12}
          thickness={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {model.struts.map((strut, index) => (
        <mesh
          key={index}
          position={strut.midpoint}
          quaternion={strut.quaternion}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.035, strut.length, 7]} />
          <meshStandardMaterial color={DOUGLAS_FIR} roughness={0.72} />
        </mesh>
      ))}

      {model.joints.map((joint, index) => (
        <mesh key={index} position={joint} castShadow>
          <sphereGeometry args={[0.065, 8, 6]} />
          <meshStandardMaterial color="#d1a06c" roughness={0.68} />
        </mesh>
      ))}

      <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.055, 7, 72]} />
        <meshStandardMaterial color={DOUGLAS_FIR} roughness={0.72} />
      </mesh>

      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 1.55, 8]} />
        <meshStandardMaterial color={COPPER} metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial
          color={FIELD_GREEN}
          emissive={FIELD_GREEN}
          emissiveIntensity={0.5}
        />
      </mesh>

      <AcousticField motionEnabled={motionEnabled} />
      <Html
        position={[0, 3.35, 0]}
        center
        distanceFactor={8}
        className="dome-scene-label"
        style={{ pointerEvents: "none" }}
      >
        10 FT / 2V / 65 STRUTS / ZERO METAL
      </Html>
    </group>
  );
}

function KeyboardCamera({
  command,
}: {
  command: CameraCommand | null;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!command) return;
    const target = new THREE.Vector3(0, 1.1, 0);
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    if (command.key === "ArrowLeft") spherical.theta -= 0.14;
    if (command.key === "ArrowRight") spherical.theta += 0.14;
    if (command.key === "ArrowUp") spherical.phi -= 0.1;
    if (command.key === "ArrowDown") spherical.phi += 0.1;
    if (command.key === "+" || command.key === "=") spherical.radius *= 0.9;
    if (command.key === "-") spherical.radius *= 1.1;

    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.3, 1.46);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, 4, 16);
    camera.position.copy(
      new THREE.Vector3().setFromSpherical(spherical).add(target),
    );
    camera.lookAt(target);
  }, [camera, command]);

  return null;
}

function DomeScene({
  autoRotate,
  motionEnabled,
  command,
  onControlStart,
}: {
  autoRotate: boolean;
  motionEnabled: boolean;
  command: CameraCommand | null;
  onControlStart: () => void;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  return (
    <>
      <color attach="background" args={[OBSIDIAN]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={1}
        color="#d4a017"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[-4, 2.5, -4]}
        intensity={0.5}
        color={FIELD_GREEN}
      />

      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[6, 80]} />
        <meshStandardMaterial color={OBSIDIAN} roughness={0.93} />
      </mesh>
      {[3.35, 4.15, 5.1].map(radius => (
        <mesh
          key={radius}
          position={[0, -0.035, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.012, 96]} />
          <meshStandardMaterial
            color={MINERAL_GREEN}
            emissive={MINERAL_GREEN}
            emissiveIntensity={0.12}
            transparent
            opacity={0.26}
            depthWrite={false}
          />
        </mesh>
      ))}

      <DomeStructure motionEnabled={motionEnabled} />
      <KeyboardCamera command={command} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 1.1, 0]}
        minDistance={4}
        maxDistance={16}
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate}
        autoRotateSpeed={0.25}
        onStart={onControlStart}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />
    </>
  );
}

export default function FieldDome() {
  const viewer = useRef<HTMLDivElement>(null);
  const commandId = useRef(0);
  const [expanded, setExpanded] = useState(false);
  const [mobileInteracted, setMobileInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cameraCommand, setCameraCommand] =
    useState<CameraCommand | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => {
      if (document.fullscreenElement) {
        setExpanded(document.fullscreenElement === viewer.current);
      }
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleExpanded = async () => {
    const element = viewer.current;
    if (!element) return;
    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
        return;
      }
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return;
      }
    } catch {
      setExpanded(current => !current);
      return;
    }
    setExpanded(current => !current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && expanded && !document.fullscreenElement) {
      setExpanded(false);
      return;
    }
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-"].includes(
        event.key,
      )
    ) {
      return;
    }
    event.preventDefault();
    commandId.current += 1;
    setCameraCommand({ id: commandId.current, key: event.key });
  };

  const handleControlStart = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileInteracted(true);
    }
  };

  return (
    <div
      ref={viewer}
      className={`field-dome-viewer ${expanded ? "is-expanded" : ""}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Interactive three-dimensional 2V wooden field dome. Drag or use arrow keys to orbit. Scroll or use plus and minus keys to zoom."
    >
      <div className="dome-model-id" aria-hidden="true">
        <span>ACOUSTIC FIELD VOLUME</span>
        <b>DOUGLAS FIR / DOWEL JOINERY</b>
      </div>
      <button
        type="button"
        className="dome-expand-button"
        onClick={toggleExpanded}
        aria-pressed={expanded}
        aria-label={expanded ? "Close full-screen dome model" : "Expand dome model to full screen"}
      >
        {expanded ? "CLOSE FULL SCREEN ×" : "EXPAND MODEL ↗"}
      </button>
      <div className="dome-viewer-controls" aria-hidden="true">
        <span>DRAG TO ROTATE</span>
        <span>SCROLL TO ZOOM</span>
        <span>ARROWS +/−</span>
      </div>
      <Canvas
        camera={{ position: [5.6, 3.3, 6.8], fov: 45, near: 0.1, far: 80 }}
        dpr={[1, 2]}
        frameloop="always"
        shadows="basic"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <DomeScene
          autoRotate={!reducedMotion && !mobileInteracted}
          motionEnabled={!reducedMotion}
          command={cameraCommand}
          onControlStart={handleControlStart}
        />
      </Canvas>
    </div>
  );
}
