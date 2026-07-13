import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NoteList } from '@/components/note-list'
import { allTags, notesByTag } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return allTags().map(({ tag }) => ({ tag }))
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `Tag: ${tag}`,
    description: `Notes tagged “${tag}”.`,
  }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const notes = notesByTag(tag)
  if (notes.length === 0) notFound()
  return (
    <>
      <h1 className="page-title">
        Tag: <em>{tag}</em>
      </h1>
      <NoteList notes={notes} />
    </>
  )
}
