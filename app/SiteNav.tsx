"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="topnav" aria-label="Primary navigation">
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <span>W/B</span> WHOLE BODY FOUNDATION
      </Link>
      <button
        className="menu-button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="primary-navigation"
      >
        NAVIGATION <i aria-hidden="true">{open ? "×" : "+"}</i>
      </button>
      <div
        id="primary-navigation"
        className={`navlinks ${open ? "open" : ""}`}
      >
        {links.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={active ? "active" : undefined}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
        <a
          className="nav-cta"
          href="https://www.odin.management/login"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
        >
          Partner Portal
        </a>
      </div>
    </nav>
  );
}
