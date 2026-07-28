"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const nav = [
  ["mission", "Mission"],
  ["dome", "Dome"],
  ["garden", "Garden"],
  ["survey", "Survey"],
  ["budget", "Budget"],
  ["roadmap", "Roadmap"],
  ["team", "Team"],
];

const gardenNodes = [
  { id: "north", x: 50, y: 18, title: "Herb Spiral North", meta: "Medicinals + culinary herbs", body: "A dry-to-moist microclimate gradient supports desert-adapted herbs with copper edging and gravity-fed drip irrigation." },
  { id: "east", x: 79, y: 70, title: "Pollinator Spiral", meta: "Flowers + nitrogen fixers", body: "A companion-planted bed extends bloom cycles, supports native pollinators, and restores nitrogen to depleted desert soil." },
  { id: "west", x: 21, y: 70, title: "Root Crop Spiral", meta: "Deep soil + shade", body: "A deeper soil profile grows roots beneath a seasonal shade frame, protecting moisture through the hottest months." },
  { id: "cistern", x: 50, y: 52, title: "Copper Cistern", meta: "1,000 gallon water hub", body: "The central reservoir gravity-feeds every bed. A copper resonator doubles as an instrumented field-study point." },
];

const budget = [
  ["Personnel", 45000, "#e9ff8b"],
  ["Equipment", 8000, "#9de5d0"],
  ["Sponsor fee", 7500, "#ef8c62"],
  ["Travel", 6000, "#d8c0ff"],
  ["Data + hosting", 4000, "#87b8d8"],
  ["Legal + insurance", 3500, "#f4cf79"],
  ["Contingency", 1000, "#a9a49a"],
] as const;

const milestones = [
  ["01", "MONTHS 1—3", "Map the baseline", "Fiscal sponsorship active · First 50 survey points · Public field log"],
  ["02", "MONTHS 4—6", "Build the system", "First grant · Dome fabrication · Garden earthworks · 150 survey points"],
  ["03", "MONTHS 7—12", "Run the experiment", "Full sensor network · First harvest · Open dataset · Annual report"],
  ["04", "MONTHS 13—18", "Share the method", "Second survey cycle · Workshop series · 501(c)(3) transition"],
];

