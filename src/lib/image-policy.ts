const knownPatterns = [
  { protocol: "https" as const, hostname: "i.ytimg.com", port: "", pathname: "/vi/**" },
  { protocol: "https" as const, hostname: "www.famhall.school11.edu.mn", port: "", pathname: "/image/**" },
];

export function publicImagePatterns(supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const patterns = [...knownPatterns];
  try {
    const url = new URL((supabaseUrl || "").trim().replace(/\/rest\/v1\/?$/, ""));
    if (url.protocol === "https:" && !url.port && !url.username && !url.password) {
      patterns.push({ protocol: "https", hostname: url.hostname, port: "", pathname: "/storage/v1/object/public/**" });
    }
  } catch { /* Unconfigured preview uses local images. */ }
  return patterns;
}

/** Retain direct rendering for unknown CMS origins, data/blob URLs and animation. */
export function unoptimizedPublicImage(src: string, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (/\.(svg|gif)(?:[?#]|$)/i.test(src)) return true;
  if (src.startsWith("/") && !src.startsWith("//")) return false;
  try {
    const url = new URL(src);
    return !publicImagePatterns(supabaseUrl).some(pattern =>
      url.protocol === `${pattern.protocol}:` && url.hostname === pattern.hostname &&
      url.port === pattern.port && !url.username && !url.password &&
      url.pathname.startsWith(pattern.pathname.slice(0, -2)),
    );
  } catch { return true; }
}
