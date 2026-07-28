import Link from "next/link";
import RouteNav from "../RouteNav";

const pillars = [
  ["01", "Magnetic field mapping", "200+ survey points", "Earth’s telluric currents create measurable field variations associated with geology, groundwater, and mineral composition. Accessible instruments let us build the Mojave baseline that conventional assessment is missing."],
  ["02", "Water systems research", "90% savings target", "Water scarcity defines desert ecology. We compare subsurface signals with hydrology while the living lab tests gravity-fed irrigation, greywater reuse, and resilient growing patterns."],
  ["03", "Acoustic resonance", "0 metal fasteners", "Natural materials can convert acoustic energy into electrical signals. A metal-free dome creates a controlled environment for studying those effects without electromagnetic interference."],
];
const chain = ["Earth’s core", "Telluric currents", "Magnetic anomalies", "Water patterns", "Ecosystem health"];

export default function VisionPage() {
  return <main className="subpage vision-page"><RouteNav />
    <header className="subhero"><span className="eyebrow">01 / RESEARCH VISION</span><h1>Reading the<br /><em>Earth’s signals.</em></h1><p>Three connected research domains reveal patterns that conventional ecological assessment often misses.</p></header>
    <section className="research-pillars">{pillars.map(p => <article key={p[0]}><span>{p[0]}</span><div><small>{p[2]}</small><h2>{p[1]}</h2><p>{p[3]}</p></div></article>)}</section>
    <section className="research-chain"><span className="eyebrow">THE RESEARCH CHAIN</span><div>{chain.map((step, i) => <article key={step}><b>0{i + 1}</b><span>{step}</span>{i < chain.length - 1 && <i>→</i>}</article>)}</div></section>
    <section className="why-grid"><div><span className="eyebrow">WHY THIS MATTERS</span><h2>Observation<br />before intervention.</h2></div><div>{[
      ["Baseline data gap","Conservation decisions require a legible record of subsurface conditions and change over time."],
      ["Climate resilience","Extreme heat, water scarcity, and habitat loss demand locally tested responses."],
      ["Replicable methods","Smartphones, open tools, and volunteer networks make the work transferable to other arid regions."],
    ].map((x,i)=><article key={x[0]}><b>0{i+1}</b><h3>{x[0]}</h3><p>{x[1]}</p></article>)}</div></section>
    <blockquote>“Land stewardship requires deep observation before intervention.”<small>WHOLE BODY FOUNDATION RESEARCH PRINCIPLE</small></blockquote>
    <Link href="/#dome" className="next-scene">NEXT: EXPLORE THE DOME <span>→</span></Link>
  </main>;
}
