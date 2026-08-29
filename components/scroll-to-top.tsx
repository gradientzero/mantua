'use client'

/**
 * Lands every client-side navigation at the very top of the page.
 *
 * Next only scrolls a new page into view when the new segment's top edge
 * isn't already visible. Mid-navigation the document is briefly shorter than
 * the position we were scrolled to (the old page's content is gone, the new
 * page hasn't laid out yet), so the browser clamps the scroll to the new
 * maximum — and that clamped position is usually far enough up that the check
 * passes and Next leaves it alone. The page then settles a header's height
 * down instead of at the top, which is the "why is it already scrolled?"
 * effect. Correcting it after the commit is cheap and always right.
 *
 * Two navigations are deliberately left alone: the first render (a deep link
 * to a #heading must keep its anchor) and back/forward, where the browser's
 * restored position is the one the reader expects.
 */

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function ScrollToTop() {
  const pathname = usePathname()
  const first = useRef(true)
  const popped = useRef(false)

  useEffect(() => {
    const onPopState = () => {
      popped.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (popped.current) {
      popped.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
