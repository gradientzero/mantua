# Source record

- **Item**: `karpathy_yt_transcript_skillissue.mdx`
- **Title**: *Skill Issue: Andrej Karpathy on Code Agents, AutoResearch, and the Loopy Era
  of AI* — NoPriors podcast, guest Andrej Karpathy
- **Origin**: **captured external material** — auto-generated YouTube transcript, dropped
  into `inbox/` by the owner
- **URL**: https://www.youtube.com/watch?v=kwSVtQ7dziU
- **Published**: 2026-03-20
- **Ingested**: 2026-07-27

## Notes on the capture

A single `.mdx` file with no frontmatter: four header lines (URL, show, title, date) and
then the whole conversation as one unbroken paragraph. No speaker labels beyond `>>`
markers, no timestamps, no punctuation of turns. Nothing in it can be cited to a position
in the recording.

**It is an automatic transcription and the proper nouns are wrong throughout.** The
corrections applied in the wiki notes, all of them unambiguous from context:

| In the transcript | Actually |
|---|---|
| clot code, claw, class stuff | Claude Code; "claw" / OpenClaw |
| codecs, CEX | Codex |
| Quinn | Qwen |
| GBT2 | GPT-2 |
| data chat, Namat | nanochat |
| program MD, program NDS | `program.md` |
| Peter Steinberg | Peter Steinberger |
| good harding | Goodharting |
| psychopasy | sycophancy |
| Jevans paradox | Jevons paradox |
| v code, vi coding, back coding | vibe coding |
| seti at home | SETI@home |
| OI, openi | OpenAI |
| Noom, Nome | Noam |
| no-briers.com | nopriors.com |

Three that were **not** resolved:

- **"the soul and D document"** — the OpenClaw file Karpathy credits with giving the agent
  its personality. Almost certainly a `SOUL.md`-style filename, but the transcript does not
  support naming it, so `the-claw-layer` calls it "the personality file". A smoothing, not a
  correction: the actual filename is unknown and should not be guessed from this source.
- **"a good book … called demon"** — almost certainly Daniel Suarez's *Daemon*, recorded
  with that hedge.
- **"Liam … CEO of periodic"** — left as transcribed.

## Where the two speakers are easy to conflate

There are no speaker labels beyond `>>` markers, and in a few places the interviewer
supplies a number or a phrase that reads as Karpathy's. One that caught out the first draft
of these notes: on how stale the joke is, **Karpathy says "three or four years ago"** and
**the interviewer says "a crappy joke from 5 years ago"**. The notes use three-or-four.
Anything attributed to him should be checked against the `>>` boundaries before it is
quoted.

This is the podcast the owner referred to from memory in his 2026-07-27 dictation ("there
is a podcast where Karpathy talks about this as a skill issue") and one of the three
uncaptured references tracked in
`tasks/2026-07-27-clip-sovereign-ai-and-expertise-sources.md`. That task is now down to two
items.

## Prior partial processing

The commit that dropped this file into the inbox (`33b9e95`, "add yt karpathy") also added
`content/notes/auto-research.mdx`, written from this transcript, but did not archive the
item, write this record, or log the ingest — and it left the note's source link
(`skill-issue-karpathy-on-code-agents`) dangling. This ingest finishes that work; the
`auto-research` page was kept as written and only gained the source pointer and two
cross-links.

## Correction it forced

`content/notes/agentic-engineering.mdx` claimed there was "no implementation of Karpathy's
Auto Research". The transcript says otherwise: the single loop ran overnight against
nanochat and found tunings its author had missed. What is unimplemented is the parallel,
untrusted-worker version and the meta-layer over `program.md`. Amended in place on that
page, with the split spelled out on `auto-research`.

## Wiki pages touched

New:

- `content/notes/skill-issue-karpathy-on-code-agents.mdx` — the interview note; source
  record, transcript caveat, the three side arguments (Jevons, digital-before-atoms, being
  outside a lab), and the hedge that makes "everything is a skill issue" hard to falsify
- `content/notes/the-claw-layer.mdx` — the persistent-entity layer, Dobby, the memory claim
- `content/notes/jaggedness-and-what-rl-optimises.mdx` — verifiable domains advance,
  everything else stalls; the joke test
- `content/notes/the-customer-is-not-the-human.mdx` — APIs instead of apps, markdown for
  agents instead of HTML for people, and what that does to teaching
- `content/notes/model-speciation-and-touching-the-weights.mdx` — monoculture vs
  speciation, context windows as the only working primitive, open weights six to eight
  months behind

Updated (prose):

- `content/notes/agentic-engineering.mdx` — Auto Research correction; new section mapping
  the four branches; cross-session-memory open question now points at the claw layer
- `content/notes/generator-evaluator-loops.mdx` — new section: the evaluator as feasibility
  gate, and metric overfitting with the regress it implies
- `content/notes/keeping-an-agent-running.mdx` — the claw layer as a fifth shape, answering
  "what stays resident" rather than "what starts the next turn"
- `content/notes/loop-engineering.mdx` — "remove yourself as the bottleneck" and
  `program.md` as the recursion's next turn; the hand-written file at the top of the stack
- `content/notes/harness-engineering-agent-first-repositories.mdx` — same instruction as
  "what the agent can't see doesn't exist", opposite motivation
- `content/notes/auto-research.mdx` — source pointer, jaggedness cross-link
- `content/notes/harness-design-reading-list.mdx` — this item is no longer missing

Updated (frontmatter only, prose untouched — `origin: human` / `mixed`):

- `content/notes/the-harness-is-a-skill-issue.mdx` (`related:`)
- `content/notes/agentic-engineering-my-role-in-the-loop.mdx` (`related:`)
- `content/notes/llm-customization-and-fine-tuning-notes.mdx` (`related:`)
- `content/notes/serving-slms-on-a-desktop-gpu.mdx` (`related:`)
