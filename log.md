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

## [2026-07-28] setup | Graph view: paper ground, titles inside the discs

Restyled `/graph` to match the rest of the site. The canvas sits on `--bg-app` instead of
white — the discs are now the only white on the map — and the full-page view dropped its
frame and padding so it reads as a room, not a panel. Every page's title is set *inside*
its node in Cormorant italic, which means the title decides the radius: each is wrapped at
whichever measure gives the tightest enclosing circle (with a six-em floor, or long titles
break into one-word lines), and springs and collision both rest at `r + r + gap`, so the
well-connected middle of the map opens up instead of knotting. Draft status moved from a
yellow fill to an amber halo on the rim, published pages to an ink hairline, hubs keep a
second ring; the legend swatches follow. Titles ease out below reading size and back in on
the way home. Zoom-to-fit now reserves its margins in screen pixels rather than graph
units, so the outer discs no longer hide under the floating toolbar and legend. README
section rewritten, including the one limit worth knowing: this link graph is near-complete,
so on a very wide screen the map stays a centered ball — shaping the springs, repulsion or
collision clearance to the viewport was measured and made it worse. No schema change, no
content touched.

## [2026-07-28] ingest | DoorDash on agentic commerce and DOT (NoPriors)

One item: a NoPriors transcript with DoorDash's co-founders, Andy Fang and Stanley Tang,
pasted into the inbox with no URL, no date and no speaker labels. Dated to July 2026 at the
earliest from its own internal references — a CLI launched "last week", Dashbench announced
"a couple weeks ago", June's model spend in the past tense. Archived to
`sources/2026-07/doordash-nopriors-agentic-commerce-and-dot/`, whose `SOURCE.md` carries the
transcription corrections, the attribution reasoning (who says what is read off the hosts'
questions), and every number as stated so the wiki's discount of them stays checkable.

It is the first source in the notebook from a company that *buys* this tooling at scale and
deploys autonomy in the physical world, rather than a lab describing its own harness. That is
what it adds.

New: `doordash-on-agentic-commerce-and-dot` — the source note. Ask DoorDash and its two
numbers (half of restaurant trajectories ending at a never-before-ordered merchant, ~40%
larger grocery baskets), voice as the modality that didn't land, the CLI as an agent-first
storefront, and a "how to read this" section that discounts every figure for missing
denominators.

New: `benchmarking-your-own-agent-spend` — model spend ~20× from January to June and now
deliberately flatlined; Dashbench scoring **models and harnesses together** to answer what the
spend bought; open weights for the cheap tasks. And the finding underneath: a team says "yeah,
it works okay", the lab scrubs the data and builds an RL environment and the models crush it,
and the same thing on real enterprise data does not hold — which is both an instance of
jaggedness and an indictment of the benchmark that found it.

New: `the-last-hundred-feet` — the argument for building toward a use case rather than shipping
a capability and hunting for a problem, the sidewalk-robot-versus-robotaxi arithmetic that
produced DOT's form factor, the edge cases nobody writes down at a desk (leaves under two
wheels, regen braking overpowering the battery, a Jenkins boot script × 500 robots), and the
one data claim in the interview that is actually load-bearing: DoorDash knows where the human
Dashers *actually* dropped the package, which Google Maps does not. Also the reversal worth
keeping — autonomy is no longer the binding constraint; operations and hardware are.

Also updated: `the-customer-is-not-the-human` gained the vendor side of Karpathy's argument,
and the "somebody has to pay for the API" objection is now narrowed rather than left standing —
the argument holds where the app was never the business model, which is why a marketplace ships
a CLI unprompted and a treadmill company does not. Two new caveats there: a first-party agent
surface is not the endpoints he asked for, and nobody has discussed the payment credential.
`jaggedness-and-what-rl-optimises` gained the same ridge seen from a buyer's chair.
`model-speciation-and-touching-the-weights` gained a buyer routing cheap work to open weights,
plus the lab-partners-with-a-business arrangement he predicted, still not touching any weights.
`the-claw-layer` gained the pantry camera that buys rather than reports.
`self-improving-agents-from-production-feedback` gained the answer from the far end of scale to
its own closing question — when corrections aren't a free by-product, you pay a fleet for them.
`agentic-engineering` gained a section on the cluster's first buyer-side source.

The provenance caveat is unusually thick on this one and lives in `SOURCE.md` plus
`tasks/2026-07-28-verify-doordash-nopriors-source.md`: find the episode, and check Dashbench,
the Also partnership and the Metis acquisition before anything here is quoted elsewhere. The
reasoning survives without them; the numbers do not.

Inbox empty.

## [2026-07-28] setup | Graph view: clicking a node no longer jostles the map

Selecting a node on `/graph` used to reheat the force simulation. Pointer-down warmed it so
a drag's neighbours could follow, but a plain click took the same path, and the whole layout
then drifted for several seconds settling again — distracting, and it moved the very node
you had just clicked to read. The reheat now waits for the pointer to actually travel past
the click threshold, so a click only changes what's lit and the map holds perfectly still;
drag behaves as before. One file, `components/graph/graph-view.tsx`. No schema change, no
content touched.

