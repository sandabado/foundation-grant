"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Material } from "three";

const FIELD_GREEN = new Color("#84a66e");
const MINERAL_GREEN = new Color("#2d4f3a");
const TERRAIN_TEXTURE = "/hero-images/old-glory-field-green-sun.jpg";

type FieldPulse = {
  curve: CatmullRomCurve3;
  mesh: Mesh<SphereGeometry, MeshBasicMaterial>;
  offset: number;
  speed: number;
};

type StationRing = {
  mesh: Mesh<RingGeometry, MeshBasicMaterial>;
  offset: number;
};

const vertexShader = `
  uniform float time;
  uniform vec2 pointer;
  varying vec2 vUv;
  varying float vLift;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float landMask = smoothstep(0.06, 0.24, 1.0 - uv.y) *
                     (1.0 - smoothstep(0.74, 0.94, uv.y));
    float ridgeField =
      sin(uv.x * 19.0 + uv.y * 8.0) * 0.04 +
      sin(uv.x * 37.0 - uv.y * 13.0) * 0.02 +
      sin(uv.x * 7.0 + uv.y * 4.0) * 0.045;
    float depth = (0.035 + ridgeField) * landMask;
    transformed.z += depth;
    transformed.z += sin(time * 0.08 + uv.x * 2.0) * 0.008 * landMask;
    transformed.x += pointer.x * (1.0 - uv.y) * 0.035;
    transformed.y += pointer.y * (1.0 - uv.y) * 0.025;
    vLift = depth * landMask;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D terrainMap;
  uniform float time;
  varying vec2 vUv;
  varying float vLift;

  void main() {
    vec3 terrain = texture2D(terrainMap, vUv).rgb;
    float vignette = 1.0 - smoothstep(0.35, 0.98, distance(vUv, vec2(0.52, 0.48)));
    float atmosphere = smoothstep(0.46, 0.95, vUv.y) * 0.035;
    float mineralShade = clamp(vLift * 0.22, -0.035, 0.045);
    float landMask = 1.0 - smoothstep(0.72, 0.94, vUv.y);

    float solarPhase = fract(time * 0.0225);
    float solarAngle = solarPhase * 6.2831853;
    float sunHeight = sin(solarAngle);
    float daylight = smoothstep(-0.3, 0.16, sunHeight);
    float twilight = exp(-abs(sunHeight) * 7.0);
    vec2 sunPoint = vec2(
      0.5 - cos(solarAngle) * 0.72,
      0.55 + sunHeight * 0.19
    );
    vec2 shadowPoint = sunPoint - vec2(cos(solarAngle) * 0.14, 0.045);
    vec2 shadowDelta = (vUv - shadowPoint) * vec2(1.0, 2.3);
    float movingShadow = 1.0 - smoothstep(0.1, 0.36, length(shadowDelta));
    vec2 sunDelta = (vUv - sunPoint) * vec2(1.0, 2.05);
    float sunGlow = 1.0 - smoothstep(0.035, 0.3, length(sunDelta));
    float sunDisc = 1.0 - smoothstep(0.006, 0.023, length(sunDelta));
    float diagonalSweep = 1.0 - smoothstep(
      0.025,
      0.2,
      abs((vUv.x + vUv.y * 0.2) - (sunPoint.x + 0.1))
    );

    terrain += vec3(mineralShade);
    terrain += vec3(0.517, 0.650, 0.431) * atmosphere;
    vec3 nightTerrain = terrain * vec3(0.16, 0.22, 0.34) + vec3(0.008, 0.014, 0.035);
    terrain = mix(nightTerrain, terrain, daylight);
    terrain += vec3(0.31, 0.105, 0.025) * twilight * (0.42 + landMask * 0.58);
    terrain *= 1.0 - movingShadow * landMask * (0.09 + daylight * 0.18);
    terrain += vec3(1.0, 0.72, 0.39) *
      (sunGlow * 0.16 + diagonalSweep * 0.055) * landMask * daylight;
    terrain += vec3(1.0, 0.82, 0.56) * sunDisc * daylight * 0.62;
    terrain *= mix(0.88, 1.03, vignette);
    gl_FragColor = vec4(terrain, 1.0);
  }
`;

const routeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const routeFragmentShader = `
  uniform float time;
  uniform float speed;
  uniform float offset;
  uniform vec3 color;
  varying vec2 vUv;

  void main() {
    float head = fract(time * speed + offset);
    float distanceToHead = abs(fract(vUv.x - head + 0.5) - 0.5);
    float pulse = smoothstep(0.16, 0.0, distanceToHead);
    float wake = smoothstep(0.34, 0.0, distanceToHead) * 0.22;
    float edge = smoothstep(0.5, 0.05, abs(vUv.y - 0.5));
    float alpha = (0.18 + pulse * 0.82 + wake) * edge;
    gl_FragColor = vec4(color * (0.72 + pulse * 1.28), alpha);
  }
`;

