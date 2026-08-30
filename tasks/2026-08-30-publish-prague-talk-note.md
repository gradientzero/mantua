---
title: Publish the Prague talk note — after its own open items are closed
date: 2026-08-30
priority: medium
status: open
area: content
---

# Publish `prague-training-harness-talk`, but not yet

**Owner action.** The 2026-08-30 ingest created
[`content/notes/prague-training-harness-talk.mdx`](../content/notes/prague-training-harness-talk.mdx)
as `status: draft`, the default for ingested material. Three published pages now link into it
— `model-training-as-code`, `model-speciation-and-touching-the-weights` and
`learning-from-deployment` — so until it is published there are **three inert dashed-underline
links** in production. Each of those paragraphs states its own claim before it points anywhere,
so nothing reads as broken.

Unlike the other publish tasks in this folder, the recommendation here is **wait**, and the
reason is in the note itself.

## What has to close first

§8 of the note is the owner's own open-items list, and three of its entries are about evidence
that is currently in the wiki unverified:

- **The §4.4 secondary numbers.** A Medium roundup of 287 deployments is the sole source for
  the ToolBench figure (~78% for a 350M tool-calling model), the ~60-LoRA-adapter deployment at
  ~10× lower cost with ~8% F1 gain, the 95/5 router split, and the 96%→65% structured-to-
  unstructured drop. The note's own instruction is "either find the primary source or present
  them as anecdote". They are fine in a draft; they are the kind of thing this notebook has
  been careful about on the public site.
- **The OpenAI fine-tuning wind-down claim**, sourced to AIMultiple (June 2026). It is load-
  bearing for the sovereignty argument and has no primary source.
- **The talk title.** "Stop Renting Models You Can't Control" is a transcription of a dictation
  and has not been confirmed against the programme.

The KDnuggets "standard practice in 2026" claim is a fourth, and the note already labels it
as trade press to be treated with suspicion, which is probably enough.

## Two ways to go

1. **Verify or cut, then publish.** Cleanest, and it is what the note asks for. The three
   inbound links resolve, and the notebook gains its first page about presenting this material
   to an audience rather than about reading it.
2. **Publish now with §4.4 trimmed to the primary-cited evidence.** BloombergGPT, the
   collaboration-gap paper and the base-model-depreciation argument all stand on their own; the
   secondary-numbers bullet is the only part that would have to go. This costs the least and
   loses the least, but it edits the owner's prose, which an agent must not do — so it is his
   call to make, not one to be executed on his behalf.

## Also worth deciding

- **The `talks` tag is new** with this note as its only member. Keep it if more speaking
  material is coming, drop it to four tags if not.
- **The last §8 item** — whether the SLM scoping review gets referenced as the longer-form
  companion piece — is the one open item that would change what the wiki holds rather than what
  the slides say. There is no such note here yet.

Related: `sources/2026-08/prague-training-harness-talk/SOURCE.md`, which records what was
carried through unverified and what was deliberately not promoted into other pages.
