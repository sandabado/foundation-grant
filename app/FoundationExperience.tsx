"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InteractiveTerrain from "./InteractiveTerrain";
import SurveyMap from "./SurveyMap";

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

const GreatHallModel = dynamic(
  () => import("./ArchitecturalModels").then(module => module.GreatHallModel),
  {
    ssr: false,
    loading: () => (
      <div className="architecture-model-viewer architecture-model-loading" aria-label="Loading the interactive Great Hall">
        <span>ASSEMBLING THE GREAT HALL</span>
      </div>
    ),
  },
);

const ResidentialClustersModel = dynamic(
  () =>
    import("./ArchitecturalModels").then(
      module => module.ResidentialClustersModel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="architecture-model-viewer architecture-model-loading" aria-label="Loading the interactive Clover Homes">
        <span>ASSEMBLING CLOVER HOMES</span>
      </div>
    ),
  },
);

type NavItem = {
  id: string;
  label: string;
  sections: readonly string[];
  cta?: boolean;
};

const nav: NavItem[] = [
  { id: "mission", label: "Mission", sections: ["mission"] },
  { id: "site-context", label: "Site", sections: ["site-context"] },
  { id: "method", label: "Method", sections: ["method"] },
  {
    id: "phase-1-tet-garden",
    label: "Build",
    sections: [
      "phase-1-tet-garden",
      "phase-2-elemental-domes",
      "phase-3-great-hall",
      "phase-4-quincunx",
    ],
  },
  { id: "land-stewardship", label: "Land", sections: ["land-stewardship"] },
  { id: "equipment", label: "Equipment", sections: ["equipment"] },
  { id: "budget", label: "Budget", sections: ["budget"] },
  { id: "timeline", label: "Roadmap", sections: ["timeline"] },
  { id: "people", label: "Team", sections: ["people"] },
  { id: "library", label: "Library", sections: ["library"] },
  { id: "contact", label: "Contact", sections: ["contact"], cta: true },
];

const fundingMix = [
  ["California climate investment", 50000, "#84a66e"],
  ["Foundation grants", 15000, "#b87333"],
  ["Community + workshops", 10000, "#d7d0bd"],
] as const;

const budgetLines = [
  ["Personnel", 45000, "#84a66e"],
  ["Equipment", 8000, "#9ab58a"],
  ["Sponsor fee", 7500, "#718c65"],
  ["Travel", 6000, "#6f8f65"],
  ["Data + hosting", 4000, "#b7c5aa"],
  ["Legal + insurance", 3500, "#5f7656"],
  ["Contingency", 1000, "#40523b"],
] as const;

const milestones = [
  ["01", "MONTHS 1–3", "Map the baseline", "Fiscal sponsorship inquiry active · First 50 GPS-tagged survey points · Magnetometer transects A–D · Baseline ecological survey · Public field log prepared for OSF"],
  ["02", "MONTHS 4–6", "Build the system", "First grant target · Tetrahedron Garden construction · Four elemental domes fabricated · 150 survey points · Water quality baseline · Mycelial network mapping initiated · Psychophysiology protocol preparation and ethics-review submission"],
  ["03", "MONTHS 7–12", "Run the experiment", "Full sensor network · First harvest · Camera trap network · Annual open dataset · Psychophysiology protocol activates only if IRB approval has been received"],
  ["04", "MONTHS 13–18", "Share the method", "Second survey cycle · Mycelial ecology workshops for land managers · 501(c)(3) transition · Replication protocol · Peer-reviewed manuscript preparation"],
];

