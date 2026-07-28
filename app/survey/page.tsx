"use client";

import { useState } from "react";
import Link from "next/link";
import RouteNav from "../RouteNav";

const points = Array.from({length:15},(_,i)=>({
  id:`SP${String(i+1).padStart(3,"0")}`, x:8+((i*37)%84), y:10+((i*53)%78),
  lat:34.0300+i*.00235, lon:-116.0831+i*.00343, field:47600+((i*1739)%6500),
  note:["Granite outcrop","Dry wash baseline","Alluvial fan","Fault proximity","Possible aquifer indicator"][i%5]
}));
const method = [["01","Calibrate","Reference the instrument and verify GPS lock."],["02","Deploy","Establish a clear two-meter sensor zone."],["03","Record","Take three readings, images, and field notes."],["04","Upload","Tag, sync, and integrity-check each record."],["05","Verify","Compare, flag anomalies, and publish."]];

export default function SurveyPage(){
  const [selected,setSelected]=useState(points[2]);
  return <main className="subpage survey-page"><RouteNav />
    <header className="subhero"><span className="eyebrow">04 / FIELD SURVEY</span><h1>Magnetic<br /><em>anomaly survey.</em></h1><p>50 square miles · 200+ planned data points · An open-access ecological baseline.</p></header>
    <section className="survey-console">
      <div className="interactive-map" aria-label="Interactive sample survey map">
        <div className="map-rings">{Array.from({length:7},(_,i)=><i key={i} style={{inset:`${i*5+8}% ${i*4+7}%`}} />)}</div>
        {points.map(p=><button key={p.id} onClick={()=>setSelected(p)} className={selected.id===p.id?"active":""} style={{left:`${p.x}%`,top:`${p.y}%`,background:`hsl(${220-((p.field-47000)/8000)*215} 70% 55%)`}} aria-label={`${p.id}: ${p.field} nanotesla`}><span>{p.field.toLocaleString()} nT</span></button>)}
        <small>SAMPLE DATA — NOT REAL COORDINATES</small>
      </div>
      <aside key={selected.id}><span className="eyebrow">SELECTED STATION</span><h2>{selected.id}</h2><dl><dt>FIELD STRENGTH</dt><dd>{selected.field.toLocaleString()} nT</dd><dt>COORDINATES</dt><dd>{selected.lat.toFixed(4)}° N<br />{Math.abs(selected.lon).toFixed(4)}° W</dd><dt>FIELD NOTE</dt><dd>{selected.note}</dd></dl><div className="legend"><span>47K</span><i/><span>55K nT</span></div></aside>
    </section>
    <section className="equipment"><span className="eyebrow">FIELD KIT</span><div>{[["MAG","Smartphone magnetometer","Calibrated 1 Hz sampling"],["GPS","Positioning unit","WGS84 · ±3 m"],["IMG","Digital camera","Four cardinal views"],["LOG","Field notebook","Soil, weather, flora, impact"]].map(x=><article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>
    <section className="method"><span className="eyebrow">REPEATABLE METHODOLOGY</span><div>{method.map(m=><article key={m[0]}><b>{m[0]}</b><h3>{m[1]}</h3><p>{m[2]}</p></article>)}</div></section>
    <section className="open-data"><span>CC BY 4.0</span><div><span className="eyebrow">OPEN DATA PROMISE</span><h2>Collected here.<br />Useful everywhere.</h2><p>Coordinates, readings, methods, and contextual observations will be published under a Creative Commons Attribution license in accessible formats.</p></div></section>
    <Link href="/#budget" className="next-scene">NEXT: REVIEW THE BUDGET <span>→</span></Link>
  </main>
}
