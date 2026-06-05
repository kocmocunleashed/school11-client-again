#!/usr/bin/env bun

const allowedFiles = new Set([".env.example"]);
const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml", ".txt", ".sql", ".html", ".css", ".xml",
]);

function extension(path: string) {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index) : "";
}

function shouldScanFile(path: string) {
  if (allowedFiles.has(path)) return false;
  const filename = path.split("/").at(-1) || path;
  if (filename === ".env.example") return false;
  if (filename === ".env" || filename.startsWith(".env.")) return true;
  return textExtensions.has(extension(path));
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
}

function looksLikeServiceRoleJwt(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1] || ""));
    return payload?.role === "service_role";
  } catch {
    return false;
  }
}

async function trackedFiles() {
  const proc = Bun.spawn(["git", "ls-files", "-z"], { stdout: "pipe", stderr: "pipe" });
  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0) throw new Error("git ls-files failed");
  return output.split("\0").filter(Boolean);
}

const findings: string[] = [];

for (const file of await trackedFiles()) {
  if (!shouldScanFile(file)) continue;
  const content = await Bun.file(file).text();
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/^\s*ADMIN_PASSWORD\s*=\s*[^#\s].{7,}/.test(line)) {
      findings.push(`${file}:${index + 1}: possible ADMIN_PASSWORD assignment`);
    }
    if (/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^#\s].{20,}/.test(line)) {
      findings.push(`${file}:${index + 1}: possible service role assignment`);
    }
    for (const match of line.matchAll(/\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g)) {
      if (looksLikeServiceRoleJwt(match[0])) {
        findings.push(`${file}:${index + 1}: possible Supabase service-role JWT`);
      }
    }
  });
}

if (findings.length) {
  console.error("Secret hygiene check failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Secret hygiene check passed");
