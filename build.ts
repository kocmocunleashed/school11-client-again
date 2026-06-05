#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import { existsSync } from "fs";
import { cp, mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

const defaultSiteUrl = "https://school11-client-again.vercel.app";
const normalizeSiteUrl = (value: string | undefined) => {
  const trimmed = (value || defaultSiteUrl).trim().replace(/\/+$/, "");
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return defaultSiteUrl;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return defaultSiteUrl;
  }
};
const siteUrl = normalizeSiteUrl(process.env.SITE_URL);
const schoolStructuredData = {
  "@context": "https://schema.org",
  "@type": "School",
  name: "Нийслэлийн 11-р сургууль",
  alternateName: [
    "11-р сургууль",
    "Нийслэлийн 11 сургууль",
    "School 11 Ulaanbaatar",
  ],
  url: `${siteUrl}/`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Партизаны гудамж",
    addressLocality: "Улаанбаатар",
    addressRegion: "Сүхбаатар дүүрэг",
    addressCountry: "MN",
  },
  telephone: "+976 11 327226",
  email: "School_11@edub.edu.mn",
};

type StaticRoute = {
  path: string;
  title: string;
  description: string;
  html: string;
};

const staticRoutes: StaticRoute[] = [
  {
    path: "/",
    title: "Нийслэлийн 11-р сургууль",
    description: "Нийслэлийн 11-р сургуулийн мэдээ, багш нар, сургалт, амжилт, элсэлтийн мэдээлэл.",
    html: `
      <main class="static-crawl-page">
        <nav aria-label="Үндсэн цэс">
          <a href="/">Нүүр</a>
          <a href="/about">Бидний тухай</a>
          <a href="/achievements">Амжилт</a>
          <a href="/courses">Сургалт</a>
          <a href="/apply">Элсэлт</a>
        </nav>
        <section>
          <p>НИЙСЛЭЛИЙН · EST. 1940</p>
          <h1>Нийслэлийн 11-р сургууль</h1>
          <p>11-р сургууль нь Улаанбаатар хотын Сүхбаатар дүүрэгт байрлах ерөнхий боловсролын сургууль бөгөөд сурагчдын академик сахилга, бүтээлч сэтгэлгээ, хамтын ажиллагааг дэмждэг.</p>
          <p>Нийслэлийн 11 сургууль буюу School 11 Ulaanbaatar-ийн албан ёсны цахим хуудсаас мэдээ, сургалт, амжилт, элсэлтийн мэдээллийг авна уу.</p>
        </section>
        <section>
          <h2>Сүүлийн мэдээ</h2>
          <article>
            <h3>Математикийн олимпиадад тэргүүн байр эзэллээ</h3>
            <p>Манай сургуулийн сурагчид улсын олимпиадад өндөр амжилт үзүүллээ.</p>
          </article>
          <article>
            <h3>Сургуулийн түүхэн материал цуглуулах ажил эхэллээ</h3>
            <p>Сургуулийн түүхэн замналыг баримтжуулах ажилд төгсөгчид, багш нар нэгдэж байна.</p>
          </article>
          <article>
            <h3>Шинжлэх ухаан, урлаг, спортын дугуйлангууд шинэ элсэлт авч байна</h3>
            <p>Сурагчдын сонирхол, авьяасыг хөгжүүлэх олон төрлийн клубүүд бүртгэлээ нээлээ.</p>
          </article>
        </section>
        <section>
          <h2>Мэргэжлийн багш нар</h2>
          <p>Туршлагатай багш нар сурагчдын академик сахилга, бүтээлч сэтгэлгээ, судалгааны оролцоог хөгжүүлдэг.</p>
        </section>
      </main>
    `,
  },
  {
    path: "/about",
    title: "Бидний тухай | Нийслэлийн 11-р сургууль",
    description: "Нийслэлийн 11-р сургуулийн түүх, эрхэм зорилго, холбоо барих мэдээлэл.",
    html: `
      <main class="static-crawl-page">
        <nav aria-label="Үндсэн цэс">
          <a href="/">Нүүр</a>
          <a href="/about">Бидний тухай</a>
          <a href="/achievements">Амжилт</a>
          <a href="/courses">Сургалт</a>
          <a href="/apply">Элсэлт</a>
        </nav>
        <h1>Бидний тухай</h1>
        <section>
          <h2>Математик, байгалийн ухааны соёлыг төлөвшүүлэгч сургууль</h2>
          <p>Нийслэлийн 11-р сургууль нь сурагч бүрийн академик сахилга, бүтээлч сэтгэлгээ, нийгмийн хариуцлагыг зэрэг хөгжүүлэхийг зорьдог.</p>
          <p>Бид сургалтын чанар, багшийн арга зүй, сурагчийн судалгааны оролцоог нэг систем болгон хөгжүүлдэг.</p>
        </section>
        <section>
          <h2>Эрхэм зорилго</h2>
          <p>Суралцахуйн өндөр стандарт, ёс зүй, хамтын ажиллагаанд тулгуурлан ирээдүйн манлайлагчдыг бэлтгэнэ.</p>
        </section>
        <section>
          <h2>Холбоо барих</h2>
          <p>Партизаны гудамж, Сүхбаатар дүүрэг, Улаанбаатар.</p>
          <p>Утас: +976 11 327226. Имэйл: School_11@edub.edu.mn.</p>
        </section>
      </main>
    `,
  },
  {
    path: "/achievements",
    title: "Амжилт | Нийслэлийн 11-р сургууль",
    description: "Сургуулийн олимпиад, судалгаа, сургалтын чанарын онцлох амжилтууд.",
    html: `
      <main class="static-crawl-page">
        <nav aria-label="Үндсэн цэс">
          <a href="/">Нүүр</a>
          <a href="/about">Бидний тухай</a>
          <a href="/achievements">Амжилт</a>
          <a href="/courses">Сургалт</a>
          <a href="/apply">Элсэлт</a>
        </nav>
        <h1>Амжилтын замнал</h1>
        <p>Олимпиад, судалгаа, сургалтын чанараар хэмжигдэх олон жилийн итгэл.</p>
        <section>
          <h2>Түүхэн үйл явдлууд</h2>
          <article>
            <h3>1940 · Үүсгэн байгуулагдсан</h3>
            <p>Нийслэлийн боловсролын салбарт математик, байгалийн ухааны чиглэлээр ялгарах сууриа тавьсан.</p>
          </article>
          <article>
            <h3>1989 · Гүнзгийрүүлсэн сургалт</h3>
            <p>Математик, физикийн сонгон сургалт тогтмолжиж, олимпиадын багш-сурагчийн систем бүрэлдсэн.</p>
          </article>
          <article>
            <h3>2016 · Шинэ байр</h3>
            <p>Орчин үеийн сургалтын орчинтой шинэ хичээлийн байр ашиглалтад орж, лаборатори, танхимын хүртээмж сайжирсан.</p>
          </article>
        </section>
      </main>
    `,
  },
  {
    path: "/courses",
    title: "Сургалт | Нийслэлийн 11-р сургууль",
    description: "Секц, дугуйлан, олимпиадын бэлтгэл болон сургалтын чиглэлүүд.",
    html: `
      <main class="static-crawl-page">
        <nav aria-label="Үндсэн цэс">
          <a href="/">Нүүр</a>
          <a href="/about">Бидний тухай</a>
          <a href="/achievements">Амжилт</a>
          <a href="/courses">Сургалт</a>
          <a href="/apply">Элсэлт</a>
        </nav>
        <h1>Сургалтын орчин ба клубүүд</h1>
        <p>Гүнзгийрүүлсэн хичээл, лаборатори, олимпиад, сонирхлын дугуйлан нэг системд.</p>
        <section>
          <h2>Секц ба дугуйлан</h2>
          <article>
            <h3>Математик олимпиад</h3>
            <p>Бодлогын арга зүй, нотолгооны соёл. Мягмар, Пүрэв 15:30.</p>
          </article>
          <article>
            <h3>Физик судалгаа</h3>
            <p>Туршилт, хэмжилт, инженерчлэлийн суурь. Даваа, Лхагва 16:00.</p>
          </article>
          <article>
            <h3>Роботик ба код</h3>
            <p>Алгоритм, электроник, багийн төсөл. Баасан 15:00.</p>
          </article>
          <article>
            <h3>Урлагийн студи</h3>
            <p>Найрал дуу, хөгжим, тайзны соёл. Лхагва 15:30.</p>
          </article>
        </section>
      </main>
    `,
  },
  {
    path: "/apply",
    title: "Элсэлт | Нийслэлийн 11-р сургууль",
    description: "Элсэлтийн гарын авлага болон өргөдлийн үр дүн шалгах хэсэг.",
    html: `
      <main class="static-crawl-page">
        <nav aria-label="Үндсэн цэс">
          <a href="/">Нүүр</a>
          <a href="/about">Бидний тухай</a>
          <a href="/achievements">Амжилт</a>
          <a href="/courses">Сургалт</a>
          <a href="/apply">Элсэлт</a>
        </nav>
        <h1>Элсэлт</h1>
        <section>
          <h2>Элсэлтийн гарын авлага</h2>
          <p>Элсэлтийн материал, хугацаа, баталгаажуулалтын дарааллыг нэг дороос харна уу.</p>
          <p><a href="/application-guide.pdf">Элсэлтийн гарын авлага PDF татаж авах</a></p>
        </section>
        <section>
          <h2>Элсэлтийн үр дүн шалгах</h2>
          <p>Өргөдлийн хариуг зөвхөн танд өгсөн 8 тэмдэгттэй кодоор шалгана. Хувийн үр дүн, сурагчийн мэдээлэл олон нийтэд нийтлэгдэхгүй.</p>
        </section>
      </main>
    `,
  },
];

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🏗️  Bun Build Script

