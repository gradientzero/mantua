# mantua.io

An **agent-first commonplace notebook**: one inbox for everything worth keeping, a
wiki that agents build and maintain, an owner who does the reading and the thinking.
Continuously deployed; open in topic — subjects emerge from what accumulates.

The pattern is Andrej Karpathy's LLM-wiki idea, kept verbatim in [`LLM_Wiki.md`](LLM_Wiki.md):
the LLM incrementally builds and maintains a persistent, compounding wiki between the
owner and the raw sources. This repo is one concrete instantiation of it.

**This README is the source of truth.** If you are a coding agent (or a human) opening
this repo with no other context: read this file top to bottom before touching anything.
It tells you everything the repo assumes.

## The one-paragraph mental model

Three layers, per `LLM_Wiki.md`. **Raw sources**: material enters through `/inbox` and,
once processed, is archived immutably under `/sources`. **The wiki**: markdown/MDX under
`/content`, versioned in git — no database, no CMS. [Velite](https://velite.js.org)
validates frontmatter against a Zod schema and compiles MDX at build time; Next.js (App
Router) renders it; notes interlink with `[[wikilinks]]`, with backlinks ("Linked from")
computed at build time. **The schema**: this README plus `CLAUDE.md` plus the commands in
`.claude/commands/` — the conventions that make agents disciplined wiki maintainers.
`git push` to `main` deploys to Vercel. That's the whole system.

## The loop (operations)

| Operation | Who | How |
|---|---|---|
| **Capture** | owner | drop markdown/images into `/inbox` (own writing → `inbox/mine/`) |
| **Ingest** | scheduled agent | `/ingest` — file inbox items into the wiki, archive to `/sources`, log, build, push |
| **Converse** | owner + agent | `/oracle <question>` — answer from the wiki with citations; durable answers get filed back as notes; also the channel for refinements ("merge these", "publish X") |
| **Lint** | agent, slower cadence | `/lint` — contradictions, orphans, stale claims, missing pages |

The scheduled ingest is not wired up yet — see
`tasks/2026-07-25-schedule-ingest-agent.md` for how to set it up (owner action).

Two bookkeeping files support this: **`log.md`** (append-only, grep-able record of every
ingest/query/lint — the notebook's timeline) and the wiki's own link structure + hub
pages, which serve as the index.

## Provenance and voice — the rules that matter most

The owner, **Wolfgang Gross**, does his own reading and writes his own notes. Agents do
the bookkeeping. Every content page declares who wrote it via the `origin` frontmatter
field, and note and hub pages render the byline accordingly (`lib/site.ts` →
`bylineFor`; the home cover shows none):

- `origin: human` — hand-written by the owner. **Agents never rewrite this prose.**
  Fixing frontmatter, adding wikilinks, choosing tags: fine. Changing his wording: never.
- `origin: agent` (default) — written and maintained by agents. Byline: *mantua agents*.
- `origin: mixed` — the owner's writing substantially extended by agents. Byline says so.

Never label agent-written text `origin: human`. This is the one unforgivable schema
violation — the labeling is the contract that makes the notebook trustworthy.

**Voice**: agent-written prose should match the owner's register — plain, concrete,
first person where natural, no hype, no filler. The `origin: human` notes are the
reference corpus for tone; study them before writing.

## Repo map

```
inbox/                # CAPTURE — drop zone; emptied by /ingest (inbox/README.md = contract)
  mine/               #   owner's own writing → becomes origin: human notes
sources/              # ARCHIVE — immutable raw sources, one folder per ingested item
content/
  notes/              # THE WIKI — atomic pages, one topic each → /notes/<slug>
  index/              # curated hub pages (entry points)
                      #   home.mdx → /   ·   anything-else.mdx → /<slug>
log.md                # append-only agent activity log (## [YYYY-MM-DD] kind | title)
tasks/                # plain-markdown backlog (tasks/README.md = format)
.claude/commands/     # the agent operations: /ingest, /oracle, /lint
velite.config.ts      # content schema (Zod) + wikilink extraction + build validation
lib/
  wikilinks.ts        # [[wikilink]] remark plugin + outgoing-link extraction
  content.ts          # THE content access layer: draft filtering, backlinks, tags
  graph.ts            # nodes+links for the graph view, derived from the wikilink structure
  search.ts           # dependency-free BM25F ranking behind the header search
  site.ts             # site constants + provenance→byline mapping
components/
  mdx.tsx             # MDX renderer; resolves wikilinks; REGISTER CUSTOM MDX COMPONENTS HERE
  note-list.tsx       # shared list/badge/tag UI
  search.tsx          # header search bar (as-you-type, client-side)
  graph/              # canvas force-directed graph (/graph + per-note neighborhood)
app/                  # Next.js routes (article template, tags, hubs, graph, OG images, sitemap)
next.config.mjs       # runs Velite as part of next dev/build — no separate content build step
.velite/              # GENERATED, git-ignored — never edit, never commit
```

`inbox/`, `sources/`, `tasks/` and `log.md` are outside `/content`: Velite never builds
them, nothing in them is published.

## Content schema (frontmatter)

Applies to `content/notes/*.mdx`. Hub pages (`content/index/*.mdx`) use the same schema
minus `tags` and `related`. Validation is enforced at build time by `velite.config.ts` —
a schema violation fails the build with a file + field error message.

```yaml
---
title: Serving an SLM from the desktop under my desk   # required, ≤160 chars
status: published        # 'draft' | 'published' — OMITTED ⇒ DEFAULTS TO DRAFT
origin: human            # 'human' | 'agent' | 'mixed' — OMITTED ⇒ DEFAULTS TO AGENT
tags: [hands-on]         # lowercase-kebab-case only; free-form otherwise
created: 2026-07-14      # ISO date, set once
updated: 2026-07-14      # ISO date — BUMP THIS ON EVERY MEANINGFUL EDIT
summary: One or two sentences; used for OG description, index listings, link previews.
author: Wolfgang Gross   # byline name for human/mixed pages; OMITTED ⇒ site.owner
related: [some-slug]     # optional, note slugs; manual "Related" section
slug: custom-slug        # optional override — by convention OMIT IT (slug = filename)
---
```

Conventions the schema can't enforce:

- **Filename is the slug**: `content/notes/tabular-foundation-models-notes.mdx` → `/notes/tabular-foundation-models-notes`.
  Only set `slug:` in frontmatter if you must decouple them; don't rename published files
  (it breaks inbound deep links — there is no redirect layer).
- Slugs are globally unique across notes *and* hubs (build fails on collision).
- Bump `updated` when you edit substance; leave it for typo fixes.
- Static assets a note needs go to `public/images/<note-slug>/`, referenced with
  absolute paths.

## Drafts and publishing

`status: draft` documents are **fully visible in `npm run dev`** (with an amber "draft"
badge) and **completely absent from production builds**: no page, no listings, no
backlinks, no sitemap entry, and wikilinks pointing at them render as inert "missing"
spans. Keep half-formed thinking in the repo freely — it never leaks.

**Publishing is an owner decision.** Ingested notes start as drafts; they go live when
the owner says so (in conversation, or by marking the inbox item `status: published`
up front).

## Wikilinks and backlinks — how they resolve

- Syntax: `[[target-slug]]` or `[[target-slug|custom label]]`.
- **Targets are slugs, not titles.** Matching is case-insensitive and trimmed.
- Bare `[[slug]]` renders the target's real title as the link text; the `|label` form
  renders your label.
- Targets may be notes or hubs (one namespace).
- A wikilink to a slug that doesn't exist (or is a draft, in production) renders as a
  muted dashed-underline span — the build **warns** but does not fail. Linking to notes
  that don't exist yet is normal; the warning list at build time is the to-do list.
- Backlinks: at build time each document's outgoing wikilink targets are extracted into a
  `links` field (`lib/wikilinks.ts`, called from `velite.config.ts`). The "Linked from"
  section on every page is computed by inverting those lists (`backlinksFor` in
  `lib/content.ts`). Wikilinks inside code blocks/inline code are ignored on both the
  rendering and extraction side.

## The graph view

`/graph` draws the whole wiki as a force-directed map, Obsidian-style: notes and hubs as
ink dots (hubs ringed; size = number of connections), tags as hollow circles, and dashed
"unwritten" nodes for wikilink targets that don't exist yet — the same to-do list the
build warnings print. Every note page ends with the same map reduced to its one-hop
neighborhood. `/graph` fills the viewport below the header, toolbar and legend floating
on the map. Hover spotlights a node's connections; click pins that spotlight so the
graph can be explored from the node (a background click releases it); double-click or
cmd/ctrl-click opens the page; drag/scroll pans and zooms; tag and unwritten nodes can
be toggled off. Labels never overlap: titles wrap to short lines, the best-connected
pages label first, and the rest fill in as you zoom (a greedy screen-space collision
pass drops what doesn't fit).

Everything derives at build time from data that already exists (`links`, `tags`,
`related`), assembled in `lib/graph.ts` and drawn by `components/graph/graph-view.tsx`
with a small built-in force simulation — no new schema fields, no dependencies, no
client-side content fetching. Draft pages appear on the map exactly where drafts appear
at all: in `npm run dev`, marked amber. `/graph` is a reserved route like `/notes` and
`/tags` — a hub with the slug `graph` would be shadowed by it.

## Search

The header carries an always-available search box — `/` or `⌘K` focuses it from any
page. Search is entirely client-side and as-you-type: no debounce, no fetch, no external
service. The layout inlines a small index of every visible page (title, tags, summary),
produced by `searchDocs()` in `lib/content.ts` — so the draft policy applies unchanged:
drafts are searchable in `npm run dev` (amber badge in the results) and absent from
production.

Ranking is a tiny dependency-free BM25F in `lib/search.ts` (same spirit as the graph's
built-in force simulation): title matches weigh ~5× summary matches with tags in
between — that's what puts title hits first — and the token still being typed matches as
a prefix, so results appear from the first character. There is no stemming; a completed
word that matches nothing exactly falls back to prefix matching, which covers plurals
and word endings at this scale. ↑↓ + ↵ navigate the results, esc dismisses.

At the current size the inlined index costs a few KB of page payload. If the wiki grows
to hundreds of notes, move the docs array to a fetched static JSON (a route handler over
`searchDocs()`) — the index building and ranking code doesn't change.

## How to add a note by hand

The normal path for new material is the inbox (see `inbox/README.md`). Editing the wiki
directly is always possible too:

1. Create `content/notes/<slug>.mdx` with the frontmatter above (start as `draft`;
   set `origin` honestly).
2. Write markdown/MDX. Link generously: `[[other-note-slug]]`.
3. `npm run dev` → check it at `http://localhost:3000/notes/<slug>`.
4. Set `status: published` when ready.
5. Commit and push to `main`. Vercel builds and deploys automatically (~1–2 min).

`npm run build` locally is the full validation suite: schema errors fail it, broken
wikilinks are listed as warnings. Run it before pushing if you changed anything
non-trivial. There are no unit tests — the build is the test.

Hub pages work the same, but live in `content/index/<slug>.mdx` (no `tags`/`related`)
and render at `/<slug>` (`home.mdx` is special — it renders at `/`). Hubs are curated
maps: mostly prose + wikilinks pointing into the notes.

## Embedding interactive components (Distill-style)

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
   `NEXT_PUBLIC_SITE_URL` to the canonical URL (e.g. `https://mantua.io`),
   then redeploy. This feeds canonical URLs, OG tags, and the sitemap.
4. Done: every push to `main` deploys. PR branches get preview URLs automatically.

Per-note Open Graph images are generated automatically
(`app/notes/[slug]/opengraph-image.tsx`) — shares render with a title card without any
manual asset work.

## Rules for agent sessions

1. **Content work happens in `/content` only.** Adding/editing notes must not require
   touching TypeScript.
2. **Respect provenance.** Never rewrite `origin: human` prose; never label agent text
   `origin: human`. Match the owner's voice when writing agent prose.
3. Respect the schema; when in doubt run `npm run build` and read the errors.
4. New notes start as `status: draft`; publishing is the owner's call.
5. Sources under `/sources` are immutable; the inbox contract is `inbox/README.md`.
6. **Log everything** that changes the notebook: one `log.md` entry per ingest/query/lint.
7. Never edit `.velite/` (generated) and never commit it.
8. If you change the schema in `velite.config.ts`, update this README in the same commit.
9. Don't rename published note files; don't reuse slugs for different topics.
10. Keep this README accurate — it is the contract between sessions.

## Deliberately out of scope for now (roadmap)

- **Scheduling the ingest agent** — the one missing piece of the loop; owner action,
  see `tasks/2026-07-25-schedule-ingest-agent.md`.
- **RSS/Atom feed** — trivial to add as `app/feed.xml/route.ts` over `allNotes()`.
- **Self-hosted web fonts** — the three families (Cormorant Garamond, Inter, JetBrains
  Mono) currently load from the Google Fonts CDN via an `@import` at the top of
  `app/globals.css`; swap to `next/font` or local `.woff2` if wanted.
- **Redirect layer** for renamed slugs (`next.config.mjs` `redirects()`).
