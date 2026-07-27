# Source record

- **Item**: `karpathy_yt_transcript_skillissue.mdx`
- **Title**: Skill Issue: Andrej Karpathy on Code Agents, AutoResearch, and the Loopy Era of AI
- **Origin**: external — NoPriors podcast, YouTube auto-transcript
- **URL**: https://www.youtube.com/watch?v=kwSVtQ7dziU
- **Published**: 2026-03-20
- **Captured**: 2026-07-27
- **Ingested**: 2026-07-27

## Notes on the capture

A YouTube auto-transcript, unedited: no speaker labels beyond `>>` markers, no paragraphs,
and the usual ASR damage. Names and terms are mangled throughout — "No Briars" for NoPriors,
"clot code"/"codecs" for Claude Code and Codex, "Namat" for what is almost certainly
nanochat, "GBT2" for GPT-2, "psychopasy" for sycophancy, "good harding" for reward hacking,
"paralize" for parallelise, "vi coding"/"back coding" for vibe coding. Attributing a line to
the right speaker sometimes requires reading around the `>>`.

Two consequences for the notes taken from it:

- Quotes were kept short and only where the transcript is unambiguous. Anything used as a
  block quote in the wiki reads cleanly in the raw text; nothing was reconstructed.
- The project Karpathy ran Auto Research against is transcribed as "data chat" / "Namat".
  Reading it as nanochat is an inference from context (his small-GPT training repo, hand-tuned
  over years, used as a recursive-self-improvement playground). The wiki page says so rather
  than asserting the name. **Worth confirming against the video.**

The interview is dated four days before Anthropic's harness-design post, so it is the same
moment in the field seen from outside a lab. That timing is used in the notes.

## Why this arrived

It fills two of the three gaps opened by the owner's dictation ingested earlier the same day
(`sources/2026-07/the-harness-is-a-skill-issue/`) and tracked in
`tasks/2026-07-27-clip-sovereign-ai-and-expertise-sources.md`: the "skill issue" podcast and
Auto Research. The third — *Agentic Coding and Persistent Returns to Expertise* — is still
unclipped, as is the Anton Leicht piece.

## The one thing it corrects

The dictation says Auto Research "is not implemented yet". The transcript reports a working
single-loop run that beat Karpathy's own hand-tuned baseline overnight. What is genuinely
unbuilt is the parallel/untrusted-swarm version and the meta-layer over `program.md`. The
correction is recorded on `auto-research` under "Correcting the record in this notebook" and
in the revised section of `agentic-engineering`. The owner's `origin: mixed` prose was **not**
edited — his conclusion survives the correction, and the premise is corrected on the agent
pages that cite it.

## Wiki pages touched

- `content/notes/skill-issue-karpathy-on-code-agents.mdx` (new — the source note)
- `content/notes/auto-research.mdx` (new — the concept; resolves a dangling wikilink from
  `the-harness-is-a-skill-issue` and `agentic-engineering`)
- `content/notes/agentic-engineering.mdx` ("How far along is this, really?" rewritten — the
  claim that nobody has a working loop was too strong)
- `content/notes/generator-evaluator-loops.mdx` ("if you can't evaluate it, you can't
  automate it" as the prior question; metric overfitting as a named failure mode)
- `content/notes/loop-engineering.mdx` (new section — the recursion one level further out,
  `program.md` as a tunable research organisation)
- `content/notes/llm-wiki-pattern.mdx` (new section — markdown for agents rather than HTML
  for humans, and what that says about what this notebook is for)
- `content/notes/the-harness-is-a-skill-issue.mdx` (one wikilink added to existing prose;
  wording untouched)

## Addendum — second ingest session, same day

This transcript was ingested twice in parallel by two sessions that did not see each other's
work (see `log.md` for both entries). The record above is the first session's and stands
unedited; the material below is what the second added, kept because it is the more complete
reading of the ASR damage. The second session's duplicate archive at
`sources/2026-07/skill-issue-karpathy-on-code-agents/` was removed in favour of this one.

Further corrections applied in the notes, beyond those listed above:

| In the transcript | Read as |
|---|---|
| Quinn | Qwen |
| Jevans paradox | Jevons paradox |
| Peter Steinberg | Peter Steinberger |
| program MD, program NDS | `program.md` |
| seti at home | SETI@home |
| OI, openi | OpenAI |
| Noom, Nome | Noam |
| data chat | nanochat (same inference as "Namat" above) |

Three left **unresolved**, and flagged as such wherever they appear:

- **"the soul and D document"** — the OpenClaw file Karpathy credits for the agent's
  personality. Probably a `SOUL.md`-style filename, but the transcript does not support
  naming it, so `the-claw-layer` calls it "the personality file". A smoothing, not a
  correction; the actual filename should not be guessed from this source.
- **"a good book … called demon"** — almost certainly Daniel Suarez's *Daemon*, recorded
  with that hedge.
- **"Liam … CEO of periodic"** — left as transcribed.

One note on terms: **"good harding"** is read above as reward hacking, which is the right
concept; the literal reading is *Goodharting*, after Goodhart's law. Either is fine, but the
notes should not mix them.

### A worked example of the speaker problem

The record above is right that attribution needs reading around the `>>` markers, and the
second session got one wrong on the first pass. On how stale the atoms joke is, **Karpathy
says "three or four years ago"** and **the interviewer says "a crappy joke from 5 years
ago"**. The wiki uses three-or-four throughout. Anything attributed to him — numbers
especially — is worth checking against the `>>` boundaries before it is quoted.

### Pages the second session added

Beyond those listed above: `the-claw-layer`, `jaggedness-and-what-rl-optimises`,
`the-customer-is-not-the-human`, `model-speciation-and-touching-the-weights`, plus updates to
`keeping-an-agent-running`, `harness-engineering-agent-first-repositories`,
`harness-design-reading-list`, `auto-research`, and `related:` entries (frontmatter only) on
four `origin: human` / `mixed` pages.
