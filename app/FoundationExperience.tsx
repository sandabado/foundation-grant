"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InteractiveTerrain from "./InteractiveTerrain";

const TetrahedronGarden = dynamic(() => import("./TetrahedronGarden"), {
  ssr: false,
  loading: () => (
    <div
      className="tet-garden-viewer tet-garden-loading"
      aria-label="Loading the interactive Tetrahedron Garden"
    >
      <span>ASSEMBLING THE FIELD MODEL</span>
    </div>
  ),
});

const FieldDome = dynamic(() => import("./FieldDome"), {
  ssr: false,
  loading: () => (
    <div className="field-dome-viewer dome-model-loading" aria-label="Loading the interactive field dome">
      <span>ASSEMBLING THE DOME MODEL</span>
    </div>
  ),
});

const nav = [
  ["mission", "Mission"],
  ["map", "Map"],
  ["build", "Build"],
  ["method", "Method"],
  ["phases", "Phases"],
  ["budget", "Budget"],
  ["library", "Library"],
  ["public", "Public"],
];

const budget = [
  ["California climate investment", 50000, "#84a66e"],
  ["Foundation grants", 15000, "#b87333"],
  ["Community + workshops", 10000, "#d7d0bd"],
] as const;

const milestones = [
  ["01", "NOW – DEC 2026", "Phase 1", "Fiscal sponsorship active · First 50 GPS-tagged survey points across the Old Glory Peak ridge transect · Public field log on OSF · Magnetometer transects A–D complete · Mineral identification catalog published"],
  ["02", "JAN 2027 – JUN 2027", "Phase 2", "First grant awarded · Dome fabrication at the Old Glory Peak site · Garden earthworks complete · 150 survey points collected · Water quality baseline established · Moss patch monitoring stations installed · Camera trap network operational · Offline field computer operational"],
  ["03", "JUL 2027 +", "Phase 3", "Full sensor network deployed · IRB-approved psychophysiology protocol active · First harvest from the Old Glory Peak garden · Annual open dataset published (geology + biology + psychology) · Alpha Node vs. Control Node comparison begins"],
  ["04", "YEAR 2 +", "Phase 4", "Second survey cycle across the San Gorgonio–San Jacinto corridor · Workshop series for land managers · 501(c)(3) transition · Replication protocol published · Peer-reviewed manuscript submitted"],
];

const methods = [
  {
    number: "01",
    title: "Environmental geophysics",
    body: "Smartphone magnetometer transects calibrated against USGS aeromagnetic data. Four survey lines crossing the Old Glory Peak ridge: Transect A (Pinto Fault Crossing), Transect B (Morongo Valley Fault Crossing), Transect C (Old Glory Peak Ridge Crest), Transect D (Mine Area Grid near historical adits). Rock sampling with standard field methods: Mohs hardness, streak plate, HCl reaction, magnetic susceptibility. Water quality testing: ORP, pH, heavy metals, mineral content.",
  },
  {
    number: "02",
    title: "Community psychophysiology",
    body: "Polar H10 chest straps for 5-minute RMSSD recordings (3× weekly). Salivary cortisol via Salivette tubes (morning/evening, monthly). Quasi-experimental design with matched control community. Repeated-measures ANOVA, Bonferroni-corrected for six supplementary outcomes. IRB-approved. Pre-registered on OSF before data collection.",
  },
  {
    number: "03",
    title: "Network & systems science",
    body: "Decision latency analysis from governance meeting timestamps. Local economic velocity tracking. Fractal scaling analysis of community network structures.",
  },
];

const documents = [
  { type: "PDF", title: "Investor One-Pager", description: "The opportunity, four-phase campus plan, research model, current status, and funding requirements in one concise planning brief.", href: "/documents/investor-one-pager.pdf" },
  { type: "PDF", title: "Project Summary", description: "Mission, research questions, methods, Old Glory Peak site justification, budget, and timeline.", href: "/documents/project-summary.pdf" },
  { type: "PDF", title: "Magnetometer Survey Protocol", description: "Transect A–D design, including the Old Glory Peak ridge survey, station log template, quality control checklist, data export format, and field safety protocols.", href: "/documents/magnetometer-survey-protocol.pdf" },
  { type: "PDF", title: "BIO-001 Psychophysiology Protocol", description: "HRV measurement specifications, cortisol assay protocol, control node matching criteria, statistical analysis plan, and Bonferroni correction.", href: "/documents/bio-001-psychophysiology-protocol.pdf" },
  { type: "PDF", title: "Phase 1 Action Plan", description: "Week-by-week implementation: legal setup, equipment acquisition, Old Glory Peak field survey execution, and grant submissions.", href: "/documents/phase-1-action-plan.pdf" },
  { type: "PDF", title: "Annual Budget Breakdown", description: "Line-item budget with justification: personnel, data stewardship, construction, field collection, documentation, and contingency.", href: "/documents/annual-budget-breakdown.pdf" },
  { type: "PDF", title: "Informed Consent Template", description: "IRB-ready consent form for HRV and cortisol study participants.", href: "/documents/informed-consent-template.pdf" },
  { type: "CSV", title: "Open Dataset — Survey Points", description: "GPS coordinates, magnetometer readings, lithology, mineral identification, and Old Glory Peak transect identifiers. Published when field data is available.", href: null },
];

