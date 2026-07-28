'use client'

/**
 * Force-directed graph of the wiki's link structure, rendered to <canvas> —
 * the Obsidian-style map view. Notes and hubs are ink dots (hubs ringed,
 * radius tracks connection count), tags are hollow circles, "missing" nodes
 * (wikilink targets nobody has written yet) are dashed.
 *
 * Self-contained on purpose: a small deterministic force simulation (link
 * springs, pairwise repulsion, centering, collision — d3-force's recipe,
 * without the dependency). At notebook scale the O(n²) pair pass is nothing,
 * and with no randomness the layout is identical on every load: nodes start
 * on a phyllotaxis spiral and settle the same way each time.
 *
 * Interactions: drag nodes; drag the background to pan; wheel/pinch to zoom;
 * hover to spotlight a neighborhood. Click pins a node — the spotlight stays
 * on its neighborhood while the cursor roams — click the background to
 * unpin, double-click (or cmd/ctrl-click) to open the page. Colors are read
 * from the design tokens at runtime so the map stays on the e-ink palette.
 *
 * Labels earn their place instead of all drawing at once: titles wrap to
 * short lines, well-connected pages reveal first as the zoom deepens, and a
 * greedy screen-space pass drops any label that would overlap one already
 * placed (hovered/focused pages always win). Each label eases its alpha so
 * the visible set changes without popping.
 */

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GraphData, GraphLinkKind, GraphNode } from '@/lib/graph'

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
  /** Zoom level at which this node's label starts to appear. */
  revealK: number
  /** Label alpha, eased: current value and this frame's target. */
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
const MAX_REPEL_DIST2 = 380 * 380
const ZOOM_MIN = 0.2
const ZOOM_MAX = 5
const FIT_MS = 180 // --duration-base

const radiusFor = (kind: GraphNode['kind'], degree: number): number => {
  const grown = Math.sqrt(degree)
  if (kind === 'tag') return Math.min(3.2 + 1.5 * grown, 12)
  if (kind === 'missing') return Math.min(3 + grown, 8)
  return Math.min(4.2 + 2 * grown, 17)
}

const chargeFor = (kind: GraphNode['kind']): number =>
  kind === 'note' || kind === 'hub' ? -190 : kind === 'tag' ? -120 : -70

const linkDistFor = (kind: GraphLinkKind): number => (kind === 'tag' ? 72 : 100)

/** Deterministic stand-in for the tiny random nudges d3 uses to split overlaps. */
const jiggle = (i: number): number => ((((i + 1) * 2654435761) % 100000) / 100000 - 0.5) * 1e-3

interface LabelBlock {
  lines: string[]
  w: number
  h: number
  lineH: number
}

