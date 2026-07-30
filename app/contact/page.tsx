import type { Metadata } from "next";
import SiteFooter from "../SiteFooter";
import SiteNav from "../SiteNav";

export const metadata: Metadata = {
  title: "Contact — Whole Body Foundation",
  description:
    "Contact Whole Body Foundation about research, stewardship, partnerships, or community work.",
};

const conversations = [
  {
    number: "01",
    title: "Research",
    body: "Methods, replication, field instruments, ethics, or data stewardship.",
    subject: "Research Inquiry",
  },
  {
    number: "02",
    title: "Land + community",
    body: "Local knowledge, ecology, stewardship, workshops, or site collaboration.",
    subject: "Land and Community Inquiry",
  },
  {
    number: "03",
    title: "Partner work",
    body: "Engineering, fabrication, funding, advisory, or authenticated partner access.",
    subject: "Partner Inquiry",
  },
] as const;

export default function ContactPage() {
  return (
    <main className="inner-page">
      <SiteNav />
      <header className="inner-hero contact-hero">
        <span className="eyebrow">CONTACT</span>
        <h1>
          Begin with
          <br />
          <em>a real question.</em>
        </h1>
        <p>
          Tell us what you know, what you are building, or where the work can be
          made more rigorous.
        </p>
      </header>

      <section className="section contact-section">
        <div className="section-number">01 / OPEN A CONVERSATION</div>
        <div className="contact-grid">
          {conversations.map((conversation) => (
            <article key={conversation.number}>
              <span>{conversation.number}</span>
              <h2>{conversation.title}</h2>
              <p>{conversation.body}</p>
              <a
                className="text-link"
                href={`mailto:jesse@wholebody.foundation?subject=${encodeURIComponent(
                  conversation.subject,
                )}`}
              >
                WRITE TO JESSE ↗
              </a>
            </article>
          ))}
        </div>
        <div className="direct-contact">
          <span className="eyebrow">DIRECT</span>
          <a href="mailto:jesse@wholebody.foundation">
            jesse@wholebody.foundation
          </a>
          <p>Morongo Valley · San Bernardino County · California</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
