---
title: Sutskever's List stayed in inbox/mine — three things to decide when the rest is read
date: 2026-08-14
priority: medium
status: open
area: content
---

# The book is still in the inbox on purpose

The 2026-08-14 ingest processed `inbox/mine/Sutskevers List Ch 1 2.md` (plus its twelve
extracted `.jpeg` figures) **without archiving it**, at the owner's instruction — he is two
chapters in and the rest is coming. So this item breaks the normal contract in one specific
way: `/ingest` is supposed to empty the inbox, and this file is meant to stay there until the
book is finished.

Consequences worth knowing:

- **The next `/ingest` will see it again.** If the capture is replaced with a longer one
  (chapters 1–5, say), that is the desired behaviour: re-read it and extend the notes. If it is
  the *same* file, the correct action is to skip it, not to re-summarise it — otherwise this
  becomes the duplicate-ingest situation from 2026-07-27.
- **Nothing is archived under `sources/2026-08/`**, so
  [`content/notes/sutskevers-list-notes.mdx`](../content/notes/sutskevers-list-notes.mdx) cites
  the book by ISBN rather than by archive path. When the reading is done, the whole capture
  should go to `sources/2026-08/sutskevers-list-heimann/` with a `SOURCE.md` listing every
  chapter covered and every page touched across all the ingest rounds.

## Three things for the owner

**1. Do you want your own reading notes on this book?** The other two Manning books here —
[`tabular-foundation-models-notes`](../content/notes/tabular-foundation-models-notes.mdx) and
[`llm-customization-and-fine-tuning-notes`](../content/notes/llm-customization-and-fine-tuning-notes.mdx)
— are `origin: human`: your chapter takeaways, your open questions. What was dropped in the
inbox this time is the *book text*, not your notes on it, so what exists now is an
`origin: agent` summary. That is the 2026-08-10 rule applied again (evidence inside the item
beats the folder, away from your byline only —
`tasks/2026-08-10-inbox-mine-misfiled-item.md`, still open). If you want the human page too,
it is a separate file and the agent page should be linked from it rather than merged into it.

**2. Four new draft pages want a publish decision.** All `status: draft`:

- `sutskevers-list-notes` — the running summary, ch. 1–2.
- `too-dangerous-to-release` — GPT-2's withholding, and the argument structure it established.
- `data-versus-architecture` — the pre-2012 "the data is doing the lifting" case, and the
  control experiment the current harness claims are missing.
- `optimising-for-the-benchmark` — dataset-bound progress, hard negative mining, and the three
  states a benchmark can be in.

The last two are the ones that earn their keep independently of the book: both land directly on
the evaluation cluster, and `optimising-for-the-benchmark` is now the oldest worked example
behind [`training-against-your-own-monitor`](../content/notes/training-against-your-own-monitor.mdx).

**3. The figures were not copied.** Six figures carry real argument in chapter 2 — the HOG false
positive on rippled water, Martens's pathological-curvature valley, the AlexNet architecture
diagram, the activation-function plots, the dropout illustration, and the ILSVRC error curve
2010–2017. Several are reproduced in the book by permission of their original authors to
Manning, which is not a permission that extends to this site, so none went into
`public/images/`. Where a figure carries the argument it is described in prose instead. If you
want any of them on a published page, that is a permission to obtain, not a file to copy.

## Two new tags

`deep-learning-history` and `scaling`. This is the notebook's first historical material — every
other source here is about the present — and the tags exist to keep it separable from the
harness and safety clusters it cross-links into.
