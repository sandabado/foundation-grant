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

const OBSIDIAN = "#0a0a1e";
const BONE = "#f5f0e1";
const WALNUT = "#5c4033";
const COPPER = "#b87333";
const POLISHED_COPPER = "#cd7f32";
const AMBER = "#d4a017";
const WATER = "#0d7377";
const COOL_LIGHT = "#00ffff";
const BED_COLORS = [
  "#2d4f3a",
  "#315640",
  "#284a35",
  "#385d43",
  "#25442f",
  "#324f3b",
];

type CameraCommand = {
  id: number;
  key: string;
};

type GardenSceneProps = {
  autoRotate: boolean;
  motionEnabled: boolean;
  enhanced: boolean;
  cameraCommand: CameraCommand | null;
  onControlStart: () => void;
};

function TriangularBed({
  angle,
  index,
}: {
  angle: number;
  index: number;
}) {
  const position: [number, number, number] = [
    Math.cos(angle) * 2.8,
    0,
    Math.sin(angle) * 2.8,
  ];
  const outwardRotation = Math.PI / 2 - angle;

  return (
    <group position={position} rotation={[0, outwardRotation, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.3, 3]} />
        <meshStandardMaterial color={WALNUT} roughness={0.86} />
      </mesh>
      <mesh
        position={[0, 0.307, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.5, 3]} />
        <meshStandardMaterial
          color={BED_COLORS[index % BED_COLORS.length]}
          emissive={BED_COLORS[index % BED_COLORS.length]}
          emissiveIntensity={0.3}
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}

function IrrigationTube({ angle }: { angle: number }) {
  const geometry = useMemo(() => {
    const destination = new THREE.Vector3(
      Math.cos(angle) * 2.25,
      0.035,
      Math.sin(angle) * 2.25,
    );
    const midpoint = destination.clone().multiplyScalar(0.55);
    midpoint.y = 0.04;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        Math.cos(angle) * 1.12,
        0.035,
        Math.sin(angle) * 1.12,
      ),
      midpoint,
      destination,
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.03, 5, false);
  }, [angle]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#101210" roughness={0.96} />
    </mesh>
  );
}

function CopperCistern({ motionEnabled }: { motionEnabled: boolean }) {
  const copperMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const waterSurface = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (copperMaterial.current) {
      copperMaterial.current.emissiveIntensity = motionEnabled
        ? 0.15 + Math.sin((elapsed * Math.PI * 2) / 3) * 0.1
        : 0.15;
    }
    if (waterSurface.current) {
      waterSurface.current.position.y = motionEnabled
        ? 0.28 + Math.sin(elapsed * Math.PI) * 0.02
        : 0.28;
    }
    if (shadow.current) {
      shadow.current.rotation.y = motionEnabled ? elapsed * 0.2 : 0.35;
    }
  });

  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.6, 32]} />
        <meshStandardMaterial
          ref={copperMaterial}
          color={COPPER}
          emissive={POLISHED_COPPER}
          emissiveIntensity={0.15}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      <mesh
        ref={waterSurface}
        position={[0, 0.28, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.15, 32]} />
        <meshStandardMaterial
          color={WATER}
          emissive={WATER}
          emissiveIntensity={0.22}
          transparent
          opacity={0.7}
          roughness={0.25}
          metalness={0.08}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.25, 1.2, 8]} />
        <meshStandardMaterial
          color={POLISHED_COPPER}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      <group ref={shadow} position={[0, 0.315, 0]}>
        <mesh position={[0, 0, -1.25]}>
          <boxGeometry args={[0.08, 0.02, 2.5]} />
          <meshStandardMaterial
            color={AMBER}
            emissive={AMBER}
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      </group>

      <Html
        position={[0, 2, 0]}
        center
        distanceFactor={9}
        className="tet-scene-label"
        style={{ pointerEvents: "none" }}
      >
        COPPER CISTERN
      </Html>
    </group>
  );
}

