"use client";

import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
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
const FIELD_GREEN = "#84a66e";
const MINERAL_GREEN = "#2d4f3a";
const TIMBER = "#8a5a38";
const LIGHT_TIMBER = "#aa7650";
const COPPER = "#b87333";
const AMBER = "#d4a017";
const BONE = "#f5f0e1";
const WATER = "#0d7377";
const STONE = "#5f5a51";

type ModelVariant = "hall" | "homes";

type CameraCommand = {
  id: number;
  key: string;
};

type BeamProps = {
  start: [number, number, number];
  end: [number, number, number];
  width?: number;
  depth?: number;
  color?: string;
};

type MiniDomeShell = {
  panels: THREE.BufferGeometry;
  edges: THREE.EdgesGeometry;
};

function Beam({
  start,
  end,
  width = 0.1,
  depth = width,
  color = TIMBER,
}: BeamProps) {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    return {
      midpoint: from.add(to).multiplyScalar(0.5),
      length: direction.length(),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize(),
      ),
    };
  }, [end, start]);

  return (
    <mesh
      position={transform.midpoint}
      quaternion={transform.quaternion}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[width, transform.length + 0.02, depth]} />
      <meshStandardMaterial color={color} roughness={0.82} metalness={0} />
    </mesh>
  );
}

function polygonPoints(
  count: number,
  radius: number,
  y: number,
  offset = Math.PI / 2,
) {
  return Array.from({ length: count }, (_, index) => {
    const angle = offset + (index / count) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    ] as [number, number, number];
  });
}

function buildHallRoof() {
  const perimeter = polygonPoints(9, 4.28, 2.9);
  const apex: [number, number, number] = [0, 4.45, 0];
  const positions: number[] = [];

  perimeter.forEach((point, index) => {
    const next = perimeter[(index + 1) % perimeter.length];
    positions.push(...point, ...next, ...apex);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

function buildMiniDomeShell(): MiniDomeShell {
  const basis = new THREE.IcosahedronGeometry(1, 0);
  const pole = new THREE.Vector3()
    .fromBufferAttribute(basis.attributes.position, 0)
    .normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    pole,
    new THREE.Vector3(0, 1, 0),
  );
  const source = new THREE.IcosahedronGeometry(1, 1);
  source.applyQuaternion(rotation);
  const nonIndexed = source.index ? source.toNonIndexed() : source.clone();
  const sourcePositions = nonIndexed.attributes.position;
  const positions: number[] = [];

  for (let index = 0; index < sourcePositions.count; index += 3) {
    const triangle = [0, 1, 2].map(offset =>
      new THREE.Vector3().fromBufferAttribute(
        sourcePositions,
        index + offset,
      ),
    );
    if (triangle.every(point => point.y >= -0.0001)) {
      triangle.forEach(point => positions.push(point.x, Math.max(0, point.y), point.z));
    }
  }

  const panels = new THREE.BufferGeometry();
  panels.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  panels.computeVertexNormals();
  const edges = new THREE.EdgesGeometry(panels, 1);

  basis.dispose();
  source.dispose();
  nonIndexed.dispose();

  return { panels, edges };
}

function MovingSun({
  motionEnabled,
  wide = false,
}: {
  motionEnabled: boolean;
  wide?: boolean;
}) {
  const sun = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (!sun.current) return;
    const elapsed = motionEnabled ? clock.getElapsedTime() * 0.055 : 0.65;
    const radius = wide ? 13 : 9;
    sun.current.position.set(
      Math.cos(elapsed) * radius,
      8 + Math.sin(elapsed * 0.7) * 1.2,
      Math.sin(elapsed) * radius,
    );
  });

  return (
    <directionalLight
      ref={sun}
      position={[7, 9, 6]}
      intensity={1.55}
      color={AMBER}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-near={0.1}
      shadow-camera-far={40}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
    />
  );
}