Usage: bun run build.ts [options]

Common Options:
  --outdir <path>          Output directory (default: "dist")
  --minify                 Enable minification (or --minify.whitespace, --minify.syntax, etc)
  --sourcemap <type>      Sourcemap type: none|linked|inline|external
  --target <target>        Build target: browser|bun|node
  --format <format>        Output format: esm|cjs|iife
  --splitting              Enable code splitting
  --packages <type>        Package handling: bundle|external
  --public-path <path>     Public path for assets
  --env <mode>             Environment handling: inline|disable|prefix*
  --conditions <list>      Package.json export conditions (comma separated)
  --external <list>        External packages (comma separated)
  --banner <text>          Add banner text to output
  --footer <text>          Add footer text to output
  --define <obj>           Define global constants (e.g. --define.VERSION=1.0.0)
  --help, -h               Show this help message

Example:
  bun run build.ts --outdir=dist --minify --sourcemap=linked --external=react,react-dom
`);
  process.exit(0);
}

const toCamelCase = (str: string): string => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

const parseValue = (value: string): any => {
  if (value === "true") return true;
  if (value === "false") return false;

  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value);

  if (value.includes(",")) return value.split(",").map(v => v.trim());

  return value;
};

function parseArgs(): Partial<Bun.BuildConfig> {
  const config: Partial<Bun.BuildConfig> = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (!arg.startsWith("--")) continue;

    if (arg.startsWith("--no-")) {
      const key = toCamelCase(arg.slice(5));
      config[key] = false;
      continue;
    }

    if (!arg.includes("=") && (i === args.length - 1 || args[i + 1]?.startsWith("--"))) {
      const key = toCamelCase(arg.slice(2));
      config[key] = true;
      continue;
    }

    let key: string;
    let value: string;

    if (arg.includes("=")) {
      [key, value] = arg.slice(2).split("=", 2) as [string, string];
    } else {
      key = arg.slice(2);
      value = args[++i] ?? "";
    }

    key = toCamelCase(key);

    if (key.includes(".")) {
      const [parentKey, childKey] = key.split(".");
      config[parentKey] = config[parentKey] || {};
      config[parentKey][childKey] = parseValue(value);
    } else {
      config[key] = parseValue(value);
    }
  }

  return config;
}

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const normalizeRoutePath = (routePath: string) => routePath === "/" ? "" : routePath.replace(/^\/+|\/+$/g, "");

const routeOutputPath = (outdir: string, routePath: string) => {
  const normalized = normalizeRoutePath(routePath);
  return normalized ? path.join(outdir, normalized, "index.html") : path.join(outdir, "index.html");
};

const stripManagedHeadTags = (html: string) => html
  .replace(/\s*<meta\s+name=["']description["'][^>]*>\s*/i, "\n")
  .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/i, "\n")
  .replace(/\s*<meta\s+name=["']robots["'][^>]*>\s*/i, "\n")
  .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, "\n")
  .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "\n")
  .replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, "\n");

const buildStaticHtml = (shell: string, route: StaticRoute) => {
  const canonicalPath = route.path === "/" ? "/" : route.path;
  const canonicalUrl = `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;
  const managedHead = [
    `    <meta name="description" content="${route.description}" />`,
    `    <link rel="canonical" href="${canonicalUrl}" />`,
    `    <meta name="robots" content="index, follow" />`,
    `    <meta property="og:title" content="${route.title}" />`,
    `    <meta property="og:description" content="${route.description}" />`,
    `    <meta property="og:url" content="${canonicalUrl}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta name="twitter:card" content="summary" />`,
    `    <script type="application/ld+json">${JSON.stringify(schoolStructuredData)}</script>`,
  ].join("\n");

  const rootHtml = `<div id="root">${route.html.trim()}</div>`;

  return stripManagedHeadTags(shell)
    .replace(/<html\b[^>]*>/i, `<html lang="mn">`)
    .replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`)
    .replace("</head>", `${managedHead}\n  </head>`)
    .replace(/<div id="root"><\/div>/, rootHtml);
};

async function writeStaticRoutes(outdir: string) {
  const shellPath = path.join(outdir, "index.html");
  const shell = await readFile(shellPath, "utf8");

  await Promise.all(staticRoutes.map(async route => {
    const target = routeOutputPath(outdir, route.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buildStaticHtml(shell, route));
  }));
}

async function writeSeoFiles(outdir: string) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => {
  const routePath = route.path === "/" ? "/" : route.path;
  return `  <url>
    <loc>${siteUrl}${routePath === "/" ? "/" : routePath}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}).join("\n")}