function StonePathways() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <ringGeometry args={[2, 2.3, 64]} />
        <meshStandardMaterial color={BONE} roughness={0.7} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <ringGeometry args={[3.5, 3.8, 64]} />
        <meshStandardMaterial color={BONE} roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <mesh
            key={angle}
            position={[
              Math.cos(angle) * 2.9,
              -0.025,
              Math.sin(angle) * 2.9,
            ]}
            rotation={[0, Math.PI / 2 - angle, 0]}
            receiveShadow
          >
            <boxGeometry args={[0.6, 0.05, 1.5]} />
            <meshStandardMaterial color={BONE} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function OrchardRing({ enhanced }: { enhanced: boolean }) {
  const trees = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const scale = 0.85 + ((index * 37) % 31) / 100;
        return { angle, scale };
      }),
    [],
  );

  return (
    <group>
      {trees.map(({ angle, scale }) => (
        <group
          key={angle}
          position={[
            Math.cos(angle) * 5.5,
            0,
            Math.sin(angle) * 5.5,
          ]}
          scale={scale}
        >
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
            <meshStandardMaterial color={WALNUT} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <icosahedronGeometry args={[0.5, enhanced ? 2 : 1]} />
            <meshStandardMaterial
              color="#1a3d1a"
              emissive="#1a3d1a"
              emissiveIntensity={0.16}
              roughness={0.88}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EnhancedGardenDetail({ motionEnabled }: { motionEnabled: boolean }) {
  const ripples = useRef<THREE.Group>(null);
  const rocks = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2 + (index % 3) * 0.09;
        const radius = 3.95 + ((index * 17) % 19) / 20;
        return {
          position: [
            Math.cos(angle) * radius,
            0.02,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          scale: 0.07 + ((index * 13) % 9) / 100,
          rotation: (index * 0.73) % Math.PI,
        };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!ripples.current) return;
    const elapsed = clock.getElapsedTime();
    ripples.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh<
        THREE.RingGeometry,
        THREE.MeshStandardMaterial
      >;
      const phase = motionEnabled
        ? (elapsed * 0.24 + index * 0.27) % 1
        : index * 0.2;
      mesh.scale.setScalar(0.82 + phase * 0.34);
      mesh.material.opacity = 0.22 * (1 - phase);
    });
  });

  return (
    <group>
      {Array.from({ length: 12 }, (_, bedIndex) => {
        const bedAngle = (bedIndex / 12) * Math.PI * 2;
        return Array.from({ length: 4 }, (_, plantIndex) => {
          const localAngle = bedAngle + (plantIndex - 1.5) * 0.06;
          const localRadius = 2.65 + (plantIndex % 2) * 0.18;
          const height = 0.13 + (plantIndex % 3) * 0.04;
          return (
            <mesh
              key={`${bedIndex}-${plantIndex}`}
              position={[
                Math.cos(localAngle) * localRadius,
                0.38 + height / 2,
                Math.sin(localAngle) * localRadius,
              ]}
              castShadow
            >
              <coneGeometry args={[0.045, height, 5]} />
              <meshStandardMaterial
                color={BED_COLORS[(bedIndex + plantIndex) % BED_COLORS.length]}
                roughness={0.92}
              />
            </mesh>
          );
        });
      })}

      {rocks.map((rock, index) => (
        <mesh
          key={index}
          position={rock.position}
          rotation={[0.2, rock.rotation, 0.1]}
          scale={[rock.scale * 1.6, rock.scale, rock.scale * 1.1]}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#756c60" roughness={0.98} />
        </mesh>
      ))}

      <group ref={ripples} position={[0, 0.305, 0]}>
        {[0.42, 0.67, 0.92].map(radius => (
          <mesh
            key={radius}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={2}
          >
            <ringGeometry args={[radius, radius + 0.018, 48]} />
            <meshStandardMaterial
              color="#84a66e"
              emissive="#84a66e"
              emissiveIntensity={0.25}
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {[4.15, 4.7, 5.15, 6].map(radius => (
        <mesh
          key={radius}
          position={[0, -0.085, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.012, 96]} />
          <meshStandardMaterial
            color="#84a66e"
            emissive="#84a66e"
            emissiveIntensity={0.08}
            transparent
            opacity={0.17}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function ColdFrames() {
  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = ((index + 0.5) / 6) * Math.PI * 2;
        return (
          <mesh
            key={angle}
            position={[
              Math.cos(angle) * 4.5,
              0.2,
              Math.sin(angle) * 4.5,
            ]}
            rotation={[-0.15, Math.PI / 2 - angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.7, 0.4, 0.5]} />
            <meshStandardMaterial
              color="#87ceeb"
              transparent
              opacity={0.5}
              roughness={0.18}
              metalness={0.05}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function JoshuaTree({ index, angle }: { index: number; angle: number }) {
  const height = 1.85 + index * 0.12;
  const branchCount = 5 + (index % 3);
  const trunkPosition: [number, number, number] = [
    Math.cos(angle) * 6.5,
    0,
    Math.sin(angle) * 6.5,
  ];

  return (
    <group position={trunkPosition} scale={0.94 + index * 0.035}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, height, 8]} />
        <meshStandardMaterial color="#7d6b5d" roughness={0.94} />
      </mesh>
      {Array.from({ length: branchCount }, (_, branchIndex) => {
        const branchAngle =
          (branchIndex / branchCount) * Math.PI * 2 + index * 0.47;
        const branchY = height * (0.56 + (branchIndex % 3) * 0.12);
        const branchRise = 0.28 + (branchIndex % 2) * 0.08;
        return (
          <group
            key={branchAngle}
            position={[0, branchY, 0]}
            rotation={[0, branchAngle, 0]}
          >
            <mesh
              position={[0, branchRise, 0.34]}
              rotation={[Math.PI / 3, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.055, 0.8, 6]} />
              <meshStandardMaterial color="#7d6b5d" roughness={0.94} />
            </mesh>
            <mesh position={[0, branchRise * 2, 0.69]} castShadow>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshStandardMaterial
                color="#4a5d3a"
                emissive="#4a5d3a"
                emissiveIntensity={0.1}
                roughness={0.9}
              />
            </mesh>
          </group>
        );
      })}
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
    const target = new THREE.Vector3(0, 0.45, 0);
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    if (command.key === "ArrowLeft") spherical.theta -= 0.14;
    if (command.key === "ArrowRight") spherical.theta += 0.14;
    if (command.key === "ArrowUp") spherical.phi -= 0.1;
    if (command.key === "ArrowDown") spherical.phi += 0.1;
    if (command.key === "+" || command.key === "=") spherical.radius *= 0.9;
    if (command.key === "-") spherical.radius *= 1.1;

    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.25, 1.48);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, 4, 20);
    camera.position.copy(
      new THREE.Vector3().setFromSpherical(spherical).add(target),
    );
    camera.lookAt(target);
  }, [camera, command]);

  return null;
}

function GardenScene({
  autoRotate,
  motionEnabled,
  enhanced,
  cameraCommand,
  onControlStart,
}: GardenSceneProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  return (
    <>
      <color attach="background" args={[OBSIDIAN]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.9}
        color={AMBER}
        castShadow={enhanced}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[-5, 3, -5]}
        intensity={0.4}
        color={COOL_LIGHT}
      />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#ffffff" />

      <mesh
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color={OBSIDIAN} roughness={0.9} />
      </mesh>

      <CopperCistern motionEnabled={motionEnabled} />
      <StonePathways />

      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <group key={angle}>
            <IrrigationTube angle={angle} />
            <TriangularBed angle={angle} index={index} />
          </group>
        );
      })}

      <OrchardRing enhanced={enhanced} />
      <ColdFrames />
      {[0, 1, 2, 3].map((index) => (
        <JoshuaTree
          key={index}
          index={index}
          angle={(index / 4) * Math.PI * 2}
        />
      ))}
      {enhanced && <EnhancedGardenDetail motionEnabled={motionEnabled} />}

      <Html
        position={[0, 5.5, 0]}
        center
        distanceFactor={9}
        className="tet-scene-label tet-scene-label-large"
        style={{ pointerEvents: "none" }}
      >
        TETRAHEDRON GARDEN
      </Html>

      <KeyboardCamera command={cameraCommand} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 0.45, 0]}
        minDistance={4}
        maxDistance={20}
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
        onStart={onControlStart}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />
    </>
  );
}

