---
description: Answer a question from the wiki, with citations — and file good answers back in
---

Answer the question in $ARGUMENTS against the notebook — the wiki is the knowledge base,
you are its oracle.

1. **Orient**: skim `log.md` (recent activity) and the pages under `content/` relevant
   to the question — follow wikilinks and backlinks rather than grepping blindly. Consult
   `sources/` when the wiki summary isn't enough and the original matters.
2. **Answer** in chat, synthesizing across pages. Cite the pages you drew from by slug
   so the owner can jump in. Say clearly when the notebook doesn't contain an answer —
   suggest what source or note would fill the gap instead of improvising one.
3. **File it back when it compounds.** If the answer produced something durable — a
   comparison, a synthesis, a connection between notes that wasn't written down anywhere —
   offer to save it as a note (`origin: agent`, `status: draft`, linked from the pages it
   connects), and add a `## [YYYY-MM-DD] query | <question>` entry to `log.md`. Pure
   lookups don't need filing.

Refinement requests ("restructure this page", "merge these two notes", "publish X")
are handled the same way: do the edit, respect provenance (never rewrite `origin: human`
prose — ask instead), run `npm run build`, log it, commit.
