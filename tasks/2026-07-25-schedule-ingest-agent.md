---
title: Schedule the recurring inbox ingest agent
date: 2026-07-25
priority: high
status: blocked
area: infra
---

## Goal

The `/ingest` command (`.claude/commands/ingest.md`) is designed to run unattended on a
regular pace — it empties `/inbox`, files everything into the wiki, archives sources,
logs, builds, and pushes. What's missing is the **scheduler** that invokes it.

## Why blocked

The agent session that restructured this repo (2026-07-25) could not set up the
schedule on the owner's behalf: recurring agent runs are configured in the owner's own
Claude UI (desktop/web app), not from inside a repo session. The owner needs to do this
once.

## Options, in order of preference

1. **Claude Code scheduled task / Routine** (desktop or claude.ai/code): create a
   recurring task on this repository with the prompt `/ingest`. Daily is a good starting
   cadence; the command is a no-op when the inbox is empty, so a tighter schedule costs
   little. A second, weekly routine running `/lint` is worth setting up at the same time.
2. **GitHub Actions**: a scheduled workflow (`on: schedule`) using the
   `anthropics/claude-code-action` with prompt `/ingest`. Keeps everything in-repo;
   needs an Anthropic API key as a repo secret and permission to push to `main`.
3. **Local cron** on any machine with the repo and Claude Code installed:
   `claude -p "/ingest"` after a `git pull`.

## Definition of done

A schedule exists that runs `/ingest` at least daily against this repo, pushes results
to `main` (which deploys), and `/lint` runs on some slower cadence. Update this file to
`status: done` and note the chosen mechanism in `log.md` (`setup` entry).
