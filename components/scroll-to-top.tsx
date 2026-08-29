'use client'

/**
 * Lands every page at the top — every navigation, the first load, reloads,
 * and back/forward.
 *
 * The underlying fault: mid-navigation the document is briefly shorter than
 * the position we were scrolled to (the old page's content is gone, the new
 * one hasn't laid out yet), so the browser clamps the scroll to the new
 * maximum. Next then checks whether the new page's top edge is visible, finds
 * that the clamp already brought it into view, and leaves it there — the page
 * settles about a header's height down. The browser's own restoration loses
 * the same way: it replays a position captured against the old page's height,
 * against a document that isn't that tall yet.
 *
 * So we take the position over ourselves, and we assert it for a few frames
 * rather than once: a scroll set against a half-laid-out document gets clamped
 * straight back, and on a phone — short viewport, webfonts and the graph
 * canvas arriving late — that is the common case, not the rare one. Any real
 * input from the reader ends the loop immediately, so this can never fight
 * someone who has started scrolling.
 *
 * The one case where the top is the wrong answer is a deep link to a
 * #heading; those are left alone.
 *
 * Trade-off, deliberately taken: back/forward no longer tries to return you to
 * where you were in a long list. It never actually managed to — the clamp put
 * it a header's height down the page regardless — so this trades an arbitrary
 * position for a predictable one. Real restoration (remembering the offset per
 * history entry and re-applying it once the document is tall enough) is a
 * bigger job and its own change.
 */

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** ~12 frames: long enough to outlast a late layout, short enough to be invisible. */
const FRAMES = 12

const INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // The browser's restoration only competes with the loop below, and it is
    // the one that gets the position wrong.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    if (window.location.hash) return

    let frame = 0
    let frames = 0
    let stopped = false

    const detach = () => {
      for (const event of INPUT_EVENTS) window.removeEventListener(event, stop)
    }

    function stop() {
      stopped = true
      cancelAnimationFrame(frame)
      detach()
    }

    const tick = () => {
      if (stopped) return
      if (window.scrollY !== 0) window.scrollTo(0, 0)
      if (++frames < FRAMES) frame = requestAnimationFrame(tick)
      else detach()
    }

    for (const event of INPUT_EVENTS) {
      window.addEventListener(event, stop, { passive: true, once: true })
    }
    tick()

    return stop
  }, [pathname])

  return null
}
