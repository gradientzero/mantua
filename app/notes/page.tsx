import type { Metadata } from 'next'
import { NoteList } from '@/components/note-list'
import { allNotes } from '@/lib/content'

export const metadata: Metadata = {
  title: 'All notes',
  description: 'Every note in the notebook, most recently updated first.',
}

export default function NotesIndexPage() {
  return (
    <>
      <h1 className="page-title">All notes</h1>
      <NoteList notes={allNotes()} />
    </>
  )
}
