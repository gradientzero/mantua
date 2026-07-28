'use client'

/**
 * Force-directed graph of the wiki's link structure, rendered to <canvas> —
 * the notebook as a map. Every page is a paper disc with its title set inside
 * in the editorial face: a hairline ink ring when published, a soft amber halo
 * when still a draft. Tags are hollow rings in mono, "missing" nodes
 * (wikilink targets nobody has written yet) are dashed.
 *
 * Self-contained on purpose: a small deterministic force simulation (link
 * springs, pairwise repulsion, collision, a soft wall — d3-force's recipe,
 * without the dependency). At notebook scale the O(n²) pair pass is nothing,
 * and with no randomness the layout is identical on every load.
 *
 * The opening is composed, not just watched: nodes are seeded on a radial tree
 * of the graph's own breadth-first structure, the first violent second of the
 * settle is spent off-screen, and the auto-framing camera eases toward the fit
 * instead of re-solving it every frame. What the reader sees is a map that is
 * already structured, breathing into place.
 *
 * Because the label lives *inside* the disc, the label decides the radius:
 * each title is wrapped at whichever measure gives the tightest enclosing
 * circle, and springs and collision both rest at `r + r + gap`, so
 * well-connected pages earn their room instead of piling into a knot. Nothing
 * pulls on the middle of the map — only a soft wall out at the radius the discs
 * could possibly need — so the interior is free to fall into whatever shape the
 * links imply. Two things shape it from outside that: springs crossing between
 * clusters rest longer and pull less than springs inside one, which opens the
 * seams enough to see them, and the whole outline is leaned toward the panel's
 * proportions by an area-preserving stretch, so a wide screen gets a wide map
 * rather than a ball with empty margins.
 *
 * Interactions: drag nodes; drag the background to pan; wheel/pinch to zoom;
 * hover to spotlight a neighborhood. Click pins a node — the spotlight stays
 * on its neighborhood while the cursor roams — click the background to
 * unpin, double-click (or cmd/ctrl-click) to open the page. Titles ease out
 * as you zoom past the point where they'd be legible and back in as you
 * return. Colors are read from the design tokens at runtime so the map stays
 * on the e-ink palette.
 */

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GraphData, GraphLinkKind, GraphNode } from '@/lib/graph'

interface LabelBlock {
  lines: string[]
  w: number
  h: number
  lineH: number
  /** True when the title outran `maxLines` and ends in an ellipsis. */
  clipped: boolean
}

interface SimNode {
  id: string
  data: GraphNode
  degree: number
  r: number
  charge: number
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
  /** The title set inside the disc: graph-space font, wrapped block, eased alpha. */
  font: string
  fontSize: number
  block: LabelBlock
  la: number
  lt: number
}

interface SimLink {
  source: SimNode
  target: SimNode
  kind: GraphLinkKind
  /** Rest clearance between the two rims, stretched for a bridge. */
  gap: number
  dist: number
  strength: number
}

interface View {
  k: number
  tx: number
  ty: number
}

const TAU = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const ALPHA_MIN = 0.002
/** A shade slower than d3's 0.0228: this settle is meant to be watched. */
const ALPHA_DECAY = 0.019
const VELOCITY_KEEP = 0.62
/**
 * Speed ceiling per tick, in graph units. Only one thing in a force layout
 * really reads as chaos — a node flung clear across the map by a repulsion
 * spike at near-zero distance — and a ceiling stops that without having any
 * effect on the shape the forces settle into.
 */
const MAX_SPEED = 22
const MAX_REPEL_DIST2 = 1100 * 1100
const ZOOM_MIN = 0.15
const ZOOM_MAX = 4
/** Zoom-to-fit stops here: the label sizes are tuned to read at k ≈ 1. */
const FIT_MAX_K = 1.15
const FIT_MS = 180 // --duration-base
/**
 * How fast the auto-framing camera chases the layout while it settles. Solving
 * the fit fresh every frame — the obvious thing — is what made the opening feel
 * jumpy: the whole map rescales under the reader every time the outline
 * changes. Easing toward the same answer costs nothing and reads as one slow
 * pull-back.
 */
const CAM_EASE = 0.12
/**
 * The opening is played from here rather than from a standing start: a cold
 * layout is stepped silently until alpha falls to this, so the reader gets the
 * gentle back half of the settle and never the violent first second of it.
 */
const PRESETTLE_ALPHA = 0.25
const PRESETTLE_MAX_TICKS = 400
/**
 * How long the first frame waits on the webfonts. Every disc radius comes from
 * measured text, so a map laid out on Georgia's metrics has to be rebuilt when
 * Cormorant lands — and rebuilding a map the reader is already looking at is
 * exactly the lurch this file is trying to avoid. A beat of empty panel is the
 * cheaper trade, but only a beat.
 */
const FONT_WAIT_MS = 700

/**
 * Breathing room collision keeps between two discs. Wide enough that the
 * links stay visible between them — packed edge to edge, the discs hide the
 * very structure the map is drawing.
 */
const COLLIDE_GAP = 36
/** Share of an overlap that collision resolves per relaxation pass. */
const COLLIDE_PUSH = 0.68
/**
 * Fraction of the map's area the discs would cover if they were packed, which is
 * how the containing wall is sized — generously, since the wall is a backstop
 * against sprawl and not a hand on the map. It scales with the notebook instead
 * of being a constant somebody has to retune every time the wiki grows.
 */
const PACK_FILL = 0.16
/** Strength of the wall's pull, growing with how far past it a node has drifted. */
const BOUND_PULL = 0.055
/**
 * How hard the outline is leaned toward the panel's proportions each tick, as an
 * area-preserving stretch, and the ceiling on any single tick's worth of it. A
 * change of frame rather than a force — it trades vertical reach for horizontal
 * on a wide screen without compressing anything, which is where the aspect-
 * shaped centering this replaces went wrong, and the springs argue back freely.
 */
const SHAPE_EASE = 0.18
const SHAPE_MAX = 1.02
/**
 * How much longer, at most, a spring rests when its two pages share none of
 * their neighbours. Uniform spring lengths on a graph this densely linked
 * settle into one undifferentiated ball; letting the bridges stretch while the
 * springs inside a cluster stay short is what pulls the clusters apart far
 * enough to see the seams.
 */
const BRIDGE_STRETCH = 0.65
/** And how much of a bridge spring's pull is given up in that bargain. */
const BRIDGE_SLACK = 0.38
/**
 * Pointer travel, in CSS pixels, that separates a click from a drag. Below it a
 * press is a selection and the layout must not move at all; past it the node is
 * being dragged and the simulation reheats to follow.
 */
