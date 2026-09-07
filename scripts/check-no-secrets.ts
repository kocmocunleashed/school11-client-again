const patterns = [
  /SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*\S{20,}/,
  /SUPABASE_SECRET_KEY[ \t]*=[ \t]*sb_secret_[A-Za-z0-9_-]+/,
  /ADMIN_SESSION_SECRET[ \t]*=[ \t]*\S{20,}/,
  /ADMIN_PASSWORD[ \t]*=[ \t]*\S{12,}/,
];

const files = [".env.example", "README.md"];
let failed = false;
for (const file of files) {
  const text = await Bun.file(file).text();
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      console.error(`Possible committed secret in ${file}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("No obvious secrets found in tracked configuration files.");

export {};
