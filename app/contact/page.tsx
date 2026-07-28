"use client";

import { FormEvent, useState } from "react";
import RouteNav from "../RouteNav";

export default function ContactPage(){
  const [sent,setSent]=useState(false);
  function submit(e:FormEvent){e.preventDefault();setSent(true)}
  return <main className="subpage contact-page"><RouteNav />
    <header className="subhero"><span className="eyebrow">CONTACT / MORONGO VALLEY</span><h1>Start a<br /><em>conversation.</em></h1><p>For grant inquiries, research partnerships, advisory roles, field participation, and project support.</p></header>
    <section className="contact-grid">
      <form onSubmit={submit}>{sent?<div className="form-success"><span>MESSAGE READY</span><h2>Thank you.</h2><p>This prototype does not transmit data yet. Please email Jesse directly using the address alongside this form.</p></div>:<>
        <label>YOUR NAME<input name="name" required placeholder="Name" /></label>
        <label>ORGANIZATION<input name="organization" placeholder="Organization or affiliation" /></label>
        <label>EMAIL<input type="email" name="email" required placeholder="you@example.org" /></label>
        <label>MESSAGE<textarea name="message" required rows={7} placeholder="Tell us what you’re interested in..." /></label>
        <button type="submit">PREPARE INQUIRY <span>→</span></button>
      </>}</form>
      <aside><div><span className="eyebrow">DIRECT</span><a href="mailto:jesse@wholebody.foundation">jesse@wholebody.foundation</a></div><div><span className="eyebrow">LOCATION</span><p>Morongo Valley, California<br />Mailing address available on request</p></div><div className="grant-box"><span>FOR GRANT OFFICERS</span><p>Request the project narrative, preliminary budget, fiscal sponsorship status, and research methods overview.</p><a href="mailto:jesse@wholebody.foundation?subject=Grant%20Inquiry">BEGIN GRANT INQUIRY ↗</a></div></aside>
    </section>
  </main>
}
