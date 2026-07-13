# Agent instructions

**Read `README.md` first — it is the source of truth for this repo** (schema,
conventions, wikilink/backlink mechanics, deployment, and the rules for agent sessions).

Quick invariants, enforced by convention:

- Content = markdown/MDX in `/content`; filename = slug; new notes default to `status: draft`.
- Wikilinks target **slugs**: `[[note-slug]]` or `[[note-slug|label]]`.
- `npm run build` is the validation suite; run it before pushing non-trivial changes.
- Never edit or commit `.velite/` (generated).
- Schema changes in `velite.config.ts` require a README update in the same commit.
