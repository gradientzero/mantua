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
import type { SearchDoc } from './search'

const showDrafts = process.env.NODE_ENV === 'development'

const byUpdatedDesc = (a: Note | Hub, b: Note | Hub) => b.updated.localeCompare(a.updated)

/**
 * Newest first by the date the note was written, not the date it was last
 * touched — an old note that an ingest revisited is not new. Same-day ties
 * (an ingest routinely creates several notes at once) fall back to the edit
 * date and then the title, so the order is stable between builds.
 */
const byCreatedDesc = (a: Note, b: Note) =>
  b.created.localeCompare(a.created) ||
  b.updated.localeCompare(a.updated) ||
  a.title.localeCompare(b.title)

const visible = <T extends Note | Hub>(docs: readonly T[]): T[] =>
  docs.filter((d) => showDrafts || d.status === 'published')

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const allNotes = (): Note[] => visible(notes).sort(byUpdatedDesc)

/** What `/` lists: the notebook's newest entries, by creation date. */
export const notesByCreated = (): Note[] => visible(notes).sort(byCreatedDesc)

export const getNote = (slug: string): Note | undefined =>
  visible(notes).find((n) => n.slug === slug)

export const relatedNotes = (note: Note): Note[] =>
  note.related.map((slug) => getNote(slug)).filter((n): n is Note => Boolean(n))

// ---------------------------------------------------------------------------
// Hubs (curated entry points, rendered at `/<slug>`). `home` is reserved: `/`
// is the entries feed, built from the notes, with no content file behind it.
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
// Search
// ---------------------------------------------------------------------------

/**
 * Everything the header search indexes — one entry per visible page. Going
 * through `allNotes()`/`allHubs()` keeps the draft policy intact: drafts are
 * searchable in dev and absent from production, like everywhere else.
 */
export function searchDocs(): SearchDoc[] {
  return [
    ...allNotes().map(
      (n): SearchDoc => ({
        title: n.title,
        summary: n.summary,
        tags: n.tags,
        url: `/notes/${n.slug}`,
        kind: 'note',
        status: n.status,
      }),
    ),
    ...allHubs().map(
      (h): SearchDoc => ({
        title: h.title,
        summary: h.summary,
        tags: [],
        url: hubUrl(h.slug),
        kind: 'hub',
        status: h.status,
      }),
    ),
  ]
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