## [2026-07-28] setup | Published every draft note

Owner call: all 23 remaining drafts in `/content/notes` flipped to `status: published`.
The wiki now has no draft pages — 25 notes, all live. No prose touched, no frontmatter
beyond the one field, no schema change. `npm run build` clean; every note is now a
prerendered page and appears in the graph, tag pages and sitemap without the draft halo.

## [2026-07-28] setup | Graph view: a composed opening, and room between the discs

`/graph` built itself chaotically and then sat there as a knot. Four separate causes for the
first: nodes were seeded on a phyllotaxis spiral in data order, so linked pages started on
opposite sides and the springs hauled them across each other; the auto-framing camera solved
the fit fresh every frame, rescaling the whole map under the reader; the violent first second
of the settle was on screen; and the webfonts landing afterwards resized every disc a second
time. Nodes are now seeded on a radial tidy tree of the graph's own breadth-first structure,
the camera eases toward the fit, a cold layout is stepped silently until it has calmed
(~72 ticks, 3ms) before the first paint, and that paint waits for Cormorant on a 700ms leash
so the map is measured once. A per-tick speed ceiling stops a repulsion spike from flinging
anything across the map.

The knot was the centering: it pulled every node toward the middle in proportion to its
distance, which is a spring to a point, so whatever the links were saying about structure got
squeezed back into a ball. Nothing pulls on the middle now — containment is a soft wall out at
the radius the discs could possibly need, and centering is a rigid translation of the centroid,
which shapes nothing. Shape comes from two things instead: springs crossing between clusters
rest longer and pull less than springs inside one (by neighbourhood overlap), and the whole
outline is leaned toward the panel's proportions by an area-preserving stretch. On a 1400×705
panel that is 24px of clear paper between neighbouring discs where they used to overlap, and
the titles came out slightly *larger* rather than smaller — a map shaped like its panel fits
better, so the extra room paid for itself. One file,
`components/graph/graph-view.tsx`. No schema change, no content touched.

## [2026-07-28] setup | Graph edges now carry a similarity weight

Every edge on the map used to pull equally hard: stiffness came from node degree alone, so
a link between two pages about the same thing was indistinguishable from a link between two
unrelated ones. Each page-to-page edge now carries a weight from how similar the two pages
read, and stiffness is scaled by it, so the map clusters by subject as well as by who links
whom.

The measure is plain tf-idf cosine over the prose — no embeddings, no API key, no model
download, no cached artifact to invalidate. Because it is a pure function of the content,
the layout is still identical on every load and every build. It reads body text, not titles
and summaries: at ~1,300 words a note that is where the signal is, and the thin version
would mostly have restated tag overlap. Bare `[[wikilink]]` targets are excluded on purpose
— counting them would let an edge's weight partly restate that same edge.

Edges are ranked against each other rather than scored absolutely (every note here is about
roughly one subject, so raw cosines bunch into a band whose midpoint means nothing), then
mapped to ±30% around neutral. Ranking makes the mean weight exactly 1, so nothing tightens
or loosens on average; the ±30% ceiling is the layout-inflation budget from the graph's
existing tuning notes, since a weakened spring rests further out and inflation is paid for
in the zoom the titles are read at. Mean weight comes out at exactly 1.0000 and the mean of
1/weight at 1.033 — the ~3% inflation the spread was chosen for.

110 of 196 edges are weighted. Tag edges, edges to unwritten pages, and any pair with no
prose to compare stay at exactly 1. Top-ranked pairs check out by eye ("Building a
generator–evaluator harness" with "Generator–evaluator loops"; "The LLM-wiki pattern" with
"How this notebook works"), as do the bottom ones.

This lands on top of the composed-opening work above, which had already started
differentiating springs — by neighbourhood overlap, i.e. whether two pages keep the same
company in the link graph. The two are kept as separate terms because they answer different
questions: overlap is topology and is recomputed per render (it depends on which nodes are on
screen), while this is about subject matter and is fixed at build. Two pages can be linked,
share no neighbours, and still read alike — that spring now stretches for the seam but keeps
some of its pull. Overlap keeps both levers it had (rest length and stiffness); similarity
only scales stiffness, and rest length is deliberately left to overlap alone so the two can
be told apart when reading the map.

New `lib/similarity.ts`; one derived schema field (`terms`) in `velite.config.ts`; the
weighting pass and a `weight` field in `lib/graph.ts`; the stiffness term in
`graph-view.tsx`. This adds the first derived field the graph depends on beyond
`links`/`tags`/`related`, so the README's graph section was corrected — it previously
promised "no new schema fields". `fold` is now exported from `lib/search.ts` and shared. No
content touched, no dependency added.

`npm run build` clean.

## [2026-07-29] ingest | Dictation — command over tokens

