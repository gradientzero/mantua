/**
 * As-you-type search over the wiki — a tiny, dependency-free BM25F ranker.
 *
 * The corpus is small (every visible note and hub), so the whole index is
 * built client-side in a few milliseconds and every keystroke is scored
 * synchronously — no fetch, no debounce. Fields are weighted
 * title ≫ tags > summary, which is what puts title hits first; the token
 * still being typed matches as a prefix so results appear from the first
 * character. No stemming — a completed token that matches nothing exactly
 * falls back to prefix matching, which covers plurals and word endings well
 * enough at this scale.
 *
 * `lib/content.ts` produces the docs (draft filtering lives there);
 * `components/search.tsx` owns the UI.
 */

export interface SearchDoc {
  title: string
  summary: string
  tags: string[]
  url: string
  kind: 'note' | 'hub'
  status: 'draft' | 'published'
}

export interface QueryTerm {
  text: string
  /** Match as a prefix — true for the token the user is still typing. */
  prefix: boolean
}

export interface SearchResult {
  doc: SearchDoc
  score: number
  /** Every query term matched somewhere in this doc. */
  matchedAll: boolean
}

export interface HighlightSegment {
  text: string
  hit: boolean
}

// Field order everywhere below: [title, tags, summary].
const FIELD_WEIGHT = [5, 2.5, 1]
// Length-normalisation strength per field (BM25 "b") — titles and tags are
// uniformly short, so they get little of it.
const FIELD_B = [0.3, 0.2, 0.75]
// Term-frequency saturation (BM25 "k1").
const K1 = 1.2
const MAX_TERMS = 8

interface IndexEntry {
  doc: SearchDoc
  /** Folded title tokens, for the starts-with-the-query bonus. */
  titleTokens: string[]
  /** Per-field term frequencies. */
  tf: Map<string, number>[]
  /** Per-field token counts. */
  len: number[]
}

export interface SearchIndex {
  entries: IndexEntry[]
  avgLen: number[]
  /** term → entry ids containing it in any field (ascending, deduped). */
  postings: Map<string, number[]>
  /** Sorted vocabulary, for prefix expansion. */
  vocab: string[]
}

interface Token {
  text: string
  start: number
  end: number
}

const WORD_RE = /[\p{L}\p{N}]+/gu

/** Case/diacritic folding — comparisons happen in this space. */
const fold = (s: string): string => s.normalize('NFKD').replace(/\p{M}+/gu, '').toLowerCase()

/** Words with their offsets in the original string (offsets drive highlighting). */
function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  for (const m of text.matchAll(WORD_RE)) {
    tokens.push({ text: fold(m[0]), start: m.index!, end: m.index! + m[0].length })
  }
  return tokens
}

export function buildIndex(docs: SearchDoc[]): SearchIndex {
  const entries: IndexEntry[] = []
  const postings = new Map<string, number[]>()
  const avgLen = [0, 0, 0]

  docs.forEach((doc, id) => {
    const fieldTokens = [doc.title, doc.tags.join(' '), doc.summary].map((text) =>
      tokenize(text).map((t) => t.text),
    )
    const tf = fieldTokens.map((tokens) => {
      const counts = new Map<string, number>()
      for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1)
      return counts
    })
    const seen = new Set(fieldTokens.flat())
    for (const term of seen) {
      const list = postings.get(term)
      if (list) list.push(id)
      else postings.set(term, [id])
    }
    fieldTokens.forEach((tokens, f) => (avgLen[f] += tokens.length))
    entries.push({ doc, titleTokens: fieldTokens[0], tf, len: fieldTokens.map((t) => t.length) })
  })

  for (let f = 0; f < avgLen.length; f++) avgLen[f] = avgLen[f] / docs.length || 1
  return { entries, avgLen, postings, vocab: [...postings.keys()].sort() }
}

/**
 * A query becomes folded terms; the last one matches as a prefix unless the
 * user typed past it (trailing space/punctuation = the token is finished).
 */
