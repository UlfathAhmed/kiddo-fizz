/* Privacy and terms.
 *
 * These pages exist so the footer links go somewhere real rather than nowhere,
 * and they say plainly that the documents are being prepared. No legal text is
 * drafted here: a privacy notice is a statement of what a company actually does
 * with personal data, and inventing one would be both wrong and useless.
 *
 * The privacy notice is a genuine launch blocker — the contact form collects a
 * name, an email address and a message, which is personal data under UK GDPR.
 */

export const legal = {
  privacy: {
    eyebrow: "Privacy",
    heading: "Privacy\nnotice.",
    sub:
      "The contact form collects personal data, so this page has to exist before " +
      "the site goes live. It is being prepared with KiddoFizz.",
    notice: {
      strong: "This is a launch blocker, not a nicety.",
      body:
        "The contact form takes a name, an email address and a message. Under UK " +
        "GDPR that is personal data, and a site collecting it owes visitors a clear " +
        "account of what happens to it. The wording has to come from KiddoFizz and " +
        "describe what they actually do — it cannot be drafted from a template here.",
    },
    needsHeading: "What the notice needs to cover",
    needsSub:
      "Each of these is a question a parent is entitled to ask before sending a " +
      "message about what is in the bottle.",
    needs: [
      ["1. What is collected", "The contact form fields, plus anything analytics records once analytics is chosen."],
      ["2. Why, and on what basis", "The lawful basis for processing each item — consent, legitimate interests, or a legal obligation."],
      ["3. Who else sees it", "The form provider, the email host, and any analytics or hosting processor."],
      ["4. How long it is kept", "A stated retention period for enquiries, rather than indefinitely."],
      ["5. Visitors' rights", "Access, correction, erasure, objection, and how to exercise them."],
      ["6. Who to contact", "A named controller, a postal address, and how to complain to the ICO."],
    ] as const,
    fine:
      "Cookies need the same treatment. If analytics is added, non-essential cookies " +
      "require consent before they are set under PECR — a banner that only informs is " +
      "not enough.",
  },

  terms: {
    eyebrow: "Terms",
    heading: "Terms of\nservice.",
    sub:
      "Being prepared with KiddoFizz. The site sells nothing directly, which keeps " +
      "these short.",
    notice: {
      strong: "Lighter than most, because nothing is sold here.",
      body:
        "The drink is sold through retailers with no direct checkout, so there are no " +
        "consumer contract, payment, delivery or returns terms to write. What remains " +
        "is ordinary website terms, and they still need KiddoFizz's own wording.",
    },
    needsHeading: "What the terms need to cover",
    needsSub: "Short, but not optional — a public site makes claims and hosts content.",
    needs: [
      ["1. Who runs the site", "The company name, registered number and address."],
      ["2. Use of the site", "What visitors may and may not do with it."],
      ["3. Accuracy of content", "Particularly product information, which the packaging governs."],
      ["4. Intellectual property", "Ownership of the brand, artwork and photography."],
      ["5. Liability", "The usual limits, within what UK consumer law allows."],
      ["6. Governing law", "England and Wales, presumably — to be confirmed."],
    ] as const,
    fine:
      "Product claims on this site must match the packaging and follow the GB Nutrition " +
      "and Health Claims Register. Advertising food to under-16s is also governed by the " +
      "CAP Code, which KiddoFizz should confirm with their own compliance advice.",
  },
};
