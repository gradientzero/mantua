---
captured: 2026-07-26
tags: [agentic-engineering, harness-design, reading-list]
clip-status: links-only
---

# Prior work linked from "Harness design for long-running application development"

Capture note, not a clip. The owner asked for the pieces linked from the opening of the
Anthropic harness-design post to go into the inbox too. **The article bodies could not be
retrieved** — this session's network policy does not allow `www.anthropic.com`
(`403 Host not in allowlist`), and `github.com/anthropics/…` is outside the repositories
this session may read. So what follows is the reference list with the URLs and the
descriptions given *in the harness-design post itself*; the full texts still need to be
clipped (Web Clipper) and dropped into the inbox to be ingested properly.

## The four pieces

1. **Effective harnesses for long-running agents** — Anthropic Engineering.
   <https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents>
   The direct predecessor. As described in the newer post: an *initializer* agent
   decomposes a product spec into a task list, and a *coding* agent implements the tasks
   one feature at a time, handing off structured artifacts to carry context across
   sessions, with full context resets between sessions. Built against Sonnet 4.5, whose
   "context anxiety" made resets load-bearing.

2. **Effective context engineering for AI agents** — Anthropic Engineering.
   <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
   Cited for the failure mode that motivates resets: models lose coherence on long tasks
   as the context window fills.

3. **Building effective agents** — Anthropic Research.
   <https://www.anthropic.com/research/building-effective-agents>
   Cited for the principle used to justify stripping the harness back: "find the simplest
   solution possible, and only increase complexity when needed."

4. **The frontend design skill** — `anthropics/claude-code`, plugin skill.
   <https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md>
   The prompt-engineering starting point for the generator/evaluator design work; in the
   full-harness run it was handed to the *planner*, which read it and derived a visual
   design language for the app as part of the spec.

## Secondary references worth having

- **Claude Opus 4.6 launch post** —
  <https://www.anthropic.com/news/claude-opus-4-6> — the capability claims the harness
  simplification was justified against (plans more carefully, sustains agentic tasks
  longer, better code review and debugging, better long-context retrieval).
- **Claude Agent SDK** —
  <https://platform.claude.com/docs/en/agent-sdk/overview> — what both harnesses were
  built on; also the source of the automatic compaction that replaced context resets.
- **"Ralph Wiggum" loop**, Geoffrey Huntley — <https://ghuntley.com/ralph/> and
  <https://ghuntley.com/loop/> — the community pattern both the Anthropic and the OpenAI
  harness posts point at: hooks or scripts that keep an agent in a continuous iteration
  cycle. Cited in the OpenAI harness-engineering post as the shape of their
  review-until-all-reviewers-are-satisfied loop.