const CLICK_SLOP = 5
/**
 * Candidate measures for wrapping a title, as multiples of its own type size.
 * The floor matters as much as the tightest fit: narrower than about six ems
 * and titles break into one-word lines, which is compact and unreadable.
 */
const WRAP_EMS = [6, 7.2, 8.6, 10.2, 12, 14]
/**
 * How much wider a disc may get to show a title whole rather than cut it. A
 * circle is a wasteful frame for a wide block, and every extra graph unit here
 * is paid for by the whole map zooming out — so the slack is bounded.
 */
const UNCUT_SLACK = 1.22

const labelSizeFor = (kind: GraphNode['kind'], degree: number): number =>
  kind === 'tag' ? 10.5 : kind === 'missing' ? 11.5 : 12.5 + Math.min(3.5, 0.6 * Math.sqrt(degree))

/** Page titles here run to seventy-odd characters; a circle needs the depth. */
const maxLinesFor = (kind: GraphNode['kind']): number =>
  kind === 'tag' ? 3 : kind === 'missing' ? 4 : 7

/** Clearance between the text block and the rim, in graph units. */
const labelPadFor = (kind: GraphNode['kind']): number =>
  kind === 'tag' ? 4.5 : kind === 'missing' ? 5 : 7

/** Floor on the disc, so a one-word page still reads as a node and not a dot. */
const minRadiusFor = (kind: GraphNode['kind'], degree: number): number =>
  kind === 'tag'
    ? 9 + 0.9 * Math.sqrt(degree)
    : kind === 'missing'
      ? 10
      : 15 + 1.8 * Math.sqrt(degree)

/**
 * Springs rest well clear of both discs; busy pages get a longer leash. Long
 * enough matters more than it looks: a spring that rests barely past the
 * collision gap leaves collision to decide the geometry, and collision knows
 * nothing about the links — fifty discs packed into a raft, every line hidden
 * underneath them. Give the springs room and the links do the arranging.
 */
const linkGapFor = (kind: GraphLinkKind, busy: number): number =>
  (kind === 'tag' ? 34 : 56) + Math.min(34, 3.4 * Math.sqrt(busy))

/**
 * Repulsion grows with the disc: collision and the spring rest lengths
 * guarantee clearance between *linked* pages, and charge is what keeps
 * unrelated ones from drifting into the same corner. Every unit of the
 * inflation it causes is a unit of zoom the titles lose, so it is set as low as
 * will still open the seams between clusters.
 */
const chargeFor = (kind: GraphNode['kind'], r: number): number =>
  -(2.9 * r + 105) * (kind === 'note' || kind === 'hub' ? 1 : 0.8)

/** Deterministic stand-in for the tiny random nudges d3 uses to split overlaps. */
const jiggle = (i: number): number => ((((i + 1) * 2654435761) % 100000) / 100000 - 0.5) * 1e-3

/** Radius of the smallest circle that holds a text block plus its padding. */
const blockRadius = (b: LabelBlock, pad: number): number => Math.hypot(b.w / 2, b.h / 2) + pad

/** Wrap points: whitespace, the dashes, colons and slashes titles are built from. */
const BREAK_AFTER = new Set([' ', '-', '–', '—', ':', '/'])

/**
 * Greedy word wrap for canvas text, breaking after spaces and punctuation
 * (missing-page labels are hyphenated slugs, titles carry dashes and colons),
 * with an ellipsis when the title outruns `maxLines`. Cached per
 * (font, width, text) — measureText is not free and the same titles are
 * re-measured across toggles.
 */
function wrapLabel(
  ctx: CanvasRenderingContext2D,
  cache: Map<string, LabelBlock>,
  raw: string,
  font: string,
  maxW: number,
  maxLines: number,
  lineH: number,
): LabelBlock {
  const key = `${font}|${maxW}|${maxLines}|${raw}`
  const hit = cache.get(key)
  if (hit) return hit
  ctx.font = font

  const pieces: string[] = []
  let from = 0
  for (let i = 0; i < raw.length; i++) {
    if (BREAK_AFTER.has(raw[i])) {
      pieces.push(raw.slice(from, i + 1))
      from = i + 1
    }
  }
  if (from < raw.length) pieces.push(raw.slice(from))

  const lines: string[] = []
  let line = ''
  let overflow = false
  for (const piece of pieces) {
    const probe = line + piece
    if (line && ctx.measureText(probe.trimEnd()).width > maxW) {
      lines.push(line.trimEnd())
      line = piece
      if (lines.length === maxLines) {
        overflow = true
        break
      }
    } else {
      line = probe
    }
  }
  if (!overflow && line.trimEnd()) lines.push(line.trimEnd())
  if (overflow) {
    let last = lines[maxLines - 1]
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1)
    lines[maxLines - 1] = `${last}…`
  }

  let w = 1
  for (const l of lines) w = Math.max(w, ctx.measureText(l).width)
  const block = { lines, w, h: lines.length * lineH, lineH, clipped: overflow }
  cache.set(key, block)
  return block
}

/**
 * Wrap at whichever measure encloses most tightly. A long title set on one
 * wide line needs a huge circle; broken too narrow it needs a tall one — the
 * squarest block encloses smallest, and small discs are what keep the map
 * zoomed in far enough to read. Showing a title whole is worth a wider disc,
 * but only up to `UNCUT_SLACK`; past that the title takes an ellipsis and the
 * page keeps its full name on hover and in the text listings.
 */
function fitLabel(
  ctx: CanvasRenderingContext2D,
  cache: Map<string, LabelBlock>,
  raw: string,
  font: string,
  size: number,
  maxLines: number,
  lineH: number,
  pad: number,
): LabelBlock {
  let tightest: LabelBlock | null = null
  let tightestR = Infinity
  let uncut: LabelBlock | null = null
  let uncutR = Infinity
  for (const em of WRAP_EMS) {
    const maxW = em * size
    const block = wrapLabel(ctx, cache, raw, font, maxW, maxLines, lineH)
    const r = blockRadius(block, pad)
    if (r < tightestR) {
      tightest = block
      tightestR = r
    }
    if (!block.clipped && r < uncutR) {
      uncut = block
      uncutR = r
    }
    // Once a title fits on a single line, wider measures only add slack.
    if (block.lines.length === 1) break
  }
  return uncut && uncutR <= tightestR * UNCUT_SLACK ? uncut : tightest!
}

