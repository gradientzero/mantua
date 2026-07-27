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

## [2026-07-26] setup | Rewrote the dictated commentary for clarity; origin human → mixed

At the owner's request, `agentic-engineering-my-role-in-the-loop` was edited from a raw
transcript into prose: transcription errors fixed, the trailing instruction to the ingest
agent deleted, the five concerns broken into sections. No argument was added or removed, and
the four wikilinks were re-placed on unchanged targets.

Because an agent edited the wording, `origin` moved from `human` to `mixed` (byline:
*Wolfgang Gross · with agents*). The verbatim dictation remains unedited in
`sources/2026-07/agentic-engineering-my-role-in-the-loop/`, so the original is recoverable.
`tasks/2026-07-26-review-dictated-commentary.md` is closed; the publish decision stays with
the cluster task.

## [2026-07-26] ingest | The LLM Wiki pattern (Andrej Karpathy) — a second, meta drop of the notebook's own founding document

The essay already lives at the repo root as `LLM_Wiki.md` — `README.md`'s founding
reference, kept verbatim by its own rule — but the owner dropped a copy into `/inbox` too,
on purpose: how to use agents this way is a topic for this notebook in its own right, not
just infrastructure. The drop had moved (not copied) the root file into `/inbox`, deleting
it from root; restored `LLM_Wiki.md` at the root before processing the inbox copy as its
own source.

New: `llm-wiki-pattern` — the pattern's three layers and three operations, mapped onto this
repo's specific choices (Zod schema enforcement, the `origin` provenance field, no search
tool yet) and linked into the harness-design cluster via
`agentic-engineering-my-role-in-the-loop` and `linting-as-agent-guardrail`. Updated `about`
(Lineage section) to point at the fuller writeup. Archived to
`sources/2026-07/llm-wiki-pattern/` alongside the permanent root copy.

## [2026-07-26] query | How was the Anthropic frontend harness implemented, and has anyone built their own?

Asked for the latest on the Anthropic harness's actual implementation, third-party
reproductions, or failing both, a plan to follow. Answered all three; filed the plan.

**On the source**: the post ships no code and there is nothing newer from Anthropic on this
specific harness. But two things postdate it and change the build-vs-use calculus — Managed
Agents' `user.define_outcome`, which provisions a rubric-driven grader in a separate context
window (the post's core mechanism as an API primitive), and Claude Code's `/goal`, which
loops until a *separate small model* judges the condition met. Also found
`anthropics/cwc-long-running-agents`, example primitives from Code with Claude 2026, whose
default-FAIL contract plus evidence-gate hook is the best idea encountered anywhere in this
reading: it makes rationalising a pass structurally impossible rather than merely discouraged.

**On reproductions**: nobody has published a faithful one. Three partials read — the ECC
`gan-style-harness` skill (closest packaged version, but it reweights craft to 0.3 and
thereby inverts the post's central weighting decision), TandemKit (planner/generator/
evaluator across three sessions, and the first cross-model evaluator seen — Claude against
Codex, which is exactly the missing experiment `generator-evaluator-loops` flagged), and
gprecious/harness.

New: `building-a-generator-evaluator-harness-plan` — four stages, cheapest first, with the
stopping rule from the post itself. Linked from `agentic-engineering`,
`harness-design-for-long-running-coding-agents`, `generator-evaluator-loops` and
`harness-design-reading-list`.

**Two corrections to existing pages.** `harness-design-reading-list` claimed its four
sources were unfetchable; that was the ingest session's network policy, not the
environment's — this session reached `www.anthropic.com` fine, and the frontend-design skill
is installed locally. Note and
`tasks/2026-07-26-clip-harness-design-prior-work.md` both updated; the task moved from
`blocked` to `open`. The skill's list of the three looks AI design converges on is a
ready-made originality fail-condition and is now recorded.

## [2026-07-27] figure | The simplified harness, end to end

Owner supplied a screenshot of the v2-harness diagram from the presentation accompanying
the Anthropic harness-design post and asked for it as a figure in the notes. Redrawn as a
themed SVG component — `components/figures/simplified-harness.tsx`, registered in
`components/mdx.tsx` alongside the two existing figures, click-to-enlarge like them — and
placed in `harness-design-for-long-running-coding-agents` at the end of the walk-back
section, where the text has just finished explaining what was cut and why.

Kept from the original: the clay evaluator and its `findings.md` return path as the only
surviving loop, the filesystem band as the sole shared state, and the four struck-out
components (context resets, sprint decomposition, per-sprint eval loop, sprint contracts)
labelled as removed on Opus 4.6. The theme has no orange or beige token, so those two
colours are local constants in the component and documented as carrying meaning rather
than decoration.

Verified by rasterising the server-rendered SVG with headless Chrome — the Browser pane
was hidden and screenshotted blank. First pass had `findings.md` sitting on top of the
evaluator box; widened that gap to 130px and derived the removed-row widths from the
evaluator's right edge so the three bands align.

## [2026-07-27] ingest | Claude Code /goal documentation

The reference page for `/goal`, dropped as the primary source behind the Department of
Product article ingested alongside it.

New: `keeping-an-agent-running` — the four mechanisms that decide what starts an agent's
next turn (`/goal`, `/loop`, Stop hooks, scheduled runs), how `/goal` evaluates (a
session-scoped prompt-based Stop hook; the condition plus the transcript go to the small
fast model after every turn), and what to put in a condition.

**The finding that touched other pages**: `/goal`'s evaluator does not call tools. It reads
the transcript, so the generator produces the evidence the grader judges. That is a real
generator/evaluator split with an independent *verdict* and dependent *evidence* — half of
what makes an evaluator work. `generator-evaluator-loops` gained that contrast under "make
it use the thing"; `building-a-generator-evaluator-harness-plan` Stage 2 now rules `/goal`
out for the frontend case specifically and points at the bash loop instead.

Also updated `agentic-engineering` (new section on the mechanics one level down; the "where
do these agents run" open question partly answered by scheduled runs and Managed Agents) and
`harness-design-reading-list` (the Ralph Wiggum loop has been absorbed into the tools).
Archived to `sources/2026-07/claude-code-goal-docs/`.

## [2026-07-27] ingest | Beyond prompts: loops, goals and slash commands (Department of Product)

Paywalled Substack piece, clipped as a fragment — it stops partway into the `/goal` section
before any worked example, and the promised 100+ command inventory is not in the capture.
Recorded as such in the source record and on the note itself.

New: `loop-engineering` — the framing that has grown up around these commands: Cherny,
Osmani and Guzman each saying a version of "the unit of work is the loop, not the prompt".
Kept short because the source is thin. The page's own argument is that the framing relocates
the judgment work rather than removing it: a loop still needs someone to specify "done"
precisely enough for a model to check, which is the same skill as writing an evaluator
rubric. Links out to `keeping-an-agent-running` for the mechanics and to
`agentic-engineering-my-role-in-the-loop`, whose open question — delegating decisions, not
tasks — is exactly the half this advice skips.

The one durable piece of structure in the fragment, the built-in/custom/connector-exposed
taxonomy, is recorded because this notebook runs on the middle category: `/ingest`,
`/oracle` and `/lint` are markdown files. Archived to
`sources/2026-07/beyond-prompts-loops-goals-slash-commands/`.
