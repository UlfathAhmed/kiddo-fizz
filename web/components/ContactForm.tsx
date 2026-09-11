"use client";

import { useState } from "react";
import { contact } from "@/content/pages";

/**
 * The contact form.
 *
 * A static export has no API routes, so submissions go to whatever endpoint is
 * configured in NEXT_PUBLIC_FORM_ENDPOINT — a form service now, or a Laravel
 * route once the backend exists. The component does not care which; it posts
 * FormData and reads the status code.
 *
 * With no endpoint configured it says so and refuses to submit, rather than
 * appearing to send and silently dropping a parent's question about allergens.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ENDPOINT || state === "sending") return;

    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="c-form c-sent" data-reveal role="status">
        <h3>Thank you — that is with us.</h3>
        <p>We answer within two working days.</p>
        <button className="c-send" type="button" onClick={() => setState("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="c-form" data-reveal onSubmit={onSubmit} noValidate={false}>
      <div className="row two">
        <label>
          <span>First name</span>
          <input type="text" name="first" autoComplete="given-name" placeholder="Jamie" required />
        </label>
        <label>
          <span>Last name</span>
          <input type="text" name="last" autoComplete="family-name" placeholder="Whitfield" required />
        </label>
      </div>
      <label>
        <span>Email</span>
        <input type="email" name="email" autoComplete="email" placeholder="you@example.co.uk" required />
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
        <textarea name="message" rows={5} placeholder="Tell us what you need&hellip;" required />
      </label>

      <button className="c-send" type="submit" disabled={!ENDPOINT || state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>

      {!ENDPOINT && (
        <p className="c-disclaimer">
          No form endpoint is configured yet, so this button is disabled. Set{" "}
          <code>NEXT_PUBLIC_FORM_ENDPOINT</code> to switch it on.
        </p>
      )}
      {state === "error" && (
        <p className="c-disclaimer" role="alert">
          That did not send. Please email{" "}
          <a href={`mailto:${contact.cards[0].email}`}>{contact.cards[0].email}</a> instead.
        </p>
      )}
    </form>
  );
}
