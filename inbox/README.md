# Inbox

The capture point for everything entering the notebook. Drop files here and forget
about them — the ingest agent (see `/ingest` in `.claude/commands/`) empties this
folder, files everything into the wiki (`/content`), and archives the raw material
under `/sources`. It is meant to run unattended on a regular pace; until that schedule
is wired up (see `tasks/2026-07-25-schedule-ingest-agent.md`), run `/ingest` by hand.

This folder is **outside `/content`**, so Velite never touches it: nothing here is
validated, built, or published. A messy inbox breaks nothing.

## What to drop here

- **Markdown files** — web articles clipped to markdown (e.g. Obsidian Web Clipper),
  reading notes, meeting notes, stray thoughts, dictated fragments. Any filename, any
  or no frontmatter.
- **Images** — screenshots, photos of pages, diagrams. Ideally next to the markdown
  file that references them; loose is fine too.
- **Folders** — a folder per source (article + its images) is the tidiest shape, but
  not required.

## Marking your own writing

Provenance matters in this notebook: hand-written material keeps its wording and gets
the owner's byline; everything else is agent-maintained. Mark material you wrote
yourself in either way:

1. Drop it into **`inbox/mine/`**, or
2. add `origin: human` to its frontmatter.

Everything else is treated as captured external material: the agent summarizes and
integrates it, it does not republish it.

## Optional per-file hints

If a dropped markdown file has frontmatter, the ingest agent honors these keys:

```yaml
status: published   # publish the resulting note immediately (default: draft)
tags: [reading-notes]
origin: human       # equivalent to dropping the file in inbox/mine/
```

Everything else — title, slug, filing decisions, cross-links — the agent works out
itself.
