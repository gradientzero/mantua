'use client'

/**
 * Header tab row (design-system chrome). Mono uppercase tabs; the active
 * tab gets a 1px underline. Client component only so it can read the
 * current path — the rest of the layout stays a server component.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Notes', href: '/notes' },
  { label: 'Tags', href: '/tags' },
]

export function SiteNav() {
  const pathname = usePathname()
  return (
    <nav className="site-tabs">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? 'site-tab site-tab-active' : 'site-tab'}
            aria-current={active ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
