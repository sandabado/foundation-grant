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
const BONE = "#f5f0e1";
const FIELD_GREEN = "#84a66e";
const MINERAL_GREEN = "#2d4f3a";
const DOUGLAS_FIR = "#8a5a38";
const DOUGLAS_FIR_LIGHT = "#a7754d";
const HARDWOOD = "#5f3b27";
const FOUNDATION_STONE = "#45463f";
const COPPER = "#b87333";
const WATER = "#4f8583";
const FIRE = "#c98245";
const AIR = "#e8ecd8";
const DOME_RADIUS = 3;
const GROUND_EPSILON = 0.0001;

type CameraCommand = {
  id: number;
  key: string;
};

type DomeModel = ReturnType<typeof buildDomeStructure>;

function buildDomeStructure() {
  const basis = new THREE.IcosahedronGeometry(1, 0);
  const pole = new THREE.Vector3()
    .fromBufferAttribute(basis.attributes.position, 0)
    .normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    pole,
    new THREE.Vector3(0, 1, 0),
  );
  const source = new THREE.IcosahedronGeometry(DOME_RADIUS, 1);
  source.applyQuaternion(rotation);
  const edges = new THREE.EdgesGeometry(source, 1);
  const positions = edges.attributes.position.array;
  const segments: [THREE.Vector3, THREE.Vector3][] = [];

  const snapToGround = (point: THREE.Vector3) => {
    if (Math.abs(point.y) <= GROUND_EPSILON) point.y = 0;
    return point;
  };

  for (let index = 0; index < positions.length; index += 6) {
    const start = snapToGround(new THREE.Vector3(
      positions[index],
      positions[index + 1],
      positions[index + 2],
    ));
    const end = snapToGround(new THREE.Vector3(
      positions[index + 3],
      positions[index + 4],
      positions[index + 5],
    ));
    if (start.y >= 0 && end.y >= 0) {
      segments.push([start, end]);
    }
  }

  const struts = segments.map(([start, end]) => {
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const length = direction.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return {
      midpoint,
      quaternion,
      length,
      type: length > DOME_RADIUS * 0.58 ? "A" : "B",
    };
  });

  const jointMap = new Map<string, THREE.Vector3>();
  segments.forEach(([start, end]) => {
    [start, end].forEach(point => {
      const key = `${point.x.toFixed(2)}:${point.y.toFixed(2)}:${point.z.toFixed(2)}`;
      jointMap.set(key, point);
    });
  });

  const joints = Array.from(jointMap.values()).map(position => ({
    position,
    isBase: position.y === 0,
  }));
  const shellSource = source.index ? source.toNonIndexed() : source.clone();
  const shellPositions = shellSource.attributes.position;
  const panelPositions: number[] = [];

  for (let index = 0; index < shellPositions.count; index += 3) {
    const triangle = [0, 1, 2].map(offset =>
      snapToGround(
        new THREE.Vector3().fromBufferAttribute(shellPositions, index + offset),
      ),
    );
    if (triangle.every(point => point.y >= 0)) {
      triangle.forEach(point => panelPositions.push(point.x, point.y, point.z));
    }
  }

  const panels = new THREE.BufferGeometry();
  panels.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(panelPositions, 3),
  );
  panels.computeVertexNormals();

  const longStruts = struts.filter(strut => strut.type === "A").length;
  const shortStruts = struts.length - longStruts;
  const baseJoints = joints.filter(joint => joint.isBase).length;

  if (
    struts.length !== 65 ||
    joints.length !== 26 ||
    baseJoints !== 10 ||
    longStruts !== 35 ||
    shortStruts !== 30 ||
    panelPositions.length / 9 !== 40
  ) {
    throw new Error("Invalid 2V dome topology");
  }

  basis.dispose();
  shellSource.dispose();
  edges.dispose();
  source.dispose();

  return {
    struts,
    joints,
    panels,
  };
}

