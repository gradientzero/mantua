import type { Metadata } from 'next'
import { MDXContent } from '@/components/mdx'
import { NoteList } from '@/components/note-list'
import { allNotes, getHub } from '@/lib/content'
import { site } from '@/lib/site'

// The home page IS a content file: content/index/home.mdx. Edit that file —
// not this one — to change what visitors see first.

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
  const recent = allNotes().slice(0, 5)
  return (
    <article>
      {hub ? (
        <MDXContent code={hub.body} />
      ) : (
        <p>
          Create <code>content/index/home.mdx</code> (status: published) to fill this page.
        </p>
      )}
      <section className="link-section">
        <h2>Recently updated</h2>
        <NoteList notes={recent} />
      </section>
    </article>
  )
}
