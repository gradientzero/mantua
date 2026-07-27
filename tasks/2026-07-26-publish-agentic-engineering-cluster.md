---
title: Decide what to publish from the agentic-engineering cluster
date: 2026-07-26
priority: medium
status: open
area: content
---

## Goal

The 2026-07-26 ingest added eight pages, all `status: draft`, forming the notebook's first
topic cluster outside the SLM thread:

| Page | Origin |
|---|---|
| `agentic-engineering` | agent — the entry point |
| `harness-design-for-long-running-coding-agents` | agent — Anthropic, 2026-03 |
| `harness-engineering-agent-first-repositories` | agent — OpenAI, 2026-02 |
| `self-improving-agents-from-production-feedback` | agent — OpenAI × Thrive, 2026-05 |
| `generator-evaluator-loops` | agent — cross-cutting concept |
| `linting-as-agent-guardrail` | agent — cross-cutting concept |
| `harness-design-reading-list` | agent — what's still unread |
| `agentic-engineering-my-role-in-the-loop` | **mixed** — the owner's commentary, agent-edited |

Publishing is the owner's call. Nothing is wired into `home` or `about` yet, deliberately:
both hubs are published, and a wikilink from a published page to a draft renders as an
inert dead span in production. So the hub edit and the publish decision have to happen
together.

## What to decide

1. **Which pages go live.** The three source-summary notes are the most self-contained.
   `agentic-engineering` is the natural public entry point but currently opens by
   referring to the inbox drop that produced it — worth a rewrite if it is published.
   `agentic-engineering-my-role-in-the-loop` was rewritten from the raw dictation on
   2026-07-26 (see `2026-07-26-review-dictated-commentary.md`), so it now reads as a note
   and is a publishable candidate — it is the only page in the cluster that says what the
   owner actually thinks.
2. **Whether this deserves a hub.** `content/index/` holds `home` and `about`. If the
   cluster grows — and the reading list alone implies four more sources — a hub page at
   `/agentic-engineering` would be a better entry point than a note, and would put the
   notebook's second real topic on the map next to the SLM thread.
3. **Tag hygiene.** The cluster introduces `agentic-engineering`, `harness-design`,
   `evaluation`, `linting`, `code-review`, `frontend-design`, `reading-list`. Existing tags
   are `reading-notes`, `fine-tuning`, `deployment`, `inference`, `hands-on`,
   `tabular-foundation-models`. `evaluation` will collide with the SLM thread's future
   eval-harness notes — decide now whether that is one tag or two.

## Worth flagging

Several of the cluster's notes point at this repository's own setup — `/lint` as a prose
linter, `/ingest` as a scheduled agent, the unscheduled state of both. If the harness ideas
get applied here rather than just written about, that is a separate, larger task and should
be its own file.
