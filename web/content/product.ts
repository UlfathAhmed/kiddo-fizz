/* The product, as data.
 *
 * Every value the client has not supplied is a `placeholder`, not invented copy.
 * Nutrition figures, ingredients, allergens and age guidance are legal
 * declarations — a plausible-looking number is worse than an obvious gap because
 * it can survive review unnoticed. Keeping them as a typed shape means the
 * outstanding list can be generated rather than remembered.
 */

export type Placeholder = { placeholder: string; note?: string };
export const isPlaceholder = (v: unknown): v is Placeholder =>
  typeof v === "object" && v !== null && "placeholder" in v;

export type Claim = {
  no: string;
  label: string;
  note?: string;
  tint: string;
};

export type Chip = { label: string; tint: string };

export type NutritionRow = {
  label: string;
  /* per 100ml, per bottle, %NRV — all em dashes until the client supplies them */
  per100: string;
  perBottle: string;
  nrv: string;
  kind?: "sub" | "group";
};

export const brandTints = {
  red: "#EE0A1E",
  orange: "#FB8C0B",
  green: "#0AA838",
  blue: "#0660C8",
  yellow: "#FFC72C",
} as const;

export const product = {
  slug: "bubblegum-drink",
  name: "Bubblegum Drink",
  lede:
    "A caffeine-free bubblegum drink in a 250ml bottle. The shape they recognise " +
    "on the shelf, with a back label that holds up to a proper read.",
  rangeLede:
    "The bottle they recognise on the shelf, with the flavour they actually ask " +
    "for — and a back label that holds up to a proper read.",
  specs: [
    { label: "Size", value: "250ml" },
    { label: "Formats", value: "Single · case of 12" },
    { label: "Bottle", value: "Recyclable PET" },
  ],
  /* the six claims that run beside the range shot */
  chips: [
    { label: "No caffeine", tint: brandTints.green },
    { label: "Low calories", tint: brandTints.orange },
    { label: "Apple juice sugars", tint: brandTints.red },
    { label: "Aspartame free", tint: brandTints.blue },
    { label: "Vitamins B3, B5, B6 & C", tint: brandTints.green },
    { label: "Bubblegum flavour", tint: brandTints.orange },
  ] satisfies Chip[],
  /* the nine claims printed on the bottle, transcribed exactly */
  claims: [
    { no: "01", label: "No caffeine", tint: brandTints.green },
    { no: "02", label: "Low calories", tint: brandTints.orange },
    { no: "03", label: "Apple juice", note: "— sugars from apple juice", tint: brandTints.red },
    { no: "04", label: "Aspartame free", tint: brandTints.blue },
    { no: "05", label: "Vitamin C", tint: brandTints.yellow },
    { no: "06", label: "Vitamin B3", note: "(niacin)", tint: brandTints.green },
    { no: "07", label: "Vitamin B5", note: "(pantothenic acid)", tint: brandTints.blue },
    { no: "08", label: "Vitamin B6", note: "& folic acid", tint: brandTints.orange },
    { no: "09", label: "Bubble gum flavour", tint: brandTints.red },
  ] satisfies Claim[],
  gallery: [
    { view: "single", label: "Single", image: "feature-bottle", alt: "KiddoFizz Bubblegum, 250ml bottle" },
    { view: "case", label: "Case of 12", image: "case", alt: "KiddoFizz Bubblegum, case of 12 × 250ml" },
    { view: "serve", label: "Chilled", image: "hero-product", alt: "KiddoFizz Bubblegum bottle, chilled and poured" },
    { view: "more", label: "To come", image: null, alt: "" },
  ],
  ingredients: {
    placeholder: "[ FULL INGREDIENTS LIST TO BE SUPPLIED BY KIDDOFIZZ ]",
    note: "Taken verbatim from the printed label once supplied. Nothing here is paraphrased.",
  } satisfies Placeholder,
  allergens: {
    placeholder: "[ ALLERGEN STATEMENT TO BE CONFIRMED ]",
    note:
      "Allergen information is a legal declaration, so it goes on the page exactly " +
      "as it appears on the pack — never summarised.",
  } satisfies Placeholder,
};

const DASH = "—";

export const nutrition: NutritionRow[] = [
  { label: "Energy", per100: DASH, perBottle: DASH, nrv: "" },
  { label: "Fat", per100: DASH, perBottle: DASH, nrv: "" },
  { label: "of which saturates", per100: DASH, perBottle: DASH, nrv: "", kind: "sub" },
  { label: "Carbohydrate", per100: DASH, perBottle: DASH, nrv: "" },
  { label: "of which sugars", per100: DASH, perBottle: DASH, nrv: "", kind: "sub" },
  { label: "Protein", per100: DASH, perBottle: DASH, nrv: "" },
  { label: "Salt", per100: DASH, perBottle: DASH, nrv: "" },
  { label: "Vitamins", per100: "", perBottle: "", nrv: "", kind: "group" },
  { label: "Vitamin C", per100: DASH, perBottle: DASH, nrv: DASH },
  { label: "Niacin (B3)", per100: DASH, perBottle: DASH, nrv: DASH },
  { label: "Pantothenic acid (B5)", per100: DASH, perBottle: DASH, nrv: DASH },
  { label: "Vitamin B6", per100: DASH, perBottle: DASH, nrv: DASH },
  { label: "Folic acid", per100: DASH, perBottle: DASH, nrv: DASH },
];

export const nutritionNotice = {
  strong: "Every figure is deliberately blank.",
  body:
    "Nutrition data is a legal declaration and will be filled in from KiddoFizz's " +
    "own certified figures. Nothing on this page is estimated or invented.",
  footnote:
    "*NRV: Nutrient Reference Value. Vitamin claims will follow the authorised " +
    "wording in the GB Nutrition and Health Claims Register.",
};
