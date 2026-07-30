import type { Metadata } from "next";
import SiteFooter from "../SiteFooter";
import SiteNav from "../SiteNav";

export const metadata: Metadata = {
  title: "About — Whole Body Foundation",
  description:
    "The mission, people, and public commitments of Whole Body Foundation.",
};

const commitments = [
  ["01", "Pre-register", "Register field protocols before data collection begins."],
  ["02", "Open the evidence", "Publish appropriate public-interest datasets and versioned releases."],
  ["03", "Protect people + place", "De-identify participant data and withhold sensitive ecological locations."],
  ["04", "Publish the misses", "Share failed hypotheses and null findings alongside positive results."],
  ["05", "Build responsibly", "Require site permission, code review, and licensed engineering before fabrication."],
  ["06", "Keep clear boundaries", "Separate public research from private partner and working documents."],
] as const;

export default function AboutPage() {
  return (
    <main className="inner-page">
      <SiteNav />
      <header className="inner-hero about-hero">
        <span className="eyebrow">MISSION + PEOPLE</span>
        <h1>
          Led from
          <br />
          <em>the field.</em>
        </h1>
        <p>
          Whole Body Foundation exists to observe deeply, document honestly,
          and build only what the land can support.
        </p>
      </header>

      <section className="section mission-statement about-mission">
        <div>
          <span className="eyebrow">THE FOUNDATION</span>
          <h2>
            Public evidence.
            <br />
            <em>Patient construction.</em>
          </h2>
        </div>
        <p>
          We connect environmental fieldwork, regenerative growing, and
          community learning without confusing a compelling idea for a proven
          result. Symbolic language may inspire a design; evidence determines
          what we claim and what we build.
        </p>
      </section>

      <section className="section commitments-section">
        <div className="section-number">01 / PUBLIC COMMITMENTS</div>
        <div className="section-head">
          <div>
            <span className="eyebrow">HOW TRUST IS BUILT</span>
            <h2>Standards before scale.</h2>
          </div>
          <p>
            The work remains legible to researchers, neighbors, builders, and
            funders because the rules are visible.
          </p>
        </div>
        <div className="commitment-grid">
          {commitments.map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section team-section">
        <div className="section-number">02 / FOUNDER</div>
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
          <div>
            <span className="eyebrow">FOUNDER + FIELD LEAD</span>
            <h3>Jesse Gawlik</h3>
            <p>
              An independent researcher based in Morongo Valley, California,
              coordinating field systems, public documentation, and community
              partnerships across the eastern Mojave.
            </p>
            <a
              className="text-link"
              href="mailto:jesse@wholebody.foundation"
            >
              CONTACT JESSE ↗
            </a>
          </div>
        </article>
        <div className="advisory-strip">
          <span className="eyebrow">ADVISORY BOARD / IN FORMATION</span>
          <p>
            Seeking mission-aligned scientists and practitioners in
            environmental geophysics, desert ecology, community health, water,
            land use, and responsible construction.
          </p>
          <a
            className="text-link"
            href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Advisory%20Inquiry"
          >
            START A CONVERSATION ↗
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
