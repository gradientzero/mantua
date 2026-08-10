---
title: Aleph Alpha article was dropped in inbox/mine — confirm it was a misfile
date: 2026-08-10
priority: medium
status: open
area: content-system
---

# An external article arrived in `inbox/mine/`

**Owner confirmation wanted.** The 2026-08-10 ingest item —
`Model Training as Code — Aleph Alpha.md` — was in `inbox/mine/`, which per
`inbox/README.md` means "I wrote this": `origin: human`, byline Wolfgang Gross, prose kept
verbatim.

It is not your writing. It is Aleph Alpha's research blog post, by Michael Barlow, with an
acknowledgments section naming six other people and a `© 2026 Aleph Alpha GmbH` line, captured
as a PDF-to-markdown conversion. Following the folder hint would have published Barlow's
article under your name, so **the hint was overridden** and the item was processed as external
material: an `origin: agent` summary at
[`content/notes/model-training-as-code.mdx`](../content/notes/model-training-as-code.mdx),
no prose republished, original archived intact at
`sources/2026-08/model-training-as-code-aleph-alpha/`.

Nothing in the file argued against that reading — no frontmatter, no commentary, no owner's
voice anywhere in it. So this is almost certainly just a drop into the wrong folder, and there
is nothing to undo. Worth a look only because the alternative — that you meant to attach your
own notes and they didn't make it into the file — would mean material is missing.

## The rule this establishes, unless you say otherwise

**Evidence inside the item beats the folder.** `inbox/mine/` is a convenience marker, and a
named external author plus a copyright notice is stronger evidence than a directory. An agent
that finds the two in conflict should file the item as external and record the conflict, which
is what happened here (`SOURCE.md` carries the same note).

The counter-argument is that this makes the folder contract unreliable — the whole point of
`inbox/mine/` is that you don't have to write frontmatter. It stays reliable in the direction
that matters: the override only ever runs *away* from `origin: human`, never toward it. An
agent may decline to claim your byline for something; it may never claim it for you.

If you agree, `inbox/README.md` should say so in the "Marking your own writing" section — one
sentence, that the marker is overridden when the material carries another author's byline.
Left unwritten for now because it is your contract to change.
