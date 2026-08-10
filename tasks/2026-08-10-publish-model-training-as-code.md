---
title: Publish the Model Training as Code note — and decide on the three Aleph Alpha figures
date: 2026-08-10
priority: medium
status: open
area: content
---

# Publish `model-training-as-code`, and decide about its figures

**Owner action, two separable decisions.** The 2026-08-10 ingest created
[`content/notes/model-training-as-code.mdx`](../content/notes/model-training-as-code.mdx) as
`status: draft`, the default for ingested material. Six published pages gained sections
pointing at it, so until it is published there are **six inert dashed-underline links** in
production — the largest number this notebook has carried at once. Each paragraph states its
own claim before it points anywhere, so nothing reads as broken, but the situation is the same
one as `tasks/2026-07-30-publish-dashbench-note.md` and it is bigger.

Pages linking in: `agentic-engineering` (twice — a new section and the "where do these agents
run" open question), `auto-research`, `harness-engineering-agent-first-repositories`,
`model-speciation-and-touching-the-weights`, `linting-as-agent-guardrail`, `loop-engineering`.

## 1. Publishing the note

Nothing about it is provisional — it is a summary of a public company blog post plus the
usual pushback, in the register of the rest of the cluster, and it is the first source here
where the harness is built for *training a model* rather than for writing software. No new
tags. **Recommend publishing.**

## 2. The figures, which is the actual question

The note embeds three of the article's own images, copied to
`public/images/model-training-as-code/`:

- `training-pipeline.jpeg` — the pre-training / post-training iteration diagram
- `sweep-workflow-dag.jpeg` — the four-way sweep in the workflow-engine UI
- `leaderboard-screen.jpeg` — the leaderboard on a screen in their Heidelberg office

They are **Aleph Alpha's copyrighted images**, reproduced with attribution in each
`figcaption`. This is the first time this notebook has put anyone else's images on the public
site — there were no images under `public/images/` before today — so publishing the note sets
a precedent rather than following one. The two diagrams carry the argument and the note is
substantially weaker without them; the leaderboard photo is the most decorative of the three
and the easiest to drop.

The four remaining extracted images — the wordmark, the hero image, the "Savanna" tile, the
footer mark — were deliberately not copied. They are branding and carry nothing.

Three ways to go, in the order I'd rank them:

1. **Publish with the figures as they are.** Short attributed excerpts from a public
   company post, in a page that comments on it, each captioned with its origin. Ordinary
   practice for this kind of writing.
2. **Publish with the two diagrams, drop the office photo.** Keeps everything load-bearing
   and reduces it to the figures the argument actually needs.
3. **Redraw the pipeline diagram as an SVG figure component** — the notebook already has three
   (`components/figures/`), and this one is simple boxes and arrows. Removes the question
   entirely for the most useful figure, costs an afternoon, and would leave the DAG
   screenshot as the only borrowed image.

Nothing is public in the meantime: drafts are absent from production builds, so the images sit
in `public/` unreferenced by any live page until the note is published.

Related: `sources/2026-08/model-training-as-code-aleph-alpha/SOURCE.md`, which records the
capture's two defects (lost inter-word spaces, both code listings truncated at the right
margin) and what was deliberately left out of the wiki.
