import { gzipSync } from "node:zlib";

// Compare two production builds using the assets linked in each route's HTML.
// These are file sizes, not browser timings or a complete network waterfall.
const origin = new URL(process.argv[2] || "http://localhost:3017");
const measurements: Record<string, unknown> = {};
for (const route of ["/", "/about", "/achievements", "/courses", "/news", "/apply", "/admin/login"]) {
  const response = await fetch(new URL(route, origin));
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  const html = await response.text();
  const assets = {
    js: [...html.matchAll(/<script[^>]+src="([^"?]+)[^"]*"/g)].map(match => match[1]),
    css: [...html.matchAll(/<link[^>]+href="([^"?]+\.css)[^"]*"/g)].map(match => match[1]),
  };
  const sizes: Record<string, unknown> = {};
  for (const [kind, paths] of Object.entries(assets)) {
    const bodies = await Promise.all([...new Set(paths)].map(async path => {
      const asset = await fetch(new URL(path!, origin));
      if (!asset.ok) throw new Error(`${path}: HTTP ${asset.status}`);
      return Buffer.from(await asset.arrayBuffer());
    }));
    sizes[kind] = {
      count: bodies.length,
      raw: bodies.reduce((sum, body) => sum + body.length, 0),
      gzip: bodies.reduce((sum, body) => sum + gzipSync(body, { level: 9 }).length, 0),
    };
  }
  measurements[route] = { ...sizes, html_bytes: Buffer.byteLength(html) };
}
console.log(JSON.stringify(measurements, null, 2));
