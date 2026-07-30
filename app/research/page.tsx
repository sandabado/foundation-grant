import type { Metadata } from "next";
import PublicFieldMap from "../PublicFieldMap";
import SiteFooter from "../SiteFooter";
import SiteNav from "../SiteNav";

export const metadata: Metadata = {
  title: "Research — Whole Body Foundation",
  description:
    "Public field methods, research protocols, and evidence standards from Whole Body Foundation.",
};

const methods = [
  {
    number: "01",
    title: "Environmental geophysics",
    status: "ESTABLISHED MEASUREMENT",
    body: "Magnetometer transects calibrated against USGS reference data. Rock observations, magnetic susceptibility, and water-quality measurements are tied to documented field stations.",
  },
  {
    number: "02",
    title: "Mycelial and ecological networks",
    status: "ACTIVE PROTOCOL / PRE-DATA",
    body: "GPS-stamped soil observations, fungal microscopy, moss documentation, ant census work, and camera traps build a repeatable picture of ecological change.",
  },
  {
    number: "03",
    title: "Community psychophysiology",
    status: "PENDING ETHICS REVIEW",
    body: "HRV and cortisol methods remain inactive until ethics review and informed-consent approval. Human-participant data will be de-identified by design.",
  },
  {
    number: "04",
    title: "Network and systems science",
    status: "ACTIVE HYPOTHESIS",
    body: "Documented measures test how ecological and human networks behave. Exploratory relationships remain hypotheses until replicated with appropriate controls.",
  },
] as const;

const milestones = [
  ["01", "MONTHS 1–3", "Map the baseline", "First 50 GPS-tagged points · magnetometer transects · ecological survey · public field log preparation"],
  ["02", "MONTHS 4–6", "Validate methods", "150 survey points · water-quality baseline · ecological network mapping · ethics-review preparation"],
  ["03", "MONTHS 7–12", "Run the fieldwork", "Sensor network · growing trial · camera traps · first annual open dataset"],
  ["04", "MONTHS 13–18", "Share the method", "Second survey cycle · land-manager workshops · replication protocol · manuscript preparation"],
] as const;

const documents = [
  {
    type: "PDF",
    title: "BIO-001 Psychophysiology Protocol",
    description:
      "HRV, cortisol, control matching, and statistical plan. IRB approval pending.",
    href: "/documents/bio-001-psychophysiology-protocol.pdf",
    status: "DOWNLOAD WORKING DRAFT ↘",
  },
  {
    type: "PDF",
    title: "Informed Consent Template",
    description:
      "Consent language prepared for independent ethics review before participant work.",
    href: "/documents/informed-consent-template.pdf",
    status: "DOWNLOAD WORKING DRAFT ↘",
  },
  {
    type: "PDF",
    title: "Ecological Network Survey Protocol",
    description:
      "Soil, fungal, moss, ant, and camera-trap methods in preparation.",
    href: null,
    status: "PROTOCOL / IN PREPARATION",
  },
  {
    type: "CSV",
    title: "Open Dataset — Survey Points",
    description:
      "De-risked field observations published after collection and quality review.",
    href: null,
    status: "DATASET / PENDING FIELD COLLECTION",
  },
] as const;

export default function ResearchPage() {
  return (
    <main className="inner-page">
      <SiteNav />
      <header className="inner-hero">
        <span className="eyebrow">PUBLIC RESEARCH</span>
        <h1>
          Mechanism
          <br />
          <em>before claim.</em>
        </h1>
        <p>
          A field method is useful only when its observations can be traced,
          tested, challenged, and repeated.
        </p>
      </header>

      <section className="section survey-section">
        <div className="section-number light">01 / FIELD CONTEXT</div>
        <PublicFieldMap />
        <div className="survey-copy">
          <span className="eyebrow">OLD GLORY PEAK CORRIDOR</span>
          <h2>Start with place.</h2>
          <p>
            The field program begins in Morongo Valley with terrain, fault,
            ecology, and access context. Final station locations remain subject
            to field reconnaissance, safety review, and land permission.
          </p>
          <div className="research-standard">
            <span>PUBLIC-INTEREST FIELD SCIENCE</span>
            <p>Measurable, repeatable, and shared with the people who steward the land.</p>
            <strong>
              Every claim backed by a mechanism.
              <br />
              Every measurement tied to a place.
            </strong>
          </div>
        </div>
      </section>

      <section className="section method-section">
        <div className="section-number light">02 / METHODS</div>
        <div className="section-head light">
          <div>
            <span className="eyebrow">FOUR DISCIPLINES</span>
            <h2>Observe across systems.</h2>
          </div>
          <p>
            Methods connect geophysics, ecology, community health, and systems
            science while keeping validated measurements separate from
            exploratory hypotheses.
          </p>
        </div>
        <div className="evidence-key" aria-label="Evidence status key">
          <span><i className="measurement" />Established measurement</span>
          <span><i className="protocol" />Active protocol</span>
          <span><i className="hypothesis" />Active hypothesis</span>
          <span><i className="inspiration" />Design inspiration</span>
          <small>
            A status describes the maturity of the work—not a positive result.
            Design inspiration is kept separate from research claims.
          </small>
        </div>
        <div className="method-grid">
          {methods.map((method) => (
            <article key={method.number}>
              <div className="method-meta">
                <span>{method.number}</span>
                <small>{method.status}</small>
              </div>
              <h3>{method.title}</h3>
              <p>{method.body}</p>
            </article>
          ))}
        </div>
        <div className="method-manifesto">
          <strong>
            Controls before conclusions.
            <br />
            Null results published.
          </strong>
          <p>Claims change when the evidence changes.</p>
        </div>
      </section>

      <section className="section roadmap-section">
        <div className="section-number light">03 / ROADMAP</div>
        <div className="section-head light">
          <div>
            <span className="eyebrow">PROVE FIRST · BUILD SECOND</span>
            <h2>From first point to public method.</h2>
          </div>
          <p>
            Each stage produces something useful before the project adds
            physical or organizational complexity.
          </p>
        </div>
        <div className="timeline">
          {milestones.map((milestone) => (
            <article key={milestone[0]}>
              <span className="milestone">{milestone[0]}</span>
              <small>{milestone[1]}</small>
              <h3>{milestone[2]}</h3>
              <p>{milestone[3]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section library-section">
        <div className="section-number light">04 / PUBLIC LIBRARY</div>
        <div className="section-head light">
          <div>
            <span className="eyebrow">OPEN METHODS</span>
            <h2>
              Read the method.
              <br />
              Trace the evidence.
            </h2>
          </div>
          <p>
            Public protocols and de-identified outputs live here. Partner
            planning, fabrication, finance, and unreleased working documents do
            not.
          </p>
        </div>
        <div className="document-grid">
          {documents.map((document, index) => {
            const card = (
              <>
                <div>
                  <span>{document.type}</span>
                  <small>0{index + 1}</small>
                </div>
                <h3>{document.title}</h3>
                <p>{document.description}</p>
                <span className="document-status">{document.status}</span>
              </>
            );
            return document.href ? (
              <a
                className="document-card document-card-link"
                href={document.href}
                target="_blank"
                rel="noreferrer"
                key={document.title}
              >
                {card}
              </a>
            ) : (
              <article
                className="document-card document-card-static"
                key={document.title}
              >
                {card}
              </article>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
