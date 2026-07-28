# Source record

- **Item**: `doordash-nopriors-agentic-commerce-and-dot.md`
- **Title**: No Priors interview with Andy Fang and Stanley Tang, co-founders of DoorDash
- **Origin**: external — No Priors podcast, machine transcript
- **URL**: not captured
- **Published**: not stated; July 2026 at the earliest (see below)
- **Captured**: 2026-07-28
- **Ingested**: 2026-07-28

## Notes on the capture

Pasted into the inbox as a single block of transcript, archived exactly as dropped. It has no
title, no URL, no date and no speaker names — only the `>>` turn markers and the show's own
sign-off (`no prior pod`, `no-briers.com`, i.e. NoPriors / no-priors.com). This is the second
NoPriors transcript in the notebook; the first is
`sources/2026-07/karpathy-nopriors-skill-issue/`.

**Dating it.** Nothing in the transcript states when it was recorded. Four internal references
bound it: the DoorDash CLI "launched last week", the Dashbench benchmark announced "a couple
weeks ago", June's model spend discussed in the past tense ("our spend in June went up like
20x versus what the spend was in January"), and "fast forward like seven eight years later"
from a 2018 start. Taken together that puts the recording in July 2026 at the earliest, which
is why it is filed under `2026-07`. The wiki pages say "four months later" where they compare
it to the March Karpathy episode — that is derived from this inference, not from a stated date.

**Transcription damage**, in the same family as the Karpathy transcript but lighter. Corrected
in the wiki pages, listed here so the archive stays the reference:

- "Stanley Ting" in the intro — DoorDash's co-founder is **Stanley Tang**. The rest of the
  transcript never spells the surname again.
- "Whimo", "whimos", "wayotes" → **Waymo**.
- "Ask Nord Dash" → **Ask DoorDash**. "Door Dash" is split throughout.
- "politely.com" for the original single-page site with eight PDF menus and a Google Voice
  number. The founding story is usually told with *PaloAltoDelivery.com*, and the syllables fit,
  but this is an inference and the wiki pages do not repeat the name.
- "in tonning world" → *in autonomy world*; "non-aututonomy" → *non-autonomy*; "interfate" →
  *interface*; "two three m hour" / "2 m per hour" → *mph*.
- "also" (lower case) is a company name: **Also**, the micromobility spin-out of Rivian. The
  transcript's "RJ is actually the board founder and chair chairman" reads as RJ Scaringe being
  its founder/chairman; the wiki says only "the Rivian-spinout micromobility company".
- "the fable level of intelligence" → a frontier model by name. The wiki renders the claim as
  "frontier-level intelligence below frontier cost" rather than quoting a model.
- "Sunday" is the home-robotics company the interviewer says they invested in; "Metis" is the
  company DoorDash is said to have acquired last year. Neither is verified here.

## Attribution

The transcript has no speaker labels, so who says what is read off the hosts' questions:

- The **agentic-commerce, Dashbench and AI-spend** material is attributed to **Andy Fang** —
  the host addresses him by name at both ends of that thread ("Andy, when you think about what
  you've learned with the initial foray into agentic commerce") and he takes the AI half after
  Tang hands it over ("I don't know if there's anything you want to add on the AI side").
- The **robotics, autonomy and DOT** material is attributed to **Stanley Tang** — the host opens
  it with "Stanley, you guys are doing a whole bunch of things on the autonomy and robotics side".

The hosts are never named in the transcript. Wiki pages refer to "the interviewer" and do not
guess which one is speaking; the Sunday-robotics investment and the Sunday-night family dinner
are both attributed only to "the interviewer".

## Numbers as stated

Recorded verbatim because the wiki pages discount them, and the discount should be checkable:
50% of Ask DoorDash restaurant trajectories going to a never-before-ordered merchant; ~40%
larger grocery baskets; 9 million Dashers; over 3 billion deliveries a year; 10 billion
deliveries of historical data; 40 million monthly consumers; "40 50 plus countries"; 25%
year-over-year growth; DOT at 300 lb and up to 20 mph, one tenth the size of a car; first 100
robots hand-built; ~500 robots in the boot-time example; June model spend ~20× January's.
All self-reported by the founders, none with a denominator or window. The DOT deployment is
"almost two years" in one answer and "over two years" in two others.

## Wiki pages touched

New:

- `content/notes/doordash-on-agentic-commerce-and-dot.mdx` — the source note.
- `content/notes/the-last-hundred-feet.mdx` — building toward a use case, the drop-off-pin data
  advantage, and the edge cases you cannot imagine at a desk.
- `content/notes/benchmarking-your-own-agent-spend.mdx` — Dashbench, the 20×, and the scrubbed
  task that passes where the real one does not.

Updated:

- `content/notes/the-customer-is-not-the-human.mdx` — the vendor side of Karpathy's argument,
  and where the DoorDash case narrows rather than refutes the "somebody has to pay for the API"
  objection.
- `content/notes/jaggedness-and-what-rl-optimises.mdx` — the enterprise-data instance of the
  same ridge.
- `content/notes/model-speciation-and-touching-the-weights.mdx` — a buyer routing cheap work to
  open weights, and the lab-partners-with-a-business arrangement he predicted.
- `content/notes/the-claw-layer.mdx` — the pantry camera that buys rather than reports, and the
  payment credential nobody discusses.
- `content/notes/self-improving-agents-from-production-feedback.mdx` — Tasks, i.e. paying a
  fleet for labels when they are not a free by-product.
- `content/notes/agentic-engineering.mdx` — the cluster's first buyer-side source.

## Open items

Tracked in `tasks/2026-07-28-verify-doordash-nopriors-source.md`: find the episode (URL, date,
host names), and check Dashbench, the Also partnership and the Metis acquisition against
primary sources before any of it is quoted outside this notebook.