const methods = [
  {
    number: "01",
    title: "Environmental geophysics",
    body: "Smartphone magnetometer transects calibrated against USGS aeromagnetic data. Rock sampling: Mohs hardness, streak plate, HCl reaction, and magnetic susceptibility. Water quality: ORP, pH, heavy metals, and mineral content.",
  },
  {
    number: "02",
    title: "Mycelial and ecological networks",
    body: "Soil sampling at GPS-stamped locations. Fungal hyphae documented through microscopy. Moss patches serve as distributed bio-sensors. Ant colony behavior is mapped. Wildlife is tracked through camera traps: birds, mammals, and domestic cats. These biological networks are the Earth’s way of reporting its own state.",
  },
  {
    number: "03",
    title: "Community psychophysiology",
    body: "Polar H10 chest straps for HRV/RMSSD: five-minute recordings, three times weekly. Monthly salivary cortisol assays. IRB approval pending. Pre-registration on OSF will occur before data collection begins.",
  },
  {
    number: "04",
    title: "Network and systems science",
    body: "Decision latency measures elapsed time from a documented issue to a recorded community decision. Local economic velocity measures the frequency and value of participant transactions recirculating within the defined study boundary. Fractal scaling compares biological and human network structures for common organizational principles.",
  },
];

const equipment = [
  ["01", "Geophysics", "Smartphone magnetometer, GPS reference, field notebook, streak plate, hardness picks, dilute HCl, and magnetic susceptibility tools."],
  ["02", "Ecology", "Glass soil-sampling jars, paper envelopes, microscopy supplies, moss documentation tools, ant census forms, and camera traps."],
  ["03", "Psychophysiology", "Polar H10 chest straps and Salivette cortisol kits held for use only after ethics review and informed consent approval."],
  ["04", "Field computing", "Raspberry Pi 5, local reference library, GPS module, closed WiFi network, solar charging, and battery backup."],
] as const;

