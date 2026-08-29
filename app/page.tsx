import Link from 'next/link'
import type { Metadata } from 'next'
import { NoteList } from '@/components/note-list'
import { notesByCreated } from '@/lib/content'
import { site } from '@/lib/site'

// The entry page is the notebook's entries and nothing else: newest first by
// the date they were written, then a link to /notes for the rest. There is no
// content file behind it — `home` is a reserved hub slug (see lib/content.ts).
// The notebook describes itself on /about (content/index/about.mdx).

/** Entries shown before sending the reader to /notes for the rest. */
const RECENT = 12

export const metadata: Metadata = {
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: 'website',
    url: '/',
  },
}

export default function HomePage() {
  const notes = notesByCreated()
  const recent = notes.slice(0, RECENT)
  return (
    <>
      <h1 className="page-title">Recent entries</h1>
      <NoteList notes={recent} dateField="created" />
      {notes.length > recent.length && (
        <p className="home-more">
          <Link href="/notes">All {notes.length} notes →</Link>
        </p>
      )}
    </>
  )
}
