/**
 * Renders MDX bodies compiled by Velite (function-body format) and resolves
 * `wikilink:` pseudo-links produced by lib/wikilinks.ts into real routes.
 *
 * CUSTOM COMPONENTS (Distill-style interactive figures, charts, demos):
 * register them in `sharedComponents` below and they become available in
 * every .mdx file without imports, e.g. `<CostCurve data={...} />`.
 * Client components (hooks, D3, event handlers) work too — mark their file
 * with 'use client'; this renderer stays a server component.
 */

import Link from 'next/link'
import * as runtime from 'react/jsx-runtime'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { resolveWikilink } from '@/lib/content'
import { WIKILINK_PROTOCOL } from '@/lib/wikilinks'
import AdaptationDecisionTree from '@/components/figures/adaptation-decision-tree'
import DataReadinessSpectrum from '@/components/figures/data-readiness-spectrum'

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }

function MdxAnchor({ href = '', children, ...rest }: AnchorProps) {
  if (href.startsWith(WIKILINK_PROTOCOL)) {
    const target = href.slice(WIKILINK_PROTOCOL.length)
    const resolved = resolveWikilink(target)
    if (!resolved) {
      // Linked page doesn't exist (yet) or is a draft in a production build.
      return (
        <span className="wikilink-missing" title={`No published page with slug “${target}” yet`}>
          {children}
        </span>
      )
    }
    // Bare [[slug]] (no |label) shows the target's real title.
    const label = children === target ? resolved.title : children
    return (
      <Link href={resolved.url} className="wikilink" title={resolved.summary}>
        {label}
      </Link>
    )
  }
  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

const sharedComponents = {
  a: MdxAnchor,
  AdaptationDecisionTree,
  DataReadinessSpectrum,
  // Register future interactive components here, e.g.:
  // CostCurve: dynamic(() => import('@/components/figures/cost-curve')),
}

// Velite compiles MDX to a function body; hydrate it with the JSX runtime.
const getMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({
  code,
  components,
}: {
  code: string
  components?: Record<string, React.ComponentType<any>>
}) {
  const Component = getMDXComponent(code)
  return <Component components={{ ...sharedComponents, ...components }} />
}
