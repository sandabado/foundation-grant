import Link from "next/link";
import RouteNav from "../RouteNav";

export default function TeamPage(){
  return <main className="subpage team-page"><RouteNav />
    <header className="subhero"><span className="eyebrow">08 / PEOPLE</span><h1>Who<br /><em>we are.</em></h1><p>A field-led foundation assembling the expertise to observe carefully, build responsibly, and share openly.</p></header>
    <section className="profile">
      <div className="portrait-placeholder"><span>JG</span><small>PORTRAIT FORTHCOMING</small></div>
      <div><span className="eyebrow">FOUNDER + PROJECT LEAD</span><h2>Jesse Gawlik</h2><p>Jesse leads field research, project development, public documentation, and partner coordination for Whole Body Foundation’s Mojave initiative.</p><p>The work brings hands-on construction and systems thinking into conversation with ecological observation—building an accountable platform for interdisciplinary research and land stewardship.</p><a href="mailto:jesse@wholebody.foundation">JESSE@WHOLEBODY.FOUNDATION ↗</a></div>
    </section>
    <section className="advisors"><span className="eyebrow">ADVISORY CIRCLE / OPEN ROLES</span><div>{["Environmental Scientist","Permaculture Designer","Legal / Compliance Advisor"].map((r,i)=><article key={r}><span>SEEKING</span><b>0{i+1}</b><h2>{r}</h2><p>For a mission-aligned practitioner who values field evidence, open knowledge, and desert resilience.</p></article>)}</div></section>
    <section className="partners"><span className="eyebrow">PARTNERS WE’RE BUILDING TOWARD</span><div><span>RESEARCH</span><span>LAND STEWARDSHIP</span><span>COMMUNITY SCIENCE</span><span>FISCAL SPONSORSHIP</span></div></section>
    <section className="get-involved"><h2>Bring your<br /><em>discipline to the field.</em></h2><div><p>Researchers, advisors, educators, field volunteers, builders, and funding partners are invited to help shape the work.</p><Link href="/contact">GET INVOLVED <span>→</span></Link></div></section>
  </main>
}
