"use client";

import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { MultiPolygon, Topology } from "topojson-specification";
import landTopologyData from "world-atlas/land-50m.json";

type GeoPoint = [number, number];

const LAND_TOPOLOGY = landTopologyData as unknown as Topology<{ land: MultiPolygon }>;
const REAL_LAND = feature(LAND_TOPOLOGY, LAND_TOPOLOGY.objects.land);
const GRATICULE = geoGraticule10();

const CLOUDS: GeoPoint[][] = [
  [[-150,38],[-118,43],[-86,38],[-55,42],[-28,38]],
  [[12,6],[39,10],[67,7],[94,12],[124,8]],
  [[-82,-23],[-53,-18],[-25,-24],[2,-19]],
  [[78,52],[106,49],[136,54],[160,50]],
];

const FIELD_NODES: GeoPoint[] = [
  [-118, 35], [-74, 41], [-46, -15], [2, 48], [31, -2], [78, 22], [121, 31], [151, -33],
];

const CUBE_VERTICES: [number, number, number][] = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],
];

const CUBE_EDGES: [number, number][] = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7],
];

function project(lon: number, lat: number, rotation: number, cx: number, cy: number, radius: number) {
  const lambda = (lon * Math.PI) / 180 + rotation;
  const phi = (lat * Math.PI) / 180;
  const z = Math.cos(phi) * Math.cos(lambda);
  return {
    x: cx + radius * Math.cos(phi) * Math.sin(lambda),
    y: cy - radius * Math.sin(phi),
    z,
  };
}

