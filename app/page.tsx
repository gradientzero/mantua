import Link from 'next/link'
import type { Metadata } from 'next'
import { MDXContent } from '@/components/mdx'
import { NoteList } from '@/components/note-list'
import { allNotes, getHub } from '@/lib/content'
import { site } from '@/lib/site'

// The entry page is the notebook's recent-entries feed: what changed, newest
// first. The one-line orientation above it IS a content file —
// content/index/home.mdx. Edit that file, not this one, to change it; the
// longer "how this works" text lives on /about (content/index/about.mdx).

/** Recent entries shown before sending the reader to /notes for the rest. */
const RECENT = 12

export function generateMetadata(): Metadata {
  const hub = getHub('home')
  return {
    description: hub?.summary ?? site.description,
    openGraph: {
      title: site.name,
      description: hub?.summary ?? site.description,
      type: 'website',
      url: '/',
    },
  }
}

export default function HomePage() {
  const hub = getHub('home')
  const notes = allNotes()
  const recent = notes.slice(0, RECENT)
  return (
    <>
      {hub && (
        <div className="home-lead">
          <MDXContent code={hub.body} />
        </div>
      )}
      <h1 className="page-title">Recent entries</h1>
      <NoteList notes={recent} />
      {notes.length > recent.length && (
        <p className="home-more">
          <Link href="/notes">All {notes.length} notes →</Link>
        </p>
      )}
    </>
  )
}