function JoshuaTree({
  position,
  scale = 1,
  rotation = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.5, 7]} />
        <meshStandardMaterial color="#75604d" roughness={0.98} />
      </mesh>
      {[-0.48, 0, 0.48].map((branchRotation, index) => (
        <group
          key={branchRotation}
          position={[0, 1.15 + index * 0.15, 0]}
          rotation={[0, branchRotation, 0]}
        >
          <mesh position={[0, 0.28, 0.3]} rotation={[0.85, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.7, 6]} />
            <meshStandardMaterial color="#75604d" roughness={0.98} />
          </mesh>
          <mesh position={[0, 0.58, 0.6]} castShadow>
            <dodecahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={MINERAL_GREEN} roughness={0.94} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GraniteBoulder({
  position,
  scale,
  rotation,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: number;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={[0.18, rotation, -0.08]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={STONE} roughness={1} />
    </mesh>
  );
}

function MojaveContext({ wide = false }: { wide?: boolean }) {
  const boulders = useMemo(
    () =>
      Array.from({ length: wide ? 20 : 12 }, (_, index) => {
        const angle = index * 2.17;
        const radius = (wide ? 7.5 : 5.4) + ((index * 13) % 17) / 10;
        return {
          position: [
            Math.cos(angle) * radius,
            0.05,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          scale: [
            0.25 + (index % 4) * 0.08,
            0.18 + (index % 3) * 0.07,
            0.3 + (index % 5) * 0.05,
          ] as [number, number, number],
          rotation: angle * 0.63,
        };
      }),
    [wide],
  );

  const treePositions: [number, number, number][] = wide
    ? [
        [-9, 0, -4],
        [-7, 0, 4.4],
        [0, 0, -6],
        [8.5, 0, -4.5],
        [7.4, 0, 4.8],
      ]
    : [
        [-5.7, 0, -3.8],
        [5.4, 0, -3.2],
        [-4.8, 0, 4.6],
        [5.5, 0, 4.1],
      ];

  return (
    <group>
      {boulders.map((boulder, index) => (
        <GraniteBoulder key={index} {...boulder} />
      ))}
      {treePositions.map((position, index) => (
        <JoshuaTree
          key={position.join(":")}
          position={position}
          scale={0.72 + index * 0.07}
          rotation={index * 0.83}
        />
      ))}
    </group>
  );
}

function AcousticCeiling({ motionEnabled }: { motionEnabled: boolean }) {
  const field = useRef<THREE.Group>(null);
  const ceiling = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (ceiling.current) {
      ceiling.current.rotation.y = motionEnabled ? elapsed * 0.035 : 0.35;
    }
    if (!field.current) return;
    field.current.children.forEach((child, index) => {
      const ring = child as THREE.Mesh<
        THREE.RingGeometry,
        THREE.MeshStandardMaterial
      >;
      const phase = motionEnabled
        ? (elapsed * 0.16 + index * 0.24) % 1
        : index * 0.2;
      ring.scale.setScalar(0.86 + phase * 0.28);
      ring.material.opacity = 0.24 * (1 - phase);
    });
  });

  return (
    <group>
      <mesh ref={ceiling} position={[0, 3.42, 0]} castShadow>
        <dodecahedronGeometry args={[0.95, 0]} />
        <meshPhysicalMaterial
          color={COPPER}
          emissive={COPPER}
          emissiveIntensity={0.15}
          metalness={0.88}
          roughness={0.26}
          transparent
          opacity={0.82}
        />
      </mesh>
      <mesh position={[0, 3.42, 0]} scale={1.012}>
        <dodecahedronGeometry args={[0.95, 0]} />
        <meshBasicMaterial color={BONE} wireframe transparent opacity={0.34} />
      </mesh>
      <group ref={field} position={[0, 2.42, 0]}>
        {[0.8, 1.25, 1.7, 2.15].map(radius => (
          <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.018, 64]} />
            <meshStandardMaterial
              color={FIELD_GREEN}
              emissive={FIELD_GREEN}
              emissiveIntensity={0.35}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GreatHall({ motionEnabled }: { motionEnabled: boolean }) {
  const perimeter = useMemo(() => polygonPoints(9, 4.25, 0), []);
  const top = useMemo(() => polygonPoints(9, 4.25, 2.9), []);
  const roof = useMemo(() => buildHallRoof(), []);
  const stainedGlass = [
    FIELD_GREEN,
    COPPER,
    AMBER,
    "#7f9b82",
    "#8a6b47",
    FIELD_GREEN,
    COPPER,
    AMBER,
    "#7f9b82",
  ];

  useEffect(() => () => roof.dispose(), [roof]);

  return (
    <group>
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.65, 4.65, 0.18, 9]} />
        <meshStandardMaterial color="#3c3027" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.125, 0]} receiveShadow>
        <cylinderGeometry args={[4.42, 4.42, 0.04, 9]} />
        <meshStandardMaterial color="#6f4c34" roughness={0.86} />
      </mesh>

      {perimeter.map((point, index) => {
        const nextIndex = (index + 1) % perimeter.length;
        const next = perimeter[nextIndex];
        const topPoint = top[index];
        const nextTop = top[nextIndex];
        const midpoint: [number, number, number] = [
          (point[0] + next[0]) / 2,
          1.58,
          (point[2] + next[2]) / 2,
        ];
        const angle = Math.atan2(next[0] - point[0], next[2] - point[2]);
        const chord = new THREE.Vector3(...point).distanceTo(
          new THREE.Vector3(...next),
        );

        return (
          <group key={index}>
            <Beam
              start={[point[0], 0.12, point[2]]}
              end={topPoint}
              width={0.16}
              depth={0.16}
              color={LIGHT_TIMBER}
            />
            <Beam
              start={[point[0], 0.2, point[2]]}
              end={[next[0], 0.2, next[2]]}
              width={0.12}
              depth={0.16}
            />
            <Beam
              start={topPoint}
              end={nextTop}
              width={0.15}
              depth={0.15}
              color={LIGHT_TIMBER}
            />
            <Beam
              start={topPoint}
              end={[0, 4.45, 0]}
              width={0.12}
              depth={0.11}
            />
            {index !== 0 && (
              <mesh
                position={midpoint}
                rotation={[0, angle, 0]}
                castShadow
              >
                <boxGeometry args={[chord * 0.58, 1.1, 0.035]} />
                <meshPhysicalMaterial
                  color={stainedGlass[index]}
                  emissive={stainedGlass[index]}
                  emissiveIntensity={0.13}
                  transmission={0.25}
                  transparent
                  opacity={0.58}
                  roughness={0.2}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}

      <mesh geometry={roof} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={MINERAL_GREEN}
          transparent
          opacity={0.13}
          roughness={0.75}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {[2.15, 2.85, 3.5].map((radius, ringIndex) =>
        polygonPoints(9, radius, 0.45).map((point, index, ring) => {
          if (index === 0 || (ringIndex === 2 && index === 1)) return null;
          return (
            <Beam
              key={`${radius}-${index}`}
              start={point}
              end={ring[(index + 1) % ring.length]}
              width={0.13}
              depth={0.34}
              color={ringIndex % 2 === 0 ? TIMBER : LIGHT_TIMBER}
            />
          );
        }),
      )}

      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.28, 9]} />
        <meshStandardMaterial color={COPPER} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.045, 9]} />
        <meshStandardMaterial color={BONE} roughness={0.76} />
      </mesh>

      <AcousticCeiling motionEnabled={motionEnabled} />
      <MojaveContext />
      <Html
        position={[0, 5.25, 0]}
        center
        distanceFactor={10}
        className="architecture-scene-label"
        style={{ pointerEvents: "none" }}
      >
        9-SIDED GREAT HALL / 12-FACED ACOUSTIC CEILING
      </Html>
    </group>
  );
}

function MiniDomeHome({
  shell,
  position,
  rotation,
  accent,
}: {
  shell: MiniDomeShell;
  position: [number, number, number];
  rotation: number;
  accent: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} dispose={null}>
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.18, 1.18, 0.13, 12]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      <mesh geometry={shell.panels} scale={1.02} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#314230"
          emissive={accent}
          emissiveIntensity={0.035}
          transparent
          opacity={0.72}
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={shell.edges} scale={1.025}>
        <lineBasicMaterial color={FIELD_GREEN} transparent opacity={0.9} />
      </lineSegments>
      <mesh position={[0, 0.42, 0.94]} castShadow>
        <boxGeometry args={[0.42, 0.72, 0.08]} />
        <meshStandardMaterial color={TIMBER} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.66, -0.79]}>
        <circleGeometry args={[0.23, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.45}
          transparent
          opacity={0.72}
        />
      </mesh>
    </group>
  );
}

