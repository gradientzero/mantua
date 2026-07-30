# Source record

- **Item**: `How we learned to trust our AI code reviewer at DoorDash.md`
- **Title**: How we learned to trust our AI code reviewer at DoorDash
- **Origin**: **captured external material** — DoorDash engineering blog post, clipped to
  markdown (Obsidian Web Clipper frontmatter intact, `tags: [clippings]`)
- **URL**: https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/
- **Authors**: Saketh Dhulipalla, Vasily Vlasov, Marcus Yearwood, Adam Yarger
- **Published**: 2026-07-06
- **Captured**: 2026-07-30
- **Ingested**: 2026-07-30

## Notes on the capture

The clip is complete, including the appendix tables (full configuration metrics, severity
breakdown, task intents, PR sizes, verifiability, product domains, impact). Five figures are
referenced as remote `careersatdoordash.com` image URLs and were **not** downloaded — the
markdown carries the captions but not the images. Everything the figures show is also in the
tables, so nothing load-bearing is lost; the figure URLs are preserved in the file if they
are ever wanted.

The clipper's `author` field uses `[[wikilink]]` syntax for the four names. That is Obsidian
convention, not this notebook's — those are people, not note slugs, and no pages were created
for them.

Two things about the dating are worth recording. The post predates the NoPriors interview
already in the notebook (`sources/2026-07/doordash-nopriors-agentic-commerce-and-dot/`),
which is undated but can be no earlier than July 2026 — so this is the "announced a couple
of weeks ago" benchmark, described by the team that built it. And it corrects the
impression left by that interview: DashBench measures a **code reviewer** on replayed
historical PRs, not coding tasks in general.

The model names in the tables (Claude Opus 4.8, Claude Fable 5, GPT 5.5, Kimi K2.6,
Composer 2.5) are carried across verbatim as published; no attempt was made to check them
against release records.

## Wiki pages touched

- `content/notes/dashbench-measuring-a-code-review-agent.mdx` (new — `origin: agent`,
  `status: draft`)
- `content/notes/benchmarking-your-own-agent-spend.mdx` — its stated gap ("Dashbench is
  named, not described") is now closed; the scope correction and the partial answer to its
  scrubbed-versus-real worry added
- `content/notes/generator-evaluator-loops.mdx` — the *what checks the check?* thread gets
  its first partial answer (triangulated labels, human adjudication, calibrated judge); the
  agentic-jury plan added to the shared-prior limit; a new limit on single-run scoring
- `content/notes/doordash-on-agentic-commerce-and-dot.mdx` — pointer plus the scope
  correction to its Dashbench section
- `content/notes/agentic-engineering.mdx` — pointer from the buyer's-side section
- `content/notes/self-improving-agents-from-production-feedback.mdx` — the *was accepted*
  vs *was real* distinction linked to the practitioner-correction classes
