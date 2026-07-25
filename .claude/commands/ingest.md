---
description: Process everything in /inbox into the wiki — the scheduled agent's entrypoint
---

Process the inbox. This is the notebook's core maintenance operation; it is designed to
run unattended on a schedule, but works the same when invoked by hand.

Read `README.md` first if you haven't this session — it is the source of truth for the
schema and conventions. Then:

1. **Enumerate** everything under `inbox/` except `inbox/README.md` and
   `inbox/mine/.gitkeep`. If the inbox is empty, append nothing to the log, change
   nothing, and stop.
2. **For each item** (file, or folder treated as one item):
   - Read it in full. Read referenced/adjacent images separately after the text.
   - Determine provenance: anything in `inbox/mine/` or marked `origin: human` is the
     owner's own writing; everything else is captured external material.
   - Honor the item's frontmatter hints (the contract in `inbox/README.md`): `origin`,
     `status`, and `tags` — keep any tags the owner set (adding more is fine).
   - **Owner's writing** → a new note in `content/notes/` with `origin: human`,
     `author: Wolfgang Gross`, and the prose **unchanged** — you may fix frontmatter,
     add wikilinks, and choose title/slug/tags, but never rewrite his wording.
   - **External material** → integrate it: write or update a summary/concept note
     (`origin: agent`), and update every existing page the new material touches —
     strengthen claims, note contradictions explicitly, add cross-references. A single
     source may touch many pages; that is the point.
   - Link generously with `[[wikilinks]]`; a link to a page that doesn't exist yet is
     fine (it is the to-do list).
   - New notes default to `status: draft`. Publish only if the item's frontmatter says
     `status: published`.
   - Images a note needs are **copied** to `public/images/<note-slug>/` and referenced
     with absolute paths (`/images/<note-slug>/…`). Copies, never moves — the original
     files stay with the item so the archive in step 3 is complete.
3. **Archive**: move each processed item — its markdown and all its assets, exactly as
   dropped — to `sources/YYYY-MM/<slug>/` and write its `SOURCE.md` (origin, URL if
   known, ingest date, wiki pages touched). The note in `content/notes/` is always a
   new file, so the original always survives intact here. Sources are immutable from
   then on.
4. **Log**: append one `## [YYYY-MM-DD] ingest | <title>` entry per item to `log.md` —
   a few lines on what it was and which pages it touched.
5. **Validate**: run `npm run build`. Fix schema errors; treat new broken-wikilink
   warnings as acceptable only when deliberate.
6. **Commit and push** to `main` with a message listing the ingested items. If anything
   was ambiguous or deserves the owner's attention, record it as a file in `tasks/`
   rather than guessing.

Stay in the owner's register when writing agent prose: plain, concrete, no hype. Study
the `origin: human` notes for tone.