function Pool({
  position,
  motionEnabled,
}: {
  position: [number, number, number];
  motionEnabled: boolean;
}) {
  const water = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!water.current) return;
    const pulse = motionEnabled
      ? 1 + Math.sin(clock.getElapsedTime() * 1.15) * 0.018
      : 1;
    water.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.22, 1.22, 0.16, 32]} />
        <meshStandardMaterial color={COPPER} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh
        ref={water}
        position={[0, 0.115, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.08, 40]} />
        <meshPhysicalMaterial
          color={WATER}
          emissive={WATER}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
          roughness={0.18}
          depthWrite={false}
        />
      </mesh>
      {[1.38, 1.68].map(radius => (
        <mesh
          key={radius}
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.035, 64]} />
          <meshStandardMaterial
            color={FIELD_GREEN}
            emissive={FIELD_GREEN}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function ResidentialClusters({
  motionEnabled,
  shell,
}: {
  motionEnabled: boolean;
  shell: MiniDomeShell;
}) {
  const centers: [number, number, number][] = [
    [-4.8, 0, 0],
    [4.8, 0, 0],
  ];
  const accents = [AMBER, FIELD_GREEN, COPPER, "#78a0a4", BONE, "#a58b6c"];

  return (
    <group>
      {centers.map((center, clusterIndex) => (
        <group key={center[0]}>
          <Pool position={center} motionEnabled={motionEnabled} />
          <mesh
            position={[center[0], 0.012, center[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[2.28, 2.42, 64]} />
            <meshStandardMaterial color={BONE} roughness={0.88} />
          </mesh>
          {Array.from({ length: 6 }, (_, homeIndex) => {
            const angle =
              (homeIndex / 6) * Math.PI * 2 +
              clusterIndex * (Math.PI / 6);
            const position: [number, number, number] = [
              center[0] + Math.cos(angle) * 3.05,
              0.12,
              center[2] + Math.sin(angle) * 3.05,
            ];
            return (
              <MiniDomeHome
                key={homeIndex}
                shell={shell}
                position={position}
                rotation={Math.PI / 2 - angle}
                accent={accents[homeIndex]}
              />
            );
          })}
          <Html
            position={[center[0], 2.05, center[2]]}
            center
            distanceFactor={12}
            className="architecture-scene-label"
            style={{ pointerEvents: "none" }}
          >
            CLUSTER {clusterIndex + 1} / 6 HOMES
          </Html>
        </group>
      ))}

      <MojaveContext wide />
    </group>
  );
}

function KeyboardCamera({
  command,
  target,
  minDistance,
  maxDistance,
}: {
  command: CameraCommand | null;
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!command) return;
    const orbitTarget = new THREE.Vector3(...target);
    const offset = camera.position.clone().sub(orbitTarget);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    if (command.key === "ArrowLeft") spherical.theta -= 0.14;
    if (command.key === "ArrowRight") spherical.theta += 0.14;
    if (command.key === "ArrowUp") spherical.phi -= 0.1;
    if (command.key === "ArrowDown") spherical.phi += 0.1;
    if (command.key === "+" || command.key === "=") spherical.radius *= 0.9;
    if (command.key === "-") spherical.radius *= 1.1;

    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.28, 1.46);
    spherical.radius = THREE.MathUtils.clamp(
      spherical.radius,
      minDistance,
      maxDistance,
    );
    camera.position.copy(
      new THREE.Vector3().setFromSpherical(spherical).add(orbitTarget),
    );
    camera.lookAt(orbitTarget);
  }, [camera, command, maxDistance, minDistance, target]);

  return null;
}

