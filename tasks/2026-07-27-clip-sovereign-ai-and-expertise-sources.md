---
title: Clip the three sources behind the skill-issue note
date: 2026-07-27
priority: medium
status: open
area: content
---

`content/notes/the-harness-is-a-skill-issue.mdx` cites three things that exist only as the
owner's recollection in the dictation. Nothing was clipped and nothing is archived, so the
note currently asserts them on his memory alone. Three wikilink targets are dangling as a
result.

## To clip

1. **Anton Leicht** — the piece arguing middle powers have not really tried sovereign AI,
   and that they should want access to the labs' internal coding and auto-science agents.
   No URL or publication date captured. This is the entry point for the whole note and the
   only genuinely new thread in it; it deserves its own page. Target slug:
   `sovereign-ai-for-middle-powers`.
2. ~~**Andrej Karpathy, "Auto Research"** and the "skill issue" podcast.~~ **Done, same
   day.** The owner dropped the NoPriors transcript mid-ingest; it is archived at
   `sources/2026-07/karpathy-nopriors-skill-issue/` and covered by `auto-research` and
   `skill-issue-karpathy-on-code-agents`. One thing left over: the transcript garbles the
   name of the repo he ran Auto Research against ("data chat" / "Namat"). The wiki reads it
   as nanochat by inference and says so — **worth confirming against the video**.
3. **"Agentic Coding and Persistent Returns to Expertise", 2026-06-16** — publisher not
   named in the dictation. It is a usage-data analysis concluding that domain
   understanding, not coding training, predicts who directs agents successfully.

## The one thing to verify first

The note carries a direct quote:

> Success is determined by how well a person understands the problem they're trying to
> solve, not whether they are trained in coding.

It is quoted from the dictation and has **not** been checked against the article. It is
also quoted a second time, in condensed form, in `loop-engineering`. If the wording turns
out to be off, fix both.

## Why it matters beyond tidiness

The sovereign-AI angle is the only part of this dictation that isn't already covered by
the harness cluster. Everything else restates
`harness-design-for-long-running-coding-agents` and
`harness-engineering-agent-first-repositories` from the owner's point of view. If the
Leicht piece gets its own note, the notebook gains a thread it doesn't have yet — who
gets access to this tooling, and what that implies — rather than a fourth angle on the
same two posts.
