'use client'

/**
 * Force-directed graph of the wiki's link structure, rendered to <canvas> —
 * the notebook as a map. Every page is a paper disc with its title set inside
 * in the editorial face: a hairline ink ring when published, a soft amber halo
 * when still a draft. Tags are hollow rings in mono, "missing" nodes
 * (wikilink targets nobody has written yet) are dashed.
 *
 * Self-contained on purpose: a small deterministic force simulation (link
 * springs, pairwise repulsion, centering, collision — d3-force's recipe,
 * without the dependency). At notebook scale the O(n²) pair pass is nothing,
 * and with no randomness the layout is identical on every load: nodes start
 * on a phyllotaxis spiral and settle the same way each time.
 *
 * Because the label lives *inside* the disc, the label decides the radius:
 * each title is wrapped at whichever measure gives the tightest enclosing
 * circle, and springs and collision both rest at `r + r + gap`, so
 * well-connected pages earn their room instead of piling into a knot. The
 * centering force is shaped to the viewport's aspect, so a wide screen gets a
 * wide map rather than a ball with empty margins.
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
const ALPHA_DECAY = 0.023
const VELOCITY_KEEP = 0.6
const MAX_REPEL_DIST2 = 700 * 700
const ZOOM_MIN = 0.15
const ZOOM_MAX = 4
/** Zoom-to-fit stops here: the label sizes are tuned to read at k ≈ 1. */
const FIT_MAX_K = 1.15
const FIT_MS = 180 // --duration-base

/**
 * Breathing room collision keeps between two discs. Wide enough that the
 * links stay visible between them — packed edge to edge, the discs hide the
 * very structure the map is drawing.
 */
const COLLIDE_GAP = 20
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

/** Springs rest clear of both discs; busy pages get a longer leash. */
const linkGapFor = (kind: GraphLinkKind, busy: number): number =>
  (kind === 'tag' ? 22 : 34) + Math.min(26, 2.6 * Math.sqrt(busy))

/**
 * Repulsion grows with the disc, but gently: collision and the spring rest
 * lengths already guarantee clearance, so charge only has to keep unrelated
 * pages from crowding. Anything stronger inflates the whole map, and every
 * unit of inflation is a unit of zoom the titles lose.
 */