One item, the owner's own writing: a dictation about token limits not being the real
constraint, dropped in `inbox/mine/` after being corrected and restructured on his
instruction. New note `content/notes/command-over-tokens.mdx` (`origin: mixed`,
`status: draft`) — his introduction in edited wording, plus a second half drafted to his
brief: why an idle allowance is a diagnosis rather than a saving, four decisions that make up
a harness (what the agent can see, what "done" means, what is enforced mechanically, what
starts the next turn), and the two habits that get you there. No new sources; the added
section draws only on material already archived here. No existing page edited.

One thing withheld on purpose: the dictation referred to an incident as evidence that the
labs run more than they publish, and it could not be resolved to a checkable event, so the
sentence stops short of naming one — `tasks/2026-07-29-name-the-lab-leak-incident.md`.
Archived under `sources/2026-07/command-over-tokens/`.

## [2026-07-30] ingest | How we learned to trust our AI code reviewer at DoorDash

One item, captured external material: the DoorDash engineering post (6 July 2026) describing
DashBench, the measurement layer behind their production code review agent. Archived under
`sources/2026-07/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/` — the clip is
complete including the appendix tables; the five figures are remote URLs and were not
downloaded, since everything they show is also tabulated.

New note `content/notes/dashbench-measuring-a-code-review-agent.mdx` (`origin: agent`,
`status: draft`): why acceptance rate can only ever populate two cells of a confusion matrix,
labels triangulated across three disagreeing sources with human adjudication feeding judge
calibration, the scout/reviewer split as a clean evaluation surface, the model-mix and
severity tables, and four limits — recall measured against the union of what the pool found,
the judge calibrated on the same case set it grades, no error bars under a "variance is a
feature" lesson, and no accounting of what building it cost.

It closes a gap this notebook had recorded explicitly. `benchmarking-your-own-agent-spend`
said "Dashbench is named, not described"; it now is, and the description corrects one thing —
DashBench measures a **code reviewer** on replayed PRs, not coding tasks in general. That
correction was carried to `doordash-on-agentic-commerce-and-dot` as well.
`generator-evaluator-loops` gained the first partial answer to its recurring *what checks the
check?* question (refuse to have a single ground truth; pay for adjudication) plus a new
limit: one run understates coverage, because the whole measurement stack is stochastic.
Smaller cross-references added to `agentic-engineering` and
`self-improving-agents-from-production-feedback`, where the *was accepted* vs *was real*
distinction matches the tax-agent post's classes of practitioner correction.

`npm run build` clean.

## [2026-08-09] ingest | The Tim Ferriss Show #878 — writers on the craft

One item, captured external material: the published transcript of a Tim Ferriss compilation
episode (7 August 2026) in which Elizabeth Gilbert, Anne Lamott, Joyce Carol Oates, Jerry
Seinfeld, Mary Karr, Brandon Sanderson and Seth Godin answer the same four questions about
writing practice — choosing a project and staying with it, beginning without inspiration,
building a practice that produces pages, and continuing when the pages are bad. Archived under
`sources/2026-08/tim-ferriss-878-writing-craft-compilation/`, complete including the rights
notice; no images. First source in the notebook outside the agentic-engineering cluster, and
the first test of the README's claim that this is open in topic.

New note `content/notes/writers-on-starting-finishing-and-bad-drafts.mdx` (`origin: agent`,
`status: draft`): the four questions as the spine, then two sections the episode itself does
not provide. **Where they disagree** — Sanderson's gardener/architect split (King says never
outline, Card says an outline is vital) plus three more contradictions the edit passes over:
Seinfeld's bounded hour against Asimov's six, Sanderson's daily word count against Karr taking
five or six years and discarding 1,200 finished pages, and Gilbert's rule never to abandon a
project against Karr's turning point being an abandonment. **What a compilation can't tell
you** — seven writers selected on the outcome describing the practice that preceded it, which
Sanderson is the only one to name, about himself.

New note `content/notes/separating-drafting-from-judging.mdx` (`origin: agent`,
`status: draft`): the one idea that reaches the rest of the notebook. Five of the seven
independently separate producing from judging — Lamott reassigning the inner critic to a job
it is fetched for, Godin's bad writing and Asimov's end-of-shift review, Oates on mood as an
output rather than a precondition, Karr's revision budget, Sanderson's longhand trick — which
is the same split as `generator-evaluator-loops`, arrived at from a field with no connection to
it. Three correspondences hold (judgement at a decided boundary; done defined before the work;
the judge needs its own access to the artifact) and three break, which is the substance of the
page: the failure modes are **inverted** (an LLM praises its own output, a person savages their
own draft), the writers separate in time rather than identity, and neither side has a ground
truth though only one admits it. It ends by refusing the obvious over-reading — most of the
episode does not transfer, and treating every source as a harness metaphor is a way of learning
nothing from it.

One existing page edited: `generator-evaluator-loops.mdx` gains a paragraph recording the
fourth independent arrival at the split, the inversion, and the cheap experiment it implies —
one model, two passes, an enforced boundary, no second agent — which nothing in this cluster
has tested. Nothing else was touched; the connections to `keeping-an-agent-running`,
`command-over-tokens` and `jaggedness-and-what-rl-optimises` are made as outbound links from
the new notes, so they surface as backlinks without editing pages the material doesn't really
change.

