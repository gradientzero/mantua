/**
 * The single access layer between Velite's generated data (`#site/content`)
 * and the app. All draft filtering, wikilink resolution, backlink inversion
 * and tag aggregation lives here — pages should never import `#site/content`
 * directly.
 *
 * Draft policy: `status: draft` documents are fully visible in `next dev`
 * (with a badge) and completely absent from production builds — no page, no
 * listings, no backlinks, no sitemap entry.
 */

import { hubs, notes, type Hub, type Note } from '#site/content'

const showDrafts = process.env.NODE_ENV === 'development'

const byUpdatedDesc = (a: Note | Hub, b: Note | Hub) => b.updated.localeCompare(a.updated)

const visible = <T extends Note | Hub>(docs: readonly T[]): T[] =>
  docs.filter((d) => showDrafts || d.status === 'published')

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const allNotes = (): Note[] => visible(notes).sort(byUpdatedDesc)

export const getNote = (slug: string): Note | undefined =>
  visible(notes).find((n) => n.slug === slug)

export const relatedNotes = (note: Note): Note[] =>
  note.related.map((slug) => getNote(slug)).filter((n): n is Note => Boolean(n))

// ---------------------------------------------------------------------------
// Hubs (curated entry points; `home` renders at `/`, others at `/<slug>`)
// ---------------------------------------------------------------------------

export const allHubs = (): Hub[] => visible(hubs).sort(byUpdatedDesc)

export const getHub = (slug: string): Hub | undefined => visible(hubs).find((h) => h.slug === slug)

// ---------------------------------------------------------------------------
// Wikilink resolution & backlinks — one namespace across notes and hubs
// ---------------------------------------------------------------------------

export interface ResolvedLink {
  title: string
  url: string
  summary: string
  status: 'draft' | 'published'
  kind: 'note' | 'hub'
}

export const hubUrl = (slug: string): string => (slug === 'home' ? '/' : `/${slug}`)

export function resolveWikilink(target: string): ResolvedLink | undefined {
  const note = getNote(target)
  if (note) {
    return { title: note.title, url: `/notes/${note.slug}`, summary: note.summary, status: note.status, kind: 'note' }
  }
  const hub = getHub(target)
  if (hub) {
    return { title: hub.title, url: hubUrl(hub.slug), summary: hub.summary, status: hub.status, kind: 'hub' }
  }
  return undefined
}

/** Pages (notes and hubs) whose body wikilinks to `slug`. */
export function backlinksFor(slug: string): ResolvedLink[] {
  const sources: ResolvedLink[] = []
  for (const n of visible(notes)) {
    if (n.links.includes(slug)) {
      sources.push({ title: n.title, url: `/notes/${n.slug}`, summary: n.summary, status: n.status, kind: 'note' })
    }
  }
  for (const h of visible(hubs)) {
    if (h.links.includes(slug)) {
      sources.push({ title: h.title, url: hubUrl(h.slug), summary: h.summary, status: h.status, kind: 'hub' })
    }
  }
  return sources.sort((a, b) => a.title.localeCompare(b.title))
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export function allTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const n of allNotes()) {
    for (const tag of n.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export const notesByTag = (tag: string): Note[] => allNotes().filter((n) => n.tags.includes(tag))
