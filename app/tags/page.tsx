import Link from 'next/link'
import type { Metadata } from 'next'
import { allTags } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse notes by topic.',
}

export default function TagsPage() {
  const tags = allTags()
  return (
    <>
      <h1 className="page-title">Tags</h1>
      {tags.length === 0 ? (
        <p className="muted">No tags yet.</p>
      ) : (
        <ul className="note-list">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link href={`/tags/${tag}`} className="note-list-title">
                {tag}
              </Link>{' '}
              <span className="muted">
                {count} {count === 1 ? 'note' : 'notes'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