Both new notes are drafts, so the published `generator-evaluator-loops` now links to one —
one inert link in production, and the same decision as the DashBench note in July, plus a
larger editorial one: publishing these makes the "not about a single topic" claim true in
public for the first time. `tasks/2026-08-09-publish-writing-craft-notes.md`.

The source's own limitation is recorded in its `SOURCE.md` and constrains everything above:
the compilation carries no dates or episode numbers for its constituent interviews, so nothing
in it can be dated or sequenced. Three claims it makes were left unverified and kept out of the
wiki, including Godin's aside about the origin of "Just do it". `npm run build` clean.

## [2026-08-10] setup | Published the two writing-craft notes

Owner call on `tasks/2026-08-09-publish-writing-craft-notes.md`: both notes from yesterday's
Tim Ferriss ingest flipped to `status: published` —
`writers-on-starting-finishing-and-bad-drafts` and `separating-drafting-from-judging`. One
field each, no prose touched, `updated` left alone (same convention as the 2026-07-28 bulk
publish).

The consequence worth recording is editorial rather than mechanical. Until now every published
page in this notebook was agentic engineering, so the README's "not about any single topic" and
the home page's "topics emerge from what accumulates" were true of the repository but not of
the public site. They are now true of both. The `generator-evaluator-loops` link into
`separating-drafting-from-judging` resolves instead of rendering as an inert span, so no page
is left pointing at nothing.

The wiki is 29 notes, 27 of them published. One new tag page goes live, `writing-craft` (17
tags now), and `evaluation` gains its first entry that isn't about agents. Task closed with the
reasoning kept as the precedent for the next source from an unfamiliar subject; a dated
addendum on the source record notes that its "both notes are drafts" line no longer holds.
`npm run build` clean, 54 prerendered pages, no new wikilink warnings.

One thing this publish creates, in the same shape as the problem it solved: the now-published
`separating-drafting-from-judging` cites `dashbench-measuring-a-code-review-agent`, which is
still a draft, so that link renders inert in production. The sentence stands without it — it
states the answer (refuse a single ground truth, pay for adjudication) before it points
anywhere — but it is a sixth caller for a note that was already recommended for publishing, and
it has been added to `tasks/2026-07-30-publish-dashbench-note.md`. The other remaining draft is
`command-over-tokens`, whose publish decision has always been the owner's.

## [2026-08-10] ingest | Model Training as Code (Aleph Alpha)

One item: a PDF-to-markdown capture of Aleph Alpha Research's *Model Training as Code* by
Michael Barlow (22 May 2026), with seven extracted images. It arrived in `inbox/mine/`, which
would mark it as the owner's own writing — it is a named external author's article with a
copyright line, so the folder hint was **overridden** and it was processed as captured
external material. Filing it `origin: human` would have put Barlow's article under Wolfgang's
byline, the one violation the README calls unforgivable. Recorded in the source record and in
`tasks/2026-08-10-inbox-mine-misfiled-item.md`, which proposes the general rule: evidence
inside the item beats the folder, and the override may only ever run *away* from
`origin: human`, never toward it.

New note `content/notes/model-training-as-code.mdx` (`origin: agent`, `status: draft`). The
substance: a lab put its entire training pipeline — pre-training, SFT, RL, evaluation — into
imperative code, with GitHub CI as the entry point, hermetic one-click runs, immutable
versioned artefacts and a lineage graph from checkpoint back to recipe. Their diagnosis of the
manual alternative is this cluster's own claim with humans in the place of the agent: the
pipeline lived in the team's heads rather than in a durable artefact. Two gates worth keeping:
a downscaled end-to-end training run on every PR in under five minutes, and a nightly larger
run that asserts a measurable improvement on the eval suite. The payoff they report most
concretely is that a large pre-training run could be stopped and resumed by whoever was on
hand, because there was no setup to reconstruct — consensus in version control converting a
person into a role. Pushback recorded: not one before/after number in the whole post, the
manual-lab before-picture is the author's own unattributed composite, and the nightly gate is
a metric the same organisation maintains.

Six published pages edited, which is what made this item worth its length — it is the first
source here where the harness exists to train a model rather than to write software, so it
lands on the cluster from an angle none of the others share. `agentic-engineering` gains a
section and an answer to its "where do these agents run" open question (a workflow engine on
Kubernetes, triggered from CI — not agent-specific, which is the point). `auto-research` gains
the substrate the loop assumes, and the correction that follows: the gap is not only
coordination, it is also plumbing, and Aleph Alpha name auto-research as their reason for
building it. `harness-engineering-agent-first-repositories` gains the strongest available
evidence that "what the agent can't see doesn't exist" is a general claim — two teams reaching
identical conventions from context budget and from organisational memory.
`model-speciation-and-touching-the-weights` gains a partial counter-example (capability teams
owning a model behaviour end-to-end are speciation arriving organisationally) and a narrowing
of the missing-primitives claim (a factory for touching weights exists; it makes the process
repeatable, not the outcome predictable). `linting-as-agent-guardrail` gains the two CI gates
as the version of this idea where the artifact is a model. `loop-engineering` gains a partial
answer to "what reviews the loop?" — keep it in version control and it reviews like code,
which covers the loop breaking and not the loop being wrong.

