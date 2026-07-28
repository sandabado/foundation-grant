"use client";

import { useEffect, useRef } from "react";

type GeoPoint = [number, number];

const LAND: GeoPoint[][] = [
  [[-168,72],[-145,69],[-127,55],[-123,42],[-112,31],[-98,20],[-83,25],[-80,31],[-66,45],[-58,52],[-72,62],[-92,72],[-118,76],[-145,73]],
  [[-82,12],[-73,9],[-62,5],[-50,-3],[-47,-17],[-58,-35],[-67,-55],[-74,-42],[-79,-18],[-82,0]],
  [[-17,36],[-5,37],[12,33],[32,30],[44,12],[50,-12],[35,-34],[18,-35],[8,-25],[-2,-5],[-12,12]],
  [[-11,36],[5,44],[22,55],[42,60],[63,70],[92,76],[125,69],[151,59],[166,48],[142,35],[121,23],[104,7],[81,9],[68,22],[51,28],[38,40],[23,39],[12,34]],
  [[112,-11],[132,-12],[153,-24],[147,-39],[126,-43],[113,-28]],
  [[-52,60],[-42,72],[-28,82],[-48,84],[-62,76]],
  [[43,-13],[51,-16],[50,-25],[45,-25]],
];

const CLOUDS: GeoPoint[][] = [
  [[-150,38],[-118,43],[-86,38],[-55,42],[-28,38]],
  [[12,6],[39,10],[67,7],[94,12],[124,8]],
  [[-82,-23],[-53,-18],[-25,-24],[2,-19]],
  [[78,52],[106,49],[136,54],[160,50]],
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
    let start = performance.now();
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
      context.clearRect(0, 0, width, height);

      const outerGlow = context.createRadialGradient(cx, cy, radius * 0.65, cx, cy, radius * 1.5);
      outerGlow.addColorStop(0, "rgba(132,166,110,.18)");
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

      context.strokeStyle = "rgba(215,208,189,.11)";
      context.lineWidth = 0.65;
      for (let lat = -60; lat <= 60; lat += 20) {
        const points: GeoPoint[] = [];
        for (let lon = -180; lon <= 180; lon += 3) points.push([lon, lat]);
        traceGeoLine(points, rotation, cx, cy, radius);
        context.stroke();
      }
      for (let lon = -180; lon < 180; lon += 20) {
        const points: GeoPoint[] = [];
        for (let lat = -88; lat <= 88; lat += 3) points.push([lon, lat]);
        traceGeoLine(points, rotation, cx, cy, radius);
        context.stroke();
      }

      for (const continent of LAND) {
        traceGeoLine(continent, rotation, cx, cy, radius, true);
        context.fillStyle = "rgba(132,166,110,.82)";
        context.fill();
        context.strokeStyle = "rgba(201,162,39,.68)";
        context.lineWidth = 1;
        context.stroke();
      }

      for (const cloud of CLOUDS) {
        traceGeoLine(cloud, rotation * 1.12, cx, cy, radius);
        context.strokeStyle = "rgba(237,237,237,.24)";
        context.lineWidth = 4;
        context.lineCap = "round";
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
      <div className="cube-wire" aria-hidden="true">
        <i className="cube-face cube-front" />
        <i className="cube-face cube-back" />
        <i className="cube-face cube-left" />
        <i className="cube-face cube-right" />
        <i className="cube-face cube-top" />
        <i className="cube-face cube-bottom" />
      </div>
      <span className="earth-readout earth-readout-top">ORBITAL BODY / 03</span>
      <span className="earth-readout earth-readout-bottom">EARTH · LIVE ROTATION</span>
    </div>
  );
}