function AcousticField({
  motionEnabled,
  color,
}: {
  motionEnabled: boolean;
  color: string;
}) {
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
            color={color}
            emissive={color}
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

function WoodIsolationPlatform({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.36, 3.42, 0.34, 24]} />
        <meshStandardMaterial color={HARDWOOD} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.105, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.25, 3.25, 0.12, 32]} />
        <meshStandardMaterial
          color={DOUGLAS_FIR_LIGHT}
          roughness={0.82}
          metalness={0}
        />
      </mesh>
      {Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        return (
          <mesh
            key={angle}
            position={[Math.cos(angle) * 2.75, -0.27, Math.sin(angle) * 2.75]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.13, 0.16, 0.28, 8]} />
            <meshStandardMaterial
              color={HARDWOOD}
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 0.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.08, 3.22, 64]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.25}
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.168, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 2.82, 64]} />
        <meshStandardMaterial
          color={DOUGLAS_FIR}
          roughness={0.86}
          metalness={0}
        />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI;
        return (
          <mesh
            key={angle}
            position={[0, 0.185, 0]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[6, 0.025]} />
            <meshStandardMaterial
              color={DOUGLAS_FIR_LIGHT}
              roughness={0.88}
              metalness={0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function DomeStructure({
  model,
  motionEnabled,
  element,
  accent,
}: {
  model: DomeModel;
  motionEnabled: boolean;
  element: string;
  accent: string;
}) {
  return (
    <group position={[0, 0.21, 0]}>
      <mesh geometry={model.panels} receiveShadow>
        <meshPhysicalMaterial
          color={accent}
          transparent
          opacity={0.045}
          roughness={0.72}
          transmission={0.08}
          thickness={0.08}
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
          receiveShadow
        >
          <boxGeometry args={[0.095, strut.length + 0.045, 0.075]} />
          <meshStandardMaterial
            color={strut.type === "A" ? DOUGLAS_FIR_LIGHT : DOUGLAS_FIR}
            roughness={0.78}
            metalness={0}
          />
        </mesh>
      ))}

      {model.joints.map((joint, index) => (
        <mesh key={index} position={joint.position} castShadow receiveShadow>
          <dodecahedronGeometry args={[joint.isBase ? 0.12 : 0.1, 0]} />
          <meshStandardMaterial color={HARDWOOD} roughness={0.82} metalness={0} />
        </mesh>
      ))}

      {model.joints
        .filter(joint => joint.isBase)
        .map((joint, index) => (
          <group
            key={`foundation-${index}`}
            position={[joint.position.x, 0, joint.position.z]}
          >
            <mesh position={[0, -0.065, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.18, 0.1, 10]} />
              <meshStandardMaterial
                color={FOUNDATION_STONE}
                roughness={0.96}
                metalness={0}
              />
            </mesh>
            <mesh position={[0, -0.005, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.09, 0.1, 0.045, 10]} />
              <meshStandardMaterial
                color={HARDWOOD}
                roughness={0.84}
                metalness={0}
              />
            </mesh>
          </group>
        ))}

      <AcousticField motionEnabled={motionEnabled} color={accent} />
      <Html
        position={[0, 3.55, 0]}
        center
        distanceFactor={10}
        className="dome-scene-label"
        style={{ pointerEvents: "none" }}
      >
        {element} / WOOD ISOLATION PLATFORM
      </Html>
    </group>
  );
}

