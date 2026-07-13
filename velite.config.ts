/**
 * Velite turns /content markdown+MDX files into typed data at .velite/
 * (imported in app code as `#site/content` — see tsconfig.json paths).
 *
 * Schema and conventions are documented for humans and agents in README.md.
 * If you change the schema here, update README.md in the same commit.
 */

import rehypeSlug from 'rehype-slug'
import { defineCollection, defineConfig, s } from 'velite'
import { extractWikilinks, remarkWikilinks } from './lib/wikilinks'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Shared frontmatter. `slug` defaults to the filename (without extension),
// which is the convention — only set it in frontmatter to override.
const baseFields = {
  title: s.string().min(1).max(160),
  slug: s.string().regex(SLUG_RE, 'slug must be lowercase-kebab-case').optional(),
  status: s.enum(['draft', 'published']).default('draft'),
  created: s.isodate(),
  updated: s.isodate(),
  summary: s.string().min(1).max(400),
  path: s.path(), // e.g. "notes/model-distillation" — provided by Velite
  body: s.mdx(),
}

const withComputedFields = <T extends { slug?: string; path: string }>(
  data: T,
  { meta }: { meta: { content?: string } },
) => ({
  ...data,
  slug: data.slug ?? data.path.split('/').pop()!,
  /** Outgoing wikilink targets; inverted into backlinks in lib/content.ts. */
  links: extractWikilinks(meta.content ?? ''),
})

const notes = defineCollection({
  name: 'Note',
  pattern: 'notes/**/*.{md,mdx}',
  schema: s
    .object({
      ...baseFields,
      tags: s.array(s.string().regex(SLUG_RE, 'tags must be lowercase-kebab-case')).default([]),
      /** Manual "related" overrides (slugs), shown in addition to backlinks. */
      related: s.array(s.string()).default([]),
    })
    .transform(withComputedFields),
})

// Curated hub/overview pages (wiki entry points). `home` renders at `/`,
// every other hub at `/<slug>`.
const hubs = defineCollection({
  name: 'Hub',
  pattern: 'index/**/*.{md,mdx}',
  schema: s.object(baseFields).transform(withComputedFields),
})

export default defineConfig({
  root: 'content',
  collections: { notes, hubs },
  mdx: {
    remarkPlugins: [remarkWikilinks],
    rehypePlugins: [rehypeSlug], // heading ids → deep-linkable sections
  },
  prepare: ({ notes, hubs }) => {
    // Slugs must be unique across BOTH collections: they share one wikilink
    // namespace. Fail the build on collisions — silent shadowing would be
    // miserable to debug months from now.
    const seen = new Map<string, string>()
    for (const doc of [...notes, ...hubs]) {
      const prev = seen.get(doc.slug)
      if (prev) throw new Error(`duplicate slug "${doc.slug}" in ${prev} and ${doc.path}`)
      seen.set(doc.slug, doc.path)
    }
    // Broken wikilinks warn but never fail the build: linking to a note you
    // haven't written yet is normal wiki practice (they render as inert
    // "missing" spans — see components/mdx.tsx).
    for (const doc of [...notes, ...hubs]) {
      for (const target of doc.links) {
        if (!seen.has(target)) {
          console.warn(`[wikilink] ${doc.path}: no note or hub with slug "${target}" (yet)`)
        }
      }
    }
  },
})
