'use client'

/**
 * The header search bar: as-you-type, keyboard-first, entirely client-side.
 *
 * The layout (a server component) passes in every visible page via
 * `searchDocs()`; the BM25F index (lib/search.ts) is built once and each
 * keystroke is scored synchronously — no fetch, no debounce, results with
 * the first character. `/` or ⌘K focuses it from anywhere; ↑↓ move,
 * ↵ opens, esc dismisses.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DraftBadge } from '@/components/note-list'
import {
  buildIndex,
  highlight,
  parseQuery,
  search,
  type QueryTerm,
  type SearchDoc,
} from '@/lib/search'

/** Rows rendered in the panel; the footer reports the full match count. */
const MAX_SHOWN = 20

function Highlighted({ text, terms }: { text: string; terms: QueryTerm[] }) {
  return (
    <>
      {highlight(text, terms).map((seg, i) =>
        seg.hit ? <mark key={i}>{seg.text}</mark> : <span key={i}>{seg.text}</span>,
      )}
    </>
  )
}

export function SiteSearch({ docs }: { docs: SearchDoc[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const index = useMemo(() => buildIndex(docs), [docs])
  const terms = useMemo(() => parseQuery(query), [query])
  const matches = useMemo(
    () => (terms.length > 0 ? search(index, query) : []),
    [index, query, terms],
  )
  const shown = matches.slice(0, MAX_SHOWN)
  const showPanel = open && terms.length > 0

  // `/` or ⌘K focuses the search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey
      const cmdK = e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)
      if (!slash && !cmdK) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable))
        return
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Click / tap anywhere outside dismisses the panel.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the active option visible while arrowing through the list.
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const dismiss = () => {
    setOpen(false)
    setActive(0)
  }

  const go = (url: string) => {
    dismiss()
    setQuery('')
    inputRef.current?.blur()
    router.push(url)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (matches.length === 0) return
      if (!showPanel) {
        setOpen(true)
        return
      }
      const delta = e.key === 'ArrowDown' ? 1 : -1
      setActive((a) => (a + delta + shown.length) % shown.length)
      return
    }
    if (e.key === 'Enter') {
      if (showPanel && shown[active]) {
        e.preventDefault()
        go(shown[active].doc.url)
      } else if (matches.length > 0) {
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      if (showPanel) dismiss()
      else inputRef.current?.blur()
    }
  }

  return (
    <div className="site-search" role="search" ref={rootRef}>
      <svg className="site-search-icon" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <input
        ref={inputRef}
        className="site-search-input"
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="site-search-listbox"
        aria-activedescendant={showPanel && shown[active] ? `site-search-option-${active}` : undefined}
        aria-autocomplete="list"
        aria-label="Search the wiki"
        placeholder="Search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(e.target.value.trim().length > 0)
        }}
        onFocus={() => setOpen(query.trim().length > 0)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
      />
      {query === '' && (
        <kbd className="site-search-kbd" aria-hidden="true">
          /
        </kbd>
      )}
      {showPanel && (
        <div className="site-search-panel">
          {shown.length > 0 ? (
            <>
              <ul
                className="site-search-results"
                id="site-search-listbox"
                role="listbox"
                aria-label="Search results"
                ref={listRef}
              >
                {shown.map((result, i) => (
                  <li
                    key={result.doc.url}
                    id={`site-search-option-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={
                      i === active ? 'site-search-option site-search-option-active' : 'site-search-option'
                    }
                    onPointerMove={() => active !== i && setActive(i)}
                  >
                    <Link
                      href={result.doc.url}
                      className="site-search-option-link"
                      tabIndex={-1}
                      onClick={() => {
                        dismiss()
                        setQuery('')
                      }}
                    >
                      <span className="site-search-option-head">
                        <span className="site-search-option-title">
                          <Highlighted text={result.doc.title} terms={terms} />
                        </span>
                        {result.doc.kind === 'hub' && <span className="site-search-flag">hub</span>}
                        <DraftBadge status={result.doc.status} />
                      </span>
                      <span className="site-search-option-summary">
                        <Highlighted text={result.doc.summary} terms={terms} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="site-search-foot">
                <span>
                  {matches.length === 1 ? '1 match' : `${matches.length} matches`}
                  {matches.length > shown.length ? ` · top ${shown.length} shown` : ''}
                </span>
                <span>↑↓ · ↵ open · esc</span>
              </div>
            </>
          ) : (
            <p className="site-search-empty">Nothing matches “{query.trim()}”.</p>
          )}
        </div>
      )}
    </div>
  )
}