/**
 * Overlap between two pages' neighbourhoods, ignoring each other: 1 when they
 * keep exactly the same company, 0 when the only thing they share is the link
 * between them. Cheap at notebook scale, and it is the whole basis for telling
 * a spring inside a cluster from a spring bridging two.
 */
function jaccard(adjacency: Map<string, Set<string>>, a: string, b: string): number {
  const A = adjacency.get(a)
  const B = adjacency.get(b)
  if (!A || !B) return 0
  const [small, big] = A.size <= B.size ? [A, B] : [B, A]
  let shared = 0
  for (const id of small) if (big.has(id)) shared++
  // a is in B and b is in A; neither counts as shared context.
  const union = A.size + B.size - shared - 2
  return union > 0 ? shared / union : 0
}

/**
 * Deterministic starting positions from the graph's own shape: a radial tree
 * over its breadth-first forest, rooted at the busiest page, each subtree given
 * an angular wedge in proportion to its size and each depth a ring wide enough
 * to seat its members.
 *
 * The point is the first frame. Seeding on a phyllotaxis spiral — pretty, and
 * what this used to do — puts linked pages on opposite sides of the map, and
 * the springs then have to haul them across each other; that scramble *is* the
 * chaotic opening. Seeded on structure, neighbours start as neighbours, and the
 * simulation has nothing left to do but tidy.
 */
function seedLayout(
  ids: string[],
  radii: Map<string, number>,
  adjacency: Map<string, Set<string>>,
): Map<string, { x: number; y: number }> {
  const seed = new Map<string, { x: number; y: number }>()
  const radiusOf = (id: string) => radii.get(id) ?? 16
  const degreeOf = (id: string) => adjacency.get(id)?.size ?? 0
  // Busiest first, ties by slug: the roots — and every wedge below them — have
  // to come out the same on every load.
  const byRank = [...ids].sort((a, b) => degreeOf(b) - degreeOf(a) || (a < b ? -1 : 1))

  const seen = new Set<string>()
  let placed = 0
  let claimed = 0

  for (const root of byRank) {
    if (seen.has(root)) continue

    // Breadth-first tree for this component.
    const order = [root]
    const depth = new Map([[root, 0]])
    const kids = new Map<string, string[]>()
    seen.add(root)
    for (let i = 0; i < order.length; i++) {
      const id = order[i]
      const mine: string[] = []
      const neighbours = [...(adjacency.get(id) ?? [])].sort(
        (a, b) => degreeOf(b) - degreeOf(a) || (a < b ? -1 : 1),
      )
      for (const next of neighbours) {
        if (seen.has(next)) continue
        seen.add(next)
        depth.set(next, depth.get(id)! + 1)
        mine.push(next)
        order.push(next)
      }
      kids.set(id, mine)
    }

    // Leaf counts, bottom-up: how wide a wedge each subtree has earned.
    const weight = new Map<string, number>()
    for (let i = order.length - 1; i >= 0; i--) {
      let w = 0
      for (const kid of kids.get(order[i])!) w += weight.get(kid)!
      weight.set(order[i], Math.max(1, w))
    }

    // Ring radii: each depth needs circumference for its members, and has to
    // clear the ring inside it.
    const tiers: string[][] = []
    for (const id of order) (tiers[depth.get(id)!] ??= []).push(id)
    const ring = [0]
    for (let d = 1; d < tiers.length; d++) {
      let need = 0
      let widest = 0
      for (const id of tiers[d]) {
        need += 2 * radiusOf(id) + COLLIDE_GAP
        widest = Math.max(widest, radiusOf(id))
      }
      let inner = 0
      for (const id of tiers[d - 1]) inner = Math.max(inner, radiusOf(id))
      ring[d] = Math.max(ring[d - 1] + inner + widest + COLLIDE_GAP * 1.5, need / TAU)
    }

    // Wedges, top-down. The root sits in the middle and owns the full circle.
    const wedge = new Map<string, [number, number]>([[root, [0, TAU]]])
    let reach = radiusOf(root)
    for (const id of order) {
      const [from, to] = wedge.get(id)!
      const d = depth.get(id)!
      const at = ring[d]
      const angle = (from + to) / 2
      seed.set(id, { x: Math.cos(angle) * at, y: Math.sin(angle) * at })
      reach = Math.max(reach, at + radiusOf(id))
      const mine = kids.get(id)!
      if (mine.length === 0) continue
      let total = 0
      for (const kid of mine) total += weight.get(kid)!
      let cut = from
      for (const kid of mine) {
        const share = ((to - from) * weight.get(kid)!) / total
        wedge.set(kid, [cut, cut + share])
        cut += share
      }
    }

    // Later components sit beside the first rather than on top of it.
    if (placed > 0) {
      const angle = placed * GOLDEN_ANGLE
      const off = claimed + reach + COLLIDE_GAP * 2
      for (const id of order) {
        const p = seed.get(id)!
        p.x += Math.cos(angle) * off
        p.y += Math.sin(angle) * off
      }
      claimed = off + reach
    } else {
      claimed = reach
    }
    placed++
  }
  return seed
}

export interface GraphViewProps {
  data: GraphData
  /** Slug to mark as "you are here": accent ring + a stronger pull to the center. */
  focus?: string
  /** CSS height of the canvas panel. */
  height?: string
  /** Toolbar (counts, toggles, fit) and legend — on for the full-page graph. */
  showControls?: boolean
}

