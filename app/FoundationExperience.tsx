"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InteractiveTerrain from "./InteractiveTerrain";
import SiteFooter from "./SiteFooter";
import SiteNav from "./SiteNav";

const publicPaths = [
  {
    number: "01",
    title: "Field research",
    body: "Baseline geophysics, ecology, water quality, and community-health methods tied to a real place.",
    href: "/research",
    link: "READ THE METHODS ↗",
  },
  {
    number: "02",
    title: "Land stewardship",
    body: "Permanent work begins with legal access, ecological fit, water discipline, and an honest reading of carrying capacity.",
    href: "/about",
    link: "OUR COMMITMENTS ↗",
  },
  {
    number: "03",
    title: "Community practice",
    body: "Researchers, builders, neighbors, and land stewards testing small systems before scaling what works.",
    href: "/contact",
    link: "JOIN THE WORK ↗",
  },
] as const;

export default function FoundationExperience() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -50, y: -50, ring: false });

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 1200);
    const scroll = () =>
      setProgress(
        window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
      );
    const move = (event: MouseEvent) =>
      setCursor({
        x: event.clientX,
        y: event.clientY,
        ring: Boolean((event.target as Element)?.closest("a,button")),
      });

    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("mousemove", move);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <main>
      <div className={`loader ${loaded ? "gone" : ""}`} aria-hidden="true">
        <i />
        <span>WHOLE BODY FOUNDATION</span>
      </div>
      <div
        className={`custom-cursor ${cursor.ring ? "ring" : ""}`}
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
        aria-hidden="true"
      />
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <SiteNav />

      <header className="hero" id="top">
        <InteractiveTerrain />
        <div className="hero-scrim" />
        <div className="hero-grid" />
        <div className="hero-copy">
          <span className="eyebrow reveal">
            EASTERN MOJAVE / PUBLIC-INTEREST FIELDWORK
          </span>
          <h1>
            <span className="hero-kicker">FIELDWORK FOR A</span>
            <em>Living Planet</em>
          </h1>
          <div className="hero-deck">
            <p>
              Observe the land. Test what works. Share what holds.
            </p>
          </div>
          <div className="hero-actions" aria-label="Explore the foundation">
            <Link className="button button-primary" href="/research">
              EXPLORE THE RESEARCH ↗
            </Link>
            <Link className="button button-quiet" href="/contact">
              JOIN THE WORK
            </Link>
          </div>
        </div>
      </header>

      <section id="mission" className="section mission-statement">
        <div>
          <span className="eyebrow">WHY THIS WORK</span>
          <h2>
            <span className="mission-line">The desert is not empty.</span>
            <em>It is information-dense.</em>
          </h2>
        </div>
        <p>
          Whole Body Foundation is building a public-interest field practice
          where environmental observation, regenerative growing, and community
          learning meet. We begin with measurable conditions and move only as
          fast as evidence, land, and responsible construction allow.
        </p>
      </section>

      <section className="section home-pathways">
        <div className="section-number light">01 / THE PUBLIC WORK</div>
        <div className="section-head light">
          <div>
            <span className="eyebrow">ONE CLEAR INVITATION</span>
            <h2>
              Start with the ground.
              <br />
              <em>Build from truth.</em>
            </h2>
          </div>
          <p>
            The public site carries the mission, research standards, people,
            and ways to participate. Each path is intentionally concise.
          </p>
        </div>
        <div className="pathway-grid">
          {publicPaths.map((path) => (
            <article key={path.number}>
              <span>{path.number}</span>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
              <Link className="text-link" href={path.href}>
                {path.link}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section portal-section">
        <div className="portal-public">
          <span className="eyebrow">A DELIBERATE BOUNDARY</span>
          <h2>
            Public mission.
            <br />
            <em>Private working room.</em>
          </h2>
          <p>
            Verified research methods and public-interest findings belong in
            the open. Design development, fabrication drawings, material
            takeoffs, financial planning, and collaborator notes need a smaller
            room with accountable access.
          </p>
          <strong>
            Nothing presented publicly is a construction drawing or a promise
            of physical performance.
          </strong>
        </div>
        <aside className="partner-portal">
          <div className="steward-mark" aria-hidden="true">
            <span>Ø</span>
          </div>
          <span className="eyebrow">PARTNER PORTAL / AUTHENTICATED</span>
          <h3>For the people making it real.</h3>
          <p>
            ØDIN / The Zero holds the evolving partner record: reviewed
            drawings, revisions, budgets, test plans, and build decisions.
          </p>
          <ul>
            <li>
              <span>01</span> Whitelisted collaborators
            </li>
            <li>
              <span>02</span> Versioned working documents
            </li>
            <li>
              <span>03</span> Engineer + builder review
            </li>
          </ul>
          <a
            className="button button-primary"
            href="https://www.odin.management/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            ENTER ØDIN ↗
          </a>
          <small>
            Access is handled by ØDIN. No shared password or private plan is
            shipped by this public page.
          </small>
        </aside>
      </section>

      <SiteFooter />
    </main>
  );
}
