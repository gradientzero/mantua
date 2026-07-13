import type { MetadataRoute } from 'next'
import { allHubs, allNotes, allTags, hubUrl } from '@/lib/content'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = allNotes().map((n) => ({
    url: `${site.url}/notes/${n.slug}`,
    lastModified: n.updated,
  }))
  const hubs = allHubs().map((h) => ({
    url: `${site.url}${hubUrl(h.slug)}`,
    lastModified: h.updated,
  }))
  const tags = allTags().map(({ tag }) => ({ url: `${site.url}/tags/${tag}` }))
  return [{ url: `${site.url}/notes` }, ...hubs, ...notes, ...tags]
}
