import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx'
import { DraftBadge, formatDate } from '@/components/note-list'
import { allHubs, backlinksFor, getHub } from '@/lib/content'
import { site } from '@/lib/site'

// Hub pages (curated entry points) from content/index/*.mdx.
// `home.mdx` is rendered by app/page.tsx at `/`; every other hub lands here
// at `/<slug>`. Static routes like /notes and /tags always win over this one.

export const dynamicParams = false

export function generateStaticParams() {
  return allHubs()
    .filter((hub) => hub.slug !== 'home')
    .map((hub) => ({ slug: hub.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hub = getHub(slug)
  if (!hub) return {}
  return {
    title: hub.title,
    description: hub.summary,
    alternates: { canonical: `/${hub.slug}` },
    openGraph: {
      title: hub.title,
      description: hub.summary,
      type: 'website',
      url: `/${hub.slug}`,
      siteName: site.name,
    },
    twitter: { card: 'summary', title: hub.title, description: hub.summary },
  }
}

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hub = getHub(slug)
  if (!hub || hub.slug === 'home') notFound()

  const backlinks = backlinksFor(hub.slug)

  return (
    <article>
      <h1>{hub.title}</h1>
      <div className="article-meta">
        <DraftBadge status={hub.status} />
        <span>updated <time dateTime={hub.updated}>{formatDate(hub.updated)}</time></span>
      </div>
      <MDXContent code={hub.body} />
      {backlinks.length > 0 && (
        <section className="link-section">
          <h2>Linked from</h2>
          <ul>
            {backlinks.map((b) => (
              <li key={b.url}>
                <a href={b.url}>{b.title}</a>
                <span className="link-summary">{b.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
