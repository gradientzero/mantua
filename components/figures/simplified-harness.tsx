'use client'

/**
 * The v2 ("simplified") harness from Anthropic's harness-design post: planner →
 * generator → evaluator, coordinating only through files on disk, with the four
 * v1 components that Opus 4.6 made unnecessary struck out below. Redrawn from a
 * diagram accompanying the post, for the reading notes in
 * content/notes/harness-design-for-long-running-coding-agents.mdx.
 *
 * Click/tap the diagram to open an enlarged overlay; click again, press
 * Escape, or click the backdrop to close it.
 */

import { useEffect, useRef, useState } from 'react'

const SANS = 'var(--sans)'
const SERIF = 'var(--serif)'
const MONO = 'var(--mono)'

// The theme has no orange or beige token — these two are local to this figure
// because they carry meaning from the original: clay = the evaluator and its
// feedback path, sand = the filesystem band everything writes into.
const CLAY = '#dd6b4e'
const SAND = '#ece3d5'
const ON_DARK = 'var(--text-inverted)'
const ON_DARK_SOFT = 'rgba(248, 248, 246, 0.78)'
const ON_CLAY_SOFT = 'rgba(255, 255, 255, 0.85)'

const VIEW_W = 1200
const VIEW_H = 700

const BOX_Y = 140
const BOX_W = 240
const BOX_H = 134
const BOX_BOTTOM = BOX_Y + BOX_H
const MID_Y = BOX_Y + BOX_H / 2

const PLANNER_X = 230
const GENERATOR_X = 560
// Wider gap than the others: it carries two arrows, and the `findings.md`
// label needs room to sit between the boxes rather than on top of one.
const EVALUATOR_X = 930
const RIGHT_EDGE = EVALUATOR_X + BOX_W

const BAND_Y = 380
const BAND_H = 112
const CHIP_Y = 412
const CHIP_H = 48
const CHIP_W = 200

const REMOVED_LABEL_Y = 540
const REMOVED_Y = 560
const REMOVED_H = 50
const REMOVED_GAP = 22
const REMOVED_W = (RIGHT_EDGE - 20 - 3 * REMOVED_GAP) / 4

const stages = [
  {
    x: PLANNER_X,
    title: 'Planner',
    subtitle: 'prompt → product spec',
    meta: 'runs once · ~5 min',
    artifact: 'spec.md',
    tone: 'light' as const,
  },
  {
    x: GENERATOR_X,
    title: 'Generator',
    subtitle: 'one continuous build',
    meta: 'no resets · 2+ hrs',
    artifact: 'app/ + git',
    tone: 'dark' as const,
  },
  {
    x: EVALUATOR_X,
    title: 'Evaluator',
    subtitle: 'Playwright + rubric',
    meta: 'at end · 2–3 passes',
    artifact: 'findings.md',
    tone: 'clay' as const,
  },
]

const removed = ['context resets', 'sprint decomposition', 'per-sprint eval loop', 'sprint contracts']

function Stage({ stage }: { stage: (typeof stages)[number] }) {
  const { x, tone } = stage
  const cx = x + BOX_W / 2
  const fill = tone === 'dark' ? 'var(--ink)' : tone === 'clay' ? CLAY : 'var(--surface)'
  const stroke = tone === 'light' ? 'var(--ink)' : 'none'
  const titleFill = tone === 'light' ? 'var(--ink)' : ON_DARK
  const softFill = tone === 'light' ? 'var(--text-secondary)' : tone === 'clay' ? ON_CLAY_SOFT : ON_DARK_SOFT
  const ruleStroke = tone === 'light' ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.35)'

  return (
    <g>
      <rect x={x} y={BOX_Y} width={BOX_W} height={BOX_H} rx={10} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={cx} y={BOX_Y + 42} textAnchor="middle" fontFamily={SERIF} fontSize={25} fontWeight={600} fill={titleFill}>
        {stage.title}
      </text>
      <text x={cx} y={BOX_Y + 68} textAnchor="middle" fontFamily={SANS} fontSize={14.5} fill={softFill}>
        {stage.subtitle}
      </text>
      <line x1={x + 34} y1={BOX_Y + 86} x2={x + BOX_W - 34} y2={BOX_Y + 86} stroke={ruleStroke} strokeWidth={1} />
      <text x={cx} y={BOX_Y + 110} textAnchor="middle" fontFamily={MONO} fontSize={12.5} fill={softFill}>
        {stage.meta}
      </text>
    </g>
  )
}

function FlowArrow({
  x1,
  x2,
  y,
  label,
  markerId,
  color = 'var(--ink)',
}: {
  x1: number
  x2: number
  y: number
  label: string
  markerId: string
  color?: string
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.5} markerEnd={`url(#${markerId})`} />
      <text x={(x1 + x2) / 2} y={y - 9} textAnchor="middle" fontFamily={MONO} fontSize={12.5} fill={color}>
        {label}
      </text>
    </g>
  )
}

