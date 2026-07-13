# SLM Research Notebook

A deployable, wiki-style research notebook on **small language model (SLM) adoption for
industry-specific enterprise tasks**. Multi-month project; content grows incrementally
and is published continuously.

**This README is the source of truth.** If you are a coding agent (or a human) opening
this repo with no other context: read this file top to bottom before touching anything.
It tells you everything the repo assumes.

## The one-paragraph mental model

Content is plain markdown/MDX files under `/content`, versioned in git — there is no
database and no CMS. [Velite](https://velite.js.org) validates frontmatter against a Zod
schema and compiles MDX at build time; Next.js (App Router) renders it. Notes link to
each other with `[[wikilinks]]`; every page shows a "Linked from" (backlinks) section
computed by inverting those links. `git push` to `main` deploys to Vercel. That's the
whole system.

## Repo map

```
content/
  notes/              # atomic articles, one topic each → /notes/<slug>
  index/              # curated hub pages (wiki entry points)
                      #   home.mdx → /   ·   anything-else.mdx → /<slug>
velite.config.ts      # content schema (Zod) + wikilink extraction + build validation
lib/
  wikilinks.ts        # [[wikilink]] remark plugin + outgoing-link extraction (one regex, two uses)
  content.ts          # THE content access layer: draft filtering, backlinks, tags, wikilink resolution
  site.ts             # site name / URL constants
components/
  mdx.tsx             # MDX renderer; resolves wikilinks; REGISTER CUSTOM MDX COMPONENTS HERE
  note-list.tsx       # shared list/badge/tag UI
app/                  # Next.js routes (article template, tags, hubs, OG images, sitemap)
next.config.mjs       # runs Velite as part of next dev/build — no separate content build step
.velite/              # GENERATED, git-ignored — never edit, never commit
```

## Content schema (frontmatter)

Applies to `content/notes/*.mdx`. Hub pages (`content/index/*.mdx`) use the same schema
minus `tags` and `related`. Validation is enforced at build time by `velite.config.ts` —
a schema violation fails the build with a file + field error message.

```yaml
---
title: What counts as a small language model?   # required, ≤160 chars
status: published        # 'draft' | 'published' — OMITTED ⇒ DEFAULTS TO DRAFT
tags: [fundamentals]     # lowercase-kebab-case only; free-form otherwise
created: 2026-07-13      # ISO date, set once
updated: 2026-07-13      # ISO date — BUMP THIS ON EVERY MEANINGFUL EDIT
summary: One or two sentences; used for OG description, index listings, link previews.
related: [private-deployment]   # optional, note slugs; manual "Related" section
slug: custom-slug        # optional override — by convention OMIT IT (slug = filename)
---
```

Conventions the schema can't enforce:

- **Filename is the slug**: `content/notes/model-distillation.mdx` → `/notes/model-distillation`.
  Only set `slug:` in frontmatter if you must decouple them; don't rename published files
  (it breaks inbound deep links — there is no redirect layer).
- Slugs are globally unique across notes *and* hubs (build fails on collision).
- Bump `updated` when you edit substance; leave it for typo fixes.

## Drafts

`status: draft` documents are **fully visible in `npm run dev`** (with an amber "draft"
badge) and **completely absent from production builds**: no page, no listings, no
backlinks, no sitemap entry, and wikilinks pointing at them render as inert "missing"
spans. Keep half-formed thinking in the repo freely — it never leaks.

## Wikilinks and backlinks — how they resolve

- Syntax: `[[target-slug]]` or `[[target-slug|custom label]]`.
- **Targets are slugs, not titles.** Matching is case-insensitive and trimmed.
- Bare `[[slug]]` renders the target's real title as the link text; the `|label` form
  renders your label.
- Targets may be notes or hubs (one namespace).
- A wikilink to a slug that doesn't exist (or is a draft, in production) renders as a
  muted dashed-underline span — the build **warns** but does not fail. Linking to notes
  you haven't written yet is normal; the warning list at build time is your to-do list.
- Backlinks: at build time each document's outgoing wikilink targets are extracted into a
  `links` field (`lib/wikilinks.ts`, called from `velite.config.ts`). The "Linked from"
  section on every page is computed by inverting those lists (`backlinksFor` in
  `lib/content.ts`). Wikilinks inside code blocks/inline code are ignored on both the
  rendering and extraction side.

## How to add a note (the whole workflow)

1. Create `content/notes/<slug>.mdx` with the frontmatter above (start as `draft`).
2. Write markdown/MDX. Link generously: `[[other-note-slug]]`.
3. `npm run dev` → check it at `http://localhost:3000/notes/<slug>`.
4. Set `status: published` when ready.
5. Commit and push to `main`. Vercel builds and deploys automatically (~1–2 min).

`npm run build` locally is the full validation suite: schema errors fail it, broken
wikilinks are listed as warnings. Run it before pushing if you changed anything
non-trivial. There are no unit tests — the build is the test.

### How to add a hub page

Same as a note, but in `content/index/<slug>.mdx` (no `tags`/`related`). It renders at
`/<slug>`. `home.mdx` is special — it renders at `/`. Hubs are curated maps: mostly
prose + wikilinks pointing into the notes.

## Embedding interactive components (Distill-style, for later)

MDX is fully wired for it. Register a component in `sharedComponents` in
`components/mdx.tsx`, then use it in any `.mdx` file with no import:

```tsx
// components/figures/cost-curve.tsx  ('use client' if it needs hooks/D3)
// components/mdx.tsx  → sharedComponents: { a: MdxAnchor, CostCurve }
```

```mdx
Regular prose, then: <CostCurve data={[1, 2, 3]} />
```

## Development

```bash
npm install
npm run dev        # http://localhost:3000 — Velite watches /content, edits hot-reload
npm run build      # full production build = content validation
npm run typecheck  # TS check (run after changing lib/ or app/, not needed for content edits)
```

Requires Node ≥ 20.9. Velite output lands in `.velite/` (git-ignored); app code imports
it as `#site/content` — but **only `lib/content.ts` may do so directly**. Pages go
through `lib/content.ts`, which owns draft filtering — bypassing it risks leaking drafts.

## Deployment (Vercel)

Standard Next.js on Vercel; Velite runs inside `next build` (see `next.config.mjs`), so
no custom build settings are needed.

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo → framework auto-detects
   as Next.js → Deploy. No settings to change.
3. In Vercel → Project → Settings → Environment Variables, set
   `NEXT_PUBLIC_SITE_URL` to the canonical URL (e.g. `https://notebook.example.com`),
   then redeploy. This feeds canonical URLs, OG tags, and the sitemap.
4. Done: every push to `main` deploys. PR branches get preview URLs automatically.

Per-note Open Graph images are generated automatically
(`app/notes/[slug]/opengraph-image.tsx`) — shares on LinkedIn/Twitter render with a
title card without any manual asset work.

## Rules for future agent sessions

1. **Content work happens in `/content` only.** Adding/editing notes must not require
   touching TypeScript.
2. Respect the schema; when in doubt run `npm run build` and read the errors.
3. New notes start as `status: draft` unless the user explicitly says publish.
4. Never edit `.velite/` (generated) and never commit it.
5. If you change the schema in `velite.config.ts`, update this README in the same commit.
6. Don't rename published note files; don't reuse slugs for different topics.
7. Keep this README accurate — it is the contract between sessions.

## Deliberately out of scope in v1 (roadmap)

- **Search** — planned: client-side index over the Velite JSON output (flexsearch) or
  [Pagefind](https://pagefind.app) post-build; no external service.
- **RSS/Atom feed** — trivial to add as `app/feed.xml/route.ts` over `allNotes()`.
- **Graph visualization** — the data already exists (`links` on every doc).
- **Custom web fonts** — currently system font stacks; swap via `next/font` if wanted.
- **Redirect layer** for renamed slugs (`next.config.mjs` `redirects()`).
