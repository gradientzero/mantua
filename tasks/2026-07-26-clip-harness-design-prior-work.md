---
title: Clip the four prior-work articles the harness-design post builds on
date: 2026-07-26
priority: medium
status: blocked
area: content
---

## Goal

The 2026-07-26 ingest brought in three harness-design articles in full, but the prior work
linked at the top of the Anthropic post went in as URLs only. `harness-design-reading-list`
holds the references; the bodies still need to be read and ingested properly.

## Why blocked

Nothing could be fetched from the ingest session:

- `www.anthropic.com` is not on this environment's egress allowlist — every request
  returns `403 Host not in allowlist`, from `curl` and from the fetch tool alike. That
  blocks three of the four.
- The frontend-design skill lives in `anthropics/claude-code`, which is outside the set of
  GitHub repositories the session is scoped to read.

Neither is worth routing around; both need either an owner-side clip or a change to the
environment's network settings.

## What to do

Clip these into `/inbox` (Web Clipper or equivalent) and re-run `/ingest`:

1. <https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents> —
   the direct predecessor, and the one most likely to change what's written in
   `harness-design-for-long-running-coding-agents`.
2. <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
3. <https://www.anthropic.com/research/building-effective-agents>
4. <https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md>

Lower priority, same treatment if wanted: the Opus 4.6 launch post, the Agent SDK overview,
Geoffrey Huntley's Ralph Wiggum posts, and the OpenAI cookbook article on execution plans.

The alternative fix is to add `www.anthropic.com` (and `openai.com`, which was not tested)
to the environment's allowed hosts, after which the ingest agent can fetch them itself.

## Definition of done

The four articles are archived under `sources/`, the reading-list note is reduced to
whatever is genuinely still unread, and any claim in the cluster that currently rests on a
second-hand description is checked against the primary text.