function disposeMaterial(material: Material | Material[]) {
  if (Array.isArray(material)) {
    material.forEach(item => item.dispose());
    return;
  }
  material.dispose();
}

export default function InteractiveTerrain() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 16 / 9, 0.1, 100);
    camera.position.set(0, 0, 13.1);

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.className = "terrain-webgl";
    renderer.domElement.setAttribute("aria-hidden", "true");
    stage.appendChild(renderer.domElement);

    const world = new Group();
    scene.add(world);

    const pointer = new Vector2();
    const pointerTarget = new Vector2();
    const texture = new TextureLoader().load(
      TERRAIN_TEXTURE,
      loaded => {
        loaded.colorSpace = SRGBColorSpace;
        loaded.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        setReady(true);
      },
    );
    texture.colorSpace = SRGBColorSpace;

    const terrainUniforms = {
      terrainMap: { value: texture },
      time: { value: 0 },
      pointer: { value: pointer },
    };
    const terrain = new Mesh(
      new PlaneGeometry(16, 9, 112, 64),
      new ShaderMaterial({
        uniforms: terrainUniforms,
        vertexShader,
        fragmentShader,
      }),
    );
    terrain.position.z = -0.12;
    world.add(terrain);

    const routeDefinitions: Vector3[][] = [
      [
        new Vector3(-2.95, -4.35, 0.16),
        new Vector3(-2.3, -3.25, 0.19),
        new Vector3(-1.65, -1.75, 0.2),
        new Vector3(-0.65, -0.2, 0.21),
        new Vector3(0.05, 0.72, 0.2),
      ],
      [
        new Vector3(-8.2, -1.95, 0.15),
        new Vector3(-5.9, -1.25, 0.18),
        new Vector3(-3.25, -0.65, 0.2),
        new Vector3(-1.25, 0.1, 0.21),
        new Vector3(0.05, 0.72, 0.2),
      ],
      [
        new Vector3(8.2, -1.9, 0.15),
        new Vector3(5.85, -1.22, 0.18),
        new Vector3(3.15, -0.65, 0.2),
        new Vector3(1.35, 0.08, 0.21),
        new Vector3(0.05, 0.72, 0.2),
      ],
      [
        new Vector3(-0.1, 0.62, 0.2),
        new Vector3(0.62, 1.08, 0.19),
        new Vector3(0.37, 1.58, 0.17),
        new Vector3(0.08, 2.15, 0.14),
      ],
    ];

    const pulses: FieldPulse[] = [];
    const stations: StationRing[] = [];
    const routeMaterials: ShaderMaterial[] = [];

    routeDefinitions.forEach((points, routeIndex) => {
      const curve = new CatmullRomCurve3(points, false, "centripetal");
      const baseMaterial = new MeshBasicMaterial({
        color: MINERAL_GREEN,
        transparent: true,
        opacity: 0.42,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const baseRoute = new Mesh(
        new TubeGeometry(curve, 110, 0.018, 5, false),
        baseMaterial,
      );
      world.add(baseRoute);

      const animatedMaterial = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          speed: { value: 0.034 + routeIndex * 0.004 },
          offset: { value: routeIndex * 0.19 },
          color: { value: FIELD_GREEN },
        },
        vertexShader: routeVertexShader,
        fragmentShader: routeFragmentShader,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      routeMaterials.push(animatedMaterial);
      world.add(new Mesh(
        new TubeGeometry(curve, 110, 0.038, 7, false),
        animatedMaterial,
      ));

      for (let pulseIndex = 0; pulseIndex < 2; pulseIndex += 1) {
        const pulse = new Mesh(
          new SphereGeometry(0.032, 12, 12),
          new MeshBasicMaterial({
            color: FIELD_GREEN,
            transparent: true,
            opacity: 0.95,
            blending: AdditiveBlending,
            depthWrite: false,
          }),
        );
        world.add(pulse);
        pulses.push({
          curve,
          mesh: pulse,
          offset: routeIndex * 0.17 + pulseIndex * 0.5,
          speed: 0.042 + routeIndex * 0.004,
        });
      }

      [0.18, 0.42, 0.68, 0.88].forEach((position, stationIndex) => {
        const ring = new Mesh(
          new RingGeometry(0.022, 0.04, 24),
          new MeshBasicMaterial({
            color: FIELD_GREEN,
            transparent: true,
            opacity: 0.68,
            blending: AdditiveBlending,
            side: DoubleSide,
            depthWrite: false,
          }),
        );
        ring.position.copy(curve.getPointAt(position));
        ring.position.z += 0.035;
        world.add(ring);
        stations.push({ mesh: ring, offset: routeIndex * 0.8 + stationIndex * 0.45 });
      });
    });

    const particleCount = window.innerWidth < 720 ? 60 : 130;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const stride = index * 3;
      particlePositions[stride] = (Math.random() - 0.5) * 16;
      particlePositions[stride + 1] = -4.1 + Math.random() * 5.5;
      particlePositions[stride + 2] = 0.12 + Math.random() * 0.12;
    }
    const particleGeometry = new BufferGeometry();
    particleGeometry.setAttribute("position", new BufferAttribute(particlePositions, 3));
    const particleMaterial = new PointsMaterial({
      color: FIELD_GREEN,
      size: 0.012,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const particles = new Points(particleGeometry, particleMaterial);
    world.add(particles);

    let isVisible = true;
    let animationFrame = 0;
    let fieldTime = 0;
    let previousFrameTime = performance.now();
    const observer = new IntersectionObserver(
      entries => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.04 },
    );
    observer.observe(stage);

    const resize = () => {
      const width = Math.max(stage.clientWidth, 1);
      const height = Math.max(stage.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const viewportAspect = width / height;
      const imageAspect = 16 / 9;
      const coverScale = viewportAspect > imageAspect
        ? viewportAspect / imageAspect
        : imageAspect / viewportAspect;
      world.scale.setScalar(Math.max(1, coverScale));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        -(((event.clientY - rect.top) / rect.height - 0.5) * 2),
      );
    };
    const onPointerLeave = () => pointerTarget.set(0, 0);
    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave);

    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      if (!isVisible || document.hidden) return;

      const now = performance.now();
      const delta = Math.min((now - previousFrameTime) / 1000, 0.1);
      previousFrameTime = now;
      if (!reducedMotion && !pausedRef.current) fieldTime += delta;
      const time = fieldTime;
      pointer.lerp(pointerTarget, reducedMotion || pausedRef.current ? 0.03 : 0.055);
      terrainUniforms.time.value = time;

      camera.position.x = MathUtils.lerp(camera.position.x, pointer.x * 0.34, 0.035);
      camera.position.y = MathUtils.lerp(camera.position.y, pointer.y * 0.2, 0.035);
      camera.lookAt(pointer.x * 0.08, pointer.y * 0.04, 0);
      world.rotation.y = MathUtils.lerp(world.rotation.y, pointer.x * 0.018, 0.035);
      world.rotation.x = MathUtils.lerp(world.rotation.x, -pointer.y * 0.012, 0.035);

      routeMaterials.forEach(material => {
        material.uniforms.time.value = time;
      });
      pulses.forEach((pulse, index) => {
        const t = (time * pulse.speed + pulse.offset) % 1;
        pulse.mesh.position.copy(pulse.curve.getPointAt(t));
        const scale = 0.8 + Math.sin(time * 4 + index) * 0.2;
        pulse.mesh.scale.setScalar(scale);
      });
      stations.forEach((station, index) => {
        station.mesh.lookAt(camera.position);
        const scale = 0.82 + Math.sin(time * 2.4 + station.offset + index * 0.08) * 0.16;
        station.mesh.scale.setScalar(scale);
        station.mesh.material.opacity = 0.34 + Math.sin(time * 2 + station.offset) * 0.14;
      });
      const solarHeight = Math.sin(time * 0.0225 * Math.PI * 2);
      const nightPresence = MathUtils.clamp((-solarHeight + 0.1) / 1.1, 0, 1);
      particleMaterial.opacity = 0.24 + nightPresence * 0.28;
      particles.position.x = Math.sin(time * 0.06) * 0.07;
      particles.position.y = Math.sin(time * 0.045) * 0.025;
      particles.rotation.z = Math.sin(time * 0.025) * 0.004;

      renderer.render(scene, camera);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      resizeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse(object => {
        const renderable = object as Mesh | Points;
        if ("geometry" in renderable && renderable.geometry) renderable.geometry.dispose();
        if ("material" in renderable && renderable.material) disposeMaterial(renderable.material);
      });
      texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className={`hero-media terrain-stage ${ready ? "is-ready" : ""} ${paused ? "is-paused" : ""}`}
      ref={stageRef}
      aria-label="Interactive computational terrain model of the Old Glory Peak transect corridor"
    >
      <img
        className="terrain-fallback"
        src={TERRAIN_TEXTURE}
        alt="Dry San Jacinto ridgeline and Old Glory Peak terrain in warm sunlight with green computational survey paths"
        fetchPriority="high"
      />
      <div className="terrain-readout" aria-hidden="true">
        <span>TRANSECT C / SOLAR CYCLE</span>
        <i />
        <span>16 GPS STATIONS</span>
      </div>
      <button
        className="terrain-motion"
        type="button"
        onClick={() => setPaused(value => !value)}
        aria-pressed={paused}
        aria-label={paused ? "Resume terrain animation" : "Pause terrain animation"}
      >
        <i aria-hidden="true" />
        {paused ? "RESUME FIELD" : "PAUSE FIELD"}
      </button>
    </div>
  );
}