export function parseQuery(query: string): QueryTerm[] {
  const tokens = tokenize(query).slice(0, MAX_TERMS)
  const finished = /[\s\p{P}]$/u.test(query)
  return tokens.map((t, i) => ({ text: t.text, prefix: i === tokens.length - 1 && !finished }))
}

const lowerBound = (arr: string[], target: string): number => {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

/** All vocabulary terms starting with `prefix`. */
function expand(vocab: string[], prefix: string): string[] {
  const out: string[] = []
  for (let i = lowerBound(vocab, prefix); i < vocab.length && vocab[i].startsWith(prefix); i++) {
    out.push(vocab[i])
  }
  return out
}

const titleStartsWith = (titleTokens: string[], terms: QueryTerm[]): boolean =>
  terms.length <= titleTokens.length && terms.every((t, i) => titleTokens[i].startsWith(t.text))

/** Ranked matches, best first. Returns every match — callers slice. */
export function search(index: SearchIndex, query: string, limit = Infinity): SearchResult[] {
  const terms = parseQuery(query)
  if (terms.length === 0) return []
  const { entries, avgLen, postings, vocab } = index
  const n = entries.length
  const score = new Float64Array(n)
  const matched = new Uint8Array(n)

  for (const term of terms) {
    // Exact match when the token is finished and known; prefix expansion
    // otherwise (as-you-type, plus the no-stemming fallback).
    const expanded =
      !term.prefix && postings.has(term.text) ? [term.text] : expand(vocab, term.text)
    if (expanded.length === 0) continue

    // The expansion behaves as one pseudo-term: per-doc tf summed over the
    // matching vocabulary, df = number of docs matching any of it.
    const docTf = new Map<number, number[]>()
    for (const t of expanded) {
      for (const id of postings.get(t)!) {
        let per = docTf.get(id)
        if (!per) docTf.set(id, (per = [0, 0, 0]))
        for (let f = 0; f < per.length; f++) per[f] += entries[id].tf[f].get(t) ?? 0
      }
    }

    const df = docTf.size
    const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
    for (const [id, per] of docTf) {
      // BM25F: weighted, per-field-normalised tf, saturated once overall.
      let wtf = 0
      for (let f = 0; f < per.length; f++) {
        if (per[f] === 0) continue
        const norm = 1 - FIELD_B[f] + (FIELD_B[f] * entries[id].len[f]) / avgLen[f]
        wtf += (FIELD_WEIGHT[f] * per[f]) / norm
      }
      score[id] += idf * (wtf / (K1 + wtf))
      matched[id] += 1
    }
  }

  const results: SearchResult[] = []
  for (let id = 0; id < n; id++) {
    if (matched[id] === 0) continue
    // The intuitive top hit while typing: the title begins with the query.
    const s = titleStartsWith(entries[id].titleTokens, terms) ? score[id] * 1.35 : score[id]
    results.push({ doc: entries[id].doc, score: s, matchedAll: matched[id] === terms.length })
  }
  results.sort(
    (a, b) =>
      Number(b.matchedAll) - Number(a.matchedAll) ||
      b.score - a.score ||
      a.doc.title.localeCompare(b.doc.title),
  )
  return results.slice(0, limit)
}

/**
 * Split display text into plain/hit segments for <mark> rendering. A word is
 * hit when it starts with any query term; only the typed prefix is marked
 * (the whole word when it matches exactly), so the emphasis mirrors what the
 * user entered.
 */
export function highlight(text: string, terms: QueryTerm[]): HighlightSegment[] {
  if (terms.length === 0) return [{ text, hit: false }]
  const segments: HighlightSegment[] = []
  let pos = 0
  for (const token of tokenize(text)) {
    let hitLen = 0
    for (const term of terms) {
      if (token.text === term.text) {
        hitLen = token.end - token.start
        break
      }
      if (token.text.startsWith(term.text)) {
        hitLen = Math.max(hitLen, Math.min(term.text.length, token.end - token.start))
      }
    }
    if (hitLen === 0) continue
    if (token.start > pos) segments.push({ text: text.slice(pos, token.start), hit: false })
    segments.push({ text: text.slice(token.start, token.start + hitLen), hit: true })
    pos = token.start + hitLen
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), hit: false })
  return segments
}