function Dome() {
  const [rotation, setRotation] = useState({ x: -10, y: 15 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const points = useMemo(() => {
    const rings = [
      [0, 0, 132],
      [52, 0, 118],
      [92, 0, 82],
      [122, 0, 30],
    ];
    return rings.flatMap(([radius, , z], ri) => {
      const count = ri === 0 ? 1 : ri * 5;
      return Array.from({ length: count }, (_, i) => {
        const a = (Math.PI * 2 * i) / count + (ri % 2 ? 0 : Math.PI / count);
        return { x: Math.cos(a) * radius, y: -Math.sin(a) * radius, z, ring: ri, index: i };
      });
    });
  }, []);
  const edges = useMemo(() => {
    const out: [number, number][] = [];
    points.forEach((p, i) => {
      if (p.ring === 0) return;
      const ringStart = 1 + ((p.ring - 1) * p.ring * 5) / 2;
      out.push([i, ringStart + ((p.index + 1) % (p.ring * 5))]);
      const prevStart = p.ring === 1 ? 0 : 1 + ((p.ring - 2) * (p.ring - 1) * 5) / 2;
      out.push([i, prevStart + Math.floor(p.index * ((p.ring - 1) / p.ring))]);
    });
    return out;
  }, [points]);

  return (
    <div
      className="dome-stage"
      onPointerDown={(e) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (!dragging.current) return; const dx = e.clientX - last.current.x; const dy = e.clientY - last.current.y; last.current = { x: e.clientX, y: e.clientY }; setRotation(r => ({ x: Math.max(-35, Math.min(25, r.x - dy * .25)), y: r.y + dx * .35 })); }}
      onPointerUp={() => { dragging.current = false; }}
      aria-label="Interactive geodesic dome model. Drag to rotate."
    >
      <div className="dome-orbit" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
        <svg viewBox="-150 -145 300 300" role="img">
          {edges.map(([a, b], i) => <line key={i} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className={i % 3 === 0 ? "strut hot" : "strut"} />)}
          {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" className="joint" />)}
        </svg>
      </div>
      <span className="drag-note">DRAG TO ROTATE</span>
      <span className="axis x-axis">X</span><span className="axis y-axis">Y</span>
    </div>
  );
}

function Garden() {
  const [selected, setSelected] = useState(gardenNodes[3]);
  return (
    <div className="garden-grid">
      <div className="garden-map">
        <div className="garden-lines" />
        {gardenNodes.map(n => (
          <button key={n.id} className={`garden-node ${selected.id === n.id ? "active" : ""}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => setSelected(n)} aria-label={`Explore ${n.title}`}>
            <span>{n.id === "cistern" ? "H₂O" : "✦"}</span>
          </button>
        ))}
        <span className="map-label">1 ACRE PILOT / NOT TO SCALE</span>
      </div>
      <div className="garden-detail" key={selected.id}>
        <span className="eyebrow">SELECTED FIELD NODE</span>
        <h3>{selected.title}</h3>
        <p className="detail-meta">{selected.meta}</p>
        <p>{selected.body}</p>
        <div className="dual">
          <span><b>AG /</b> food, habitat, water</span>
          <span><b>LAB /</b> soil, sound, field data</span>
        </div>
      </div>
    </div>
  );
}

export default function FoundationExperience() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("mission");
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -50, y: -50, ring: false });
  useEffect(() => {
    const observer = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-35% 0px -55%" });
    nav.forEach(([id]) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 1200);
    const scroll = () => setProgress(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    const move = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY, ring: !!(e.target as Element)?.closest("a,button") });
    const keys = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const index = nav.findIndex(([id]) => id === active);
      const next = e.key === "ArrowRight" ? Math.min(nav.length - 1, index + 1) : Math.max(0, index - 1);
      document.getElementById(nav[next][0])?.scrollIntoView();
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("mousemove", move);
    window.addEventListener("keydown", keys);
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", scroll); window.removeEventListener("mousemove", move); window.removeEventListener("keydown", keys); };
  }, [active]);

  return (
    <main>
      <div className={`loader ${loaded ? "gone" : ""}`} aria-hidden="true"><i /><span>WHOLE BODY FOUNDATION</span></div>
      <div className={`custom-cursor ${cursor.ring ? "ring" : ""}`} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden="true" />
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <nav className="topnav">
        <a href="#top" className="brand"><span>W/B</span> WHOLE BODY FOUNDATION</a>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu}>MENU <i>{menu ? "×" : "+"}</i></button>
        <div className={`navlinks ${menu ? "open" : ""}`}>
          {nav.map(([id, label], i) => <a key={id} href={id === "mission" ? "/vision" : id === "survey" ? "/survey" : id === "team" ? "/team" : `#${id}`} onClick={() => setMenu(false)} className={active === id ? "active" : ""}><small>0{i + 1}</small>{label}</a>)}
          <a href="/contact"><small>08</small>Contact</a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-copy">
          <span className="eyebrow reveal">MOJAVE DESERT / 34.969° N, 116.419° W</span>
          <h1><span>FIELDWORK</span><br />FOR A LIVING<br /><em>PLANET.</em></h1>
          <p>A community research station mapping the unseen forces that shape desert ecology—and testing practical systems for life in a hotter, drier world.</p>
          <a href="#mission" className="cta">ENTER THE FIELD <span>↓</span></a>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <div className="sun"><i /><i /><i /></div>
          <span>WHOLE / BODY</span>
        </div>
        <div className="hero-stats">
          <div><strong>50</strong><span>SQUARE MILES</span></div>
          <div><strong>200+</strong><span>SURVEY POINTS</span></div>
          <div><strong>01</strong><span>LIVING LAB</span></div>
        </div>
      </header>

      <section id="mission" className="section mission">
        <div className="section-number">01 / MISSION</div>
        <div className="mission-lead">
          <span className="eyebrow">THE PREMISE</span>
          <h2>The desert is not empty.<br />It is <em>information-dense.</em></h2>
        </div>
        <div className="mission-copy">
          <p>We’re building a baseline ecological record where geomagnetic mapping, soil observation, acoustic research, and dryland agriculture meet.</p>
          <p>This is public-interest field science: measurable, repeatable, and shared openly with the people who steward the land.</p>
        </div>
        <div className="pillars">
          {[
            ["01", "MAP", "GPS-tagged magnetic readings reveal patterns across 50 square miles of the Mojave."],
            ["02", "BUILD", "A metal-free dome and one-acre garden turn a remote site into a working laboratory."],
            ["03", "SHARE", "Field notes, datasets, and build methods stay open for land managers and communities."],
          ].map(p => <article key={p[0]}><span>{p[0]}</span><h3>{p[1]}</h3><p>{p[2]}</p></article>)}
        </div>
      </section>

      <section id="dome" className="section dome-section">
        <div className="section-number light">02 / INSTRUMENT</div>
        <div className="section-head light">
          <div><span className="eyebrow">ACOUSTIC + FIELD RESEARCH</span><h2>A room with<br />no interference.</h2></div>
          <p>Ten feet across. Sixty-five Douglas fir struts. Zero metal fasteners. The 2V geodesic dome creates a controlled acoustic space without distorting electromagnetic readings.</p>
        </div>
        <div className="dome-layout">
          <Dome />
          <aside>
            <span className="eyebrow">BUILD SPEC / 2V</span>
            {[["DIAMETER", "10 FT"], ["A STRUTS", "35 × 54.75″"], ["B STRUTS", "30 × 56.25″"], ["JOINERY", "DOWEL + HIDE GLUE"], ["METAL", "0"]].map(r => <div className="spec" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}
            <p>Designed as a replicable prototype for natural-material research structures.</p>
          </aside>
        </div>
      </section>

      <section id="garden" className="section garden-section">
        <div className="section-number">03 / LIVING SYSTEM</div>
        <div className="section-head">
          <div><span className="eyebrow">TETRAHEDRON GARDEN</span><h2>Grow food.<br />Measure everything.</h2></div>
          <p>Three productive spirals orbit one water hub. Each element performs twice: sustaining a crop while collecting evidence about desert growing systems.</p>
        </div>
        <Garden />
        <div className="metric-row">
          <div><strong>90%</strong><span>LESS WATER*</span></div><div><strong>3×</strong><span>PLANTING DENSITY*</span></div><div><strong>12</strong><span>MICROCLIMATES</span></div>
          <small>* Pilot targets to be validated during the first growing cycle.</small>
        </div>
      </section>

      <section id="survey" className="section survey-section">
        <div className="section-number light">04 / FIELD SURVEY</div>
        <div className="survey-map">
          <div className="contours">{Array.from({length: 11}, (_, i) => <i key={i} style={{ inset: `${i * 3.7 + 8}% ${i * 4.3 + 7}%`, transform: `rotate(${i * 7 - 28}deg)` }} />)}</div>
          {Array.from({length: 38}, (_, i) => <b key={i} style={{ left: `${8 + ((i * 37) % 84)}%`, top: `${9 + ((i * 53) % 76)}%`, animationDelay: `${(i % 8) * .14}s` }} />)}
          <div className="map-callout"><span>ANOMALY CLUSTER 07</span><strong>+184 nT</strong><small>34.9678° / −116.4012°</small></div>
        </div>
        <div className="survey-copy">
          <span className="eyebrow">OPEN-ACCESS BASELINE</span>
          <h2>Make the invisible<br />legible.</h2>
          <p>A repeatable grid of GPS-tagged magnetometer readings creates a long-term baseline for change. Every observation links field strength to soil, sound, weather, and land use.</p>
          <div className="data-sample"><span>POINT 0192</span><b>47,382 nT</b><small>LAT 34.9691 / LON −116.4194 / ±3.2m</small></div>
        </div>
      </section>

      <section id="budget" className="section budget-section">
        <div className="section-number">05 / RESOURCES</div>
        <div className="budget-head"><div><span className="eyebrow">YEAR ONE</span><h2>$75,000</h2></div><p>A lean first year funds people before objects: field collection, data stewardship, construction, insurance, and public documentation.</p></div>
        <div className="budget-table">
          {budget.map(([name, amount, color], i) => <div key={name} className="budget-row"><span className="rank">0{i + 1}</span><span>{name}</span><div className="budget-bar"><i style={{ width: `${(amount / 45000) * 100}%`, background: color }} /></div><b>${amount.toLocaleString()}</b></div>)}
        </div>
        <div className="funding"><span>PROPOSED FUNDING MIX</span><p>California climate investment <b>$50K</b> · Foundation grants <b>$15K</b> · Community + workshops <b>$10K</b></p></div>
      </section>

      <section id="roadmap" className="section roadmap-section">
        <div className="section-number light">06 / ROADMAP</div>
        <div className="section-head light"><div><span className="eyebrow">18 MONTHS</span><h2>From first point<br />to public method.</h2></div><p>A staged path that makes early work useful immediately, then adds infrastructure as evidence and support grow.</p></div>
        <div className="timeline">
          {milestones.map(m => <article key={m[0]}><span className="milestone">{m[0]}</span><small>{m[1]}</small><h3>{m[2]}</h3><p>{m[3]}</p></article>)}
        </div>
      </section>

      <section id="team" className="section team-section">
        <div className="section-number">07 / PEOPLE</div>
        <div className="section-head">
          <div><span className="eyebrow">WHO WE ARE</span><h2>Built in public.<br />Led from the field.</h2></div>
          <p>Whole Body Foundation is assembling a practical, interdisciplinary team around a simple standard: observe deeply, document honestly, and build only what the land can support.</p>
        </div>
        <div className="team-grid">
          <article className="lead-card">
            <div className="portrait-placeholder"><span>JG</span><small>PORTRAIT FORTHCOMING</small></div>
            <div><span className="eyebrow">PROJECT LEAD</span><h3>Jesse Gawlik</h3><p>Founder and field lead coordinating the foundation’s ecological research, site systems, public documentation, and community partnerships in the Mojave.</p><a href="mailto:jesse@wholebody.foundation">JESSE@WHOLEBODY.FOUNDATION ↗</a></div>
          </article>
          <div className="advisor-grid">
            {["Environmental Scientist","Permaculture Designer","Legal / Compliance Advisor"].map((role, i) => <article key={role}><span>0{i + 1}</span><small>SEEKING</small><h3>{role}</h3><p>Advisor role open for a mission-aligned practitioner.</p></article>)}
          </div>
        </div>
      </section>

      <footer>
        <div><span className="eyebrow">WHOLE BODY FOUNDATION</span><h2>Help build the<br /><em>baseline.</em></h2></div>
        <div className="footer-side"><p>For funders, field partners, researchers, and people who believe careful observation is an act of stewardship.</p><a href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Inquiry">FOR GRANT INQUIRIES ↗</a><address>Morongo Valley, California<br />Mailing address available on request</address></div>
        <small>MOJAVE DESERT · COMMUNITY SCIENCE · ECOLOGICAL RESILIENCE</small>
      </footer>
    </main>
  );
}