const documents = [
  { type: "PDF", title: "Investor One-Pager", description: "The opportunity, four-phase campus plan, research model, current status, and funding requirements in one concise planning brief.", href: "/documents/investor-one-pager.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "PDF", title: "Project Summary", description: "Mission, research questions, methods, Old Glory Peak site justification, budget, and timeline.", href: "/documents/project-summary.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "PDF", title: "Magnetometer Survey Protocol", description: "Transect A–D design, including the Old Glory Peak ridge survey, station log template, quality control checklist, data export format, and field safety protocols.", href: "/documents/magnetometer-survey-protocol.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "PDF", title: "Mycelial and Ecological Network Survey Protocol", description: "Soil sampling methodology, microscopy techniques, mycorrhizal identification guide, moss patch documentation, ant colony census procedures, and camera trap placement protocols.", href: null, status: "PROTOCOL / IN PREPARATION" },
  { type: "PDF", title: "BIO-001 Psychophysiology Protocol", description: "HRV measurement specifications, cortisol assay protocol, control node matching criteria, statistical analysis plan, and Bonferroni correction. IRB approval pending.", href: "/documents/bio-001-psychophysiology-protocol.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "PDF", title: "Phase 1 Action Plan", description: "Week-by-week implementation: legal setup, equipment acquisition, Old Glory Peak field survey execution, and grant submissions.", href: "/documents/phase-1-action-plan.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "PDF", title: "Annual Budget Breakdown", description: "Line-item budget with justification: personnel, data stewardship, construction, field collection, documentation, and contingency.", href: "/documents/annual-budget-breakdown.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "PDF", title: "Informed Consent Template", description: "IRB-ready consent form for HRV and cortisol study participants.", href: "/documents/informed-consent-template.pdf", status: "DOWNLOAD WORKING DRAFT ↘" },
  { type: "CSV", title: "Open Dataset — Survey Points", description: "GPS coordinates, magnetometer readings, lithology, mineral identification, Old Glory Peak transect identifiers, and ecological observations. Published when field data is available.", href: null, status: "DATASET / PENDING FIELD COLLECTION" },
];

function Garden() {
  return <TetrahedronGarden />;
}

export default function FoundationExperience() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("site-context");
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -50, y: -50, ring: false });
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const item = nav.find(candidate =>
            candidate.sections.includes(entry.target.id),
          );
          if (item) setActive(item.id);
        }),
      { rootMargin: "-35% 0px -55%" },
    );
    nav.forEach(item =>
      item.sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) observer.observe(element);
      }),
    );
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 1200);
    const scroll = () => setProgress(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    const move = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY, ring: !!(e.target as Element)?.closest("a,button") });
    const keys = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const index = nav.findIndex(item => item.id === active);
      const next = e.key === "ArrowRight" ? Math.min(nav.length - 1, index + 1) : Math.max(0, index - 1);
      document.getElementById(nav[next].id)?.scrollIntoView();
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
      <nav className="topnav" aria-label="Primary navigation">
        <a href="#top" className="brand" onClick={() => setMenu(false)}><span>W/B</span> WHOLE BODY FOUNDATION</a>
        <button
          className="menu-button"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-controls="primary-navigation"
        >
          NAVIGATION <i aria-hidden="true">{menu ? "×" : "+"}</i>
        </button>
        <div id="primary-navigation" className={`navlinks ${menu ? "open" : ""}`}>
          {nav.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenu(false)}
              className={`${active === item.id ? "active" : ""} ${item.cta ? "nav-cta" : ""}`.trim()}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <header className="hero" id="top">
        <InteractiveTerrain />
        <div className="hero-scrim" />
        <div className="hero-grid" />
        <div className="hero-copy">
          <span className="eyebrow reveal">MORONGO VALLEY / OLD GLORY PEAK CORRIDOR</span>
          <h1><span className="hero-kicker">FIELDWORK FOR A</span><em>Living Planet</em></h1>
          <div className="hero-deck">
            <p>Mapping the geological and ecological systems of the Old Glory Peak transect corridor.</p>
          </div>
          <div className="hero-actions" aria-label="Explore the fieldwork">
            <a className="button button-primary" href="#site-context">ENTER THE FIELD ↓</a>
          </div>
        </div>
      </header>

      <section id="mission" className="section mission-statement">
        <div>
          <span className="eyebrow">WHY THIS WORK</span>
          <h2><span className="mission-line">The desert is not empty.</span><em>It is information-dense.</em></h2>
        </div>
        <p>We’re building a baseline ecological record where geomagnetic mapping, mineral identification, water quality testing, dryland agriculture, mycelial network surveys, and community health monitoring converge at the Old Glory Peak field station.</p>
      </section>

      <section id="site-context" className="section survey-section">
        <div className="section-number light">01 / THE GROUND TRUTH</div>
        <SurveyMap />
        <div className="survey-copy">
          <span className="eyebrow">SITE CONTEXT</span>
          <h2>Old Glory Peak.</h2>
          <p>The locally named Old Glory ridge rises on the western edge of Morongo Valley within the San Gorgonio Wilderness landscape. USGS mapping places it between two branches of the Pinto Mountain fault zone, which includes the Morongo Valley fault.</p>
          <p>The map separates fixed survey specifications from alignments that still require access reconnaissance:</p>
          <div className="transect-list">
            {[
              ["A", "Pinto Fault Crossing", "PLANNING CORRIDOR / ENDPOINTS PENDING"],
              ["B", "Morongo Valley Fault Crossing", "PLANNING CORRIDOR / ENDPOINTS PENDING"],
              ["C", "Old Glory Peak Ridge Crest", "400 M / 9 STATIONS / 50 M SPACING"],
              ["D", "Mine Area Grid near historical adits", "BOUNDARY PENDING ACCESS + SAFETY"],
            ].map(([letter, label, status]) => (
              <div key={letter}>
                <span>TRANSECT {letter}</span>
                <strong>{label}</strong>
                <small>{status}</small>
              </div>
            ))}
          </div>
          <div className="research-standard">
            <span>PUBLIC-INTEREST FIELD SCIENCE</span>
            <p>Measurable, repeatable, and shared openly with the people who steward the land.</p>
            <strong>Every claim backed by a mechanism.<br />Every measurement tied to a GPS coordinate.</strong>
          </div>
        </div>
      </section>

      <section id="method" className="section method-section">
        <div className="section-number light">02 / HOW WE WORK</div>
        <div className="section-head light">
          <div><span className="eyebrow">MECHANISM BEFORE CLAIM</span><h2>Four disciplines.</h2></div>
          <p>Our methodology connects geophysics, ecology, community health, and systems science. Every measurement is tied to a mechanism, a protocol, and a place.</p>
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

      <section id="phase-1-tet-garden" className="section garden-section">
        <div className="section-number">03 / ARCHITECTURE · PHASE 1</div>
        <div className="architecture-layout">
          <div className="architecture-copy">
            <span className="eyebrow">PHASE 1</span>
            <h2>Tetrahedron Garden.</h2>
            <p>Twelve triangular raised beds arranged in a Flower of Life geometric pattern orbit a central copper cistern pool. A solar-calibrated copper gnomon tracks time and season. An orchard ring and six cold frames complete the perimeter.</p>
            <strong>12 beds. One cistern. Food grows with the geometry of the land.</strong>
          </div>
          <Garden />
        </div>
      </section>

      <section id="phase-2-elemental-domes" className="section dome-section">
        <div className="section-number light">04 / ARCHITECTURE · PHASE 2</div>
        <div className="architecture-layout">
          <div className="architecture-copy">
            <span className="eyebrow">PHASE 2</span>
            <h2>Four elemental domes.</h2>
            <p>Four geodesic domes hold Earth, Fire, Air, and Water practices around the central garden. Each dome is built entirely of Douglas fir, joined with hardwood dowels and hide glue. No metal. No interference.</p>
            <strong>2V geodesic geometry. 65 connected struts per dome. Zero metal fasteners.</strong>
          </div>
          <FieldDome />
        </div>
      </section>

      <section id="phase-3-great-hall" className="section architecture-phase architecture-hall">
        <div className="section-number">05 / ARCHITECTURE · PHASE 3</div>
        <div className="architecture-layout">
          <div className="architecture-copy">
            <span className="eyebrow">PHASE 3</span>
            <h2>The Great Hall.</h2>
            <p>A nine-sided hall gathers the community around a central stage. A twelve-faced, copper-paneled dodecahedral ceiling shapes the acoustic field. Concentric wooden seating holds 50–75 people. Stained glass carries desert light into a completely wooden structure.</p>
            <strong>The village speaks to the sky.</strong>
          </div>
          <GreatHallModel />
        </div>
      </section>

      <section id="phase-4-quincunx" className="section architecture-phase architecture-homes">
        <div className="section-number light">06 / ARCHITECTURE · PHASE 4</div>
        <div className="architecture-layout">
          <div className="architecture-copy">
            <span className="eyebrow">PHASE 4</span>
            <h2>Clover Homes.</h2>
            <p>Two residential clusters, each with six wooden dome homes arranged around a central swimming pool. Dense forest vegetation surrounds each cluster for privacy. The modular design adds clusters as the community grows.</p>
            <strong>12 homes total. Forest privacy. Community life.</strong>
          </div>
          <ResidentialClustersModel />
        </div>
      </section>

      <section id="land-stewardship" className="section land-section">
        <div className="section-number light">07 / LAND + LEGAL</div>
        <div className="land-head">
          <div>
            <span className="eyebrow">PRECONDITION TO BUILD</span>
            <h2>Secure the ground.<br /><em>Then build.</em></h2>
            <p>Permanent infrastructure depends on legally durable access to an appropriate site. Land acquisition and long-term stewardship are therefore a separate capital and due-diligence track—not an assumption hidden inside the operating plan.</p>
          </div>
          <aside className="land-status">
            <span>STATUS / PLANNING TRACK</span>
            <strong>Permanent site control remains a project dependency.</strong>
            <p>No property is represented here as acquired, under contract, or approved for construction. Property-specific claims will be published only after documentary review.</p>
          </aside>
        </div>
        <div className="land-grid">
          {[
            ["01", "Site due diligence", "Identify a candidate site, then verify boundaries, title, legal access, zoning, water rights, environmental constraints, and permitted research uses."],
            ["02", "Stewardship structure", "Evaluate purchase, long-term lease, conservation easement, or land-trust structures with qualified legal and land-use counsel."],
            ["03", "Capital plan", "Establish a property-specific acquisition target only after appraisal, survey, title review, legal analysis, and closing-cost estimates."],
            ["04", "Public record", "Publish the selected legal structure, material constraints, acquisition status, and construction permissions before permanent building begins."],
          ].map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="land-budget-line">
          <div><span>YEAR-ONE OPERATING PLAN</span><strong>$75,000</strong></div>
          <p>Land acquisition is excluded from the operating budget. A separate capital target will be established only after a real property and its verified costs are identified.</p>
        </div>
      </section>

      <section id="equipment" className="section equipment-section">
        <div className="section-number">08 / TOOLKIT</div>
        <div className="section-head">
          <div><span className="eyebrow">FIELD EQUIPMENT / V2.0</span><h2>Measure what<br />the land reports.</h2></div>
          <div className="section-copy">
            <p>One field kit supports all four research disciplines. Phase 1 startup estimate: $9,450, with a $260 priority kit allowing baseline collection to begin first.</p>
            <p><strong>No plastic sample containers. Glass, paper, and cloth only.</strong></p>
          </div>
        </div>
        <div className="equipment-grid">
          {equipment.map(([number, title, description]) => (
            <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
        <div className="offline-panel">
          <div><span className="eyebrow">FIELD COMPUTER / AIR-GAPPED</span><h2>Offline by design.</h2></div>
          <div><p>A self-contained field computer runs without internet. Field notes are GPS-stamped and stored locally. No cloud dependency. No data leaving the site.</p><div className="offline-stats"><span>SOLAR-CHARGED</span><span>BATTERY-BACKED</span><span>AIR-GAPPED</span></div></div>
        </div>
      </section>

      <section id="budget" className="section budget-section">
        <div className="section-number">09 / YEAR ONE</div>
        <div className="budget-head"><div><span className="eyebrow">LEAN FIRST YEAR</span><h2>$75,000</h2><small className="budget-scope-note">OPERATING BUDGET / LAND EXCLUDED</small></div><p>A lean first year funds people before objects: field collection, data stewardship, construction, insurance, and public documentation.</p></div>
        <div className="budget-table">
          {budgetLines.map(([name, amount, color], i) => <div key={name} className="budget-row"><span className="rank">0{i + 1}</span><span>{name}</span><div className="budget-bar"><i style={{ width: `${(amount / 45000) * 100}%`, background: color }} /></div><b>${amount.toLocaleString()}</b></div>)}
        </div>
        <div className="funding-mix">
          {fundingMix.map(([name, amount]) => <div key={name}><strong>${Math.round(amount / 1000)}K</strong><span>{name}</span></div>)}
        </div>
        <div className="funding"><span>OPEN FINANCE STANDARD</span><p>Every dollar tracked. Every expense reported. <b>Open financial summary published annually.</b></p></div>
      </section>

      <section id="timeline" className="section roadmap-section">
        <div className="section-number light">10 / ROADMAP</div>
        <div className="section-head light"><div><span className="eyebrow">STAGED FOR EVIDENCE</span><h2>From first point<br />to public method.</h2></div><p>A staged path that makes early work useful immediately, then adds infrastructure as evidence and support grow.</p></div>
        <div className="timeline">
          {milestones.map(m => <article key={m[0]}><span className="milestone">{m[0]}</span><small>{m[1]}</small><h3>{m[2]}</h3><p>{m[3]}</p></article>)}
        </div>
      </section>

      <section id="people" className="section team-section">
        <div className="section-number">11 / WHO WE ARE</div>
        <div className="section-head">
          <div><span className="eyebrow">LED FROM THE FIELD</span><h2>Built in public.<br />Led from the field.</h2></div>
          <p>Whole Body Foundation is assembling a practical, interdisciplinary team around a simple standard: observe deeply, document honestly, and build only what the land can support.</p>
        </div>
        <div className="team-grid">
          <article className="lead-card">
            <div className="portrait-image">
              <img
                src="/images/jesse-gawlik.jpg"
                alt="Jesse Gawlik in the Mojave Desert"
                width={1600}
                height={1200}
                loading="eager"
                decoding="async"
              />
            </div>
            <div><span className="eyebrow">FOUNDER AND FIELD LEAD</span><h3>Jesse Gawlik</h3><p>Jesse Gawlik — Independent researcher based in Morongo Valley, California. Coordinating ecological research at the Old Glory Peak field station, site systems, public documentation, and community partnerships across the eastern Mojave.</p><a className="text-link" href="mailto:jesse@wholebody.foundation">CONTACT JESSE ↗</a></div>
          </article>
          <div className="public-grid">
            <article className="science-commitment">
              <span className="eyebrow">OPEN SCIENCE COMMITMENT</span>
              <ul>
                <li><strong>Pre-registration.</strong> Field study protocols will be registered on OSF before data collection begins.</li>
                <li><strong>Open data.</strong> Public-interest datasets will be archived through OSF and Zenodo under the CC BY 4.0 International license.</li>
                <li><strong>Privacy by design.</strong> Human-participant data will be de-identified, and sensitive ecological locations will not be made openly identifiable.</li>
                <li><strong>Citable outputs.</strong> Public registrations and versioned archival releases will receive repository-issued DOIs.</li>
                <li><strong>Negative results.</strong> Failed hypotheses and null findings will be published alongside positive results.</li>
                <li><strong>Replication protocol.</strong> Complete methods and data dictionaries will support independent verification.</li>
                <li><strong>Financial transparency.</strong> Quarterly expense updates and an annual financial summary will be published.</li>
              </ul>
              <p className="repository-plan"><strong>Repository plan.</strong> OSF will hold preregistrations, evolving protocols, and field logs. Zenodo will preserve versioned annual releases when they are ready for citation.</p>
            </article>
            <article className="advisory-note">
              <span className="eyebrow">ADVISORY BOARD</span>
              <h3>In formation.</h3>
              <p>Seeking mission-aligned scientists and practitioners in environmental geophysics, desert ecology, and community health.</p>
              <a className="text-link" href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Advisory%20Inquiry">START A CONVERSATION ↗</a>
            </article>
          </div>
          <div className="public-links">
            <a className="button button-secondary" href="mailto:jesse@wholebody.foundation">CONTACT JESSE</a>
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0 TERMS ↗</a>
            <span aria-disabled="true">OSF PROJECT / COMING SOON</span>
            <span aria-disabled="true">ZENODO ARCHIVE / COMING SOON</span>
            <span aria-disabled="true">FIELD LOG / COMING SOON</span>
          </div>
        </div>
      </section>

      <section id="library" className="section library-section">
        <div className="section-number light">12 / DOCUMENT LIBRARY</div>
        <div className="section-head light">
          <div><span className="eyebrow">THE FULL RESEARCH PACKAGE</span><h2>Read the method.<br />Trace the evidence.</h2></div>
          <div className="section-copy">
            <p>Download the full research package. Every document is updated as the project evolves.</p>
            <p>All documents will be hosted on the Open Science Framework. Until the OSF project is established, documents are available for download directly from this site.</p>
          </div>
        </div>
        <div className="document-grid">
          {documents.map((document, index) => {
            const card = (
              <>
                <div><span>{document.type}</span><small>0{index + 1}</small></div>
                <h3>{document.title}</h3>
                <p>{document.description}</p>
                <span className="document-status">{document.status}</span>
              </>
            );
            return document.href ? (
              <a className="document-card document-card-link" href={document.href} target="_blank" rel="noreferrer" key={document.title}>{card}</a>
            ) : (
              <article className="document-card document-card-static" key={document.title}>{card}</article>
            );
          })}
        </div>
      </section>

      <footer id="contact" className="site-footer">
        <div><span className="eyebrow">WHOLE BODY FOUNDATION</span><h2>Old Glory Peak<br /><em>Field Station.</em></h2></div>
        <div className="footer-side">
          <p>Field research station · Open data · Public-interest science</p>
          <a className="button button-primary" href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Inquiry">EMAIL THE FOUNDATION ↗</a>
          <a className="footer-email" href="mailto:jesse@wholebody.foundation">JESSE@WHOLEBODY.FOUNDATION</a>
          <address>Old Glory Peak Field Station<br />Morongo Valley, San Bernardino County, California<br /><br />OSF project · coming soon<br />Zenodo archive · coming soon<br />Field log · coming soon</address>
        </div>
        <small>© 2026 WHOLE BODY FOUNDATION · UNLESS OTHERWISE NOTED, FOUNDATION-AUTHORED PUBLIC RESEARCH OUTPUTS ARE RELEASED UNDER <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0 INTERNATIONAL</a></small>
      </footer>
    </main>
  );
}