const chargeFor = (kind: GraphNode['kind'], r: number): number =>
  -(2.2 * r + 60) * (kind === 'note' || kind === 'hub' ? 1 : 0.8)

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

    // ---- simulation state --------------------------------------------------

    const degree = new Map<string, number>()
    for (const l of active.links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1)
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1)
    }

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

    const nodes: SimNode[] = active.nodes.map((d, i) => {
      const seat = positions.get(d.id)
      const spiralR = 52 * Math.sqrt(0.5 + i)
      const spiralA = i * GOLDEN_ANGLE
      const deg = degree.get(d.id) ?? 0
      const { font, size, block, r } = layOut(d, deg)
      return {
        id: d.id,
        data: d,
        degree: deg,
        r,
        charge: chargeFor(d.kind, r),
        x: seat?.x ?? Math.cos(spiralA) * spiralR,
        y: seat?.y ?? Math.sin(spiralA) * spiralR,
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
    // extra length is what opens up the highly connected middle of the map.
    const links: SimLink[] = active.links.map((l) => {
      const source = byId.get(l.source)!
      const target = byId.get(l.target)!
      const busy = Math.min(source.degree, target.degree)
      return {
        source,
        target,
        kind: l.kind,
        dist: source.r + target.r + linkGapFor(l.kind, busy),
        strength: 1 / Math.min(source.degree || 1, target.degree || 1),
      }
    })

    const adjacency = new Map<string, Set<string>>()
    for (const l of links) {
      if (!adjacency.has(l.source.id)) adjacency.set(l.source.id, new Set())
      if (!adjacency.has(l.target.id)) adjacency.set(l.target.id, new Set())
      adjacency.get(l.source.id)!.add(l.target.id)
      adjacency.get(l.target.id)!.add(l.source.id)
    }
    const inHood = (center: SimNode, n: SimNode): boolean =>
      n === center || (adjacency.get(center.id)?.has(n.id) ?? false)

    // Big nodes first so small ones (and their titles) draw on top.
    nodes.sort((a, b) => b.r - a.r)

    const focusNode = focus ? byId.get(focus) : undefined
    const centerPull = nodes.length > 60 ? 0.02 : 0.032

    let alpha = positions.size > 0 ? 0.65 : 1
    let alphaTarget = 0

    function tick() {
      alpha += (alphaTarget - alpha) * ALPHA_DECAY

      // Lean the centering toward the panel's long axis so the map drifts a
      // little wider on a wide screen. Only the centering is shaped: the wiki's
      // link graph is close to complete, and springs that dense settle it into
      // a ball whatever else is done. Shaping the springs, the repulsion or the
      // collision clearance instead all measured worse — the outline barely
      // moved and the layout inflated, which costs the zoom titles are read at.
      const shape = Math.min(Math.max((ch || 1) / (cw || 1), 0.45), 1.6)

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

      for (const n of nodes) {
        n.vx -= n.x * centerPull * shape * alpha
        n.vy -= (n.y * centerPull * alpha) / shape
      }
      if (focusNode) {
        focusNode.vx -= focusNode.x * 0.2 * alpha
        focusNode.vy -= focusNode.y * 0.2 * alpha
      }

      // Collision. Two relaxation passes: the discs are label-sized now, so one
      // pass leaves visible overlaps once the springs stop helping.
      collide()
      collide()

      for (const n of nodes) {
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
          const push = ((min - d) / d) * 0.5
          const wa = (b.r * b.r) / (a.r * a.r + b.r * b.r)
          a.vx -= dx * push * wa
          a.vy -= dy * push * wa
          b.vx += dx * push * (1 - wa)
          b.vy += dy * push * (1 - wa)
        }
      }
    }

    const settleNow = () => {
      for (let i = 0; i < 320 && alpha > ALPHA_MIN; i++) tick()
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
        // Keep everything in frame while the layout unfolds; stop the moment
        // the user takes the camera.
        if (!interactedRef.current) view = computeFit()
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
      if (!interactedRef.current) view = computeFit()
      else view = { ...view, tx: view.tx + (cw - prevW) / 2, ty: view.ty + (ch - prevH) / 2 }
      needsDraw = true
      schedule()
    })
    ro.observe(wrap)

    // Titles were measured against the fallback face until the webfonts land;
    // re-lay them out once Cormorant and JetBrains Mono are actually here,
    // since the wrap — and with it every disc radius — depends on the metrics.
    let disposed = false
    document.fonts?.ready.then(() => {
      if (disposed) return
      labelCache.clear()
      for (const n of nodes) {
        const { font, size, block, r } = layOut(n.data, n.degree)
        n.font = font
        n.fontSize = size
        n.block = block
        n.r = r
        n.charge = chargeFor(n.data.kind, r)
      }
      for (const l of links) {
        const busy = Math.min(l.source.degree, l.target.degree)
        l.dist = l.source.r + l.target.r + linkGapFor(l.kind, busy)
      }
      nodes.sort((a, b) => b.r - a.r)
      // Let the layout breathe out to the new radii rather than snap.
      if (alpha < 0.35) alpha = 0.35
      if (reducedMotion) settleNow()
      needsDraw = true
      schedule()
    })

    if (reducedMotion) {
      settleNow()
      if (!interactedRef.current) view = computeFit()
    }
    needsDraw = true
    schedule()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      raf = 0
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endPointer)
      canvas.removeEventListener('pointercancel', endPointer)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('wheel', onWheel)
      for (const n of nodes) positions.set(n.id, { x: n.x, y: n.y })
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
