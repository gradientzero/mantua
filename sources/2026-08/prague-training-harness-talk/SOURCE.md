# Source record

- **Item**: `2026-08-30-prague-training-harness-talk.md`
- **Title**: Note on the Prague Training-Harness Talk — "2027 Will Be the Year of Specialized
  Language Models"
- **Origin**: **the owner's own writing, worked up with AI agents** — dropped in `inbox/mine/`
  with `origin: mixed` in its frontmatter
- **Author**: Wolfgang Gross
- **URL**: none — unpublished working document
- **Captured**: 2026-08-30
- **Ingested**: 2026-08-30

## Notes on the capture

A planning artifact for a 50-minute talk in Prague at the end of September 2026, not a script
and not reading notes. The document's own closing line describes how it was made: compiled
from a dictated field recording, with sections 3, 4.2, 4.4 and 5 written as *pushback on* the
dictation rather than as a transcription of it. So the spoken original is the owner's, and the
structuring, the evidence check and the counter-argument section were done with agents — which
is what `origin: mixed` is for, and it is how the note is labelled in the wiki.

The prose was **not** edited. Two structural changes only, both permitted by the ingest
contract in `README.md`:

1. The duplicated H1 (`# Note on the Prague Training-Harness Talk`) was dropped — the article
   template renders the title from frontmatter. The masthead block under it (working title,
   author, date, status) is the owner's and was kept as dropped.
2. The item's frontmatter keys that the content schema has no slot for — `talk_title`, `date`,
   `venue`, and the free-text `status: draft / thinking note` — were translated into schema
   fields (`created`/`updated: 2026-08-30`, `status: draft`) and a `summary`. The working talk
   title and the venue survive in the body's masthead; nothing was lost.

Eight wikilinks were added, all with the owner's own words as the visible label: two to
`model-training-as-code`, two to `auto-research`, one each to
`model-speciation-and-touching-the-weights`, `learning-from-deployment`,
`small-language-models` and `private-deployment`, plus `slm-evaluation-harness` on the note's
"trustworthy eval" condition. The last three targets do not exist yet — they were already on
the notebook's to-do list, cited from the owner's other hand-written notes.

## What is unverified in it, and stays unverified

The note flags its own weak evidence and the flags were carried through verbatim rather than
resolved: the §4.4 secondary numbers (the Medium 287-deployment roundup, the ToolBench figure,
the LoRA-adapter cost claim), the reported wind-down of OpenAI's fine-tuning platform, and the
KDnuggets "standard practice" claim. None of them were checked at ingest and none were promoted
into any other page. **The only numbers that reached the rest of the wiki are the ones with
primary citations** — BloombergGPT's parameter count and reported cost, and the arXiv IDs. The
note is `status: draft`, so none of it is on the public site; the verification work is the
owner's §8 list and is tracked as `tasks/2026-08-30-publish-prague-talk-note.md`.

## Wiki pages touched

- `content/notes/prague-training-harness-talk.mdx` — new, `origin: mixed`, `status: draft`,
  prose unchanged
- `content/notes/model-training-as-code.mdx` — new pushback paragraph: Savanna is a
  frontier-pretraining factory, and reading it as a blueprint at consultancy scale prices the
  whole thing; the transferable subset named explicitly
- `content/notes/model-speciation-and-touching-the-weights.mdx` — new section: the demand-side
  answer to Karpathy's supply-side reason for the monoculture (agentic workloads are knowable
  by construction), BloombergGPT as the counter, and the observation that the surviving case
  for specialisation is on the format/latency/cost/sovereignty axes rather than the knowledge
  axis he is looking at
- `content/notes/learning-from-deployment.mdx` — new section: the data flywheel as the small
  version of that page's loop, and why filtering by workflow success is a coarser label than
  anything else on the page
