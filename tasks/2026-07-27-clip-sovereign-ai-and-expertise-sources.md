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

**Update 2026-07-27: item 2 is done, two remain.** The Karpathy transcript came in and was
ingested. One thing it changed about the rest of this task: his account, read in full,
turned out to be *more* qualified than the recollection of it — he says the single Auto
Research loop worked, and he says he cannot tell whether the remaining roughness is the
models or the operator. Worth keeping in mind for the other two: the note's summaries of
them are also unverified recollections, and the one that has now been checked needed
correcting.

## To clip

1. **Anton Leicht** — the piece arguing middle powers have not really tried sovereign AI,
   and that they should want access to the labs' internal coding and auto-science agents.
   No URL or publication date captured. This is the entry point for the whole note and the
   only genuinely new thread in it; it deserves its own page. Target slug:
   `sovereign-ai-for-middle-powers`.
2. ~~**Andrej Karpathy, "Auto Research"**~~ — **done, 2026-07-27.** The owner dropped the
   transcript of the podcast in question: NoPriors, *Skill Issue: Andrej Karpathy on Code
   Agents, AutoResearch, and the Loopy Era of AI*, 2026-03-20,
   https://www.youtube.com/watch?v=kwSVtQ7dziU. It is both items at once — the "skill
   issue" phrase and the Auto Research description come from the same conversation.
   Archived at `sources/2026-07/skill-issue-karpathy-on-code-agents/`; notes at
   `skill-issue-karpathy-on-code-agents` and `auto-research`, plus four more pages. It
   also corrected a claim on `agentic-engineering` — see the log entry for that date.
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
