# Sources

The raw-source archive — the notebook's source of truth. When the ingest agent
processes an inbox item, the original material is moved here, unmodified, and never
touched again.

**Sources are immutable.** Agents read from this folder but never edit, rewrite, or
delete anything in it. If a source turns out to be wrong or superseded, that is recorded
in the wiki page that cites it — not by editing the source.

Like `/inbox` and `/tasks`, this folder is outside `/content`: Velite never builds it
and nothing here is published.

## Layout

One folder per ingested item, grouped by ingest month:

```
sources/
  2026-07/
    some-article-title/
      some-article-title.md     # the clipped/dropped original
      image-1.png               # its assets, if any
      SOURCE.md                 # ingest record (see below)
```

`SOURCE.md` is a small record the agent writes at ingest time: where the item came from
(URL if known), when it was ingested, its provenance (`human` or captured material), and
which wiki pages it touched. It is the join point between this archive and the wiki.
