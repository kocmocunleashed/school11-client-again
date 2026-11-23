<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Public website design

- Read [design.md](./design.md) before changing or reviewing the site or admin UI.
- Preserve its bold, playful, graceful school-yearbook direction. The reference
  cards inspire consistent details; they are not a template for every section.
- Include `design.md` in every UI subagent brief and require agents to read it.
- Reuse existing components and shared tokens. Keep admin layout styles scoped.
- Use Bun for packages and checks. Verify responsive layouts and interactions.
- Save a baseline commit before a broad refresh and keep the refresh separately
  reversible. Do not reset or discard unrelated work.