function Garden() {
  return <TetrahedronGarden />;
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
          {nav.map(([id, label], i) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)} className={active === id ? "active" : ""}><small>0{i + 1}</small>{label}</a>)}
        </div>
      </nav>

      <header className="hero" id="top">
        <InteractiveTerrain />
        <div className="hero-scrim" />
        <div className="hero-grid" />
        <div className="hero-copy">
          <span className="eyebrow reveal">MOJAVE FIELD RESEARCH / 34.969° N, 116.419° W</span>
          <h1><span>FIELDWORK</span><br />FOR A LIVING<br /><em>PLANET.</em></h1>
          <span className="hero-location">OLD GLORY PEAK TRANSECT CORRIDOR</span>
          <p>Mapping where the Pinto Mountain and Morongo Valley fault traces intersect between the San Gorgonio and San Jacinto fault zones.</p>
          <div className="hero-actions" aria-label="Explore the fieldwork">
            <a href="#map">MAP</a>
            <a href="#build">BUILD</a>
            <a href="#library">SHARE</a>
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>50</strong><span>SQUARE MILES</span></div>
          <div><strong>04</strong><span>FAULT TRANSECTS</span></div>
          <div><strong>CC</strong><span>BY OPEN DATA</span></div>
        </div>
      </header>

      <section id="mission" className="section mission">
        <div className="section-number">01 / THE PREMISE</div>
        <div className="mission-lead">
          <span className="eyebrow">PUBLIC-INTEREST FIELD SCIENCE</span>
          <h2>The desert is not empty.<br />It is <em>information-dense.</em></h2>
        </div>
        <div className="mission-copy">
          <p>We’re building a baseline ecological record where geomagnetic mapping, mineral identification, water quality testing, and dryland agriculture meet at the Old Glory Peak field station.</p>
          <p>This is public-interest field science: measurable, repeatable, and shared openly with the people who steward the land.</p>
        </div>
        <div className="pillars">
          {[
            ["01", "MAP", "Link GPS-tagged field strength to lithology, mineral assemblage, and photographic documentation."],
            ["02", "BUILD", "Test natural-material structures, desert agriculture, water systems, and offline field computing."],
            ["03", "SHARE", "Pre-register hypotheses, publish negative results, and release data under a CC-BY license."],
          ].map(p => <article key={p[0]}><span>{p[0]}</span><h3>{p[1]}</h3><p>{p[2]}</p></article>)}
        </div>
      </section>

      <section id="map" className="section survey-section">
        <div className="section-number light">02 / MAP THE BASELINE</div>
        <div className="survey-map">
          <div className="contours">{Array.from({length: 11}, (_, i) => <i key={i} style={{ inset: `${i * 3.7 + 8}% ${i * 4.3 + 7}%`, transform: `rotate(${i * 7 - 28}deg)` }} />)}</div>
          {Array.from({length: 38}, (_, i) => <b key={i} style={{ left: `${8 + ((i * 37) % 84)}%`, top: `${9 + ((i * 53) % 76)}%`, animationDelay: `${(i % 8) * .14}s` }} />)}
          <div className="map-callout"><span>ANOMALY CLUSTER 07</span><strong>+184 nT</strong><small>34.9678° / −116.4012°</small></div>
        </div>
        <div className="survey-copy">
          <span className="eyebrow">OPEN-ACCESS BASELINE</span>
          <h2>Make the invisible<br />legible.</h2>
          <p>A repeatable grid of GPS-tagged magnetometer readings creates a long-term baseline for geological change across the Old Glory Peak transect corridor — spanning the Pinto Mountain Fault (northern boundary of DWR Basin 7-20), the Morongo Valley Fault (documented “rising water and marshy conditions”), and the Emerson Fault / 1992 Landers rupture zone.</p>
          <p>Four transects cross these fault lines, including a dedicated high-resolution grid along the Old Glory Peak ridge itself. The peak sits directly between the San Gorgonio and San Jacinto fault zones — making it a natural laboratory for studying how hydrothermal processes and crustal stress interact.</p>
          <p>Historical gold mining in the Morongo District (1890s–1940s, including the Morongo King Mine with a 10-stamp mill producing $400 in gold on its first day) confirms mineralized quartz vein systems along these structures.</p>
          <p>Every station links field strength to lithology, mineral assemblage, and photographic documentation. Every dataset is published on the Open Science Framework under a CC-BY license before analysis begins.</p>
          <div className="research-standard">
            <span>THE STANDARD</span>
            <p>We pre-register our hypotheses. We publish negative results.</p>
            <strong>Every claim backed by a mechanism.<br />Every measurement tied to a GPS coordinate.</strong>
          </div>
        </div>
      </section>

      <section id="build" className="section dome-section">
        <div className="section-number light">03 / BUILD THE INSTRUMENT</div>
        <div className="section-head light">
          <div><span className="eyebrow">ACOUSTIC + FIELD RESEARCH</span><h2>A room with<br />no interference.</h2></div>
          <div className="section-copy">
            <p>Ten feet across. Sixty-five Douglas fir struts. Zero metal fasteners. The 2V geodesic dome creates a controlled acoustic space without distorting electromagnetic readings — a replicable prototype for natural-material research structures.</p>
            <p>Located on the Old Glory Peak ridge transect corridor, the dome serves as the central field station for all survey operations.</p>
          </div>
        </div>
        <div className="dome-layout">
          <FieldDome />
          <aside>
            <span className="eyebrow">BUILD SPEC / 2V</span>
            {[["DIAMETER", "10 FT"], ["A STRUTS", "35 × 54.75″"], ["B STRUTS", "30 × 56.25″"], ["JOINERY", "DOWEL + HIDE GLUE"], ["METAL", "0"]].map(r => <div className="spec" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}
            <p>Designed as a replicable prototype for natural-material research structures.</p>
          </aside>
        </div>
      </section>

      <section id="systems" className="section garden-section">
        <div className="section-number">04 / LIVING SYSTEM</div>
        <div className="section-head">
          <div><span className="eyebrow">TETRAHEDRON GARDEN</span><h2>Grow food.<br />Measure everything.</h2></div>
          <p>Three productive spirals orbit one water hub. Each element performs twice: sustaining a crop while collecting evidence about desert growing systems.</p>
        </div>
        <Garden />
        <div className="metric-row">
          <div><strong>1K</strong><span>GALLON CISTERN</span></div><div><strong>03</strong><span>PRODUCTIVE SPIRALS</span></div><div><strong>ORP</strong><span>PH + MINERAL TESTING</span></div>
          <small>Every water reading becomes part of the Living River baseline.</small>
        </div>
        <div className="water-note">
          <span className="eyebrow">WATER AS EVIDENCE</span>
          <p>A 1,000-gallon copper cistern gravity-feeds every bed. Water quality is tested for ORP, pH, and mineral content — baseline data for the Living River system and a verifiable record of what this land produces without synthetic inputs.</p>
        </div>
        <div className="offline-panel">
          <div>
            <span className="eyebrow">FIELD COMPUTER / AIR-GAPPED</span>
            <h2>Offline by design.</h2>
          </div>
          <div>
            <p>A self-contained field computer runs entirely without internet. Raspberry Pi 5 with a closed WiFi network, GPS module, and local AI reference system. Field notes are GPS-stamped and stored locally. No cloud dependency. No data leaving the site.</p>
            <div className="offline-stats"><span>SOLAR-CHARGED</span><span>BATTERY-BACKED</span><span>AIR-GAPPED</span></div>
          </div>
        </div>
      </section>

      <section id="method" className="section method-section">
        <div className="section-number light">05 / METHOD</div>
        <div className="section-head light">
          <div><span className="eyebrow">MECHANISM BEFORE CLAIM</span><h2>How we work.</h2></div>
          <p>Our methodology sits at the intersection of three disciplines. Every measurement is tied to a mechanism, a protocol, and a place.</p>
        </div>
        <div className="method-grid">
          {methods.map(method => (
            <article key={method.number}>
              <span>{method.number}</span>
              <h3>{method.title}</h3>
              <p>{method.body}</p>
            </article>
          ))}
        </div>
        <div className="method-manifesto">
          <strong>Every claim backed by a mechanism.<br />Every measurement tied to a GPS coordinate.</strong>
          <p>Every dataset open and reproducible.</p>
        </div>
      </section>

      <section id="phases" className="section roadmap-section">
        <div className="section-number light">06 / PHASES</div>
        <div className="section-head light"><div><span className="eyebrow">STAGED FOR EVIDENCE</span><h2>From first point<br />to public method.</h2></div><p>A staged path that makes early work useful immediately, then adds infrastructure as evidence and support grow.</p></div>
        <div className="timeline">
          {milestones.map(m => <article key={m[0]}><span className="milestone">{m[0]}</span><small>{m[1]}</small><h3>{m[2]}</h3><p>{m[3]}</p></article>)}
        </div>
      </section>

      <section id="budget" className="section budget-section">
        <div className="section-number">07 / RESOURCES</div>
        <div className="budget-head"><div><span className="eyebrow">LEAN FIRST YEAR</span><h2>$75,000</h2></div><p>A lean first year funds people before objects: field collection at the Old Glory Peak site, data stewardship, construction, insurance, and public documentation.</p></div>
        <div className="budget-table">
          {budget.map(([name, amount, color], i) => <div key={name} className="budget-row"><span className="rank">0{i + 1}</span><span>{name}</span><div className="budget-bar"><i style={{ width: `${(amount / 50000) * 100}%`, background: color }} /></div><b>${amount.toLocaleString()}</b></div>)}
        </div>
        <div className="funding"><span>OPEN FINANCE STANDARD</span><p>Every dollar tracked. Every expense reported. <b>Open financial summary published annually.</b></p></div>
      </section>

      <section id="library" className="section library-section">
        <div className="section-number light">08 / DOCUMENT LIBRARY</div>
        <div className="section-head light">
          <div><span className="eyebrow">THE FULL RESEARCH PACKAGE</span><h2>Read the method.<br />Trace the evidence.</h2></div>
          <p>Download the full research package. Every document is updated as the project evolves.</p>
        </div>
        <div className="document-grid">
          {documents.map((document, index) => {
            const card = (
              <>
                <div><span>{document.type}</span><small>0{index + 1}</small></div>
                <h3>{document.title}</h3>
                <p>{document.description}</p>
                <span className="document-status">{document.href ? "DOWNLOAD WORKING DRAFT ↘" : "DATASET / PENDING FIELD COLLECTION"}</span>
              </>
            );
            return document.href ? (
              <a className="document-card" href={document.href} target="_blank" rel="noreferrer" key={document.title}>{card}</a>
            ) : (
              <article className="document-card" key={document.title}>{card}</article>
            );
          })}
        </div>
      </section>

      <section id="public" className="section team-section">
        <div className="section-number">09 / BUILT IN PUBLIC</div>
        <div className="section-head">
          <div><span className="eyebrow">LED FROM THE FIELD</span><h2>Built in public.<br />Led from the field.</h2></div>
          <p>Whole Body Foundation operates on a simple standard: observe deeply, document honestly, and build only what the land can support.</p>
        </div>
        <div className="team-grid">
          <article className="lead-card">
            <div className="portrait-placeholder"><span>JG</span><small>MORONGO VALLEY / CA</small></div>
            <div><span className="eyebrow">FOUNDER &amp; FIELD LEAD</span><h3>Jesse Gawlik</h3><p>Jesse Gawlik — Independent researcher based in Morongo Valley, California. Coordinating ecological research at the Old Glory Peak field station, site systems, public documentation, and community partnerships across the eastern Mojave.</p><a href="mailto:jesse@wholebody.foundation">CONTACT JESSE ↗</a></div>
          </article>
          <div className="public-grid">
            <article className="science-commitment">
              <span className="eyebrow">OPEN SCIENCE COMMITMENT</span>
              <ul>
                <li>Pre-registration on OSF before data collection</li>
                <li>Open data on OSF/Zenodo under CC-BY license</li>
                <li>Negative results published</li>
                <li>Full replication protocol available</li>
                <li>Annual financial summary published</li>
              </ul>
            </article>
            <article className="advisory-note">
              <span className="eyebrow">ADVISORY BOARD</span>
              <h3>In formation.</h3>
              <p>Seeking mission-aligned scientists and practitioners in environmental geophysics, desert ecology, and community health.</p>
              <a href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Advisory%20Inquiry">START A CONVERSATION ↗</a>
            </article>
          </div>
          <div className="public-links">
            <a href="mailto:jesse@wholebody.foundation">CONTACT JESSE</a>
            <span aria-disabled="true">OSF PROFILE / COMING SOON</span>
            <span aria-disabled="true">FIELD LOG / COMING SOON</span>
          </div>
        </div>
      </section>

      <footer>
        <div><span className="eyebrow">WHOLE BODY FOUNDATION</span><h2>Old Glory Peak<br /><em>Field Station.</em></h2></div>
        <div className="footer-side">
          <p>Field research station · Open data · Public-interest science</p>
          <a href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Inquiry">JESSE@WHOLEBODY.FOUNDATION ↗</a>
          <address>Old Glory Peak Field Station<br />Morongo Valley, San Bernardino County, California<br /><br />OSF profile · coming soon<br />Field log · coming soon</address>
        </div>
        <small>© 2026 WHOLE BODY FOUNDATION · ALL RESEARCH OUTPUTS PUBLISHED UNDER CC-BY LICENSE UNLESS OTHERWISE NOTED</small>
      </footer>
    </main>
  );
}