export default function TetrahedronGarden() {
  const viewer = useRef<HTMLDivElement>(null);
  const [mobileInteracted, setMobileInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [enhanced, setEnhanced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 900px)").matches,
  );
  const [cameraCommand, setCameraCommand] =
    useState<CameraCommand | null>(null);
  const commandId = useRef(0);

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

  const handleControlStart = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileInteracted(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
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

  return (
    <div
      ref={viewer}
      className={`tet-garden-viewer ${expanded ? "is-expanded" : ""}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Interactive three-dimensional Tetrahedron Garden. Drag or use arrow keys to orbit. Scroll or use plus and minus keys to zoom."
    >
      <div className="tet-garden-model-id" aria-hidden="true">
        <span>12-BED FIELD MODEL</span>
        <b>INTERACTIVE / LIVE</b>
      </div>
      <div className="tet-viewer-actions">
        <button
          type="button"
          className="tet-detail-button"
          onClick={() => setEnhanced(current => !current)}
          aria-pressed={enhanced}
        >
          {enhanced ? "DETAIL / ENHANCED" : "ENHANCE DETAIL +"}
        </button>
        <button
          type="button"
          className="tet-expand-button"
          onClick={toggleExpanded}
          aria-pressed={expanded}
          aria-label={expanded ? "Close full-screen garden model" : "Expand garden model to full screen"}
        >
          {expanded ? "CLOSE FULL SCREEN ×" : "EXPAND MODEL ↗"}
        </button>
      </div>
      <div className="tet-garden-controls" aria-hidden="true">
        <span>DRAG TO ORBIT</span>
        <span>SCROLL TO ZOOM</span>
        <span>ARROWS +/−</span>
      </div>
      <Canvas
        camera={{ position: [0, 6, 8], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        frameloop="always"
        shadows={enhanced ? "basic" : false}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <GardenScene
          autoRotate={!reducedMotion && !mobileInteracted}
          motionEnabled={!reducedMotion}
          enhanced={enhanced}
          cameraCommand={cameraCommand}
          onControlStart={handleControlStart}
        />
      </Canvas>
    </div>
  );
}
