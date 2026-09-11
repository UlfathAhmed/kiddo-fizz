// throwaway: stacks the artboard bodies into one plain HTML page for a visual check
import { readFileSync, writeFileSync } from "node:fs";
const order = ["Main","BeatCaffeine","BeatVitamins","BeatAspartame","BeatBubblegum","Nutrition","Family","Range","Stockists","Footer"];
let head = "", out = "";
for (const n of order) {
  const s = readFileSync(n + ".dc.html", "utf8");
  const inner = s.split("<x-dc>")[1].split("</x-dc>")[0];
  const hel = inner.split("<helmet>")[1].split("</helmet>")[0];
  if (!head) head = hel;
  const body = inner.split("</helmet>")[1];
  out += '<div style="margin:0 auto 44px;width:1280px;box-shadow:0 10px 34px rgba(0,0,0,.20)"><div style="font:700 12px/1 monospace;padding:9px;color:#7a7168">' + n + '</div>' + body + '</div>';
}
writeFileSync("_preview.html", '<!doctype html><html><head><meta charset="utf-8">' + head + '<style>body{background:#DDD6CC;padding:44px 0;margin:0}</style></head><body>' + out + '</body></html>', "utf8");
console.log("preview written");
