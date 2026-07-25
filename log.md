# Log

Append-only record of what happened to this notebook and when — ingests, queries filed
back into the wiki, lint passes, structural changes. Newest entries at the bottom; never
rewrite old entries.

Every entry starts with a consistent, grep-able prefix:

```
## [YYYY-MM-DD] <kind> | <short title>
```

where `<kind>` is one of `ingest`, `query`, `lint`, `setup`. That makes the log
parseable with plain unix tools — `grep "^## \[" log.md | tail -5` shows the last five
entries.

---

## [2026-07-25] setup | Restructured into mantua.io, the agent-first commonplace notebook

Converted the repository from the SLM research notebook into **mantua.io**, following
the LLM-wiki pattern (`LLM_Wiki.md`): added `/inbox` (capture), `/sources` (immutable
raw archive), this log, agent commands (`/ingest`, `/oracle`, `/lint`), and an `origin`
provenance field on all content. Removed the four placeholder seed notes; kept the three
hand-written notes (LLM customization reading notes, tabular foundation models reading
notes, desktop-GPU serving lab notes), now marked `origin: human`.
