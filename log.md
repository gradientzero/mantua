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

## [2026-07-27] ingest | Dictation — Auto Research, the published harnesses, and the skill issue

Dictated by the owner and passed straight to `/ingest` with the instruction to edit out the
clutter and restructure while keeping the tone. Done, which makes the page `origin: mixed`
rather than `origin: human` — same call as the 2026-07-26 dictation. The verbatim transcript
is archived at `sources/2026-07/the-harness-is-a-skill-issue/`.

New: `the-harness-is-a-skill-issue` — the entry point is an Anton Leicht piece on middle
powers and sovereign AI, whose one surprising line is that these initiatives should want
access to the coding and auto-science agents the labs run internally. That sent him looking
for what is actually published, and the answer is the two posts already in this notebook,
plus the observation that nobody has implemented Karpathy's Auto Research. Conclusion: the
labs are still experimenting, we see their work two to four months late, and the gap is a
skill issue on the operator's side — build and train your own harness. The note ends with
his own operating rules: don't watch the agent work, run the first loops by hand as your own
evaluator, write measurable criteria, read what the evaluator produces before trusting it,
then schedule it.

**What touched other pages**: `agentic-engineering` gained a section stating plainly that
the fully automated loop is unimplemented — the hub read more settled than the situation is.
`generator-evaluator-loops` gained his operational version of "concrete criteria" (colour
scheme from a named set, spacing, window-size scaling, buttons clickable) and two tuning
corollaries: be the evaluator yourself for the first few loops, and judge the evaluator by
what it finds, not by its verdict. `loop-engineering` gained the returns-to-expertise
finding as a second line of evidence for its own argument that specification work doesn't
disappear. `agentic-engineering-my-role-in-the-loop` got a `related:` entry only, prose
untouched.

Three cited sources — Leicht, Auto Research, and "Agentic Coding and Persistent Returns to
Expertise" (2026-06-16) — exist only as recollection in the dictation; none was clipped, and
the direct quote in the note is unverified. Two dangling wikilinks (`sovereign-ai-for-middle-powers`,
`auto-research`) mark the gap. Tracked as
`tasks/2026-07-27-clip-sovereign-ai-and-expertise-sources.md`.

## [2026-07-27] ingest | Skill Issue: Karpathy on code agents (NoPriors, 2026-03-20)

Dropped into the inbox mid-session, right after the dictation ingest above flagged the same
podcast as an uncaptured source. A YouTube auto-transcript with heavy ASR damage — names and
terms mangled throughout — so quotes were kept short and only taken where the raw text is
unambiguous. Archived to `sources/2026-07/karpathy-nopriors-skill-issue/`.

New: `skill-issue-karpathy-on-code-agents` — the source note. The December flip (he has not
typed a line of code since), "everything is skill issue" as a diagnosis and token throughput
as the resource you feel guilty wasting, macro actions and Steinberg's wall of 20-minute
Codex sessions, claws as a persistence-plus-memory layer, and the jaggedness caveat that
undercuts the rest: models improve where behaviour is verifiable and stall everywhere else,
with the unchanged four-year-old atoms joke as the cheap counter-example to capability
transfer.

New: `auto-research` — the concept, previously a dangling wikilink. An objective, a metric,
boundaries, go. The nanochat run that beat his own two-decades-of-experience hand-tuning
overnight; `program.md` and the observation that a research organisation is just a set of
markdown files, therefore tunable; the untrusted-worker swarm he has not solved; and the one
constraint that bounds all of it — if you can't evaluate it, you can't auto-research it.

**The correction this forces**: the dictation ingested earlier today says Auto Research "is
not implemented yet". That is too strong. The single loop is implemented and produced this
cluster's one uncontested result. What is unbuilt is the coordination — parallel loops, the
swarm, the meta-layer over the loop's own spec. The owner's `origin: mixed` prose was left
alone; the correction lives on `auto-research` and in the rewritten "How far along is this,
really?" section of `agentic-engineering`, which had inherited the same overstatement.

Also updated: `generator-evaluator-loops` (the evaluator as the prior question, not a
component — plus metric overfitting as a named failure mode of long-running loops),
`loop-engineering` (the recursion one level further out: code → prompt → loop → the thing
that writes the loop, and why the objection gets sharper not weaker), `llm-wiki-pattern`
(markdown for agents rather than HTML for humans — the same bet as this notebook, arrived at
from teaching), and one wikilink added to `the-harness-is-a-skill-issue` with its wording
untouched.

