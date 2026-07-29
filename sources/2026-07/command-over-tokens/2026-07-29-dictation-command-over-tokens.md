---
origin: mixed
author: Wolfgang Gross
captured: 2026-07-29
tags: [agentic-engineering, harness-design]
---

This is a dictation from me, cleaned up and tightened, plus a section I asked the agent to
draft. Make it one standalone blog article. Keep the introduction essentially as it stands —
that part is mine — and keep the added practical part in the same register.

# Command over tokens

## The introduction (mine)

It is easy to say: if only I had limitless token expenditure, like inside one of the frontier
labs, I would be able to do so much more.

In practice I rarely see anyone exhaust their weekly limit on a pro subscription while
coding — let alone on knowledge work. It does happen at the session level, especially with
high reasoning effort and several sessions at once, but not across a whole week.

And having a high token throughput that is actually *meaningful* is a skill in itself.
Karpathy talks about exactly this as a skill issue.

So you read the examples from Anthropic and OpenAI about long-running agents, and you wonder
whether something like Auto Research already exists — whether you can formulate a wish, a
specification, and have it run for hours or days until the task is done. Technically that is
possible, but not in the way you think. It is a skill issue.

And nobody outside the labs knows what they really run. What is published is what they chose
to publish; the experiments themselves are months old by the time we read them, and now and
then something leaks out that suggests there is more. [Agent: I dictated a specific incident
here as a reference and I am not sure I named it correctly — leave it out of the prose and
flag it for me to fill in.]

So we are left to our own devices, which is also very empowering. Nobody knows exactly how
to use these tools yet. It is always a play between model capability and the harness. And
with good skills and good harness design you can let an agent do some magical things for you.

## What I want added (agent's part)

Take the practical implementation from here on: how to run this, and how to decide on a
harness. Use the four practical points from *The harness is a skill issue* as the spine —
don't watch it work, run the loops by hand first, make the criteria measurable, read what the
evaluator produces — and combine them with the rest of what is already in the notebook: the
stress test on every harness component from the Anthropic post, the agent-first repository
work from OpenAI, linting as a guardrail, and the mechanisms that decide what starts the next
turn and what ends the sequence.

The point I want it to land on: throughput is bought with harness design, not with a bigger
allowance. That is the same conclusion as the title.