</urlset>
`;
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Sitemap: ${siteUrl}/sitemap.xml
`;

  await Promise.all([
    writeFile(path.join(outdir, "sitemap.xml"), sitemap),
    writeFile(path.join(outdir, "robots.txt"), robots),
  ]);
}

console.log("\n🚀 Starting build process...\n");

const cliConfig = parseArgs();
const outdir = cliConfig.outdir || path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();

const entrypoints = [...new Bun.Glob("**.html").scanSync("src")]
  .map(a => path.resolve("src", a))
  .filter(dir => !dir.includes("node_modules"));
console.log(`📄 Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? "file" : "files"} to process\n`);

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: true,
  publicPath: "/",
  target: "browser",
  sourcemap: "none",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  ...cliConfig,
});

const end = performance.now();

const publicDir = path.join(process.cwd(), "public");
if (existsSync(publicDir)) {
  await cp(publicDir, outdir, { recursive: true, force: true });
}

await writeStaticRoutes(outdir);
await writeSeoFiles(outdir);

const outputTable = result.outputs.map(output => ({
  File: path.relative(process.cwd(), output.path),
  Type: output.kind,
  Size: formatFileSize(output.size),
}));

console.table(outputTable);
const buildTime = (end - start).toFixed(2);

console.log(`\n✅ Build completed in ${buildTime}ms\n`);