Inbox empty. Still unclipped from this morning's dictation: the Anton Leicht sovereign-AI
piece and *Agentic Coding and Persistent Returns to Expertise*.

## [2026-07-27] ingest | Karpathy transcript, second pass — the concept notes, and a duplicate ingest

**The same transcript was ingested twice, in parallel, by two sessions that could not see
each other.** The entry above is the first; this is the second, reconciled onto it after the
fact. Recorded rather than quietly squashed, because the duplication is a finding about how
this notebook is being operated, not just a merge accident: two agent sessions were started
on one inbox item minutes apart, and nothing in the repo made either aware of the other.
Worth fixing before the ingest agent runs on a schedule — a lock, or a claim marker in the
inbox, or simply not starting two.

What the reconciliation kept from the first pass: the source note
`skill-issue-karpathy-on-code-agents` (both sessions wrote one, under the same slug; the
first's is more complete and is the one that survives), the archive at
`sources/2026-07/karpathy-nopriors-skill-issue/`, and the rewritten "How far along is this,
really?" section of `agentic-engineering`. The second session's duplicate archive folder was
deleted.

What this pass adds on top — four concept notes spun out of sections the source note covers
in brief, each linked from the relevant point in it:

- `the-claw-layer` — the persistence layer, the Dobby demo, and the security story that does
  not hold together. Also a fifth shape for `keeping-an-agent-running`: what stays *resident*
  between turns, where the other four answer what starts the next one.
- `jaggedness-and-what-rl-optimises` — followed through the cluster, where it turns out to be
  the mechanism behind several findings collected separately, including why the model is a
  poor QA agent out of the box.
- `the-customer-is-not-the-human` — apps-should-be-APIs and docs-for-agents as one argument,
  plus where it thins out (somebody pays for the API; the claim is made by someone who can
  build the replacement).
- `model-speciation-and-touching-the-weights` — the SLM thread's share: why customisation
  stops at the context window, and open weights six to eight months behind.

Also updated: `harness-engineering-agent-first-repositories`, `harness-design-reading-list`,
`auto-research` (source pointer, jaggedness cross-link), and `related:` frontmatter on four
`origin: human` / `mixed` pages, prose untouched.

**Provenance fixes from a review pass** over this branch's own diff, before merge. Three
slips, all found by checking the notes against the archived transcript rather than against
the reasoning that produced them: `the-claw-layer` asserted the claw runs on a machine at
home that stays up and hung a cross-link on it, which the transcript does not support (claim
scoped, link dropped); the atoms joke was dated five years in two places, which is the
*interviewer's* number, not Karpathy's; and the source record's correction table was missing
"the soul and D document". All three are recorded in the addendum to that record, along with
the fuller ASR correction table and a worked example of the speaker-attribution problem.

## [2026-07-27] setup | Graph view: the wiki as a map

Added an Obsidian-style force-directed graph of the whole notebook at `/graph` — notes,
hubs, tags and not-yet-written wikilink targets as nodes, wikilinks/`related`/tag
membership as edges; hover spotlights a neighborhood, click opens the page, tags and
unwritten targets toggle off. Every note page now ends with the same map reduced to its
one-hop neighborhood. No schema change and no new dependencies: the data was already
there (`links` on every doc), assembled in `lib/graph.ts` and drawn by a small built-in
force simulation on canvas (`components/graph/graph-view.tsx`). New nav tab and sitemap
entry; README section added; roadmap item closed.

## [2026-07-28] setup | Search: as-you-type BM25 in the header

Added the roadmap's search feature: an always-available box in the header (`/` or `⌘K`
to focus) that ranks every visible page as you type — no debounce, no fetch, results
with the first character. Matching is field-weighted BM25 (title ≫ tags > summary, so
title hits surface first) with prefix matching on the token being typed, implemented
dependency-free in `lib/search.ts` — same spirit as the graph's built-in force
simulation. The index is inlined by the layout from `searchDocs()` in `lib/content.ts`,
so the draft policy applies unchanged: drafts searchable in dev, absent in production.
README section added; roadmap item closed. No schema change, no content touched.
