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
const DOUGLAS_FIR = "#8a5a38";
const DOUGLAS_FIR_LIGHT = "#a7754d";
const HARDWOOD = "#5f3b27";
const FOUNDATION_STONE = "#45463f";
const DOME_RADIUS = 3;
const GROUND_EPSILON = 0.0001;

type CameraCommand = {
  id: number;
  key: string;
};

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
  useEffect(() => () => model.panels.dispose(), [model]);

  return (
    <group>
      <mesh geometry={model.panels} receiveShadow>
        <meshPhysicalMaterial
          color={FIELD_GREEN}
          transparent
          opacity={0.035}
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

      <AcousticField motionEnabled={motionEnabled} />
      <Html
        position={[0, 3.42, 0]}
        center
        distanceFactor={8}
        className="dome-scene-label"
        style={{ pointerEvents: "none" }}
      >
        10 FT / 2V / 65 CONNECTED STRUTS / 26 WOOD HUBS
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
    const target = new THREE.Vector3(0, 1.3, 0);
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    if (command.key === "ArrowLeft") spherical.theta -= 0.14;
    if (command.key === "ArrowRight") spherical.theta += 0.14;
    if (command.key === "ArrowUp") spherical.phi -= 0.1;
    if (command.key === "ArrowDown") spherical.phi += 0.1;
    if (command.key === "+" || command.key === "=") spherical.radius *= 0.9;
    if (command.key === "-") spherical.radius *= 1.1;

    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.3, 1.46);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, 5.2, 16);
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
      <ContactShadows
        position={[0, -0.02, 0]}
        scale={8}
        opacity={0.58}
        blur={2.4}
        far={4.5}
        resolution={512}
        color="#000000"
      />
      <KeyboardCamera command={command} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 1.3, 0]}
        minDistance={5.2}
        maxDistance={16}
        maxPolarAngle={1.47}
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
        camera={{ position: [5.9, 3.7, 7], fov: 42, near: 0.1, far: 80 }}
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