// Diagram content only (no outer <svg>) — rendered into both the inline
// thumbnail and the enlarged overlay, each with its own marker ids so the two
// simultaneous SVGs never share an element id.
function DiagramBody({ markerId }: { markerId: string }) {
  const inkArrow = `${markerId}-ink`
  const clayArrow = `${markerId}-clay`

  return (
    <>
      <defs>
        <marker id={inkArrow} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
        </marker>
        <marker id={clayArrow} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={CLAY} />
        </marker>
      </defs>

      <text x={20} y={52} fontFamily={SERIF} fontSize={34} fontWeight={600} fill="var(--ink)">
        The simplified harness, end to end
      </text>

      {/* Human → Planner → Generator → Evaluator */}
      <rect x={20} y={MID_Y - 27} width={120} height={54} rx={27} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.5} />
      <text x={80} y={MID_Y + 6} textAnchor="middle" fontFamily={SANS} fontSize={16} fontWeight={500} fill="var(--ink)">
        Human
      </text>
      <FlowArrow x1={140} x2={PLANNER_X} y={MID_Y} label="prompt" markerId={inkArrow} />
      <FlowArrow x1={PLANNER_X + BOX_W} x2={GENERATOR_X} y={MID_Y} label="spec.md" markerId={inkArrow} />

      {/* The one loop that survived: generator ⇄ evaluator, once at the end. */}
      <FlowArrow x1={GENERATOR_X + BOX_W} x2={EVALUATOR_X} y={MID_Y - 21} label="live app" markerId={inkArrow} />
      <FlowArrow
        x1={EVALUATOR_X}
        x2={GENERATOR_X + BOX_W}
        y={MID_Y + 25}
        label="findings.md"
        markerId={clayArrow}
        color={CLAY}
      />

      {stages.map((s) => (
        <Stage key={s.title} stage={s} />
      ))}

      {/* Filesystem band — the only shared state. */}
      {stages.map((s) => {
        const cx = s.x + BOX_W / 2
        return (
          <line
            key={`drop-${s.title}`}
            x1={cx}
            y1={BOX_BOTTOM}
            x2={cx}
            y2={CHIP_Y}
            stroke="var(--border-subtle)"
            strokeWidth={1.5}
            strokeDasharray="3 6"
          />
        )
      })}
      <rect x={20} y={BAND_Y} width={RIGHT_EDGE - 20} height={BAND_H} fill={SAND} />
      <text x={48} y={BAND_Y + 40} fontFamily={MONO} fontSize={14} letterSpacing="0.08em" fill="var(--ink)">
        FILESYSTEM
      </text>
      <text x={48} y={BAND_Y + 64} fontFamily={SANS} fontSize={13} fill="var(--text-secondary)">
        shared state, not context
      </text>
      {stages.map((s) => {
        const cx = s.x + BOX_W / 2
        return (
          <g key={`chip-${s.title}`}>
            <rect x={cx - CHIP_W / 2} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={4} fill="var(--surface)" />
            <text x={cx} y={CHIP_Y + 30} textAnchor="middle" fontFamily={MONO} fontSize={14} fill="var(--ink)">
              {s.artifact}
            </text>
          </g>
        )
      })}

      {/* What the walk-back deleted. */}
      <text x={20} y={REMOVED_LABEL_Y} fontFamily={MONO} fontSize={13} letterSpacing="0.08em" fill="var(--text-muted)">
        REMOVED ON OPUS 4.6
      </text>
      {removed.map((label, i) => {
        const x = 20 + i * (REMOVED_W + REMOVED_GAP)
        const cx = x + REMOVED_W / 2
        const cy = REMOVED_Y + REMOVED_H / 2
        return (
          <g key={label}>
            <rect
              x={x}
              y={REMOVED_Y}
              width={REMOVED_W}
              height={REMOVED_H}
              rx={6}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth={1}
              strokeDasharray="5 5"
            />
            <text x={cx} y={cy + 5} textAnchor="middle" fontFamily={SANS} fontSize={14.5} fill="var(--text-muted)">
              {label}
            </text>
            <line x1={x + 26} y1={cy + 7} x2={x + REMOVED_W - 26} y2={cy - 7} stroke="var(--border-subtle)" strokeWidth={1.5} />
          </g>
        )
      })}

      <text x={VIEW_W / 2} y={665} textAnchor="middle" fontFamily={SANS} fontSize={16} fill="var(--text-secondary)">
        Three agents, zero shared context. All coordination goes through files on disk.
      </text>
    </>
  )
}

export default function SimplifiedHarness() {
  const [open, setOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <figure>
      <div style={{ overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Enlarge simplified harness diagram"
          style={{
            all: 'unset',
            display: 'block',
            width: '100%',
            minWidth: 720,
            cursor: 'zoom-in',
          }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            role="img"
            aria-hidden="true"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <DiagramBody markerId="sh-arrow-thumb" />
          </svg>
        </button>
      </div>
      <figcaption>
        The v2 harness after the walk-back — planner once, generator continuous, evaluator at the end,
        everything coordinated through files. Redrawn from a diagram accompanying the post. Click to enlarge.
      </figcaption>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged simplified harness diagram"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '94vw', maxHeight: '90vh' }}>
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              width={VIEW_W}
              height={VIEW_H}
              role="img"
              aria-label="The simplified harness: human prompt to planner, spec.md to generator, live app to evaluator, findings.md back to generator, with spec.md, app plus git, and findings.md on a shared filesystem; context resets, sprint decomposition, per-sprint eval loop and sprint contracts removed on Opus 4.6"
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '94vw',
                maxHeight: '90vh',
                background: 'var(--bg)',
                borderRadius: 10,
                padding: '1.25rem',
                boxSizing: 'border-box',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.35)',
              }}
            >
              <DiagramBody markerId="sh-arrow-modal" />
            </svg>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close enlarged diagram"
              style={{
                all: 'unset',
                position: 'absolute',
                top: '0.6rem',
                right: '0.6rem',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'var(--card)',
                border: '1px solid var(--rule)',
                color: 'var(--ink)',
                fontFamily: SANS,
                fontSize: 15,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </figure>
  )
}
