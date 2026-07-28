---
title: Find the DoorDash NoPriors episode and verify what the transcript claims
date: 2026-07-28
priority: medium
status: open
area: content
---

The DoorDash interview ingested on 2026-07-28 arrived as a bare paste: no URL, no date, no
speaker names. It is archived at
`sources/2026-07/doordash-nopriors-agentic-commerce-and-dot/` and covered by
`doordash-on-agentic-commerce-and-dot`, `the-last-hundred-feet` and
`benchmarking-your-own-agent-spend`. Everything below is what those pages currently rest on
that a primary source would settle.

## The source itself

1. **Find the episode.** NoPriors, Andy Fang and Stanley Tang. Record the URL, the publication
   date and the host names in `SOURCE.md` (immutably — add an addendum, don't rewrite the
   record) and in the source note.
2. **The date matters more than usual here.** Three pages say "four months later" when
   comparing this to the March Karpathy episode, and that interval is inferred from internal
   references (a CLI launched "last week", Dashbench "a couple weeks ago", June spend in the
   past tense), not stated. If the real date moves, fix the interval in
   `the-customer-is-not-the-human`, `jaggedness-and-what-rl-optimises` and
   `model-speciation-and-touching-the-weights`.

## The four things worth checking against primary sources

- **Dashbench.** Described in one sentence and load-bearing for a whole page. If it is
  published, read it: where the tasks come from, how a harness is held fixed while the model
  varies, how scoring works, and whether the "models *and* harnesses" reading survives contact
  with the actual thing. `benchmarking-your-own-agent-spend` says explicitly that this is taken
  on trust.
- **The Metis acquisition.** Asserted in passing; the name may be a transcription artifact.
- **Also**, the Rivian-spinout micromobility company, and the DOT manufacturing partnership.
- **DOT's deployment claims.** "Fully autonomous L4" in Phoenix/Tempe, live about two years.
  Whether *any* outside numbers exist — disengagements, interventions, incidents, remote
  assistance — decides whether `the-last-hundred-feet` can say anything firmer than
  "self-reported".

## Two smaller garbles

Listed in `SOURCE.md` and worth settling at the same time: the original DoorDash site
("politely.com" in the transcript, read as *PaloAltoDelivery.com* by inference and deliberately
not named in the wiki), and the frontier model named as "fable" in the spend discussion, which
the wiki paraphrases as "frontier-level" rather than quoting.

## What is not blocked on this

The reasoning is separable from the numbers, and the pages are written that way — build toward
a use case, the distribution you cannot imagine from a desk, drop-off pins as the data that
actually localises a failure, the scrubbed-task-passes finding. None of that needs the episode
link. What needs it is anything quoted or any figure used as an effect size, and the pages
already say so.
