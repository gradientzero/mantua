import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/site-nav'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <div>
              <Link href="/" className="wordmark">
                {site.name}
              </Link>
              <div className="wordmark-tagline">{site.tagline}</div>
            </div>
          </div>
          <SiteNav />
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p className="muted">
            {site.name} — a working notebook, updated continuously. Notes are living documents, not
            finished essays.
          </p>
        </footer>
      </body>
    </html>
  )
}
