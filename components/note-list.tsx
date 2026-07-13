import Link from 'next/link'
import type { Note } from '#site/content'

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso),
  )

export function DraftBadge({ status }: { status: 'draft' | 'published' }) {
  if (status !== 'draft') return null
  return <span className="draft-badge">draft</span>
}

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <span className="tag-list">
      {tags.map((tag) => (
        <Link key={tag} href={`/tags/${tag}`} className="tag-chip">
          {tag}
        </Link>
      ))}
    </span>
  )
}

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return <p className="muted">Nothing here yet.</p>
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.slug}>
          <div className="note-list-head">
            <Link href={`/notes/${note.slug}`} className="note-list-title">
              {note.title}
            </Link>
            <DraftBadge status={note.status} />
            <time dateTime={note.updated} className="muted note-list-date">
              {formatDate(note.updated)}
            </time>
          </div>
          <p className="note-list-summary">{note.summary}</p>
          <TagList tags={note.tags} />
        </li>
      ))}
    </ul>
  )
}