/**
 * Greedy word wrap for canvas text, breaking after spaces and hyphens
 * (missing-page labels are hyphenated slugs), with an ellipsis when the
 * title outruns `maxLines`. Cached per (font, width, text) — measureText
 * is not free and the same blocks are needed every frame.
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
    if (raw[i] === ' ' || raw[i] === '-') {
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
  const block = { lines, w, h: lines.length * lineH, lineH }
  cache.set(key, block)
  return block
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
      draftText: token('--attention-text', '#92400e'),
      draftBg: token('--attention-bg', '#fef3c7'),
    }
    const fontBody = "'Inter', system-ui, sans-serif"
    const fontMono = "'JetBrains Mono', ui-monospace, monospace"
    const labelCache = new Map<string, LabelBlock>()
    const fontFor = (n: SimNode, prime: boolean): string =>
      n.data.kind === 'tag'
        ? `400 9px ${fontMono}`
        : n.data.kind === 'missing'
          ? `italic 400 10.5px ${fontBody}`
          : `${prime ? 500 : 400} 10.5px ${fontBody}`

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const positions = positionsRef.current

    // ---- simulation state --------------------------------------------------

    const degree = new Map<string, number>()
    for (const l of active.links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1)
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1)
    }

    const nodes: SimNode[] = active.nodes.map((d, i) => {
      const seat = positions.get(d.id)
      const spiralR = 16 * Math.sqrt(0.5 + i)
      const spiralA = i * GOLDEN_ANGLE
      const deg = degree.get(d.id) ?? 0
      return {
        id: d.id,
        data: d,
        degree: deg,
        r: radiusFor(d.kind, deg),
        charge: chargeFor(d.kind),
        x: seat?.x ?? Math.cos(spiralA) * spiralR,
        y: seat?.y ?? Math.sin(spiralA) * spiralR,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        revealK: 0,
        la: 0,
        lt: 0,
      }
    })
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // The pinned ("selected") node: click sets it, background click clears it.
    let selected: SimNode | null =
      selectedRef.current != null ? (byId.get(selectedRef.current) ?? null) : null
    if (!selected) selectedRef.current = null

    // The best-connected pages label first; leaves and tags wait for zoom.
    let maxDegree = 1
    for (const n of nodes) maxDegree = Math.max(maxDegree, n.degree)
    for (const n of nodes) {
      n.revealK = 0.34 + (1 - n.degree / maxDegree) * 0.42 + (n.data.kind === 'tag' ? 0.12 : 0)
    }

    // Nodes that just toggled into an existing layout start next to a placed
    // neighbor instead of on the spiral, so the map grows rather than convulses.
    const unplaced = new Set(active.nodes.filter((d) => !positions.has(d.id)).map((d) => d.id))
    if (unplaced.size > 0 && unplaced.size < nodes.length) {
      active.links.forEach((l, i) => {
        const a = byId.get(l.source)!
        const b = byId.get(l.target)!
        if (unplaced.has(a.id) && !unplaced.has(b.id)) {
          a.x = b.x + Math.cos(i * GOLDEN_ANGLE) * 30
          a.y = b.y + Math.sin(i * GOLDEN_ANGLE) * 30
          unplaced.delete(a.id)
        } else if (unplaced.has(b.id) && !unplaced.has(a.id)) {
          b.x = a.x + Math.cos(i * GOLDEN_ANGLE) * 30
          b.y = a.y + Math.sin(i * GOLDEN_ANGLE) * 30
          unplaced.delete(b.id)
        }
      })
    }

    const links: SimLink[] = active.links.map((l) => {
      const source = byId.get(l.source)!
      const target = byId.get(l.target)!
      return {
        source,
        target,
        kind: l.kind,
        dist: linkDistFor(l.kind),
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

    // Big nodes first so small ones (and their labels) draw on top.
    nodes.sort((a, b) => b.r - a.r)

    const focusNode = focus ? byId.get(focus) : undefined
    const centerPull = nodes.length > 60 ? 0.03 : 0.05

    let alpha = positions.size > 0 ? 0.65 : 1
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

      for (const n of nodes) {
        n.vx -= n.x * centerPull * alpha
        n.vy -= n.y * centerPull * alpha
      }
      if (focusNode) {
        focusNode.vx -= focusNode.x * 0.2 * alpha
        focusNode.vy -= focusNode.y * 0.2 * alpha
      }

      // Collision: one relaxation pass is enough at this scale.
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const min = a.r + b.r + 4.5
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
        minX = Math.min(minX, n.x - n.r)
        maxX = Math.max(maxX, n.x + n.r)
        minY = Math.min(minY, n.y - n.r)
        maxY = Math.max(maxY, n.y + n.r)
      }
      const pad = 36
      const k = Math.max(
        Math.min((cw / (maxX - minX + pad * 2)), ch / (maxY - minY + pad * 2), 1.3),
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
          // Label alphas are still easing — keep the loop alive until they land.
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

      // Edges, in graph space.
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty)
      ctx!.lineCap = 'round'
      for (const l of links) {
        const lit = spot != null && (l.source === spot || l.target === spot)
        const dim = spot != null && !lit
        if (l.kind === 'tag') {
          ctx!.setLineDash([2.5 / k, 3.5 / k])
          ctx!.globalAlpha = dim ? 0.08 : lit ? 0.9 : 0.55
        } else {
          ctx!.setLineDash([])
          ctx!.globalAlpha = dim ? 0.08 : lit ? 1 : 0.8
        }
        ctx!.strokeStyle = lit ? color.accent : color.subtle
        ctx!.lineWidth = (lit ? 1.5 : 0.8) / k
        ctx!.beginPath()
        ctx!.moveTo(l.source.x, l.source.y)
        ctx!.lineTo(l.target.x, l.target.y)
        ctx!.stroke()
      }
      ctx!.setLineDash([])

      // Nodes.
      for (const n of nodes) {
        ctx!.globalAlpha = spot != null && !inHood(spot, n) && n !== selected ? 0.16 : 1
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r, 0, TAU)
        if (n.data.kind === 'tag') {
          ctx!.fillStyle = color.surface
          ctx!.fill()
          ctx!.strokeStyle = color.secondary
          ctx!.lineWidth = 1.1 / k
          ctx!.stroke()
        } else if (n.data.kind === 'missing') {
          ctx!.fillStyle = color.surface
          ctx!.fill()
          ctx!.strokeStyle = color.muted
          ctx!.lineWidth = 1 / k
          ctx!.setLineDash([2 / k, 2.2 / k])
          ctx!.stroke()
          ctx!.setLineDash([])
        } else {
          ctx!.fillStyle = n.data.draft ? color.draftBg : color.ink
          ctx!.fill()
          if (n.data.draft) {
            ctx!.strokeStyle = color.draftText
            ctx!.lineWidth = 1.2 / k
            ctx!.stroke()
          }
          if (n.data.kind === 'hub') {
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, n.r + 2.5, 0, TAU)
            ctx!.strokeStyle = n.data.draft ? color.draftText : color.ink
            ctx!.lineWidth = 1 / k
            ctx!.stroke()
          }
        }
        if (n === spot || n === focusNode || n === selected) {
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r + (n.data.kind === 'hub' ? 4.6 : 3.2), 0, TAU)
          ctx!.strokeStyle = color.accent
          ctx!.lineWidth = 1.6 / k
          ctx!.stroke()
        }
      }

      // Labels, in screen space so they stay crisp and readable at any zoom.
      // Which labels show is re-decided every frame: nodes reveal by
      // connectedness as the zoom deepens, then a greedy pass (spotlight >
      // focus > neighborhood > degree) drops any label that would overlap
      // one already placed.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'top'
      ctx!.lineJoin = 'round'

      const cands: {
        n: SimNode
        sx: number
        sy: number
        font: string
        block: LabelBlock
        tier: number
      }[] = []
      for (const n of nodes) {
        const sx = n.x * k + tx
        const sy = (n.y + n.r) * k + ty + 4
        const hood = spot != null && inHood(spot, n)
        let a = Math.min(Math.max((k - n.revealK) / 0.22, 0), 1)
        if (spot != null) a = hood ? 1 : a * 0.1
        if (n === spot || n === focusNode || n === selected) a = 1
        if (sx < -110 || sx > cw + 110 || sy < -52 || sy > ch + 6 || (a < 0.03 && n.la < 0.03)) {
          n.lt = 0
          n.la = 0
          continue
        }
        const prime = n === spot || n === focusNode || n === selected
        const raw = n.data.kind === 'tag' ? `#${n.data.label}` : n.data.label
        const font = fontFor(n, prime)
        const block = wrapLabel(
          ctx!,
          labelCache,
          raw,
          font,
          prime ? 170 : 120,
          prime ? 3 : 2,
          n.data.kind === 'tag' ? 11 : 12.5,
        )
        n.lt = a
        cands.push({ n, sx, sy, font, block, tier: prime ? 2 : hood ? 1 : 0 })
      }

      cands.sort((p, q) => q.tier - p.tier || q.n.degree - p.n.degree || q.n.r - p.n.r)
      const placed: { x0: number; y0: number; x1: number; y1: number }[] = []
      for (const c of cands) {
        if (c.n.lt < 0.03) continue // already fading out; reserves no space
        const w2 = c.block.w / 2 + 2
        const box = { x0: c.sx - w2, y0: c.sy - 2, x1: c.sx + w2, y1: c.sy + c.block.h + 2 }
        const blocked =
          c.tier < 2 &&
          placed.some((p) => box.x0 < p.x1 && box.x1 > p.x0 && box.y0 < p.y1 && box.y1 > p.y0)
        if (blocked) c.n.lt = 0
        else placed.push(box)
      }

      // Ease each label toward its target; draw low tiers first so the
      // spotlight paints on top.
      let settling = false
      for (let i = cands.length - 1; i >= 0; i--) {
        const { n, sx, sy, font, block } = cands[i]
        if (reducedMotion || Math.abs(n.lt - n.la) <= 0.02) {
          n.la = n.lt
        } else {
          n.la += (n.lt - n.la) * 0.3
          settling = true
        }
        if (n.la < 0.03) continue
        ctx!.font = font
        ctx!.globalAlpha = n.la
        ctx!.strokeStyle = color.surface
        ctx!.lineWidth = 3.5
        ctx!.fillStyle =
          n === spot || n === selected
            ? color.ink
            : n.data.draft
              ? color.draftText
              : n.data.kind === 'tag' || n.data.kind === 'missing'
                ? color.muted
                : color.secondary
        for (let li = 0; li < block.lines.length; li++) {
          ctx!.strokeText(block.lines[li], sx, sy + li * block.lineH)
          ctx!.fillText(block.lines[li], sx, sy + li * block.lineH)
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
        const hit = n.r + 6 / view.k
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
        if (!reducedMotion) {
          alphaTarget = 0.3
          if (alpha < 0.3) alpha = 0.3
        }
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
        const clicked = travel < 5
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
      } else if (panning && pointers.size === 0 && travel < 5 && !multiTouch) {
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

    // Redraw once webfonts land so labels don't stay in the fallback face.
    let disposed = false
    document.fonts?.ready.then(() => {
      if (!disposed) {
        labelCache.clear() // wrap widths measured against the fallback face are stale now
        needsDraw = true
        schedule()
      }
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
  }, [active, focus, router])

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
              click pins a page · double-click opens · zoom for labels
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
