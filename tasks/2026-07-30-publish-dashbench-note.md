# Publish the DashBench note, or accept five inert links in production

**Owner action.** The 2026-07-30 ingest created
[`content/notes/dashbench-measuring-a-code-review-agent.mdx`](../content/notes/dashbench-measuring-a-code-review-agent.mdx)
as `status: draft`, which is the default for ingested material. But the material genuinely
belonged on pages that are already published, so five of them now link to it:

- `benchmarking-your-own-agent-spend.mdx` — its stated gap ("Dashbench is named, not
  described") is closed by the new page; the paragraph reads oddly without it
- `generator-evaluator-loops.mdx` — two references
- `doordash-on-agentic-commerce-and-dot.mdx`
- `agentic-engineering.mdx`
- `self-improving-agents-from-production-feedback.mdx`
- `separating-drafting-from-judging.mdx` — added 2026-08-10, when the writing-craft notes were
  published; it cites this note as the cluster's one partial answer to *what checks the check?*
  The sentence states the answer before it points anywhere, so it stands without the link

Until the new note is published, all of those render in production as muted dashed-underline
spans (the draft policy in `README.md`). Nothing breaks and the sentences still parse, but
the two on `benchmarking-your-own-agent-spend` are load-bearing — they announce a correction
and then point at nothing.

This is the first time a published page in this notebook links to a draft, so there is no
precedent to follow. Two clean options:

1. **Publish it** — set `status: published` on the new note. The prose is a summary of a
   public engineering post, in the same register as the rest of the cluster.
2. **Hold it and soften the callers** — reword the five references so they stand without the
   link. Cheap, but the correction to the DashBench scope has to live somewhere.

Recommend (1) after a read-through. Related:
`sources/2026-07/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/SOURCE.md`.
