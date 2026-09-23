# Source record

- **Item**: `(KV) Cache Rules Everything Around Me - by Diogo.pdf` (preserved exactly as dropped)
- **Title**: "(KV) Cache Rules Everything Around Me"
- **Author**: Diogo, on the Substack *Complete Skeptic*
- **Origin**: external — a Substack post
- **URL**: https://www.completeskeptic.com/p/kv-cache-rules-everything-around (from the print footer)
- **Published**: 2026-09-09, per the post's dateline
- **Captured**: 2026-09-23 (browser print-to-PDF, per the PDF metadata and page header)
- **Ingested**: 2026-09-23
- **Provenance**: **captured external material**, processed as `origin: agent` although it arrived
  in `inbox/mine/`. The post carries its author's byline, avatar, the publication's masthead and a
  copyright line. No prose republished. Note left as `status: draft` (no publish hint).

## Provenance: the folder hint was overridden again

Fifth item in a row dropped in `inbox/mine/` that is someone else's writing. Recorded in
`tasks/2026-08-17-third-misfile-into-inbox-mine.md` rather than a new task file.

## Capture quality

An 11-page Chrome print of the Substack page. Two kinds of damage:

- **Most charts are lost.** Substack's floating subscribe box prints over the middle of every page
  and covers the figures on pages 3, 4, 5 and 8 (the per-model cost table, the OpenCode hit-rate
  chart, the Vercel open-weight share chart, the routing comparison). Only the opening pie chart on
  page 1 survives, and even that is cut off at the right margin.
- **The right edge of the text column is clipped** by a few characters per line. Every clipped
  sentence was recoverable from context; the wiki note uses only figures stated in legible text.

## Wiki pages touched

New (`status: draft`, `origin: agent`):

- `content/notes/kv-cache-economics-of-agents.mdx` — the claim, the prefill/decode/pause argument,
  what follows for routing, subagents, subscriptions and self-hosting, how it lands against the
  notebook, and where it thins out (HBM capacity, price-sheet dependence, the author's stake).

Updated:

- `content/notes/benchmarking-your-own-agent-spend.mdx` — routing per task vs. per step; record hit
  rate next to spend.
- `content/notes/command-over-tokens.mdx` (`origin: mixed`, agent section only) — the parallelism
  decision priced by how much context each subagent inherits.
- `content/notes/inference-engineering-baseten.mdx` — cache-aware routing, seen from the customer's
  side.
- `content/notes/gpt-6-astra-automated-ai-engineer.mdx` — the "<$6/hour" figure is computed on output,
  the smaller line of an agent's bill.

Not touched: `serving-slms-on-a-desktop-gpu` is `origin: human`; the note links to it instead.

## Things deliberately left out

- The per-model cost table and the OpenCode hit-rate figures — hidden in the capture.
- The two reader comments, except the one objection that matters (why no lab prices cache reads at
  zero), which the note cites as a comment.
