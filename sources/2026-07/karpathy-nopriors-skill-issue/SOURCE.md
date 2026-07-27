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
