/**
 * Wikilink support: `[[target-slug]]` and `[[target-slug|Custom label]]`.
 *
 * Two halves, kept deliberately in sync via the same regex:
 *
 * 1. `remarkWikilinks` — a remark plugin (run by Velite while compiling MDX)
 *    that turns wikilink syntax inside text into ordinary link nodes with the
 *    pseudo-protocol `wikilink:<target>`. Resolution to a real URL/title
 *    happens later, at render time, in `components/mdx.tsx` — that is where
 *    the full content graph is available.
 *
 * 2. `extractWikilinks` — a plain-text scan used by `velite.config.ts` to
 *    store each document's outgoing wikilink targets in the build output.
 *    Backlinks ("pages that link here") are computed by inverting these
 *    lists in `lib/content.ts`.
 *
 * Targets are note/hub SLUGS (not titles). Matching is case-insensitive and
 * trimmed, so `[[Model-Distillation]]` resolves to the slug
 * `model-distillation`.
 */

import { visit } from 'unist-util-visit'
import type { Root, PhrasingContent } from 'mdast'

export const WIKILINK_PROTOCOL = 'wikilink:'

// [[target]] or [[target|label]] — target and label must not contain [, ] or |
const WIKILINK_RE = /\[\[([^[\]|]+?)(?:\|([^[\]|]+?))?\]\]/g

export const normalizeTarget = (target: string): string => target.trim().toLowerCase()

/** Remark plugin: rewrite [[wikilinks]] in text nodes into link nodes. */
export function remarkWikilinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return
      if (parent.type === 'link' || parent.type === 'linkReference') return

      const value = node.value
      WIKILINK_RE.lastIndex = 0
      if (!WIKILINK_RE.test(value)) return
      WIKILINK_RE.lastIndex = 0

      const replacement: PhrasingContent[] = []
      let cursor = 0
      for (const match of value.matchAll(WIKILINK_RE)) {
        const [raw, target, label] = match
        const start = match.index
        if (start > cursor) {
          replacement.push({ type: 'text', value: value.slice(cursor, start) })
        }
        replacement.push({
          type: 'link',
          url: WIKILINK_PROTOCOL + normalizeTarget(target),
          children: [{ type: 'text', value: (label ?? target).trim() }],
        })
        cursor = start + raw.length
      }
      if (cursor < value.length) {
        replacement.push({ type: 'text', value: value.slice(cursor) })
      }

      parent.children.splice(index, 1, ...replacement)
      return index + replacement.length
    })
  }
}

/**
 * Extract outgoing wikilink targets from raw markdown (frontmatter already
 * stripped by Velite). Code fences and inline code are removed first so that
 * documentation ABOUT wikilink syntax doesn't create phantom links — mirroring
 * remark, which never transforms text inside code nodes.
 */
export function extractWikilinks(raw: string): string[] {
  const withoutCode = raw
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1`*\s*$/gm, '')
    .replace(/`[^`\n]*`/g, '')
  const targets = new Set<string>()
  for (const match of withoutCode.matchAll(WIKILINK_RE)) {
    targets.add(normalizeTarget(match[1]))
  }
  return [...targets]
}