function ArchitectureScene({
  variant,
  autoRotate,
  motionEnabled,
  command,
  onControlStart,
}: {
  variant: ModelVariant;
  autoRotate: boolean;
  motionEnabled: boolean;
  command: CameraCommand | null;
  onControlStart: () => void;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const shell = useMemo(() => buildMiniDomeShell(), []);
  const isHomes = variant === "homes";
  const target: [number, number, number] = isHomes ? [0, 0.65, 0] : [0, 1.65, 0];
  const minDistance = isHomes ? 10 : 7;
  const maxDistance = isHomes ? 28 : 20;

  useEffect(
    () => () => {
      shell.panels.dispose();
      shell.edges.dispose();
    },
    [shell],
  );

  return (
    <>
      <color attach="background" args={[OBSIDIAN]} />
      <fog attach="fog" args={[OBSIDIAN, isHomes ? 18 : 13, isHomes ? 38 : 28]} />
      <ambientLight intensity={0.48} />
      <hemisphereLight args={[BONE, MINERAL_GREEN, 0.72]} />
      <MovingSun motionEnabled={motionEnabled} wide={isHomes} />
      <pointLight
        position={[-5, 3, -5]}
        intensity={0.52}
        color={FIELD_GREEN}
      />

      <mesh
        position={[0, -0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[isHomes ? 14 : 9, 96]} />
        <meshStandardMaterial color="#17150f" roughness={1} />
      </mesh>
      {[isHomes ? 7 : 5.2, isHomes ? 10.5 : 7.2].map(radius => (
        <mesh
          key={radius}
          position={[0, -0.065, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.018, 96]} />
          <meshStandardMaterial
            color={FIELD_GREEN}
            emissive={FIELD_GREEN}
            emissiveIntensity={0.1}
            transparent
            opacity={0.24}
            depthWrite={false}
          />
        </mesh>
      ))}

      {isHomes ? (
        <ResidentialClusters motionEnabled={motionEnabled} shell={shell} />
      ) : (
        <GreatHall motionEnabled={motionEnabled} />
      )}

      <ContactShadows
        position={[0, -0.045, 0]}
        scale={isHomes ? 24 : 12}
        opacity={0.54}
        blur={2.4}
        far={8}
        resolution={512}
        color="#000000"
      />
      <KeyboardCamera
        command={command}
        target={target}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />
      <OrbitControls
        ref={controls}
        makeDefault
        target={target}
        minDistance={minDistance}
        maxDistance={maxDistance}
        maxPolarAngle={1.47}
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        autoRotate={autoRotate}
        autoRotateSpeed={isHomes ? 0.18 : 0.24}
        onStart={onControlStart}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />
    </>
  );
}

function ArchitecturalModelViewer({ variant }: { variant: ModelVariant }) {
  const viewer = useRef<HTMLDivElement>(null);
  const commandId = useRef(0);
  const [expanded, setExpanded] = useState(false);
  const [mobileInteracted, setMobileInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cameraCommand, setCameraCommand] =
    useState<CameraCommand | null>(null);
  const isHomes = variant === "homes";

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
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
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
      className={`architecture-model-viewer architecture-model-${variant} ${expanded ? "is-expanded" : ""}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={
        isHomes
          ? "Interactive three-dimensional model of two six-home geodesic residential clusters. Drag or use arrow keys to orbit. Scroll or use plus and minus keys to zoom."
          : "Interactive three-dimensional model of the nine-sided timber Great Hall and twelve-faced acoustic ceiling. Drag or use arrow keys to orbit. Scroll or use plus and minus keys to zoom."
      }
    >
      <div className="architecture-model-id" aria-hidden="true">
        <span>{isHomes ? "PHASE 4 / RESIDENTIAL CAMPUS" : "PHASE 3 / GREAT HALL"}</span>
        <b>{isHomes ? "12 DOMES / 2 POOLS / LIVE MODEL" : "9 SIDES / 12 FACETS / LIVE MODEL"}</b>
      </div>
      <button
        type="button"
        className="architecture-expand-button"
        onClick={toggleExpanded}
        aria-pressed={expanded}
        aria-label={
          expanded
            ? "Close full-screen architectural model"
            : "Expand architectural model to full screen"
        }
      >
        {expanded ? "CLOSE FULL SCREEN ×" : "EXPAND MODEL ↗"}
      </button>
      <div className="architecture-model-controls" aria-hidden="true">
        <span>DRAG TO ROTATE</span>
        <span>SCROLL TO ZOOM</span>
        <span>ARROWS +/−</span>
      </div>
      <Canvas
        camera={{
          position: isHomes ? [11.8, 8.2, 14.8] : [7.2, 5.3, 8.4],
          fov: isHomes ? 42 : 40,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.75]}
        frameloop="always"
        shadows="basic"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <ArchitectureScene
          variant={variant}
          autoRotate={!reducedMotion && !mobileInteracted}
          motionEnabled={!reducedMotion}
          command={cameraCommand}
          onControlStart={handleControlStart}
        />
      </Canvas>
    </div>
  );
}

export function GreatHallModel() {
  return <ArchitecturalModelViewer variant="hall" />;
}

export function ResidentialClustersModel() {
  return <ArchitecturalModelViewer variant="homes" />;
}
