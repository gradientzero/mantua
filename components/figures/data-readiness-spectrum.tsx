'use client'

/**
 * Data-readiness figure: how much labelled data you have determines which
 * adaptation technique is even on the table. Adapted from the framework in
 * ch. 3 of "LLM Customization and Fine-Tuning" (Bahree & Tok) for the reading
 * notes in content/notes/llm-customization-and-fine-tuning-notes.mdx.
 *
 * Click/tap the diagram to open an enlarged overlay; click again, press
 * Escape, or click the backdrop to close it.
 */

import { useEffect, useRef, useState } from 'react'

const SANS = 'var(--sans)'

const COL_W = 214
const COL_GAP = 15
const COL_STEP = COL_W + COL_GAP
const START_X = 10
const BOX_Y = 75
const BOX_H = 175
const RIGHT_X = START_X + 5 * COL_W + 4 * COL_GAP

function colX(i: number) {
  return START_X + i * COL_STEP
}
function colCenter(i: number) {
  return colX(i) + COL_W / 2
}

const levels = [
  { level: 'Level 0', desc: ['No labelled', 'data'], action: 'Collect human seeds', task: ['Gather 10–20', 'human examples'] },
  { level: 'Level 1', desc: ['10–50 human', 'seed examples'], action: 'Replicate & variate', task: ['Generate synthetic', 'variations from seeds'] },
  { level: 'Level 2', desc: ['50–300 clean', 'examples'], action: 'Fine-tune instruct', task: ['Add gap-fill data,', 'check distribution'] },
  { level: 'Level 3', desc: ['300–1,000', 'representative'], action: 'Production-ready', task: ['Mine prod. logs,', 'add governance'] },
  { level: 'Level 4', desc: ['1,000+', 'governed'], action: 'Base model viable', task: ['Cont. pretraining,', 'Dragon LLM'] },
]

function LevelBox({ i }: { i: number }) {
  const x = colX(i)
  const cx = colCenter(i)
  const item = levels[i]
  return (
    <g>
      <rect x={x} y={BOX_Y} width={COL_W} height={BOX_H} fill="var(--card)" stroke="var(--rule)" strokeWidth={1.5} />
      <text x={cx} y={BOX_Y + 32} textAnchor="middle" fontFamily={SANS} fontSize={16} fontWeight={650} fill="var(--ink)">
        {item.level}
      </text>
      <text x={cx} y={BOX_Y + 60} textAnchor="middle" fontFamily={SANS} fontSize={14} fill="var(--ink)">
        {item.desc.map((line, idx) => (
          <tspan key={idx} x={cx} dy={idx === 0 ? 0 : 18}>
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={cx}
        y={BOX_Y + BOX_H - 20}
        textAnchor="middle"
        fontFamily={SANS}
        fontSize={13.5}
        fontStyle="italic"
        fill="var(--muted)"
      >
        {item.action}
      </text>
    </g>
  )
}

// Diagram content only (no outer <svg>) — rendered into both the inline
// thumbnail and the enlarged overlay, each with its own marker id so the two
// simultaneous SVGs never share an element id.
function DiagramBody({ markerId }: { markerId: string }) {
  const arrowY = 290
  const tickX = colX(1) + 50
  const dashY = 390
  const actionY = dashY + 30

  return (
    <>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
        </marker>
      </defs>

      <text x={(START_X + RIGHT_X) / 2} y={26} textAnchor="middle" fontFamily={SANS} fontSize={19} fontWeight={650} fill="var(--ink)">
        The Data Readiness Spectrum
      </text>
      <text x={(START_X + RIGHT_X) / 2} y={50} textAnchor="middle" fontFamily={SANS} fontSize={14} fill="var(--muted)">
        Where does your data sit today — and where does it need to be?
      </text>

      {levels.map((_, i) => (
        <LevelBox key={i} i={i} />
      ))}

      <line x1={START_X} y1={arrowY} x2={RIGHT_X} y2={arrowY} stroke="var(--muted)" strokeWidth={1.5} markerEnd={`url(#${markerId})`} />
      <text x={(START_X + RIGHT_X) / 2} y={arrowY - 10} textAnchor="middle" fontFamily={SANS} fontSize={13} fill="var(--muted)">
        increasing quality, governance, and training performance →
      </text>

      <line x1={tickX} y1={arrowY + 8} x2={tickX} y2={arrowY + 38} stroke="var(--muted)" strokeWidth={1.5} />
      <text x={tickX} y={arrowY + 58} textAnchor="middle" fontFamily={SANS} fontSize={13} fill="var(--muted)">
        <tspan x={tickX} dy={0}>Most teams</tspan>
        <tspan x={tickX} dy={17}>start here</tspan>
      </text>

      <line x1={START_X} y1={dashY} x2={RIGHT_X} y2={dashY} stroke="var(--rule)" strokeWidth={1.5} strokeDasharray="6 6" />

      {levels.map((item, i) => {
        const cx = colCenter(i)
        return (
          <g key={item.level}>
            <text x={cx} y={actionY} textAnchor="middle" fontFamily={SANS} fontSize={14} fontWeight={650} fill="var(--ink)">
              Action
            </text>
            <text x={cx} y={actionY + 24} textAnchor="middle" fontFamily={SANS} fontSize={13.5} fill="var(--ink)">
              {item.task.map((line, idx) => (
                <tspan key={idx} x={cx} dy={idx === 0 ? 0 : 18}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </>
  )
}

export default function DataReadinessSpectrum() {
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
          aria-label="Enlarge data readiness spectrum diagram"
          style={{
            all: 'unset',
            display: 'block',
            width: '100%',
            minWidth: 720,
            cursor: 'zoom-in',
          }}
        >
          <svg viewBox="0 0 1150 500" role="img" aria-hidden="true" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <DiagramBody markerId="drs-arrow-thumb" />
          </svg>
        </button>
      </div>
      <figcaption>
        The data-readiness spectrum — adapted from ch. 3 of <em>LLM Customization and Fine-Tuning</em>{' '}
        (Bahree &amp; Tok). Click to enlarge.
      </figcaption>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged data readiness spectrum diagram"
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
              viewBox="0 0 1150 500"
              width={1150}
              height={500}
              role="img"
              aria-label="Data readiness spectrum from level 0 (no labelled data) to level 4 (governed, base-model viable)"
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
              <DiagramBody markerId="drs-arrow-modal" />
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
