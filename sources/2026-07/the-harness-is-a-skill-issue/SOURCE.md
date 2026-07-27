# Source record

- **Item**: `2026-07-27-dictation-auto-research-and-the-skill-issue.md`
- **Title**: Dictation — Auto Research, the published harnesses, and the skill issue
- **Origin**: **the owner's own writing** — dictated, transcribed as spoken
  (passed directly as the argument to `/ingest`, not dropped as a file)
- **Author**: Wolfgang Gross
- **Captured**: 2026-07-27
- **Ingested**: 2026-07-27

## Notes on the capture

Dictated, transcribed speech. The transcript is archived here **verbatim**, including the
instruction line at the top and the question at the end.

The owner's instruction was explicit: *"Create an own note from this and edit out the
clutter, restructure it but keep the tone."* So the wiki page is edited prose, not the
transcript — same call he made on the 2026-07-26 dictation
(`tasks/2026-07-26-review-dictated-commentary.md`). Consequences:

- **`origin: mixed`, not `origin: human`.** An agent chose the wording and the structure,
  so the page cannot claim to be hand-written. The byline reads *Wolfgang Gross · with
  agents*. The argument, the opinions and the framing are entirely his. Reverting to
  `origin: human` is only correct if he reworks the prose himself.
- The spoken repairs and restarts are gone ("so is it something, is it, like Anton
  described"), the transcription slips are fixed (*"bad critiques"* → bad critics, *"a
  planner, which is kind of like fast"* → the planner stage, *"Opus is a bad Q&A agent"* →
  poor QA agent, which is what the Anthropic post actually says).
- The material is reordered into five sections — the entry point, what is published, where
  that leaves it, who turns out to be good at it, what he would do — but nothing was added
  to the argument and nothing was dropped from it.
- **The closing question is not in the note.** "Should I put my commentary in my blog post
  on this topic?" is a question to the agent, not commentary; it was answered in the
  session and is tracked with the rest of the publishing decision in
  `tasks/2026-07-26-publish-agentic-engineering-cluster.md`.

## Sources referred to but not captured

Three references are described from the owner's recollection only; none was clipped, and
none is archived here. Tracked as `tasks/2026-07-27-clip-sovereign-ai-and-expertise-sources.md`.

- **Anton Leicht**, piece on middle powers and sovereign AI — no URL or date given.
- **Andrej Karpathy, "Auto Research"** — described but not linked. Also the podcast where
  he uses "skill issue".
- **"Agentic Coding and Persistent Returns to Expertise", 2026-06-16** — publisher not
  named. The direct quote carried into the note ("Success is determined by how well a
  person understands the problem they're trying to solve, not whether they are trained in
  coding") comes from the dictation and has **not** been verified against the article.

The two harness posts he discusses are already archived, under
`sources/2026-07/harness-design-for-long-running-application-development/` and
`sources/2026-07/harness-engineering-leveraging-codex-in-an-agent-first-world/`, and his
account of both matches the notes taken from the originals.

## Wiki pages touched

- `content/notes/the-harness-is-a-skill-issue.mdx` (new — `origin: mixed`, the edited
  dictation)
- `content/notes/agentic-engineering.mdx` (new section "How far along is this, really?" —
  the cluster hub had no statement that the fully automated loop is unimplemented)
- `content/notes/generator-evaluator-loops.mdx` (his operational rubric example under
  concrete criteria; the "be the evaluator yourself first" and "read the evaluator's
  output, not its verdict" corollaries under tuning)
- `content/notes/loop-engineering.mdx` (the returns-to-expertise finding as a second line
  of evidence that the specification work doesn't go away)
- `content/notes/agentic-engineering-my-role-in-the-loop.mdx` (`related:` only — prose
  untouched)