export function GraphView({
  data,
  focus,
  height = 'clamp(420px, 72vh, 760px)',
  showControls = true,
}: GraphViewProps) {
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tagsOn, setTagsOn] = useState(true)
  const [missingOn, setMissingOn] = useState(true)

  // Layout, camera and the pinned node survive toggle rebuilds so the map
  // doesn't reshuffle or lose its place.
  const positionsRef = useRef(new Map<string, { x: number; y: number }>())
  const viewRef = useRef<View | null>(null)
  const selectedRef = useRef<string | null>(null)
  const interactedRef = useRef(false)
  const fitRef = useRef<() => void>(() => {})

  const active = useMemo(() => {
    const nodes = data.nodes.filter(
      (n) => (tagsOn || n.kind !== 'tag') && (missingOn || n.kind !== 'missing'),
    )
    const ids = new Set(nodes.map((n) => n.id))
    const links = data.links.filter((l) => ids.has(l.source) && ids.has(l.target))
    return { nodes, links }
  }, [data, tagsOn, missingOn])

  const pageCount = active.nodes.filter((n) => n.kind === 'note' || n.kind === 'hub').length
  const hasTags = data.nodes.some((n) => n.kind === 'tag')
  const hasMissing = data.nodes.some((n) => n.kind === 'missing')
  const hasDrafts = data.nodes.some((n) => n.draft)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const styles = getComputedStyle(document.documentElement)
    const token = (name: string, fallback: string): string =>
      styles.getPropertyValue(name).trim() || fallback
    const color = {
      ink: token('--text-primary', '#000000'),
      secondary: token('--text-secondary', '#565656'),
      muted: token('--text-muted', '#878787'),
      surface: token('--surface', '#ffffff'),
      subtle: token('--border-subtle', '#b2b2b2'),
      accent: token('--link', '#1a56db'),
      draftRing: token('--attention-text', '#92400e'),
      draftHalo: token('--attention-bg', '#fef3c7'),
    }
    const fontEditorial = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
    const fontMono = "'JetBrains Mono', ui-monospace, monospace"
    const labelCache = new Map<string, LabelBlock>()
    // Cormorant is a high-contrast face; at the ten-odd pixels a title is set
    // at here, it needs the heavier italic to hold its own on paper-toned
    // ground. Unwritten pages stay lighter — they are placeholders.
    const fontFor = (kind: GraphNode['kind'], size: number): string =>
      kind === 'tag'
        ? `400 ${size}px ${fontMono}`
        : kind === 'missing'
          ? `italic 500 ${size}px ${fontEditorial}`
          : `italic 700 ${size}px ${fontEditorial}`

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const positions = positionsRef.current
    /** No remembered layout: this is an opening, not a toggle mid-session. */
    const cold = positions.size === 0

    // ---- simulation state --------------------------------------------------

    const degree = new Map<string, number>()
    const adjacency = new Map<string, Set<string>>()
    for (const d of active.nodes) adjacency.set(d.id, new Set())
    for (const l of active.links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1)
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1)
      adjacency.get(l.source)!.add(l.target)
      adjacency.get(l.target)!.add(l.source)
    }
    const inHood = (center: SimNode, n: SimNode): boolean =>
      n === center || (adjacency.get(center.id)?.has(n.id) ?? false)

    /** Measure the title, then let it set the disc it has to fit inside. */
    const layOut = (d: GraphNode, deg: number) => {
      const size = labelSizeFor(d.kind, deg)
      const font = fontFor(d.kind, size)
      const raw = d.kind === 'tag' ? `#${d.label}` : d.label
      const lineH = size * (d.kind === 'tag' ? 1.3 : 1.18)
      const pad = labelPadFor(d.kind)
      const block = fitLabel(ctx, labelCache, raw, font, size, maxLinesFor(d.kind), lineH, pad)
      return { font, size, block, r: Math.max(blockRadius(block, pad), minRadiusFor(d.kind, deg)) }
    }

    // Discs are measured in their own pass, ahead of everything else: the seed
    // layout sizes its rings from the radii and the springs rest on them.
    const laid = active.nodes.map((d) => {
      const deg = degree.get(d.id) ?? 0
      return { d, deg, ...layOut(d, deg) }
    })
    const seed = seedLayout(
      active.nodes.map((d) => d.id),
      new Map(laid.map((l) => [l.d.id, l.r])),
      adjacency,
    )

    const nodes: SimNode[] = laid.map(({ d, deg, font, size, block, r }) => {
      const seat = positions.get(d.id) ?? seed.get(d.id)!
      return {
        id: d.id,
        data: d,
        degree: deg,
        r,
        charge: chargeFor(d.kind, r),
        x: seat.x,
        y: seat.y,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        font,
        fontSize: size,
        block,
        la: 0,
        lt: 0,
      }
    })
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // The pinned ("selected") node: click sets it, background click clears it.
    let selected: SimNode | null =
      selectedRef.current != null ? (byId.get(selectedRef.current) ?? null) : null
    if (!selected) selectedRef.current = null

    // Nodes that just toggled into an existing layout start next to a placed
    // neighbor instead of on the spiral, so the map grows rather than convulses.
    const unplaced = new Set(active.nodes.filter((d) => !positions.has(d.id)).map((d) => d.id))
    if (unplaced.size > 0 && unplaced.size < nodes.length) {
      active.links.forEach((l, i) => {
        const a = byId.get(l.source)!
        const b = byId.get(l.target)!
        if (unplaced.has(a.id) && !unplaced.has(b.id)) {
          a.x = b.x + Math.cos(i * GOLDEN_ANGLE) * (a.r + b.r + COLLIDE_GAP)
          a.y = b.y + Math.sin(i * GOLDEN_ANGLE) * (a.r + b.r + COLLIDE_GAP)
          unplaced.delete(a.id)
        } else if (unplaced.has(b.id) && !unplaced.has(a.id)) {
          b.x = a.x + Math.cos(i * GOLDEN_ANGLE) * (a.r + b.r + COLLIDE_GAP)
          b.y = a.y + Math.sin(i * GOLDEN_ANGLE) * (a.r + b.r + COLLIDE_GAP)
          unplaced.delete(b.id)
        }
      })
    }

    // Springs rest clear of both discs, and busy pages get a longer leash — the
    // extra length is what opens up the highly connected middle of the map. On
    // top of that, a spring is stretched and slackened in proportion to how
    // little its two pages have in common, measured against the closest pair on
    // the map: pages that share a neighbourhood stay tight, a lone link between
    // two otherwise unrelated corners gives way.
    const kinship = active.links.map((l) => jaccard(adjacency, l.source, l.target))
    const closest = kinship.length > 0 ? Math.max(...kinship) : 0
    const links: SimLink[] = active.links.map((l, i) => {
      const source = byId.get(l.source)!
      const target = byId.get(l.target)!
      const busy = Math.min(source.degree, target.degree)
      const apart = closest > 0 ? 1 - kinship[i] / closest : 1
      const gap = linkGapFor(l.kind, busy) * (1 + BRIDGE_STRETCH * apart)
      return {
        source,
        target,
        kind: l.kind,
        gap,
        dist: source.r + target.r + gap,
        strength: (1 - BRIDGE_SLACK * apart) / Math.min(source.degree || 1, target.degree || 1),
      }
    })

    // Big nodes first so small ones (and their titles) draw on top.
    nodes.sort((a, b) => b.r - a.r)

    const focusNode = focus ? byId.get(focus) : undefined

    /**
     * Radius the layout is entitled to, from the area its discs could possibly
     * need — the soft wall in `tick` sits here, so it grows with the notebook
     * rather than against a constant.
     */
    let boundR = 0
    const measureBounds = () => {
      let area = 0
      for (const n of nodes) area += (n.r + COLLIDE_GAP / 2) ** 2
      boundR = Math.sqrt(area / PACK_FILL)
    }
    measureBounds()

    let alpha = cold ? 1 : 0.5
    let alphaTarget = 0

    function tick() {
      alpha += (alphaTarget - alpha) * ALPHA_DECAY

      for (let i = 0; i < links.length; i++) {
        const { source: s, target: t, dist, strength } = links[i]
        let dx = t.x + t.vx - s.x - s.vx
        let dy = t.y + t.vy - s.y - s.vy
        if (dx === 0 && dy === 0) {
          dx = jiggle(i)
          dy = jiggle(i + 7)
        }
        const len = Math.hypot(dx, dy)
        const f = ((len - dist) / len) * alpha * strength
        dx *= f
        dy *= f
        const bias = s.degree / (s.degree + t.degree || 1)
        t.vx -= dx * bias
        t.vy -= dy * bias
        s.vx += dx * (1 - bias)
        s.vy += dy * (1 - bias)
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          let dx = b.x - a.x
          let dy = b.y - a.y
          let d2 = dx * dx + dy * dy
          if (d2 >= MAX_REPEL_DIST2) continue
          if (dx === 0 && dy === 0) {
            dx = jiggle(i * 31 + j)
            dy = jiggle(i + j * 17)
            d2 = dx * dx + dy * dy
          }
          if (d2 < 1) d2 = Math.sqrt(d2) // bound the kick at near-zero distance, as d3 does
          const w = alpha / d2
          a.vx += dx * b.charge * w
          a.vy += dy * b.charge * w
          b.vx -= dx * a.charge * w
          b.vy -= dy * a.charge * w
        }
      }

      // Containment, not compression. The centering this replaces pulled every
      // node toward the middle in proportion to its distance from it, which is a
      // spring to a point: whatever the links were trying to say about
      // structure, the middle squeezed back into a ball. All that holds the map
      // together now is a soft wall out at the radius the discs could possibly
      // need, which says nothing whatsoever about the interior and on a healthy
      // graph is never even touched.
      for (const n of nodes) {
        const past = (n.x * n.x + n.y * n.y) / (boundR * boundR) - 1
        if (past <= 0) continue
        const pull = BOUND_PULL * Math.min(past, 3) * alpha
        n.vx -= n.x * pull
        n.vy -= n.y * pull
      }
      if (focusNode) {
        focusNode.vx -= focusNode.x * 0.16 * alpha
        focusNode.vy -= focusNode.y * 0.16 * alpha
      }

      // Collision. Two relaxation passes: the discs are label-sized now, so one
      // pass leaves visible overlaps once the springs stop helping.
      collide()
      collide()

      let cx = 0
      let cy = 0
      for (const n of nodes) {
        // Ceiling on the step, so no single spike can fling a node across the
        // map — the difference between a layout settling and a layout thrashing.
        const speed2 = n.vx * n.vx + n.vy * n.vy
        if (speed2 > MAX_SPEED * MAX_SPEED) {
          const brake = MAX_SPEED / Math.sqrt(speed2)
          n.vx *= brake
          n.vy *= brake
        }
        if (n.fx != null) {
          n.x = n.fx
          n.vx = 0
        } else {
          n.vx *= VELOCITY_KEEP
          n.x += n.vx
        }
        if (n.fy != null) {
          n.y = n.fy
          n.vy = 0
        } else {
          n.vy *= VELOCITY_KEEP
          n.y += n.vy
        }
        cx += n.x
        cy += n.y
      }

      // Keep the map on its origin with a rigid translation rather than a force,
      // so drift is corrected without anything being said about the shape.
      // Skipped while a node is held: a pinned node and a moving frame of
      // reference only fight each other.
      if (!dragNode && nodes.length > 0) {
        cx /= nodes.length
        cy /= nodes.length
        for (const n of nodes) {
          n.x -= cx
          n.y -= cy
        }
      }

      // Lean the outline toward the panel's proportions. Area-preserving, so
      // nothing is squeezed — reach along the short axis is traded for reach
      // along the long one — and scaled by alpha, so it has finished arguing by
      // the time the map comes to rest.
      if (!dragNode && nodes.length > 1 && alpha > ALPHA_MIN) {
        let mx = 1
        let my = 1
        for (const n of nodes) {
          mx += n.x * n.x
          my += n.y * n.y
        }
        const have = Math.sqrt(mx / my)
        const want = Math.min(Math.max((cw || 1) / (ch || 1), 0.62), 2.05)
        const lean = Math.min(
          Math.max((want / have) ** (SHAPE_EASE * alpha), 1 / SHAPE_MAX),
          SHAPE_MAX,
        )
        for (const n of nodes) {
          n.x *= lean
          n.y /= lean
        }
      }
    }

    /** Keep discs from crowding: nudge any too-close pair apart, mass by area. */
    function collide() {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const min = a.r + b.r + COLLIDE_GAP
          let dx = b.x - a.x
          let dy = b.y - a.y
          if (Math.abs(dx) >= min || Math.abs(dy) >= min) continue
          let d2 = dx * dx + dy * dy
          if (d2 >= min * min) continue
          if (d2 === 0) {
            dx = jiggle(i + j)
            dy = jiggle(i * 13 + j)
            d2 = dx * dx + dy * dy
          }
          const d = Math.sqrt(d2)
          const push = ((min - d) / d) * COLLIDE_PUSH
          const wa = (b.r * b.r) / (a.r * a.r + b.r * b.r)
          a.vx -= dx * push * wa
          a.vy -= dy * push * wa
          b.vx += dx * push * (1 - wa)
          b.vy += dy * push * (1 - wa)
        }
      }
    }

    const settleNow = () => {
      for (let i = 0; i < 420 && alpha > ALPHA_MIN; i++) tick()
    }

    /**
     * Step the layout off-screen until the motion left in it is worth watching.
     * Fifty discs finding their clearance at full alpha is a scramble no reader
     * needs to sit through, and it is over in a few milliseconds of arithmetic.
     */
    const presettle = () => {
      for (let i = 0; i < PRESETTLE_MAX_TICKS && alpha > PRESETTLE_ALPHA; i++) tick()
    }

    // ---- camera ------------------------------------------------------------

    const dpr = Math.max(window.devicePixelRatio || 1, 1)
    let cw = 0
    let ch = 0
    const measure = () => {
      cw = wrap.clientWidth
      ch = wrap.clientHeight
      canvas.width = Math.max(1, Math.round(cw * dpr))
      canvas.height = Math.max(1, Math.round(ch * dpr))
    }
    measure()

    let view: View = viewRef.current ?? { k: 1, tx: cw / 2, ty: ch / 2 }

    function computeFit(): View {
      if (nodes.length === 0) return { k: 1, tx: cw / 2, ty: ch / 2 }
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (const n of nodes) {
        const reach = n.r + (n.data.draft ? 6 : 3)
        minX = Math.min(minX, n.x - reach)
        maxX = Math.max(maxX, n.x + reach)
        minY = Math.min(minY, n.y - reach)
        maxY = Math.max(maxY, n.y + reach)
      }
      // Margins are reserved in screen pixels, not graph units — the toolbar
      // and legend float over the canvas at a fixed size, so the room they
      // need must not shrink with the zoom it is being solved for.
      const insetY = showControls ? 34 : 8
      const insetX = 16
      const k = Math.max(
        Math.min(
          (cw - insetX * 2) / Math.max(maxX - minX, 1),
          (ch - insetY * 2) / Math.max(maxY - minY, 1),
          FIT_MAX_K,
        ),
        ZOOM_MIN,
      )
      return { k, tx: cw / 2 - (k * (minX + maxX)) / 2, ty: ch / 2 - (k * (minY + maxY)) / 2 }
    }

    function zoomAt(sx: number, sy: number, factor: number) {
      const k = Math.min(Math.max(view.k * factor, ZOOM_MIN), ZOOM_MAX)
      const real = k / view.k
      view = { k, tx: sx - (sx - view.tx) * real, ty: sy - (sy - view.ty) * real }
    }

    let fitAnim: { from: View; to: View; start: number } | null = null
    function startFit() {
      if (reducedMotion) {
        view = computeFit()
        needsDraw = true
        schedule()
        return
      }
      fitAnim = { from: { ...view }, to: computeFit(), start: performance.now() }
      schedule()
    }
    fitRef.current = startFit

    // ---- interaction state ---------------------------------------------------

    let hover: SimNode | null = null
    let dragNode: SimNode | null = null
    let dragOffX = 0
    let dragOffY = 0
    let panning = false
    let travel = 0
    let lastClickId: string | null = null
    let lastClickAt = 0
    let multiTouch = false
    const pointers = new Map<number, { x: number; y: number }>()
    /** Last known cursor position, so hover stays honest while nodes drift under it. */
    let cursorAt: { x: number; y: number } | null = null

    const setCursor = () => {
      canvas.style.cursor =
        dragNode || panning ? 'grabbing' : hover ? (hover.data.url ? 'pointer' : 'default') : 'grab'
    }

    // ---- render loop ---------------------------------------------------------

    let raf = 0
    let needsDraw = true
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    function frame(now: number) {
      raf = 0
      let live = false

      if (!reducedMotion && (alpha > ALPHA_MIN || alphaTarget > 0)) {
        tick()
        // Nodes move under a stationary cursor while the sim runs — retest.
        if (cursorAt && pointers.size === 0) {
          const { gx, gy } = toGraph(cursorAt.x, cursorAt.y)
          const n = nodeAt(gx, gy)
          if (n !== hover) {
            hover = n
            setCursor()
          }
        }
        needsDraw = true
        live = true
      }
      // Keep everything in frame while the layout unfolds — easing toward the
      // fit, never snapping to it. Solving it fresh every frame is what made the
      // opening lurch: the map rescales under the reader every time a node on
      // the rim moves. Stops the moment the user takes the camera.
      if (!interactedRef.current && !fitAnim) {
        const to = computeFit()
        if (
          Math.abs(to.k - view.k) < 1e-4 &&
          Math.abs(to.tx - view.tx) < 0.05 &&
          Math.abs(to.ty - view.ty) < 0.05
        ) {
          view = to
        } else {
          view = {
            k: view.k + (to.k - view.k) * CAM_EASE,
            tx: view.tx + (to.tx - view.tx) * CAM_EASE,
            ty: view.ty + (to.ty - view.ty) * CAM_EASE,
          }
          needsDraw = true
          live = true
        }
      }
      if (fitAnim) {
        const t = Math.min((now - fitAnim.start) / FIT_MS, 1)
        const e = 1 - (1 - t) ** 3
        view = {
          k: fitAnim.from.k + (fitAnim.to.k - fitAnim.from.k) * e,
          tx: fitAnim.from.tx + (fitAnim.to.tx - fitAnim.from.tx) * e,
          ty: fitAnim.from.ty + (fitAnim.to.ty - fitAnim.from.ty) * e,
        }
        if (t >= 1) fitAnim = null
        needsDraw = true
        live = live || fitAnim !== null
      }
      if (needsDraw) {
        const settling = draw()
        needsDraw = false
        if (settling) {
          // Title alphas are still easing — keep the loop alive until they land.
          needsDraw = true
          live = true
        }
      }
      if (live) schedule()
    }

    function draw(): boolean {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, cw, ch)
      const { k, tx, ty } = view
      // Hover leads, the pinned node holds the spotlight once the cursor moves on.
      const spot = hover ?? dragNode ?? selected
      const dimmed = (n: SimNode): boolean =>
        spot != null && !inHood(spot, n) && n !== selected && n !== focusNode

      // Everything below is drawn in graph space: discs and titles zoom
      // together, strokes are divided by k to stay hairlines on screen.
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty)
      ctx!.lineCap = 'round'
      for (const l of links) {
        const lit = spot != null && (l.source === spot || l.target === spot)
        const dim = spot != null && !lit
        if (l.kind === 'tag') {
          ctx!.setLineDash([2.5 / k, 3.5 / k])
          ctx!.globalAlpha = dim ? 0.07 : lit ? 0.85 : 0.5
        } else {
          ctx!.setLineDash([])
          ctx!.globalAlpha = dim ? 0.08 : lit ? 1 : 0.75
        }
        ctx!.strokeStyle = lit ? color.accent : color.subtle
        ctx!.lineWidth = (lit ? 1.6 : 0.9) / k
        ctx!.beginPath()
        ctx!.moveTo(l.source.x, l.source.y)
        ctx!.lineTo(l.target.x, l.target.y)
        ctx!.stroke()
      }
      ctx!.setLineDash([])

      // Discs: paper inside, the status on the rim — ink hairline when
      // published, a soft amber halo while the page is still a draft.
      for (const n of nodes) {
        ctx!.globalAlpha = dimmed(n) ? 0.15 : 1
        const rim = n.data.draft
          ? color.draftRing
          : n.data.kind === 'tag'
            ? color.subtle
            : n.data.kind === 'missing'
              ? color.muted
              : color.ink

        if (n.data.draft) {
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r + 2.9 / k, 0, TAU)
          ctx!.strokeStyle = color.draftHalo
          ctx!.lineWidth = 5.4 / k
          ctx!.stroke()
        }

        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r, 0, TAU)
        ctx!.fillStyle = color.surface
        ctx!.fill()
        ctx!.strokeStyle = rim
        ctx!.lineWidth = (n.data.kind === 'hub' ? 1.5 : n.data.kind === 'missing' ? 1 : 1.2) / k
        if (n.data.kind === 'missing') ctx!.setLineDash([3 / k, 3 / k])
        ctx!.stroke()
        ctx!.setLineDash([])

        // Hubs keep their second ring — the map's index pages.
        if (n.data.kind === 'hub') {
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r + 4 / k, 0, TAU)
          ctx!.strokeStyle = rim
          ctx!.lineWidth = 0.9 / k
          ctx!.stroke()
        }

        if (n === spot || n === focusNode || n === selected) {
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r + (n.data.kind === 'hub' ? 8 : 4.5) / k, 0, TAU)
          ctx!.strokeStyle = color.accent
          ctx!.lineWidth = 1.8 / k
          ctx!.stroke()
        }
      }

      // Titles, inside their discs — in a second pass so a slight overlap
      // between two discs can never paint over a neighbour's words. Each one
      // eases out once the zoom takes it below reading size, and back in on
      // the way home.
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      let settling = false
      for (const n of nodes) {
        const sx = n.x * k + tx
        const sy = n.y * k + ty
        const reach = n.r * k + 8
        if (sx < -reach || sx > cw + reach || sy < -reach || sy > ch + reach) {
          n.lt = 0
          n.la = 0
          continue
        }
        // Fade out below reading size rather than shrinking into noise.
        n.lt = Math.min(Math.max((n.fontSize * k - 4.4) / 2.6, 0), 1)
        if (dimmed(n)) n.lt *= 0.16 // match the dimmed disc, or the words shout past it
        if (reducedMotion || Math.abs(n.lt - n.la) <= 0.02) {
          n.la = n.lt
        } else {
          n.la += (n.lt - n.la) * 0.3
          settling = true
        }
        if (n.la < 0.03) continue
        ctx!.globalAlpha = n.la
        ctx!.font = n.font
        ctx!.fillStyle =
          n.data.kind === 'tag'
            ? color.secondary
            : n.data.kind === 'missing'
              ? color.muted
              : color.ink
        const top = n.y - n.block.h / 2 + n.block.lineH / 2
        for (let li = 0; li < n.block.lines.length; li++) {
          ctx!.fillText(n.block.lines[li], n.x, top + li * n.block.lineH)
        }
      }
      ctx!.globalAlpha = 1
      return settling
    }

    // ---- pointer + wheel handlers ---------------------------------------------

    function toGraph(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect()
      const sx = clientX - rect.left
      const sy = clientY - rect.top
      return { sx, sy, gx: (sx - view.tx) / view.k, gy: (sy - view.ty) / view.k }
    }

    function nodeAt(gx: number, gy: number): SimNode | null {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        const hit = n.r + 3 / view.k
        const dx = gx - n.x
        const dy = gy - n.y
        if (dx * dx + dy * dy <= hit * hit) return n
      }
      return null
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      try {
        canvas!.setPointerCapture(e.pointerId)
      } catch {
        // best-effort: a fast tap can already be gone by the time we run
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      interactedRef.current = true
      travel = 0
      if (pointers.size === 1) multiTouch = false

      if (pointers.size === 2) {
        multiTouch = true
        // Second finger: switch to pinch, drop any node drag.
        if (dragNode) {
          dragNode.fx = null
          dragNode.fy = null
          dragNode = null
        }
        panning = false
        alphaTarget = 0
        setCursor()
        return
      }

      const { gx, gy } = toGraph(e.clientX, e.clientY)
      const n = nodeAt(gx, gy)
      if (n) {
        dragNode = n
        dragOffX = n.x - gx
        dragOffY = n.y - gy
        n.fx = n.x
        n.fy = n.y
        // No reheat here: pressing a node is a selection until the pointer has
        // travelled, and a click that jostles the whole map is only distracting.
        // `onPointerMove` warms the simulation once this becomes a real drag.
      } else {
        panning = true
      }
      setCursor()
      schedule()
    }

    function onPointerMove(e: PointerEvent) {
      cursorAt = { x: e.clientX, y: e.clientY }
      if (pointers.size === 2 && pointers.has(e.pointerId)) {
        const [[idA, a], [, b]] = [...pointers.entries()]
        const still = idA === e.pointerId ? b : a
        const was = pointers.get(e.pointerId)!
        const prevDist = Math.hypot(was.x - still.x, was.y - still.y) || 1
        const nextDist = Math.hypot(e.clientX - still.x, e.clientY - still.y) || 1
        const prevMid = { x: (was.x + still.x) / 2, y: (was.y + still.y) / 2 }
        const nextMid = { x: (e.clientX + still.x) / 2, y: (e.clientY + still.y) / 2 }
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        const rect = canvas!.getBoundingClientRect()
        zoomAt(prevMid.x - rect.left, prevMid.y - rect.top, nextDist / prevDist)
        view = { ...view, tx: view.tx + nextMid.x - prevMid.x, ty: view.ty + nextMid.y - prevMid.y }
        needsDraw = true
        schedule()
        return
      }

      const prev = pointers.get(e.pointerId)
      if (prev) {
        travel += Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y)
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      }

      if (dragNode) {
        const { gx, gy } = toGraph(e.clientX, e.clientY)
        dragNode.fx = gx + dragOffX
        dragNode.fy = gy + dragOffY
        // Past the click threshold this is a drag, so let the neighbours follow.
        if (!reducedMotion && travel >= CLICK_SLOP) {
          alphaTarget = 0.3
          if (alpha < 0.3) alpha = 0.3
        }
        if (reducedMotion) {
          dragNode.x = dragNode.fx
          dragNode.y = dragNode.fy
        }
        needsDraw = true
        schedule()
        return
      }
      if (panning && prev) {
        view = { ...view, tx: view.tx + (e.clientX - prev.x), ty: view.ty + (e.clientY - prev.y) }
        needsDraw = true
        schedule()
        return
      }

      const { gx, gy } = toGraph(e.clientX, e.clientY)
      const n = nodeAt(gx, gy)
      if (n !== hover) {
        hover = n
        needsDraw = true
        setCursor()
        schedule()
      }
    }

    function endPointer(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return
      pointers.delete(e.pointerId)

      if (dragNode) {
        const clicked = travel < CLICK_SLOP
        const n = dragNode
        n.fx = null
        n.fy = null
        dragNode = null
        alphaTarget = 0
        if (reducedMotion) {
          settleNow()
          needsDraw = true
        }
        if (clicked) {
          // First click pins the node so its neighborhood stays lit; a second
          // click within 400ms (or cmd/ctrl-click) opens the page.
          const now = performance.now()
          const dbl = lastClickId === n.id && now - lastClickAt < 400
          lastClickId = n.id
          lastClickAt = now
          if (n.data.url && (e.metaKey || e.ctrlKey)) {
            window.open(n.data.url, '_blank', 'noopener')
          } else if (n.data.url && dbl) {
            router.push(n.data.url)
          } else {
            selected = n
            selectedRef.current = n.id
          }
          needsDraw = true
        }
      } else if (panning && pointers.size === 0 && travel < CLICK_SLOP && !multiTouch) {
        // A plain click on empty canvas releases the pinned node.
        selected = null
        selectedRef.current = null
        lastClickId = null
        needsDraw = true
      }
      panning = pointers.size > 0
      setCursor()
      schedule()
    }

    function onPointerLeave() {
      cursorAt = null
      if (hover) {
        hover = null
        needsDraw = true
        setCursor()
        schedule()
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      interactedRef.current = true
      const rect = canvas!.getBoundingClientRect()
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-delta * 0.0021))
      needsDraw = true
      schedule()
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endPointer)
    canvas.addEventListener('pointercancel', endPointer)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    const ro = new ResizeObserver(() => {
      const prevW = cw
      const prevH = ch
      measure()
      // The wall is shaped by the panel, so a change of shape is a change of
      // layout: let the map reflow into the new proportions instead of sitting
      // in the outline of the old ones.
      if (
        !reducedMotion &&
        prevW > 0 &&
        prevH > 0 &&
        Math.abs(cw / (ch || 1) - prevW / prevH) > 0.12 &&
        alpha < 0.22
      ) {
        alpha = 0.22
      }
      if (!interactedRef.current) view = computeFit()
      else view = { ...view, tx: view.tx + (cw - prevW) / 2, ty: view.ty + (ch - prevH) / 2 }
      needsDraw = true
      schedule()
    })
    ro.observe(wrap)

    /** Re-measure every disc against the face that is actually loaded now. */
    const relayout = () => {
      labelCache.clear()
      for (const n of nodes) {
        const { font, size, block, r } = layOut(n.data, n.degree)
        n.font = font
        n.fontSize = size
        n.block = block
        n.r = r
        n.charge = chargeFor(n.data.kind, r)
      }
      for (const l of links) l.dist = l.source.r + l.target.r + l.gap
      nodes.sort((a, b) => b.r - a.r)
      measureBounds()
    }

    /** Raise the curtain: settle off-screen, frame the result, then hand it over. */
    let opened = false
    const open = () => {
      opened = true
      if (reducedMotion) settleNow()
      else if (cold) presettle()
      if (!interactedRef.current) view = computeFit()
      needsDraw = true
      schedule()
    }

    // Every disc radius comes from measured text, so the map can only be laid
    // out once the face it is set in is here. Wait for it — on a short leash —
    // rather than build the layout on Georgia's metrics and then rebuild it
    // under a reader who is already looking at it.
    let disposed = false
    let late = 0
    if (!document.fonts || document.fonts.status === 'loaded') {
      open()
    } else {
      late = window.setTimeout(() => {
        if (!disposed && !opened) open()
      }, FONT_WAIT_MS)
      document.fonts.ready.then(() => {
        window.clearTimeout(late)
        if (disposed) return
        relayout()
        if (opened) {
          // The leash ran out and the map is already up: let it breathe out to
          // the new radii instead of snapping to them.
          if (alpha < 0.3) alpha = 0.3
          if (reducedMotion) settleNow()
          needsDraw = true
          schedule()
        } else {
          open()
        }
      })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      raf = 0
      window.clearTimeout(late)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endPointer)
      canvas.removeEventListener('pointercancel', endPointer)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('wheel', onWheel)
      // Only a layout that was actually raised is worth remembering — a mount
      // torn down during the font wait would otherwise hand the next one a
      // half-built map and rob it of its opening.
      if (opened) for (const n of nodes) positions.set(n.id, { x: n.x, y: n.y })
      viewRef.current = view
      fitRef.current = () => {}
    }
  }, [active, focus, router, showControls])

  if (data.nodes.length === 0) return <p className="muted">Nothing to map yet.</p>

  return (
    <div className="graph-view">
      <div ref={wrapRef} className="graph-canvas-frame" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="graph-canvas"
          role="img"
          aria-label={`Map of ${pageCount} pages connected by ${active.links.length} links. The same connections are listed as text on each page.`}
        />
        {showControls && (
          <div className="graph-toolbar">
            <span className="section-label">
              {pageCount} pages · {active.links.length} links
            </span>
            {hasTags && (
              <button
                type="button"
                className="graph-chip"
                aria-pressed={tagsOn}
                onClick={() => setTagsOn((v) => !v)}
              >
                tags
              </button>
            )}
            {hasMissing && (
              <button
                type="button"
                className="graph-chip"
                aria-pressed={missingOn}
                onClick={() => setMissingOn((v) => !v)}
              >
                unwritten
              </button>
            )}
            <button type="button" className="graph-chip" onClick={() => fitRef.current()}>
              fit view
            </button>
          </div>
        )}
        {showControls && (
          <div className="graph-legend">
            <span>
              <i className="graph-dot graph-dot-note" /> note
            </span>
            <span>
              <i className="graph-dot graph-dot-hub" /> hub
            </span>
            {hasTags && tagsOn && (
              <span>
                <i className="graph-dot graph-dot-tag" /> tag
              </span>
            )}
            {hasMissing && missingOn && (
              <span>
                <i className="graph-dot graph-dot-missing" /> unwritten
              </span>
            )}
            {hasDrafts && (
              <span>
                <i className="graph-dot graph-dot-draft" /> draft
              </span>
            )}
            <span className="graph-legend-hint">
              click pins a page · double-click opens · scroll to zoom
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
