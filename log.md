# Log

Append-only record of what happened to this notebook and when — ingests, queries filed
back into the wiki, lint passes, structural changes. Newest entries at the bottom; never
rewrite old entries.

Every entry starts with a consistent, grep-able prefix:

```
## [YYYY-MM-DD] <kind> | <short title>
```

where `<kind>` is one of `ingest`, `query`, `lint`, `setup`. That makes the log
parseable with plain unix tools — `grep "^## \[" log.md | tail -5` shows the last five
entries.

---

## [2026-07-25] setup | Restructured into mantua.io, the agent-first commonplace notebook

Converted the repository from the SLM research notebook into **mantua.io**, following
the LLM-wiki pattern (`LLM_Wiki.md`): added `/inbox` (capture), `/sources` (immutable
raw archive), this log, agent commands (`/ingest`, `/oracle`, `/lint`), and an `origin`
provenance field on all content. Removed the four placeholder seed notes; kept the three
hand-written notes (LLM customization reading notes, tabular foundation models reading
notes, desktop-GPU serving lab notes), now marked `origin: human`.

## [2026-07-26] ingest | Harness design for long-running application development (Anthropic)

Web article, Prithvi Rajasekaran / Anthropic Labs, 2026-03-24, supplied as text by the
owner (`www.anthropic.com` is not reachable from the ingest session). A GAN-inspired
generator/evaluator loop applied first to frontend design, then a planner/generator/
evaluator harness for full-stack builds, then walked back to a simpler harness on
Opus 4.6. Published cost figures for both runs.

New: `harness-design-for-long-running-coding-agents`. Also fed `agentic-engineering`,
`generator-evaluator-loops`, `linting-as-agent-guardrail`, `harness-design-reading-list`.
Archived to `sources/2026-07/harness-design-for-long-running-application-development/`.

## [2026-07-26] ingest | Harness engineering: leveraging Codex in an agent-first world (OpenAI)

Web article, Ryan Lopopolo / OpenAI, 2026-02-11, supplied as text by the owner. Five
months shipping a product with no hand-written code: docs as the system of record,
`AGENTS.md` as a table of contents, the app made drivable per git worktree, custom
linters enforcing architecture and taste, and background agents garbage-collecting drift.

New: `harness-engineering-agent-first-repositories` and `linting-as-agent-guardrail`
(most of the latter's material comes from here). Archived to
`sources/2026-07/harness-engineering-leveraging-codex-in-an-agent-first-world/`.

## [2026-07-26] ingest | Building self-improving tax agents with Codex (OpenAI × Thrive)

Web article, 2026-05-27, supplied as text by the owner. Practitioner corrections in
production become structured findings, then targeted evals, then bounded tasks a coding
agent closes — with a field-completion metric that moved from 25% to 86% of returns at
≥75% correct in six weeks.

New: `self-improving-agents-from-production-feedback`. Gives an inbound link to the
existing `llm-customization-and-fine-tuning-notes` on production logs as an eval set.
Archived to `sources/2026-07/building-self-improving-tax-agents-with-codex/`.

## [2026-07-26] ingest | Commentary on the harness-design articles (owner, dictated)

The owner's own dictation, dropped in `inbox/mine/`: six months of AI coding, the feeling
of being the bottleneck, and the move from doing the work to managing a small team of
agents — plus the practical questions that follow (where the agents run, cross-session
memory, quality control and PR review, linting beyond tests).

New: `agentic-engineering-my-role-in-the-loop` — `origin: human`, prose unchanged, four
wikilinks added whose visible labels are his own words. The transcript has speech-to-text
artifacts; cleaning them up is his call, flagged in
`tasks/2026-07-26-review-dictated-commentary.md`. Archived to
`sources/2026-07/agentic-engineering-my-role-in-the-loop/`.

## [2026-07-26] ingest | Prior work linked from the Anthropic harness-design post

Link list only. The owner asked for the four pieces linked at the top of the harness-design
post to be captured too; none could be fetched — `www.anthropic.com` is not on this
environment's egress allowlist (403), and the frontend-design skill lives in a GitHub
repository outside this session's scope. Captured as URLs plus what the citing article says
about each.

New: `harness-design-reading-list`. Follow-up in
`tasks/2026-07-26-clip-harness-design-prior-work.md`. Archived to
`sources/2026-07/anthropic-prior-work-on-agent-harnesses-links/`.

**Cluster note.** These five items open a new topic in the notebook, held together by
`agentic-engineering`. All eight new pages are drafts and are deliberately not linked from
`home` or `about` yet — a published hub linking to drafts renders as dead spans in
production. Wiring them in is an owner decision, tracked in
`tasks/2026-07-26-publish-agentic-engineering-cluster.md`.
