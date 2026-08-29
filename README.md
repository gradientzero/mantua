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
                      #   home.mdx → the lead line on /   ·   anything-else.mdx → /<slug>
                      #   about.mdx → /about, linked from the header tabs
log.md                # append-only agent activity log (## [YYYY-MM-DD] kind | title)
tasks/                # plain-markdown backlog (tasks/README.md = format)
.claude/commands/     # the agent operations: /ingest, /oracle, /lint
velite.config.ts      # content schema (Zod) + wikilink extraction + build validation
lib/
  wikilinks.ts        # [[wikilink]] remark plugin + outgoing-link extraction
  content.ts          # THE content access layer: draft filtering, backlinks, tags
  graph.ts            # nodes+links for the graph view, derived from the wikilink structure
  similarity.ts       # tf-idf cosine between pages; weights the graph's edges
  search.ts           # dependency-free BM25F ranking behind the header search
  site.ts             # site constants + provenance→byline mapping
components/
  mdx.tsx             # MDX renderer; resolves wikilinks; REGISTER CUSTOM MDX COMPONENTS HERE
  note-list.tsx       # shared list/badge/tag UI
  search.tsx          # header search bar (as-you-type, client-side)
  site-nav.tsx        # header tab row — add a tab here when you add a hub worth linking
  scroll-to-top.tsx   # lands client-side navigations at the top (see the file's comment)
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

Two fields are *derived* at build time rather than written by hand, both computed in
`velite.config.ts` from the raw file and available on every document:

- `links` — outgoing wikilink targets (`lib/wikilinks.ts`), inverted into backlinks.
- `terms` — prose term frequencies (`lib/similarity.ts`), used to weight the graph's edges.
  Server-only: it never reaches the browser, since only the resulting number is serialised.

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

`/graph` draws the whole wiki as a force-directed map: every page is a paper disc with
its title set inside it in the editorial face, tags are hollow rings in mono, and dashed
"unwritten" nodes stand for wikilink targets that don't exist yet — the same to-do list
the build warnings print. Colour lives on the rim, never in the fill: a hairline ink ring
for a published page, a second ring for a hub, a soft amber halo while a page is still a
draft. The map sits on the same paper tone as the rest of the site, so the discs are the
only white on it. Every note page ends with the same map reduced to its one-hop
neighborhood.

`/graph` fills the viewport below the header, toolbar and legend floating on the map.
Hover spotlights a node's connections; click pins that spotlight so the graph can be
explored from the node (a background click releases it); double-click or cmd/ctrl-click
opens the page; drag/scroll pans and zooms; tag and unwritten nodes can be toggled off.
Because the title lives inside the disc, the title decides the radius — each one is
wrapped at whichever measure gives the tightest enclosing circle (with a floor, or long
titles break into one-word lines), and both the springs and the collision pass rest at
`r + r + gap`, so well-connected pages earn their room instead of piling into a knot.
Titles ease out once the zoom takes them below reading size and back in on the way home.

Everything derives at build time — the link structure from data that already exists
(`links`, `tags`, `related`) and the edge weights from the derived `terms` field —
assembled in `lib/graph.ts` and drawn by `components/graph/graph-view.tsx` with a small
built-in force simulation. No dependencies and no client-side content fetching: the
browser receives nodes, edges and one number per edge, never any prose.

Edges are not all equal, and two separate things differentiate them. **Neighbourhood
overlap** asks whether two pages keep the same company in the link graph; a spring bridging
two clusters rests longer and pulls less than one inside a cluster, which is what opens the
seams enough to see them. That is pure topology, computed per render because it depends on
which nodes are currently shown. **Similarity** asks whether two pages are about the same
thing — plain tf-idf cosine over their prose (`lib/similarity.ts`), no embeddings and no
API — and scales stiffness only, so pages on one subject pull together and the map clusters
by subject as well as by who links whom.

They are kept apart deliberately: two pages can be linked, share no neighbours, and still
read alike, and that spring should stretch for the seam while keeping some pull. Rest length
is left to overlap alone so the two effects stay legible on the map. Similarity edges are
ranked against each other and mapped to ±30% around neutral, which keeps the *average*
stiffness unchanged — the point is to redistribute pull, not to tighten or loosen the whole
map. Tag edges, edges to unwritten pages, and anything with no prose to compare stay
neutral. Those weights are computed once over the whole graph at build, so a page's local
map agrees with the big one and the layout is still identical on every load.

Draft pages appear on the map exactly where drafts appear
at all: in `npm run dev`, haloed amber. `/graph` is a reserved route like `/notes` and
`/tags` — a hub with the slug `graph` would be shadowed by it.

One known limit: the notebook's link graph is close to complete, and springs that dense
want to settle into a ball. Nothing pulls on the middle any more — containment is a soft
wall at the radius the discs could possibly need, and centering is a rigid translation of
the centroid, which shapes nothing — so the interior is free to take whatever shape the
links imply, and the outline is leaned toward the panel's proportions by an area-preserving
stretch. It does not fully reach a very wide panel's aspect, and leaning harder than this
was measured worse: the springs fight back and inflate both axes, which costs the zoom the
titles are read at.

That zoom is the budget everything here is spent against, and it is why the similarity
weights are held to ±30%. A weakened spring rests further out, and in the crowded middle of
this map that overshoot is already a few hundred units, so a wider spread would inflate the
layout and spend exactly what the paragraph above refuses to spend. Percentile ranking is
what makes the ±30% safe: it pins the mean weight to 1, so the redistribution is free.

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
and render at `/<slug>`. Hubs are curated maps: mostly prose + wikilinks pointing into
the notes.

`home.mdx` is the exception. `/` is the recent-entries feed — the most recently updated
notes, newest first, then a link to `/notes` for the rest — and `home.mdx` supplies only
the line of orientation above it. Keep it to a sentence or two: the longer "how this
notebook works" text belongs on `about.mdx` (`/about`), which the header tabs link to.
Renaming `about.mdx` therefore breaks a nav tab and the home page's wikilink; change
`components/site-nav.tsx` in the same commit if you ever do.

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
