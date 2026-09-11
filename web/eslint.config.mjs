import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/* eslint-config-next ships flat config in v16 — no FlatCompat wrapper needed
   (and it throws if you use one). */
const config = [
  ...next,
  ...nextTs,
  { ignores: ["out/**", ".next/**", "public/**", "next-env.d.ts"] },
];

export default config;