Three of the seven images were copied to `public/images/model-training-as-code/` and are
referenced as figures with attribution: the pipeline diagram, the sweep DAG, and the office
leaderboard photo. The other four are branding and were left in the archive. This is the first
time anything sits under `public/images/`, and the images are Aleph Alpha's — so publishing the
note would set a precedent rather than follow one. That decision, and the six inert wikilinks
the draft currently leaves in production, are in
`tasks/2026-08-10-publish-model-training-as-code.md` with three options ranked.

The capture has two defects that constrain what could be taken from it, both recorded in
`SOURCE.md`: PDF conversion dropped inter-word spaces in ~30 places (`ratherthan`, `forthree`),
repaired silently in anything quoted; and both code listings are truncated at the right margin,
so the note describes what the code does instead of reproducing it. `npm run build` clean.

## [2026-08-10] setup | Published the Model Training as Code note

Owner call on `tasks/2026-08-10-publish-model-training-as-code.md`, taken the same day the
note was ingested: publish. One field changed on
`content/notes/model-training-as-code.mdx`, no prose touched, `updated` left alone — it was
already today's date (same convention as the two publishes before this one).

The mechanical consequence is the largest this notebook has had from a single publish. Six
published pages were pointing at a draft, so six wikilinks were rendering as inert spans in
production — `agentic-engineering` twice, `auto-research`,
`harness-engineering-agent-first-repositories`, `model-speciation-and-touching-the-weights`,
`linting-as-agent-guardrail` and `loop-engineering`. All of them now resolve, and the new page
carries all six as backlinks. No new tag page: all four of its tags already had one, and
`fine-tuning` gains its first entry that is about infrastructure rather than about a technique.
The wiki is 30 notes, 28 published; the two remaining drafts are unchanged
(`dashbench-measuring-a-code-review-agent`, `command-over-tokens`).

The decision worth recording is the second one in that task, which the publish settled
implicitly: **this is the first third-party imagery on mantua.io.** Nothing sat under
`public/images/` before today. Three of Aleph Alpha's figures are now on a public page — the
pipeline diagram, the sweep DAG, the office leaderboard — each attributed in its `figcaption`,
with the wordmark, hero image and product tile deliberately left in the archive. The terms
that went with it are the precedent for the next source that arrives with images: substantive
figures only, attribution on each, branding never. Redrawing the pipeline diagram as an SVG
figure component (the repo has three already) remains worth doing on its own merits and is no
longer a way of avoiding the question.

Both tasks from this morning's ingest are now closed or answered. `npm run build` clean, 55
prerendered pages, no new wikilink warnings.

## [2026-08-13] ingest | Ryan Greenblatt on recursive self-improvement (Dwarkesh Podcast)

One item, dropped and processed the same day at the owner's request, with `status: published` on the
inbox item because he asked for the result published: the site transcript of a 2h12m Dwarkesh
Podcast interview with Ryan Greenblatt, chief scientist at Redwood Research, on whether human-level
AI research automates itself. Archived under
`sources/2026-08/dwarkesh-greenblatt-recursive-self-improvement/`.

**The capture decision worth recording.** The page renders its transcript twice, and neither copy is
complete: the player widget copies with speaker labels and with every space stripped out of the
words, the reading transcript below it has the spaces and no speaker labels at all. The words are
identical and the timestamped copy is finer-grained, so the archive carries that one verbatim plus a
speaker map — every speaker change with its timestamp — which is the only thing the de-spaced copy
carried that it doesn't. That is the single transformation applied, it is declared at the top of the
archived file and in `SOURCE.md`, and it is lossless for both content and attribution. It mattered
more than usual here: several of the sharpest lines in this interview are Dwarkesh's objections
rather than Greenblatt's claims — the two attractor states of punishing a caught cheat, the
falsifiability challenge, the "I'm not joining the global communist uprising" objection, the dual-use
argument for broad access — and attributing any of them to Greenblatt would misrepresent the source.
Every attribution on the new pages was checked against the map.

**The substance.** Dwarkesh splits the thesis into three claims and evaluates them one at a time: AI
R&D is verifiable enough to containerise; automating it buys four or five years of progress in one;
what comes out can be dropped into any job. Greenblatt's medians are ~2030–31 for full automation of
AI R&D, ~2033 for beating all humans on the job, and 35–40% for something we would call takeover by
2040 — with the misalignment situation getting "really, really crazy" more like three years out. Two
of his answers cut against how this notebook has been framing things. The least verifiable part of AI
research is not insight or theory but **making calls on large experiments**, where you get few tries;
and what he expects models to lack is taste about in-the-weeds experiments rather than deep ideas,
because he thinks ML is a *shallower* domain than mathematics.

