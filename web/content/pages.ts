/* Per-page content: About, Contact and the FAQ. Same principle as product.ts —
   copy lives here, not in markup, so a CMS can replace it without touching a
   component. */

export type Faq = { q: string; a: string; placeholder?: string; note?: string };

export const faqs: Faq[] = [
  {
    q: "Is it really caffeine free?",
    a:
      "Yes. The bottle carries a “no caffeine” claim on the front label — there is " +
      "none in the recipe, so there is no buzz before bedtime and no crash after it.",
  },
  {
    q: "Where does the sweetness come from?",
    a:
      "The label states that the sugars come from apple juice, and that the drink is " +
      "aspartame free. Exact sugar content per bottle appears in the nutrition table " +
      "on the product page once the figures are supplied.",
  },
  {
    q: "What age is it suitable for?",
    a: "",
    placeholder: "[ AGE GUIDANCE TO BE CONFIRMED BY KIDDOFIZZ ]",
    note:
      "This is a question worth answering precisely rather than vaguely, so it waits " +
      "for the client’s own wording.",
  },
  {
    q: "What vitamins are in it, and how much?",
    a:
      "Vitamin C, niacin (B3), pantothenic acid (B5), and vitamin B6 with folic acid. " +
      "Amounts and %NRV go in the nutrition table — and any claim made about what those " +
      "vitamins do has to use the authorised wording from the GB register.",
  },
  {
    q: "Is the bottle recyclable?",
    a:
      "It is a clear PET bottle, which is collected by every UK kerbside scheme. Leave " +
      "the cap on when you put it out — loose caps are too small to be sorted and get " +
      "lost in the process.",
  },
  {
    q: "Where can I buy it?",
    a:
      "Through retailers rather than direct — there is no online checkout. The stockist " +
      "list goes live with launch.",
  },
];

/* About is deliberately unwritten. A company's own account of itself is the one
   part of a site that cannot be drafted on the client's behalf, so the page ships
   as a structured request for exactly what is missing. */
export const about = {
  eyebrow: "About us",
  heading: "About KiddoFizz.",
  sub:
    "The page is built and sits in the navigation. The words that go on it have to " +
    "come from KiddoFizz.",
  notice: {
    strong: "Awaiting direction from the client.",
    body:
      "A company’s own account of itself — who founded it, why, and what it stands " +
      "for — is the one part of a website that cannot be drafted on the client’s " +
      "behalf. Filling this page with invented history would put words in KiddoFizz’s " +
      "mouth and give the wrong impression of how far the content is along.",
  },
  needsHeading: "What the page needs",
  needsSub:
    "Each item below is a section already accounted for in the layout. As the client " +
    "supplies them, they drop in without any rework to the design.",
  needs: [
    ["1. Company background", "Who founded KiddoFizz, when the company was formed, and what prompted it. Where the business is registered and based."],
    ["2. Mission and positioning", "The case the brand wants to make to parents, in the client’s own words — and the line they want the range judged against."],
    ["3. Production and sourcing", "Where the drink is made and bottled, which partners are involved, and any certifications or standards worth naming."],
    ["4. The people", "Names, roles and a short line each for anyone the client wants named. Photography if it exists; otherwise the section runs as text."],
    ["5. Packaging and sustainability", "Any commitments the client is prepared to state publicly. These need to be specific and substantiated rather than general environmental claims."],
    ["6. Proof points", "Retail listings, awards, press coverage or trade accreditations — whatever is on record and can be evidenced."],
  ] as const,
  fine:
    "Two notes for whoever writes this copy. Claims about the product’s nutrition or " +
    "health benefits are regulated in the UK and must follow authorised wording from the " +
    "GB Nutrition and Health Claims Register. Environmental claims must be specific and " +
    "evidenced — broad statements such as “eco-friendly” do not meet CMA guidance.",
};

export const contact = {
  eyebrow: "Contact",
  heading: "Say hello.",
  sub:
    "Questions about what is in the bottle, where to buy it, or getting KiddoFizz onto " +
    "your shelves — this is the place.",
  formHeading: "Send us a message",
  formNote: "We answer within two working days.",
  topics: [
    "Ingredients and allergens",
    "Where to buy",
    "Stocking KiddoFizz",
    "Press and media",
    "Something else",
  ],
  cards: [
    {
      title: "For families",
      body: "Ingredients, allergens, vitamins, or anything else on the label.",
      email: "hello@kiddofizz.co.uk",
      tint: "#0AA838",
      onInk: false,
    },
    {
      title: "For retailers",
      body: "Wholesale, cases of 12 × 250ml, and trade enquiries.",
      email: "trade@kiddofizz.co.uk",
      tint: "#0660C8",
      onInk: false,
    },
    {
      title: "Press",
      body: "Samples, images and interview requests.",
      email: "press@kiddofizz.co.uk",
      tint: "#FB8C0B",
      onInk: true,
    },
  ],
  faqEyebrow: "For parents",
  faqHeading: "The questions we actually get.",
};

export const products = {
  eyebrow: "Our range",
  heading: "One drink.\nDone properly.",
  sub:
    "Bubblegum flavour, caffeine free, in a 250ml bottle. A second flavour is on the " +
    "way — this is where it will live.",
  soon: {
    kicker: "Coming soon",
    title: "Flavour two",
    lede:
      "The range is built for more than one. When the second flavour lands it slots in " +
      "here, same format, same label rules.",
    cta: "Tell me when it lands",
  },
};

export const home = {
  heroTitle: "STAY FIZZY",
  heroNote:
    "A bubblegum drink made for kids. No caffeine, no aspartame, low calorie — with " +
    "sugars from apple juice.",
  heroCta: "See what’s inside",
  featureEyebrow: "What is inside",
  featureHeading: "A Fun, Refreshing Drink.",
  featureSub: "And a back label that holds up to a proper read.",
  featureCards: [
    ["Caffeine free", "None at all. The fizz without the buzz, or the bedtime negotiation.", "#0AA838", false],
    ["Low calorie", "Light enough to be an everyday drink rather than a treat.", "#FB8C0B", true],
    ["Aspartame free", "Sweetened without it. The sugars come from apple juice.", "#0660C8", false],
    ["Vitamins B3, B5, B6 & C", "Niacin, pantothenic acid, B6 with folic acid, and vitamin C.", "#EE0A1E", false],
    ["Bubblegum flavour", "The bottle they recognise, with the flavour they ask for.", "#FFC72C", true],
  ] as const,
  showcase: { l1: "We have one", l2: "seriously", l3: "good flavour", cta: "Find a stockist" },
};