export default function EarthCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const start = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = scene.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const traceGeoLine = (
      points: GeoPoint[],
      rotation: number,
      cx: number,
      cy: number,
      radius: number,
      close = false,
    ) => {
      context.beginPath();
      let drawing = false;
      for (const [lon, lat] of points) {
        const point = project(lon, lat, rotation, cx, cy, radius);
        if (point.z <= 0.015) {
          drawing = false;
          continue;
        }
        if (!drawing) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
        drawing = true;
      }
      if (close && drawing) context.closePath();
    };

    const draw = (now: number) => {
      const cx = width / 2 + pointer.current.x * 7;
      const cy = height / 2 + pointer.current.y * 5;
      const radius = Math.min(width, height) * 0.305;
      const rotation = reduceMotion ? -0.55 : -0.55 + (now - start) * 0.000035;
      const pulse = reduceMotion ? 0 : Math.sin((now - start) * 0.0014);
      const elapsed = now - start;
      context.clearRect(0, 0, width, height);

      const cubeAngleY = reduceMotion ? 0.58 : elapsed * 0.00016 + pointer.current.x * 0.42;
      const cubeAngleX = reduceMotion ? -0.32 : -0.32 + Math.sin(elapsed * 0.00012) * 0.2 - pointer.current.y * 0.32;
      const cubeAngleZ = reduceMotion ? 0.05 : Math.sin(elapsed * 0.00009) * 0.11;
      const cubeScale = radius * 1.24;
      const focalLength = radius * 5.4;
      const cubePoints = CUBE_VERTICES.map(([x, y, z]) => {
        const y1 = y * Math.cos(cubeAngleX) - z * Math.sin(cubeAngleX);
        const z1 = y * Math.sin(cubeAngleX) + z * Math.cos(cubeAngleX);
        const x2 = x * Math.cos(cubeAngleY) + z1 * Math.sin(cubeAngleY);
        const z2 = -x * Math.sin(cubeAngleY) + z1 * Math.cos(cubeAngleY);
        const x3 = x2 * Math.cos(cubeAngleZ) - y1 * Math.sin(cubeAngleZ);
        const y3 = x2 * Math.sin(cubeAngleZ) + y1 * Math.cos(cubeAngleZ);
        const perspective = focalLength / (focalLength - z2 * cubeScale);
        return {
          x: cx + x3 * cubeScale * perspective,
          y: cy + y3 * cubeScale * perspective,
          z: z2,
          perspective,
        };
      });

      const drawCubeLayer = (front: boolean) => {
        for (const [from, to] of CUBE_EDGES) {
          const a = cubePoints[from];
          const b = cubePoints[to];
          const averageDepth = (a.z + b.z) / 2;
          if ((averageDepth > 0) !== front) continue;
          const edgeGlow = context.createLinearGradient(a.x, a.y, b.x, b.y);
          if (front) {
            edgeGlow.addColorStop(0, "rgba(132,166,110,.9)");
            edgeGlow.addColorStop(0.5, "rgba(215,208,189,.7)");
            edgeGlow.addColorStop(1, "rgba(184,115,51,.88)");
            context.shadowColor = "rgba(132,166,110,.35)";
            context.shadowBlur = 8;
            context.lineWidth = 1.35;
            context.setLineDash([]);
          } else {
            edgeGlow.addColorStop(0, "rgba(132,166,110,.2)");
            edgeGlow.addColorStop(1, "rgba(184,115,51,.13)");
            context.shadowBlur = 0;
            context.lineWidth = 0.75;
            context.setLineDash([3, 6]);
          }
          context.strokeStyle = edgeGlow;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
        context.setLineDash([]);
        context.shadowBlur = 0;
        if (front) {
          for (const point of cubePoints.filter((item) => item.z > 0)) {
            context.fillStyle = "rgba(215,208,189,.9)";
            context.beginPath();
            context.arc(point.x, point.y, 1.6 * point.perspective, 0, Math.PI * 2);
            context.fill();
          }
        }
      };

      drawCubeLayer(false);

      const outerGlow = context.createRadialGradient(cx, cy, radius * 0.65, cx, cy, radius * 1.5);
      outerGlow.addColorStop(0, `rgba(132,166,110,${0.18 + pulse * 0.025})`);
      outerGlow.addColorStop(0.55, "rgba(132,166,110,.055)");
      outerGlow.addColorStop(1, "rgba(132,166,110,0)");
      context.fillStyle = outerGlow;
      context.beginPath();
      context.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.clip();

      const ocean = context.createRadialGradient(cx - radius * 0.32, cy - radius * 0.36, radius * 0.06, cx, cy, radius * 1.08);
      ocean.addColorStop(0, "#315b59");
      ocean.addColorStop(0.38, "#173937");
      ocean.addColorStop(0.76, "#0b201d");
      ocean.addColorStop(1, "#030806");
      context.fillStyle = ocean;
      context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      const earthProjection = geoOrthographic()
        .translate([cx, cy])
        .scale(radius)
        .clipAngle(90)
        .precision(0.35)
        .rotate([(rotation * 180) / Math.PI, -3, 0]);
      const earthPath = geoPath(earthProjection, context);

      context.beginPath();
      earthPath(GRATICULE);
      context.strokeStyle = "rgba(215,208,189,.11)";
      context.lineWidth = 0.65;
      context.stroke();

      const landLight = context.createLinearGradient(
        cx - radius * 0.75,
        cy - radius,
        cx + radius * 0.85,
        cy + radius,
      );
      landLight.addColorStop(0, "rgba(174,194,150,.94)");
      landLight.addColorStop(0.42, "rgba(112,146,91,.92)");
      landLight.addColorStop(1, "rgba(47,75,53,.96)");
      context.beginPath();
      earthPath(REAL_LAND);
      context.fillStyle = landLight;
      context.fill();
      context.strokeStyle = "rgba(215,208,189,.38)";
      context.lineWidth = 0.58;
      context.lineJoin = "round";
      context.stroke();

      for (const cloud of CLOUDS) {
        traceGeoLine(cloud, rotation * 1.12, cx, cy, radius);
        context.strokeStyle = "rgba(237,237,237,.24)";
        context.lineWidth = 4;
        context.lineCap = "round";
        context.stroke();
      }

      const visibleNodes = FIELD_NODES
        .map(([lon, lat]) => project(lon, lat, rotation, cx, cy, radius))
        .filter((point) => point.z > 0.08);
      context.strokeStyle = "rgba(184,115,51,.2)";
      context.lineWidth = 0.7;
      for (let i = 1; i < visibleNodes.length; i++) {
        context.beginPath();
        context.moveTo(visibleNodes[i - 1].x, visibleNodes[i - 1].y);
        context.quadraticCurveTo(cx, cy - radius * 0.22, visibleNodes[i].x, visibleNodes[i].y);
        context.stroke();
      }
      for (let i = 0; i < visibleNodes.length; i++) {
        const point = visibleNodes[i];
        const nodePulse = 2.2 + Math.sin((now - start) * 0.002 + i) * 0.8;
        context.fillStyle = "rgba(215,208,189,.88)";
        context.beginPath();
        context.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "rgba(132,166,110,.48)";
        context.beginPath();
        context.arc(point.x, point.y, nodePulse, 0, Math.PI * 2);
        context.stroke();
      }

      const night = context.createLinearGradient(cx - radius, cy, cx + radius, cy);
      night.addColorStop(0, "rgba(0,0,0,0)");
      night.addColorStop(0.57, "rgba(0,0,0,.06)");
      night.addColorStop(1, "rgba(0,0,0,.78)");
      context.fillStyle = night;
      context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      context.restore();

      context.strokeStyle = "rgba(132,166,110,.75)";
      context.lineWidth = 1.2;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = "rgba(215,208,189,.18)";
      context.lineWidth = 0.7;
      context.beginPath();
      context.arc(cx, cy, radius + 5, 0, Math.PI * 2);
      context.stroke();

      context.save();
      context.translate(cx, cy);
      context.rotate(-0.18);
      context.scale(1, 0.32);
      context.strokeStyle = "rgba(184,115,51,.22)";
      context.lineWidth = 0.8;
      context.setLineDash([4, 8]);
      context.beginPath();
      context.arc(0, 0, radius * 1.28, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
      context.restore();

      drawCubeLayer(true);

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(start);
    });
    observer.observe(scene);
    resize();
    frame = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="earth-cube-scene"
      role="img"
      aria-label="A smoothly rotating Earth suspended inside a dimensional wireframe cube"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        };
        event.currentTarget.style.setProperty("--earth-tilt-y", `${pointer.current.x * 8}deg`);
        event.currentTarget.style.setProperty("--earth-tilt-x", `${pointer.current.y * -8}deg`);
      }}
      onPointerLeave={(event) => {
        pointer.current = { x: 0, y: 0 };
        event.currentTarget.style.setProperty("--earth-tilt-y", "0deg");
        event.currentTarget.style.setProperty("--earth-tilt-x", "0deg");
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="earth-field" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} style={{ "--particle-index": index } as React.CSSProperties} />
        ))}
      </div>
      <span className="earth-readout earth-readout-top">ORBITAL BODY / 03</span>
      <span className="earth-readout earth-readout-bottom">EARTH · LIVE ROTATION</span>
    </div>
  );
}
