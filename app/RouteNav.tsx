"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  ["/", "Home"], ["/vision", "Vision"], ["/#dome", "Dome"], ["/#garden", "Garden"],
  ["/survey", "Survey"], ["/#budget", "Budget"], ["/#roadmap", "Roadmap"], ["/team", "Team"],
];

export default function RouteNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="route-nav">
      <Link href="/" className="brand"><span>W/B</span> WHOLE BODY FOUNDATION</Link>
      <button onClick={() => setOpen(!open)} aria-expanded={open}>MENU <i>{open ? "×" : "+"}</i></button>
      <div className={open ? "open" : ""}>
        {links.map(([href, label], i) => <Link key={label} href={href} onClick={() => setOpen(false)}><small>0{i + 1}</small>{label}</Link>)}
        <Link href="/contact" className="contact-link">Contact ↗</Link>
      </div>
    </nav>
  );
}