function GardenSignal({ motionEnabled }: { motionEnabled: boolean }) {
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
        ? (elapsed * 0.11 + index * 0.31) % 1
        : index * 0.28;
      ring.scale.setScalar(0.92 + phase * 0.16);
      ring.material.opacity = 0.32 * (1 - phase);
    });
  });

  return (
    <group ref={group} position={[0, 0.075, 0]}>
      {[2.25, 2.55, 2.85].map(radius => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.025, 64]} />
          <meshStandardMaterial
            color={FIELD_GREEN}
            emissive={FIELD_GREEN}
            emissiveIntensity={0.36}
            transparent
            opacity={0.24}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function TetrahedronGarden({ motionEnabled }: { motionEnabled: boolean }) {
  const water = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!water.current) return;
    water.current.emissiveIntensity = motionEnabled
      ? 0.25 + Math.sin(clock.getElapsedTime() * 1.2) * 0.08
      : 0.25;
  });

  return (
    <group>
      <mesh position={[0, -0.045, 0]} receiveShadow>
        <cylinderGeometry args={[3.05, 3.18, 0.12, 48]} />
        <meshStandardMaterial color="#10150f" roughness={0.97} />
      </mesh>
      {[1.12, 2.08, 2.95].map(radius => (
        <mesh
          key={radius}
          position={[0, 0.025, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.055, 72]} />
          <meshStandardMaterial
            color={FIELD_GREEN}
            emissive={FIELD_GREEN}
            emissiveIntensity={0.16}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>
      ))}

      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const radius = index % 2 === 0 ? 1.72 : 2.06;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const lineLength = Math.max(0.35, radius - 0.72);
        return (
          <group key={angle}>
            <mesh
              position={[x, 0.17, z]}
              rotation={[0, Math.PI / 2 - angle, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.46, 0.46, 0.3, 3]} />
              <meshStandardMaterial
                color={index % 3 === 0 ? "#345d42" : MINERAL_GREEN}
                emissive={MINERAL_GREEN}
                emissiveIntensity={0.18}
                roughness={0.94}
              />
            </mesh>
            <mesh
              position={[
                Math.cos(angle) * (0.72 + lineLength / 2),
                0.055,
                Math.sin(angle) * (0.72 + lineLength / 2),
              ]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[lineLength, 0.025, 0.035]} />
              <meshStandardMaterial
                color={COPPER}
                emissive={COPPER}
                emissiveIntensity={0.18}
                roughness={0.55}
              />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.78, 0.56, 32]} />
        <meshStandardMaterial
          color={COPPER}
          emissive={COPPER}
          emissiveIntensity={0.12}
          metalness={0.72}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.57, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.64, 32]} />
        <meshStandardMaterial
          ref={water}
          color={WATER}
          emissive={WATER}
          emissiveIntensity={0.25}
          transparent
          opacity={0.82}
          roughness={0.24}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <tetrahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial
          color={COPPER}
          emissive={COPPER}
          emissiveIntensity={0.2}
          metalness={0.62}
          roughness={0.28}
          wireframe
        />
      </mesh>

      <GardenSignal motionEnabled={motionEnabled} />
      <Html
        position={[0, 1.78, 0]}
        center
        distanceFactor={11}
        className="dome-scene-label"
        style={{ pointerEvents: "none" }}
      >
        TETRAHEDRON GARDEN / CENTRAL WATER HUB
      </Html>
    </group>
  );
}

function DiamondPath({
  start,
  end,
}: {
  start: [number, number];
  end: [number, number];
}) {
  const deltaX = end[0] - start[0];
  const deltaZ = end[1] - start[1];
  const length = Math.hypot(deltaX, deltaZ);
  const angle = -Math.atan2(deltaZ, deltaX);

  return (
    <group
      position={[(start[0] + end[0]) / 2, 0.018, (start[1] + end[1]) / 2]}
      rotation={[0, angle, 0]}
    >
      <mesh receiveShadow>
        <boxGeometry args={[length, 0.045, 0.22]} />
        <meshStandardMaterial color={HARDWOOD} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.032, 0]}>
        <boxGeometry args={[length, 0.018, 0.035]} />
        <meshStandardMaterial
          color={FIELD_GREEN}
          emissive={FIELD_GREEN}
          emissiveIntensity={0.26}
          transparent
          opacity={0.68}
        />
      </mesh>
    </group>
  );
}

