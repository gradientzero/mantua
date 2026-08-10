# Source record

- **Item**: `Model Training as Code — Aleph Alpha.md` + 7 extracted images
- **Title**: Model Training as Code
- **Author**: Michael Barlow, Aleph Alpha Research
- **Origin**: external — Aleph Alpha company research blog. © 2026 Aleph Alpha GmbH.
- **URL**: not recorded in the capture; the article is on the Aleph Alpha site
  (https://aleph-alpha.com), dated 22/05/2026 in the byline
- **Published**: 2026-05-22
- **Captured**: 2026-08-10
- **Ingested**: 2026-08-10

## Provenance correction, which is the important part of this record

**The item was dropped in `inbox/mine/`, but it is not the owner's writing.** It is an
external company blog post with a named author, an acknowledgments section naming six further
contributors, and a copyright line. Per `inbox/README.md` the folder alone would mark it
`origin: human` with the owner's byline — that would have attributed Michael Barlow's article
to Wolfgang Gross, which is the one schema violation the README calls unforgivable, so the
folder hint was overridden and the item was processed as captured external material: an
`origin: agent` summary note, no republication of the prose.

Nothing in the item contradicts this reading — there is no frontmatter, no commentary, and no
owner's voice anywhere in the file. The most likely explanation is a misfiled drop.
Recorded for the owner in `tasks/2026-08-10-inbox-mine-misfiled-item.md`.

## Notes on the capture

A PDF-to-markdown conversion (Marker, judging by the `_page_N_Picture_M.jpeg` asset naming and
the page-ordered image references), so the source PDF was presumably a print or export of the
web page. The conversion is faithful in structure — headings, blockquote TL;DR, tables, image
placements — with three artefacts worth knowing about before quoting from it:

1. **Lost inter-word spaces**, consistently after "for", "the", "over", "than", "after" and
   similar: `forthree`, `ratherthan`, `overtime`, `aftertwo`, `neverfeels`, `enablerfor`.
   Roughly thirty occurrences. Quotations taken into the wiki were repaired silently; the
   archive is left as captured.
2. **Both code blocks are truncated at the right margin.** The `post_train` pseudocode and the
   learning-rate sweep example are each cut mid-line (`sft_checkpoint = await sft(config.sft)`
   survives, `return PostTrainEvaluation(await sft_eval, awa` does not). The wiki note
   therefore describes what the code does and does not reproduce it.
3. **Page furniture is retained**: the Aleph Alpha wordmark and hero image at the top, the
   footer address/legal table for the Heidelberg, Berlin, Bayreuth and München offices, and the
   copyright line. Kept as captured.

## Images

All seven extracted images are archived here exactly as dropped. Three carry information and
were copied into `public/images/model-training-as-code/` for the note (copies — these
originals are untouched):

| Archive file | Copied as | Content |
|---|---|---|
| `_page_2_Picture_1.jpeg` | `training-pipeline.jpeg` | The pre-training / post-training iteration diagram (×n, ×m) |
| `_page_9_Figure_0.jpeg` | `sweep-workflow-dag.jpeg` | The four-way sweep DAG in the workflow-engine UI, two SFT nodes awaiting cache |
| `_page_10_Picture_0.jpeg` | `leaderboard-screen.jpeg` | Photo of the model leaderboard on a screen in the Heidelberg office |

The other four are branding or decoration and were not copied: `_page_0_Picture_2.jpeg`
(Aleph Alpha wordmark), `_page_0_Picture_3.jpeg` (voxelated-face hero image),
`_page_6_Picture_6.jpeg` (a "Savanna" tile), `_page_12_Picture_4.jpeg` (footer mark).

**The three copied figures are Aleph Alpha's, reproduced with attribution in a page that is
currently a draft.** Nothing they own reaches the public site until the owner publishes the
note; the re-use question is flagged in `tasks/2026-08-10-publish-model-training-as-code.md`.

## Wiki pages touched

- `content/notes/model-training-as-code.mdx` — new, `origin: agent`, `status: draft`
- `content/notes/agentic-engineering.mdx` — new section; the "where do these agents run"
  open question gains the industrial answer
- `content/notes/auto-research.mdx` — new section on the substrate the loop assumes
- `content/notes/harness-engineering-agent-first-repositories.mdx` — the durable-artefact
  claim, independently reached outside software
- `content/notes/model-speciation-and-touching-the-weights.mdx` — capability teams as
  organisational speciation; the missing-primitives claim narrowed
- `content/notes/linting-as-agent-guardrail.mdx` — CI gates on a training pipeline
- `content/notes/loop-engineering.mdx` — partial answer to "what reviews the loop?"

## What was left out of the wiki

- The full manual-lab narrative (the Slack handoff, the `do_not_delete` dataset, the SFT/RL
  blame investigation). Summarised, not reproduced — it is the post's rhetorical set piece and
  it is unattributed and undated.
- Both code listings, because both are truncated in the capture (see above).
- The office addresses and legal footer.
