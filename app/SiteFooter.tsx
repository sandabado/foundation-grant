import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div>
        <span className="eyebrow">WHOLE BODY FOUNDATION</span>
        <h2>
          Old Glory Peak
          <br />
          <em>Field Station.</em>
        </h2>
      </div>
      <div className="footer-side">
        <p>Field research · Land stewardship · Public-interest science</p>
        <a
          className="button button-primary"
          href="mailto:jesse@wholebody.foundation?subject=Whole%20Body%20Foundation%20Inquiry"
        >
          EMAIL THE FOUNDATION ↗
        </a>
        <a
          className="footer-email"
          href="mailto:jesse@wholebody.foundation"
        >
          JESSE@WHOLEBODY.FOUNDATION
        </a>
        <div className="footer-links" aria-label="Footer navigation">
          <Link href="/research">Research</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <a
            href="https://www.odin.management/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Partner Portal ↗
          </a>
        </div>
      </div>
      <small>
        © 2026 WHOLE BODY FOUNDATION · FOUNDATION-AUTHORED PUBLIC RESEARCH
        OUTPUTS ARE RELEASED UNDER{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY 4.0 INTERNATIONAL
        </a>
      </small>
    </footer>
  );
}
