/**
 * Lexical similarity between pages — how much two notes are *about* the same
 * thing, measured from their prose. `lib/graph.ts` turns it into a spring
 * stiffness so the map clusters by topic and not only by who links whom.
 *
 * Plain tf-idf cosine, no embeddings: no API key, no model download, no cached
 * artifact to invalidate. It is a pure function of the content, which is what
 * keeps the graph layout identical on every load and every build.
 *
 * The corpus is ~1,300 words a note, so body text is the signal. Titles and
 * summaries (what `lib/search.ts` indexes) are ~30 words and far too thin —
 * most pairs would score zero, and what survived would mostly restate tag
 * overlap, which the tag edges already draw.
 *
 * `termCounts` runs inside the Velite transform (velite.config.ts), so this
 * module must stay free of `#site/content` and of anything Node-only.
 */

import { fold } from './search'

/** Folded term → count in one document. */
export type TermCounts = Record<string, number>
/** Folded term → tf-idf weight, L2-normalised so a dot product is a cosine. */
export type Vector = Map<string, number>

const WORD_RE = /[\p{L}\p{N}]+/gu

/**
 * Function words carry no topic. Domain-ubiquitous words ("agent", "model")
 * are deliberately *not* listed — idf already discounts anything that shows up
 * everywhere, and it does so from this corpus rather than from a guess.
 */
const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been
   before being below between both but by can cannot could did do does doing don down
   during each few for from further had has have having he her here hers herself him
   himself his how i if in into is it its itself just me more most my myself no nor not
   now of off on once only or other others ought our ours ourselves out over own same
   she should so some such than that the their theirs them themselves then there these
   they this those through to too under until up very was we were what when where which
   while who whom why will with would you your yours yourself yourselves
   isn aren wasn weren don doesn didn won wouldn couldn shouldn its it s t re ve ll d m
   one two three thing things way ways lot much many get got make makes made take takes
   like really quite still even yet already often sometimes always never
   thats theres heres whats dont doesnt didnt wont cant isnt arent wasnt werent`
    .split(/\s+/)
    .filter(Boolean),
)

/**
 * Prose tokens of a markdown/MDX source, as folded term counts.
 *
 * Everything that isn't authored prose is stripped first: frontmatter, code
 * (fenced and inline), JSX tags and their attributes, import/export lines,
 * URLs, and markdown punctuation.
 *
 * Wikilinks are a deliberate special case — `[[slug|label]]` keeps only the
 * label, and a bare `[[slug]]` is dropped entirely. A bare target is structure,
 * not writing, and counting it would let an edge's weight be partly a
 * restatement of that same edge. Similarity has to be independent of topology
 * for weighting the topology to mean anything.
 */
export function termCounts(text: string): TermCounts {
  const prose = text
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, ' ') // frontmatter
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/^[ \t]*(?:import|export)\s.*$/gm, ' ') // MDX module scope
    .replace(/`[^`\n]*`/g, ' ') // inline code
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, ' $2 ') // wikilink: keep the label
    .replace(/\[\[[^\]]+\]\]/g, ' ') // bare wikilink: structure, not prose
    .replace(/<[^>]+>/g, ' ') // JSX / HTML tags with their attributes
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, ' $1 ') // markdown links: keep the text
    .replace(/https?:\/\/\S+/g, ' ')

  const counts: TermCounts = {}
  for (const m of prose.matchAll(WORD_RE)) {
    const term = fold(m[0])
    // Two characters is the floor because "ai" and "ml" are real terms here.
    if (term.length < 2) continue
    if (/^\d+$/.test(term)) continue // years, versions, figures
    if (STOPWORDS.has(term)) continue
    counts[term] = (counts[term] ?? 0) + 1
  }
  return counts
}

/**
 * One L2-normalised tf-idf vector per document, keyed by id.
 *
 * Documents with nothing to measure (no qualifying terms, so a zero norm) are
 * **left out of the map** rather than given a zero vector — a caller that
 * can't find a vector treats the pair as unweighted, which is the right answer
 * and avoids a 0/0 cosine.
 *
 * tf is log-scaled (`1 + ln tf`) so a word used thirty times doesn't dominate a
 * page; idf is smoothed so a term present in every document contributes ~0.
 */
export function similarityVectors(
  docs: readonly { id: string; terms: TermCounts }[],
): Map<string, Vector> {
  const df = new Map<string, number>()
  for (const doc of docs) {
    for (const term of Object.keys(doc.terms)) df.set(term, (df.get(term) ?? 0) + 1)
  }

  const n = docs.length
  const vectors = new Map<string, Vector>()
  for (const doc of docs) {
    const vec: Vector = new Map()
    let norm = 0
    for (const [term, tf] of Object.entries(doc.terms)) {
      if (tf <= 0) continue
      const idf = Math.log(1 + (n - df.get(term)!) / (df.get(term)! + 0.5))
      if (idf <= 0) continue
      const w = (1 + Math.log(tf)) * idf
      vec.set(term, w)
      norm += w * w
    }
    if (norm <= 0 || vec.size === 0) continue // nothing to compare — see above
    const inv = 1 / Math.sqrt(norm)
    for (const [term, w] of vec) vec.set(term, w * inv)
    vectors.set(doc.id, vec)
  }
  return vectors
}

/** Cosine of two normalised vectors — walk the shorter one. */
export function cosine(a: Vector, b: Vector): number {
  const [short, long] = a.size <= b.size ? [a, b] : [b, a]
  let dot = 0
  for (const [term, w] of short) {
    const other = long.get(term)
    if (other !== undefined) dot += w * other
  }
  return dot
}