Five new notes, all published. `recursive-self-improvement-greenblatt` is the source note — the
argument, the numbers, the transfer question, the two agent-misbehaviour incidents narrated in the
interview, and why correlated model lineages answer the coordination objection without requiring a
conspiracy. `containerising-ai-research` has the concrete environments and the three scales they run
at, plus the data-versus-algorithms dispute and the two experiments both men propose to settle it.
`training-against-your-own-monitor` is the mechanism page and the one that most changes how to read
the rest of the wiki. `learning-from-deployment` is production traffic becoming training data.
`aligned-to-whom` is the notebook's first page about policy rather than engineering.

**Eleven published pages edited**, and the reason this item was worth its length is that the
vocabulary carries over intact — verifiability deciding what can be automated, the evaluator as the
load-bearing component, "what reviews the loop?" as the unanswered question — so it lands on pages
that already exist rather than sitting beside them.

The most important edit is a **contradiction**, the first direct one between two sources in this
notebook. `jaggedness-and-what-rl-optimises` records Karpathy's claim that capability advances only
where a reward can be computed, with a frozen four-year-old joke as the demonstration. Greenblatt is
asked essentially the same question and answers the opposite way: transfer to hard-to-verify domains
looks fine in practice, and he cannot name a domain where GPT-4 to now has not improved a lot. Both
describe the same models, so the disagreement is about what counts as evidence — Karpathy's
instrument is a ceiling, Greenblatt's is a slope — and it is recorded as a disagreement with the crux
named rather than smoothed into a synthesis. Worth noting that his optimistic case rests on the
absence of a counter-example, which is the same kind of evidence as the "no published failures"
absence this cluster keeps flagging in the lab write-ups.

The rest, briefly. `auto-research` gains the industrial-scale version of its own loop, and a better
explanation of why the nanochat demonstration worked: not only that a training loss is a clean
metric, but that the runs were cheap enough to do thousands of them — so "can you evaluate it" and
"can you afford to evaluate it repeatedly" are two conditions this cluster had been treating as one.
Its metric-overfitting caveat is promoted from caveat to mechanism. `generator-evaluator-loops` gains
the furthest extension of its own *what checks the check?* thread — a judge whose verdict is
downstream of its training reports the distribution of that training while looking like an
independent measurement, and filtering the training data when you dislike the verdict is how an
operator trains bad epistemics on purpose. It also gains the limit that one AI monitoring another
works until the work gets hard to understand, and the observation that correlated lineages weaken the
cross-model-evaluator fix three sources have now proposed. `linting-as-agent-guardrail` gains a
distinction it was missing: enforcing a rule and *selecting against* it are different acts, and the
pass rate rises either way. `self-improving-agents-from-production-feedback` gains the same loop with
the model as the artefact, and the observation that the substitution drops the expensive step that
made it trustworthy — practitioners separating a real bug from noise. `model-speciation-and-touching-
the-weights` gains the depressed-models anecdote and its ablation, which is the sharpest available
instance of an intervention on data whose effect was neither predictable nor removable by inspection.
`benchmarking-your-own-agent-spend` gains an answer to Fang's standing open question from someone
with no stake in it. `model-training-as-code` gains the curriculum to go with the factory.
`loop-engineering` and `agentic-engineering` gain the cluster boundary and what is on the other side.

**One task advanced without being closed.** `tasks/2026-07-29-name-the-lab-leak-incident.md` was
opened because the owner's dictation referred to something like "the hacking face incident" that
could not be resolved. This interview names an OpenAI/Hugging Face incident repeatedly and says
Greenblatt is co-leading the investigation into it, which is almost certainly the referent. The task
now carries an addendum saying so — and saying why the owner's prose in `command-over-tokens` was
still left untouched: the bar for a named incident in his own writing is a citation, and a damaged
transcript that renders the name three ways (including "Hugging Quiz") is a strong lead, not a
source. The addendum also lists the two other incidents the interview describes in enough detail to
look up, either of which would serve that sentence.

Four new tags, which is the most this notebook has added at once and reflects that this is a third
subject area rather than a new angle on the first: `ai-safety`, `recursive-self-improvement`,
`reward-hacking`, `ai-policy`. `npm run build` clean.

The capture's defects are in `SOURCE.md` and constrain what could be taken from it. Five passages
collapse into a repeated phrase where the reasoning should be — including, awkwardly, Dwarkesh's
reframing of the entire failure story at 1:36, which survives only because Greenblatt's reply
restates it. Numbers contradict themselves inside single answers (GPT-3 dated twice, two different
model-card versions one sentence apart, token prices that must be per million). And the frontier
model names in the transcript — *Mythos*, *Fable*, *Sol* — resolve to nothing checkable, so nothing
on any page depends on the mapping.

## [2026-08-14] ingest | Sutskever's List, ch. 1–2 (Heimann, Manning 2026)

