# Agent instructions

**Read `README.md` first — it is the source of truth for this repo** (the mantua.io
loop, schema, provenance rules, wikilink/backlink mechanics, deployment, and the rules
for agent sessions). `LLM_Wiki.md` is the founding pattern behind the design.

Quick invariants, enforced by convention:

- This is an **agent-first commonplace notebook**: `/inbox` → (`/ingest`) → wiki in
  `/content` + immutable archive in `/sources`, with every operation logged in `log.md`.
- Content = markdown/MDX in `/content`; filename = slug; new notes default to
  `status: draft`; publishing is the owner's call.
- **Provenance is sacred**: never rewrite `origin: human` prose, never label agent
  text `origin: human`. Agent prose matches the owner's voice (study the
  `origin: human` notes).
- Wikilinks target **slugs**: `[[note-slug]]` or `[[note-slug|label]]`.
- `npm run build` is the validation suite; run it before pushing non-trivial changes.
- Never edit or commit `.velite/` (generated).
- Schema changes in `velite.config.ts` require a README update in the same commit.
- The agent operations live in `.claude/commands/`: `/ingest`, `/oracle`, `/lint`.