function FirePit({ motionEnabled }: { motionEnabled: boolean }) {
  const flames = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!flames.current) return;
    const elapsed = clock.getElapsedTime();
    flames.current.children.forEach((child, index) => {
      const flame = child as THREE.Mesh<
        THREE.ConeGeometry,
        THREE.MeshStandardMaterial
      >;
      const pulse = motionEnabled
        ? Math.sin(elapsed * (4.2 + index * 0.45) + index * 1.8)
        : 0;
      flame.scale.set(
        0.9 + pulse * 0.08,
        0.92 + pulse * 0.16,
        0.9 + pulse * 0.08,
      );
      flame.rotation.y = elapsed * (motionEnabled ? 0.38 : 0) + index;
      flame.material.emissiveIntensity = 0.9 + pulse * 0.2;
    });
  });

  return (
    <group>
      <mesh position={[0, 0.255, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.84, 0.18, 24]} />
        <meshStandardMaterial color="#17120f" roughness={0.95} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh
            key={angle}
            position={[Math.cos(angle) * 0.77, 0.37, Math.sin(angle) * 0.77]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={FOUNDATION_STONE}
              roughness={0.96}
              metalness={0}
            />
          </mesh>
        );
      })}
      {[-Math.PI / 4, Math.PI / 4].map(rotation => (
        <mesh
          key={rotation}
          position={[0, 0.49, 0]}
          rotation={[Math.PI / 2, 0, rotation]}
          castShadow
        >
          <cylinderGeometry args={[0.1, 0.12, 1.1, 8]} />
          <meshStandardMaterial color={HARDWOOD} roughness={0.92} />
        </mesh>
      ))}
      <group ref={flames} position={[0, 0.7, 0]}>
        {[
          { x: -0.18, z: 0.08, height: 0.74, color: "#d46b34" },
          { x: 0.16, z: 0.05, height: 0.88, color: FIRE },
          { x: 0, z: -0.14, height: 1.08, color: "#f0a64b" },
          { x: 0.05, z: 0.16, height: 0.58, color: "#f4cc72" },
        ].map((flame, index) => (
          <mesh
            key={index}
            position={[flame.x, flame.height / 2, flame.z]}
            rotation={[0, index * 1.3, index % 2 === 0 ? -0.08 : 0.08]}
          >
            <coneGeometry args={[0.22, flame.height, 8]} />
            <meshStandardMaterial
              color={flame.color}
              emissive={flame.color}
              emissiveIntensity={1}
              transparent
              opacity={0.86}
              roughness={0.3}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <pointLight
        position={[0, 1.05, 0]}
        color="#f0a050"
        intensity={motionEnabled ? 3.1 : 2.4}
        distance={5.5}
        decay={2}
      />
    </group>
  );
}

function WaterFeature({ motionEnabled }: { motionEnabled: boolean }) {
  const water = useRef<THREE.MeshStandardMaterial>(null);
  const droplets = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (water.current) {
      water.current.emissiveIntensity = motionEnabled
        ? 0.34 + Math.sin(elapsed * 1.8) * 0.1
        : 0.34;
    }
    if (!droplets.current) return;
    droplets.current.children.forEach((child, index) => {
      const phase = motionEnabled
        ? (elapsed * 0.34 + index / droplets.current!.children.length) % 1
        : index / droplets.current!.children.length;
      child.position.y = 0.76 + Math.sin(phase * Math.PI) * 0.92;
      child.position.x = Math.cos(index * 2.1) * phase * 0.42;
      child.position.z = Math.sin(index * 2.1) * phase * 0.42;
      child.scale.setScalar(0.72 + (1 - phase) * 0.28);
    });
  });

  return (
    <group>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 1.08, 0.28, 32]} />
        <meshStandardMaterial
          color={FOUNDATION_STONE}
          roughness={0.88}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0.495, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.86, 48]} />
        <meshStandardMaterial
          ref={water}
          color={WATER}
          emissive={WATER}
          emissiveIntensity={0.34}
          transparent
          opacity={0.88}
          roughness={0.18}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
      {[0.28, 0.52, 0.74].map(radius => (
        <mesh
          key={radius}
          position={[0, 0.505, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.018, 48]} />
          <meshStandardMaterial
            color={AIR}
            emissive={WATER}
            emissiveIntensity={0.55}
            transparent
            opacity={0.52}
            depthWrite={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.56, 12]} />
        <meshStandardMaterial color={COPPER} roughness={0.42} metalness={0.62} />
      </mesh>
      <group ref={droplets}>
        {Array.from({ length: 9 }, (_, index) => (
          <mesh key={index}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial
              color={AIR}
              emissive={WATER}
              emissiveIntensity={0.8}
              transparent
              opacity={0.82}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <pointLight
        position={[0, 1.05, 0]}
        color={WATER}
        intensity={motionEnabled ? 2.2 : 1.7}
        distance={5}
        decay={2}
      />
    </group>
  );
}

function EarthTree() {
  const branches = [
    { position: [-0.18, 1.3, 0], rotation: [0, 0, -0.48], length: 1.05 },
    { position: [0.23, 1.48, 0.03], rotation: [0, 0, 0.56], length: 1.18 },
    { position: [0.03, 1.62, -0.16], rotation: [0.5, 0, 0.12], length: 0.94 },
  ] as const;

  return (
    <group>
      <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.3, 1.48, 9]} />
        <meshStandardMaterial color={HARDWOOD} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 1.08, 28]} />
        <meshStandardMaterial color="#2a2c20" roughness={1} />
      </mesh>
      {branches.map((branch, index) => (
        <mesh
          key={index}
          position={[...branch.position]}
          rotation={[...branch.rotation]}
          castShadow
        >
          <cylinderGeometry
            args={[0.09, 0.15, branch.length, 8]}
          />
          <meshStandardMaterial color={HARDWOOD} roughness={0.94} />
        </mesh>
      ))}
      {[
        [-0.62, 1.78, 0.04, 0.62],
        [0.65, 1.94, 0.04, 0.72],
        [0.05, 2.22, -0.24, 0.68],
        [-0.12, 1.9, 0.42, 0.58],
      ].map(([x, y, z, scale], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          scale={[scale, scale * 0.68, scale]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? MINERAL_GREEN : FIELD_GREEN}
            emissive={MINERAL_GREEN}
            emissiveIntensity={0.08}
            roughness={0.98}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function AirLightTunnel({ motionEnabled }: { motionEnabled: boolean }) {
  const tunnel = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!tunnel.current) return;
    const elapsed = clock.getElapsedTime();
    tunnel.current.children.forEach((child, index) => {
      if (!(child instanceof THREE.Mesh)) return;
      const ring = child as THREE.Mesh<
        THREE.TorusGeometry,
        THREE.MeshStandardMaterial
      >;
      const pulse = motionEnabled
        ? (Math.sin(elapsed * 1.5 - index * 0.78) + 1) / 2
        : 0.45;
      ring.material.opacity = 0.34 + pulse * 0.48;
      ring.material.emissiveIntensity = 0.5 + pulse * 0.75;
      ring.scale.setScalar(0.96 + pulse * 0.045);
    });
  });

  return (
    <group>
      <group ref={tunnel} position={[0, 1.18, 0]}>
        {Array.from({ length: 9 }, (_, index) => {
          const z = (index - 4) * 0.38;
          const radius = 0.7 + Math.abs(index - 4) * 0.035;
          return (
            <mesh key={index} position={[0, 0, z]}>
              <torusGeometry args={[radius, 0.035, 10, 64]} />
              <meshStandardMaterial
                color={AIR}
                emissive={FIELD_GREEN}
                emissiveIntensity={0.8}
                transparent
                opacity={0.65}
                roughness={0.24}
                depthWrite={false}
              />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 3.35]} />
        <meshStandardMaterial
          color={AIR}
          emissive={FIELD_GREEN}
          emissiveIntensity={0.34}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        position={[0, 1.18, 0]}
        color={AIR}
        intensity={motionEnabled ? 2.6 : 1.9}
        distance={5.2}
        decay={2}
      />
    </group>
  );
}

function ElementalCenterpiece({
  element,
  motionEnabled,
}: {
  element: "EARTH" | "FIRE" | "AIR" | "WATER";
  motionEnabled: boolean;
}) {
  if (element === "FIRE") return <FirePit motionEnabled={motionEnabled} />;
  if (element === "WATER") {
    return <WaterFeature motionEnabled={motionEnabled} />;
  }
  if (element === "EARTH") return <EarthTree />;
  return <AirLightTunnel motionEnabled={motionEnabled} />;
}

function DomeCampus({ motionEnabled }: { motionEnabled: boolean }) {
  const model = useMemo(() => buildDomeStructure(), []);
  useEffect(() => () => model.panels.dispose(), [model]);

  const domes = [
    { element: "EARTH", accent: FIELD_GREEN, position: [0, 0, -6.2] },
    { element: "FIRE", accent: FIRE, position: [6.2, 0, 0] },
    { element: "AIR", accent: AIR, position: [0, 0, 6.2] },
    { element: "WATER", accent: WATER, position: [-6.2, 0, 0] },
  ] as const;

  const diamond = [
    [[0, -6.2], [6.2, 0]],
    [[6.2, 0], [0, 6.2]],
    [[0, 6.2], [-6.2, 0]],
    [[-6.2, 0], [0, -6.2]],
  ] as const;

  return (
    <group>
      {diamond.map(([start, end], index) => (
        <DiamondPath key={index} start={[...start]} end={[...end]} />
      ))}
      <TetrahedronGarden motionEnabled={motionEnabled} />
      {domes.map(dome => (
        <group
          key={dome.element}
          position={[...dome.position]}
          scale={0.62}
        >
          <WoodIsolationPlatform accent={dome.accent} />
          <ElementalCenterpiece
            element={dome.element}
            motionEnabled={motionEnabled}
          />
          <DomeStructure
            model={model}
            motionEnabled={motionEnabled}
            element={dome.element}
            accent={dome.accent}
          />
        </group>
      ))}
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
    const target = new THREE.Vector3(0, 1.15, 0);
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    if (command.key === "ArrowLeft") spherical.theta -= 0.14;
    if (command.key === "ArrowRight") spherical.theta += 0.14;
    if (command.key === "ArrowUp") spherical.phi -= 0.1;
    if (command.key === "ArrowDown") spherical.phi += 0.1;
    if (command.key === "+" || command.key === "=") spherical.radius *= 0.9;
    if (command.key === "-") spherical.radius *= 1.1;

    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.3, 1.46);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, 8.5, 34);
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
      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#d7d0bd", "#11170d", 0.62]} />
      <directionalLight
        position={[8, 12, 7]}
        intensity={1.15}
        color="#d4a017"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[-8, 4.5, -5]}
        intensity={0.62}
        color={FIELD_GREEN}
      />
      <pointLight
        position={[7, 2.5, 6]}
        intensity={0.34}
        color={COPPER}
      />

      <mesh
        position={[0, -0.19, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[13, 96]} />
        <meshStandardMaterial color={OBSIDIAN} roughness={0.93} />
      </mesh>
      {[3.4, 6.2, 8.8, 11.2].map(radius => (
        <mesh
          key={radius}
          position={[0, -0.175, 0]}
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

      <DomeCampus motionEnabled={motionEnabled} />
      <ContactShadows
        position={[0, -0.17, 0]}
        scale={25}
        opacity={0.62}
        blur={2.8}
        far={9}
        resolution={512}
        color="#000000"
      />
      <KeyboardCamera command={command} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 1.15, 0]}
        minDistance={8.5}
        maxDistance={34}
        maxPolarAngle={1.47}
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate}
        autoRotateSpeed={0.16}
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
      aria-label="Interactive three-dimensional campus of four 2V wooden elemental domes on raised wood platforms, arranged in a diamond around the Tetrahedron Garden. Drag or use arrow keys to orbit. Scroll or use plus and minus keys to zoom."
    >
      <div className="dome-model-id" aria-hidden="true">
        <span>FOUR ELEMENTAL DOMES / DIAMOND CAMPUS</span>
        <b>4 × 65 CONNECTED STRUTS / WOOD ISOLATION PLATFORMS</b>
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
        camera={{ position: [13.5, 10.5, 15.5], fov: 39, near: 0.1, far: 120 }}
        dpr={[1, 1.75]}
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