`inbox/mine/Sutskevers List Ch 1 2.md` — a PDF-to-markdown capture of the front matter and first two
chapters of Richard Heimann's *Sutskever's List*, plus twelve extracted figures. The owner is two
chapters in and asked for this round to cover what he has read, and **asked that the book not be
moved to `sources/`** — so this item stays in the inbox until the reading is finished, which is the
first deliberate exception to "ingest empties the inbox". The consequences, and what the next session
should do if it sees the same file again, are in `tasks/2026-08-14-sutskevers-list-stays-in-inbox.md`.

**Provenance overridden, second time.** The item was in `inbox/mine/`, which means `origin: human`
and the owner's byline. It is a published book by a named author with a copyright notice, so the
2026-08-10 rule applied again — evidence inside the item beats the folder, in the direction away from
his byline only — and the material is summarised rather than republished. Which leaves a gap worth
naming: the other two Manning books here have `origin: human` reading notes in his own words, and
this one has an agent summary instead. If he wanted the former, the notes didn't make it into the
inbox. The task file asks.

**Four new pages, all drafts.** `sutskevers-list-notes` is the running summary and carries the book's
own thesis — the four-part reading of Sutskever's worldview, and the list's omissions (no symbolic
AI, no classical planning, and no reinforcement learning, which is the odd one). The other three are
concept pages that stand without the book:

`too-dangerous-to-release` — GPT-2's withholding in February 2019, the staged release, and the
November admission that no misuse had been seen. The part worth keeping is structural rather than
historical: the stated defence was about a broader class of future systems, which cannot justify
withholding *this* model, so the action and its reason came apart — and the premise underneath it,
that acting too late is worse than acting early, licenses action on grounds that cannot generate the
evidence for stopping. Nine months of waiting bought no information. The 2018 charter revision is the
detail that reframes the episode: it was an institutional pivot already committed to, not a reaction
to a capability surprise.

`data-versus-architecture` — the strongest pre-2012 case against neural networks, which was that the
data deserved the credit, and Efros's control experiment for it (hold the data fixed, run nearest
neighbours, watch the network's advantage disappear). AlexNet settled it on data everyone already
had, and the settlement is narrower than either slogan: data was underrated *and* is not an
equaliser, because scaling behaviour is a property of the method. The reason the page is in this
notebook is the modern version of the argument, which is running now without the control —
DoorDash's "harness gap or model gap?" is a which-component question with no baseline, and neither
the harness write-ups nor the RL-transfer optimism reports one.

`optimising-for-the-benchmark` — dataset-bound progress in 2000s vision: DPM sculpted around
PASCAL's quirks, Efros and Torralba's 2011 diagnosis, ImageNet nearly a monument to scale, and the
benchmark spent by 2017. Two findings. **Hard negative mining is `training-against-your-own-monitor`
with a human running the loop**, which is now the oldest worked example behind that page and the
strongest, because no intent, situational awareness or deception is involved — an optimiser and a
partial detector suffice. And a benchmark is in one of three states — too hard, fitted, or spent —
and nobody asks which about their own.

**Six published pages edited.** `training-against-your-own-monitor` gains the hard-negative-mining
precedent, plus the one hopeful disanalogy: that failure was fixed by making the representation
learnable, not by better negatives, and there is no obvious equivalent move here.
`agentic-engineering` gains the AlexNet assembly claim — the cluster's own thesis about software,
made about model training in 2012 — and, less comfortably, the observation that its central
which-component claim has the same missing baseline as the 2009 argument.
`benchmarking-your-own-agent-spend` gains the reading that Fang's either/or is that argument in
modern clothes. `jaggedness-and-what-rl-optimises` gains the 2011 precedent for its closing worry,
and a reason not to read the ridge as permanent: it moved, and what moved it was a harder measure
rather than a better model. `aligned-to-whom` gains where the current arrangement came from.
`dashbench-measuring-a-code-review-agent` gains the history its methodology is answering.

Two new tags: `deep-learning-history`, `scaling`. First historical material in the notebook.

**No images copied.** Six figures carry argument in chapter 2, several reproduced in the book by
permission of their original authors to Manning — a permission that does not extend to this site.
They are described in prose; the task file records what it would take to use one.

**The capture itself was not committed.** It stays in `inbox/mine/` as working material and is left
untracked: it is 140 KB of a commercial book's text plus twelve figures licensed to its publisher, and
nothing in the repo needs it once the notes exist. So the file is on the owner's disk, not in git
history — which also means the eventual `sources/` archive for this book is a decision to make
deliberately rather than a step to perform.

`npm run build` clean.

## [2026-08-14] setup | Published the four Sutskever's List pages

At the owner's instruction, same day as the ingest: `sutskevers-list-notes`,
`too-dangerous-to-release`, `data-versus-architecture` and `optimising-for-the-benchmark` all move
from `draft` to `published`. Nothing else changed — no prose edits, no frontmatter beyond `status`.

