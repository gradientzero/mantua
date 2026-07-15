import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx'
import { DraftBadge, TagList, formatDate } from '@/components/note-list'
import { allNotes, backlinksFor, getNote, relatedNotes } from '@/lib/content'
import { site } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return allNotes().map((note) => ({ slug: note.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const note = getNote(slug)
  if (!note) return {}
  return {
    title: note.title,
    description: note.summary,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      title: note.title,
      description: note.summary,
      type: 'article',
      url: `/notes/${note.slug}`,
      publishedTime: note.created,
      modifiedTime: note.updated,
      tags: note.tags,
      siteName: site.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title,
      description: note.summary,
    },
  }
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const note = getNote(slug)
  if (!note) notFound()

  const backlinks = backlinksFor(note.slug)
  const related = relatedNotes(note)

  return (
    <article>
      {(note.tags.length > 0 || note.status === 'draft') && (
        <div className="article-tags">
          <DraftBadge status={note.status} />
          <TagList tags={note.tags} />
        </div>
      )}

      <h1 className="article-title">{note.title}</h1>

      <div className="article-byline">
        <span className="section-label section-label-secondary">{note.author ?? site.author}</span>
        <span className="section-label">
          <time dateTime={note.created}>{formatDate(note.created)}</time>
          {note.updated !== note.created && (
            <> · updated <time dateTime={note.updated}>{formatDate(note.updated)}</time></>
          )}
        </span>
      </div>

      {note.summary && <p className="article-lead">{note.summary}</p>}

      <MDXContent code={note.body} />

      {related.length > 0 && (
        <section className="link-section">
          <h2>Related</h2>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/notes/${r.slug}`}>{r.title}</Link>
                <span className="link-summary">{r.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="link-section">
        <h2>Linked from</h2>
        {backlinks.length > 0 ? (
          <ul>
            {backlinks.map((b) => (
              <li key={b.url}>
                <Link href={b.url}>{b.title}</Link>
                <span className="link-summary">{b.summary}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No pages link here yet.</p>
        )}
      </section>
    </article>
  )
}
