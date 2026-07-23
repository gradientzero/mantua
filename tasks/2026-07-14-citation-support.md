---
title: Add citation support for papers and books
date: 2026-07-14
priority: medium
status: open
area: content-system
---

## Goal

When a note cites a scientific paper or book, the source should be stored in
the repo alongside a bibliographic record, cited inline with a short marker,
and automatically collected into a well-structured "References" section at
the end of the article — the kind where a reader can immediately tell what
was cited and where it came from. Books should support page-level citations.

This is explicitly **not** a LaTeX workflow — everything else in this repo is
plain markdown/MDX rendered through Velite + remark/rehype
([README.md](../README.md)), and citations need to fit that pipeline, not
bring in a parallel toolchain.

## Two sub-problems

1. **Storage**: a `papers/` folder to hold the source PDFs plus a
   bibliographic record per source (author, title, year, venue, pages for
   books, etc.) in a format that's easy to hand-edit and easy to reference
   from a note.
2. **Rendering**: pick and wire up the actual citation technology — parse
   citation keys used inline in MDX, resolve them against the bibliographic
   records, and render both the inline marker and the generated references
   list. This is the part that needs real evaluation before committing to an
   approach — figuring out the *right* tool is part of the task, not a
   solved prerequisite.

## Candidate directions to evaluate (not a decision — research this first)

- **CSL-JSON + `rehype-citation`** (citeproc-js under the hood): the closest
  non-LaTeX equivalent to a BibTeX + citation-style workflow, and it plugs
  into a remark/rehype pipeline the same way `velite.config.ts` already wires
  `remarkWikilinks` and `rehypeSlug`. BibTeX files can be converted to
  CSL-JSON (e.g. via `citation-js`) if papers are sourced as `.bib` already.
- **`citation-js`** directly, as a build-time step that resolves keys and
  emits both the inline citation and a references array Velite can pass
  through to the page template.
- Whatever else turns up — the point of this task is to actually compare
  options against this repo's constraints (MDX, build-time only, no client
  JS requirement, must integrate with Velite's schema/transform step) rather
  than assume the first hit is right.

## Open questions to resolve when picked up

- Where do citation keys live — a per-note frontmatter list, or inline
  `[@key]`-style markers in the MDX body?
- One shared bibliography file, or one bibliographic record per paper next to
  its PDF in `papers/`?
- How are book page numbers expressed for a specific citation (CSL supports
  `locator`/`page` per-cite, worth confirming the chosen tool surfaces that)?
- Does this need a schema change in `velite.config.ts`? If so, remember the
  README update rule in [CLAUDE.md](../CLAUDE.md).

## Definition of done

- A note can cite a paper or book stored in `papers/` and get a rendered,
  correctly formatted references section at the bottom of the article.
- The approach is documented in the README (per the "schema changes" rule)
  so future sessions know the convention without re-deriving it.