What that does to the production build, since it is the point of publishing rather than a side
effect: the six pages edited during the ingest carry wikilinks into all four, and until now those
rendered as inert "missing" spans in production. They resolve now, which means
`training-against-your-own-monitor` has its hard-negative-mining precedent visible on the public
site, and `agentic-engineering`'s admission about the missing no-harness baseline points somewhere.

The notebook gains its first historical material in public and its first two pages tagged
`deep-learning-history` and `scaling`. `sutskevers-list-notes` is a *running* page — the book is two
chapters read out of nine and stays in `inbox/mine/` — so a published page here will be extended by
later ingests rather than finished, which is a first for this notebook. Item 2 of
`tasks/2026-08-14-sutskevers-list-stays-in-inbox.md` is closed; the other two (the owner's own
reading notes, and the figures) stay open.

`npm run build` clean.

## [2026-08-17] ingest | Inference engineering (Latent Space × Baseten, 2026-08-03)

A two-hour Latent Space episode with Philip Kiely and Ali Taha of Baseten, dropped as a single
unlabelled ASR transcript with no file extension. Third item in a row to arrive in `inbox/mine/`
and turn out to be somebody else's work, so the 2026-08-10 rule applied again — evidence inside the
item beats the folder, in the away-from-`origin: human` direction only. Summarised, not
republished. Archived at `sources/2026-08/latent-space-inference-engineering-baseten/`.

This is the notebook's first source about **the layer between a released checkpoint and a served
endpoint**. Everything here so far has treated inference as a thing you buy or a thing you run, and
tokens-per-second as a property of the model. It is a property of what somebody did to the model
afterwards: 2–4× on identical hardware between a careless deployment and a careful one, which is
wider than the gap between adjacent model generations. First source from an infrastructure vendor,
and the first covering modalities other than text.

Three new pages, all drafts. `inference-engineering-baseten` is the source note — the request path,
the four optimisations and what each is worth, the claim that quantising *more* of a model can make
it better (errors cancel, and they measure it by KL divergence against the full-precision logits
rather than by benchmark), the mode-collapse bug that turned out to be a kernel race exposed by a
slow interconnect, and composing models out of frozen parts.
`diffusion-versus-autoregressive-generation` takes the video and audio half: 35,000 tokens for five
seconds of 480p, quadratic attention, and why the open/closed gap that has nearly closed for text is
night-and-day for video with a feedback loop keeping it there.
`training-and-inference-are-merging` takes the closing stretch, and it is the one that matters here.

Six existing pages edited, and two of the edits are corrections rather than additions.
`model-speciation-and-touching-the-weights` gains composition at the serving layer — a frozen Kimi
encoder, a frozen GLM backbone, a trained projector between them — as a third option that Karpathy's
context-window-versus-weights dichotomy has no slot for; and the correction that his six-to-eight
month open/closed gap was a claim about text, recorded here as a claim about the field.
`dashbench-measuring-a-code-review-agent` gains what "run it more than once" is actually averaging
over, which is model, quantisation, engine, kernel version and cluster at once. `auto-research`,
`recursive-self-improvement-greenblatt`, `learning-from-deployment` and
`benchmarking-your-own-agent-spend` gain the rest.

**The one worth flagging.** Baseten report plugging a GLM-5.2 endpoint into their Claude Code
harness and running it in a loop: forward pass, profiling trace, find the bottleneck kernels in
SGLang, write replacements, profile again — with some of the kernels the model then runs on having
been written by it. That crosses the boundary this notebook drew on 2026-08-13, where the recursion
stopped at Karpathy's overnight nanochat run. Modestly: it is one anecdote, the obvious confounder
is uncontrolled (best coding model available, or uniquely good at optimising itself — nobody ran the
experiment), and the reason it works at all is that a profiling trace is a mechanical metric with no
judge in the loop. But it is the first instance here of the loop closing outside a lab and outside a
demo, on somebody's ordinary Tuesday.

**No pages with `origin: human` or `origin: mixed` were edited**, per the 2026-08-14 precedent.
`serving-slms-on-a-desktop-gpu` is the page this source bears on most — the local-versus-datacenter
framing ("fit it and make it less dumb" versus "load it and make it less slow"), TurboQuant being
valuable on a Mac and harmful on a B200, active-versus-total parameters at batch size one — and all
of it is recorded on the new pages with links back rather than written into his note.

**No images copied**: the item arrived as one text file. Several passages describe diagrams shown on
camera; none are in the capture and none were reconstructed.

The capture is badly damaged and the source record lists it in full. Two things constrain what could
be taken: there are **no speaker labels**, so the Kiely/Taha split was reconstructed from content and
is declared as inference on the page, with several exchanges left unattributed; and the quantisation
research — the most surprising claim in the source — rests on a paper that is not in the capture.

`tasks/2026-08-17-third-misfile-into-inbox-mine.md` records the pattern: three for three, nothing
correctly filed in `inbox/mine/` in the period these logs cover, which is a fact about the contract
rather than three accidents.

`npm run build` clean.
