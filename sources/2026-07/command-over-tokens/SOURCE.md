# Source record

- **Item**: `2026-07-29-dictation-command-over-tokens.md`
- **Title**: Dictation — command over tokens
- **Origin**: **the owner's own writing** — dictated, then corrected and tightened at his
  explicit request before it was dropped in `inbox/mine/`
- **Author**: Wolfgang Gross
- **Captured**: 2026-07-29
- **Ingested**: 2026-07-29

## Notes on the capture

Dictated. Unlike the 2026-07-27 dictation, the raw transcript is **not** what is archived
here: the owner asked in the same breath for the typos and speech repairs to be fixed and
the argument restructured, so the file archived above is already the cleaned version, with
his instruction line kept at the top and his brief for the added section kept at the bottom.
The verbatim transcript exists only in the session that produced it.

Transcription slips corrected in the introduction, recorded here because the archived file no
longer shows them: *"Hapathi"* → Karpathy, *"Anthropian oak"* → Anthropic and OpenAI, *"the
research attorney"* → Auto Research, *"limitless token expand… expenditure"* → limitless token
expenditure. Spoken restarts ("and it's kind of… well, how did that… I know…") are gone. The
argument, the opinions and the framing are his; nothing was added to the introduction and
nothing dropped from it.

- **`origin: mixed`, not `origin: human`.** The introduction is his argument in edited
  wording, and the second half of the page (*Why the allowance is not the constraint*, *Four
  decisions that make a harness*, *How to get there without pretending*) was drafted by an
  agent to his brief. The byline reads *Wolfgang Gross · with agents*. Reverting to
  `origin: human` is only correct if he rewrites the prose himself.
- **Status is `draft`.** Publishing is his call; he asked for a preview.

## One deliberate omission

The dictation referred to an incident that suggests the labs run more than they publish —
named in the recording as something like "the hacking face incident", which the agent could
not resolve to a real event with confidence. Rather than guess at a public incident and
attribute a claim to it, the sentence in the note stops at "now and then something leaks out
that suggests there is more". Tracked as
`tasks/2026-07-29-name-the-lab-leak-incident.md`.

## Nothing else new was captured

Every source the added section draws on is already archived in this notebook:

- `sources/2026-07/harness-design-for-long-running-application-development/` — the
  stress-test-every-component principle, sprint contracts, the poor-QA-agent finding.
- `sources/2026-07/harness-engineering-leveraging-codex-in-an-agent-first-world/` — docs as
  the system of record, custom linters carrying remediation instructions, continuous cleanup.
- `sources/2026-07/karpathy-nopriors-skill-issue/` — unspent quota as a diagnosis, macro
  actions and ~20-minute task sizing.
- `sources/2026-07/claude-code-goal-docs/` — the four turn-starting mechanisms.
- `sources/2026-07/doordash-nopriors-agentic-commerce-and-dot/` — the 20× spend and the
  benchmark built to price it.

## Wiki pages touched

- `content/notes/command-over-tokens.mdx` (new — `origin: mixed`, `status: draft`)

No existing page was edited. The new note links out to
`the-harness-is-a-skill-issue`, `skill-issue-karpathy-on-code-agents`,
`harness-design-for-long-running-coding-agents`,
`harness-engineering-agent-first-repositories`, `auto-research`,
`benchmarking-your-own-agent-spend`, `keeping-an-agent-running` and
`linting-as-agent-guardrail`; backlinks appear on those pages automatically once this one is
published.
