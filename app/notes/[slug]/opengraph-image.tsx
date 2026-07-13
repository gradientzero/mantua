import { ImageResponse } from 'next/og'
import { getNote } from '@/lib/content'
import { site } from '@/lib/site'

// Auto-generated Open Graph card per note (1200×630), so LinkedIn/Twitter
// shares always have an image without any manual asset work.

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = site.name

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const note = getNote(slug)
  const title = note?.title ?? site.name
  const summary = note?.summary ?? site.description

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#16181b',
          color: '#dcdcd7',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#7aa7d8' }}>{site.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', fontSize: 64, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {title.length > 80 ? `${title.slice(0, 77)}…` : title}
          </div>
          <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.4, color: '#8f8f88' }}>
            {summary.length > 140 ? `${summary.slice(0, 137)}…` : summary}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
