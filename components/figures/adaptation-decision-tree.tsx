'use client'

/**
 * Decision-tree figure: which LLM adaptation technique to reach for first.
 * Adapted from the framework in ch. 1 of "LLM Customization and Fine-Tuning"
 * (Bahree & Tok) for the reading notes in
 * content/notes/llm-customization-and-fine-tuning-notes.mdx.
 *
 * Click/tap the diagram to open an enlarged overlay; click again, press
 * Escape, or click the backdrop to close it.
 */

import { useEffect, useRef, useState } from 'react'

const SANS = 'var(--sans)'

function Diamond({ cx, cy, w, h, lines }: { cx: number; cy: number; w: number; h: number; lines: string[] }) {
  const points = [
    [cx, cy - h / 2],
    [cx + w / 2, cy],
    [cx, cy + h / 2],
    [cx - w / 2, cy],
  ]
    .map((p) => p.join(','))
    .join(' ')
  return (
    <g>
      <polygon points={points} fill="var(--card)" stroke="var(--rule)" strokeWidth={1.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily={SANS} fontSize={15} fill="var(--ink)">
        {lines.map((line, i) => (
          <tspan key={i} x={cx} dy={i === 0 ? -((lines.length - 1) * 9) : 18}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function Box({
  x,
  y,
  w,
  h,
  lines,
  emphasis = false,
}: {
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  emphasis?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={emphasis ? 'var(--accent-soft)' : 'var(--card)'}
        stroke={emphasis ? 'var(--accent)' : 'var(--rule)'}
        strokeWidth={1.5}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={SANS}
        fontSize={14.5}
        fill="var(--ink)"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x + w / 2} dy={i === 0 ? -((lines.length - 1) * 9) : 18}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function VArrow({ x, y1, y2, label, markerId }: { x: number; y1: number; y2: number; label?: string; markerId: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="var(--muted)" strokeWidth={1.5} markerEnd={`url(#${markerId})`} />
      {label && (
        <text x={x + 10} y={(y1 + y2) / 2 + 4} fontFamily={SANS} fontSize={13} fill="var(--muted)">
          {label}
        </text>
      )}
    </g>
  )
}

function HArrow({ y, x1, x2, label, markerId }: { y: number; x1: number; x2: number; label?: string; markerId: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--muted)" strokeWidth={1.5} markerEnd={`url(#${markerId})`} />
      {label && (
        <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fontFamily={SANS} fontSize={13} fill="var(--muted)">
          {label}
        </text>
      )}
    </g>
  )
}

const COL_X = 300
const SIDE_X = 590
const SIDE_W = 360
const BOX_H = 90
// Visual center of the whole figure (diamond column + side-box column) — used
// to center the title and the bottom row. NOT the same as COL_X: centering the
// bottom row on COL_X pushed it left of x=0, where the SVG viewport clips it.
const CENTER_X = (COL_X - 150 + SIDE_X + SIDE_W) / 2

const D1_CY = 130
const D2_CY = 340
const D3_CY = 550
const D4_CY = 760
const BUS_Y = 850
const BOTTOM_Y = 880
const BOTTOM_H = 100

const bottomBoxes = [
  { label: 'Cost at scale', lines: ['Distillation', 'Ch 7'] },
  { label: 'Privacy or residency', lines: ['Self-hosted LoRA', 'or full SFT', 'Ch 5 or 6'] },
  { label: 'Behavior or tone', lines: ['Preference', 'alignment', 'Ch 8'], emphasis: true },
  { label: 'Quality plateaued', lines: ['Full SFT', 'Ch 6'] },
]
const BOTTOM_W = 220
const BOTTOM_GAP = 25
const BOTTOM_START_X = CENTER_X - (4 * BOTTOM_W + 3 * BOTTOM_GAP) / 2

// Diagram content only (no outer <svg>) — rendered into both the inline
// thumbnail and the enlarged overlay, each with its own marker id so the two
// simultaneous SVGs never share an element id.
function DiagramBody({ markerId }: { markerId: string }) {
  return (
    <>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
        </marker>
      </defs>

      <text x={CENTER_X} y={30} textAnchor="middle" fontFamily={SANS} fontSize={17} fontWeight={650} fill="var(--ink)">
        Which adaptation technique should I start with?
      </text>

      <Diamond cx={COL_X} cy={D1_CY} w={300} h={130} lines={['Is the task', 'commodity or specialized?']} />
      <HArrow y={D1_CY} x1={COL_X + 150} x2={SIDE_X} label="Commodity" markerId={markerId} />
      <Box x={SIDE_X} y={D1_CY - BOX_H / 2} w={SIDE_W} h={BOX_H} lines={['Frontier API + careful prompt', 'No adaptation needed']} />
      <VArrow x={COL_X} y1={D1_CY + 65} y2={D2_CY - 65} label="Specialized" markerId={markerId} />

      <Diamond cx={COL_X} cy={D2_CY} w={300} h={130} lines={['Have you measured', 'the prompting baseline?']} />
      <HArrow y={D2_CY} x1={COL_X + 150} x2={SIDE_X} label="No" markerId={markerId} />
      <Box x={SIDE_X} y={D2_CY - BOX_H / 2} w={SIDE_W} h={BOX_H} lines={['Run baseline first', 'before training — Ch 3 + Ch 4']} />
      <VArrow x={COL_X} y1={D2_CY + 65} y2={D3_CY - 65} label="Yes" markerId={markerId} />

      <Diamond cx={COL_X} cy={D3_CY} w={300} h={130} lines={['Do you have several hundred', 'curated examples?']} />
      <HArrow y={D3_CY} x1={COL_X + 150} x2={SIDE_X} label="No" markerId={markerId} />
      <Box x={SIDE_X} y={D3_CY - BOX_H / 2} w={SIDE_W} h={BOX_H} lines={['Build dataset first', 'before training — Ch 3']} />
      <VArrow x={COL_X} y1={D3_CY + 65} y2={D4_CY - 65} label="Yes" markerId={markerId} />

      <Diamond cx={COL_X} cy={D4_CY} w={300} h={130} lines={['What is the', 'hard constraint?']} />
      <VArrow x={COL_X} y1={D4_CY + 65} y2={BUS_Y} markerId={markerId} />
      <line
        x1={BOTTOM_START_X + BOTTOM_W / 2}
        y1={BUS_Y}
        x2={BOTTOM_START_X + 3 * (BOTTOM_W + BOTTOM_GAP) + BOTTOM_W / 2}
        y2={BUS_Y}
        stroke="var(--muted)"
        strokeWidth={1.5}
      />

      {bottomBoxes.map((b, i) => {
        const x = BOTTOM_START_X + i * (BOTTOM_W + BOTTOM_GAP)
        const cx = x + BOTTOM_W / 2
        return (
          <g key={b.label}>
            <VArrow x={cx} y1={BUS_Y} y2={BOTTOM_Y} markerId={markerId} />
            <text x={cx} y={BUS_Y - 8} textAnchor="middle" fontFamily={SANS} fontSize={13} fill="var(--muted)">
              {b.label}
            </text>
            <Box x={x} y={BOTTOM_Y} w={BOTTOM_W} h={BOTTOM_H} lines={b.lines} emphasis={b.emphasis} />
          </g>
        )
      })}
    </>
  )
}

export default function AdaptationDecisionTree() {
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
          aria-label="Enlarge decision tree diagram"
          style={{
            all: 'unset',
            display: 'block',
            width: '100%',
            minWidth: 720,
            cursor: 'zoom-in',
          }}
        >
          <svg viewBox="0 0 1100 980" role="img" aria-hidden="true" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <DiagramBody markerId="dt-arrow-thumb" />
          </svg>
        </button>
      </div>
      <figcaption>
        Decision framework for picking a first adaptation technique — adapted from ch. 1 of{' '}
        <em>LLM Customization and Fine-Tuning</em> (Bahree &amp; Tok). Click to enlarge.
      </figcaption>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged decision tree diagram"
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
              viewBox="0 0 1100 980"
              width={1100}
              height={980}
              role="img"
              aria-label="Decision tree for choosing an LLM adaptation technique"
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
              <DiagramBody markerId="dt-arrow-modal" />
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
