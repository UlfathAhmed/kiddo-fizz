// Local static server for reviewing the design preview and the scroll prototype.
// Also accepts POST /__save so a page can hand captured frames back to disk.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const ROOT = process.cwd();
const FRAMES = process.env.FRAME_DIR || join(ROOT, "wireframe video", "frames");
const ASSETS = join(ROOT, "prototype", "assets");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
};

function body(req) {
  return new Promise((resolve, reject) => {
    let s = "";
    req.on("data", (c) => { s += c; if (s.length > 64e6) reject(new Error("too big")); });
    req.on("end", () => resolve(s));
    req.on("error", reject);
  });
}

createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);

  if (req.method === "POST" && path === "/__save") {
    try {
      const { name, dataUrl } = JSON.parse(await body(req));
      const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      // png/webp are prototype assets, everything else is a video frame grab
      const dir = /\.(png|webp)$/i.test(name) ? ASSETS : FRAMES;
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, name.replace(/[^\w.-]/g, "_")), Buffer.from(b64, "base64"));
      res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
    } catch (e) {
      res.writeHead(500, { "Content-Type": "text/plain" }).end(String(e));
    }
    return;
  }

  let p = path === "/" ? "/design/_preview.html" : path;
  if (p.includes("..")) { res.writeHead(400).end("bad path"); return; }
  try {
    const buf = await readFile(join(ROOT, normalize(p)));
    res.writeHead(200, { "Content-Type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(buf);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found: " + p);
  }
}).listen(5178, () => console.log("preview server on http://localhost:5178"));
