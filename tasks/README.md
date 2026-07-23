# Tasks

A plain-markdown backlog for things that came to mind but shouldn't be acted on
immediately. This folder is **outside `/content`**, so Velite never touches it —
no schema validation, no build impact, no publishing. It's scratch space for the
repo owner and for agent sessions picking up work later.

## Format

One file per task: `YYYY-MM-DD-slug.md`, dated by when the task was captured
(not when it should be done).

```yaml
---
title: Short imperative title
date: 2026-07-14        # capture date, set once
priority: medium         # high | medium | low
status: open             # open | blocked | in-progress | done
area: content-system     # free-form: content-system, design, infra, ...
---
```

Body: freeform markdown. Include enough context (motivation, constraints,
open questions, definition of done) that a future session — human or agent —
can pick it up cold without re-deriving the reasoning.

## Workflow

- New task → create a file with `status: open`.
- Picking one up → read the whole file first, it may note blockers
  (e.g. "waiting on material from the user") that must be resolved before
  starting.
- Done → either delete the file or set `status: done` and leave it as a
  record; either is fine, this folder has no build-time consequences.
