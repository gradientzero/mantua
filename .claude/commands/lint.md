---
description: Health-check the wiki — contradictions, orphans, stale claims, missing pages
---

Run a maintenance pass over the whole wiki. Read `README.md` first if you haven't this
session. Then examine `content/` as a system, not page by page:

- **Broken wikilinks**: run `npm run build` and collect the `[wikilink]` warnings.
  Each one is either a page worth creating now or a deliberate to-do — decide which.
- **Orphans**: pages with no inbound links (no backlinks, not reachable from `home` or
  any hub). Link them in or flag them.
- **Contradictions**: places where two pages make incompatible claims. Never silently
  pick a winner — note the contradiction on both pages, with the sources.
- **Stale claims**: statements that newer ingested material has superseded.
- **Missing pages**: concepts mentioned repeatedly across notes that deserve their own
  page.
- **Hygiene**: tags that mean the same thing, summaries that no longer match their
  page, `updated` dates that were forgotten, hub pages that don't reflect what the
  notebook now contains.

Fix what is mechanical and safe (links, tags, hub updates, cross-references). Respect
provenance — `origin: human` prose is never rewritten. Anything judgment-heavy becomes
a file in `tasks/` for the owner.

Finish with a `## [YYYY-MM-DD] lint | <summary>` entry in `log.md` listing what was
fixed and what was flagged, run `npm run build`, commit and push.
