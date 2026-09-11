"use client";

import { contact } from "@/content/pages";

/**
 * The form is not connected to anything, and says so.
 *
 * It cannot be: the site builds with output: "export", which has no API routes.
 * Before launch this needs a real endpoint — a form service, or a Laravel route
 * if the backend lands first. Until then submitting is prevented rather than
 * silently appearing to work, which would be worse than an obvious placeholder.
 */
export function ContactForm() {
  return (
    <form className="c-form" data-reveal onSubmit={(e) => e.preventDefault()}>
      <div className="row two">
        <label>
          <span>First name</span>
          <input type="text" name="first" autoComplete="given-name" placeholder="Jamie" />
        </label>
        <label>
          <span>Last name</span>
          <input type="text" name="last" autoComplete="family-name" placeholder="Whitfield" />
        </label>
      </div>
      <label>
        <span>Email</span>
        <input type="email" name="email" autoComplete="email" placeholder="you@example.co.uk" />
      </label>
      <label>
        <span>What is this about?</span>
        <select name="topic" defaultValue={contact.topics[0]}>
          {contact.topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" rows={5} placeholder="Tell us what you need&hellip;" />
      </label>
      <button className="c-send" type="submit">
        Send message
      </button>
      <p className="c-disclaimer">
        Prototype &mdash; this form is not connected to anything and sends nothing.
      </p>
    </form>
  );
}
