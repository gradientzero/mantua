---
title: Typewriter/paper-style design overhaul
date: 2026-07-14
priority: low
status: blocked
area: design
---

## Goal

The current look is clean but generic. Give it more character while keeping
the overall structure (the note "card" look is already close to right) —
this is a typography and color tightening pass, not a rebuild.

## Direction

- **Typeface**: lean typewriter — Courier-like — but not "too programmy."
  Reference points:
  - [Distill.pub](https://distill.pub) — paper-like, generous and well-measured
    spacing. Match the feel of the spacing/rhythm, not just the font choice.
  - Derek Sivers' book text (sive.rs) — very minimal, restrained.
- **Color scheme**: fixed, not adaptive to OS dark-mode. Light only, always:
  - Background: tinted white / eggshell (not pure `#fff`).
  - Text: near-black.
  - Accent: a dark/navy blue — aiming for a paper-and-ink feel.
  - Concretely: this means the `prefers-color-scheme` handling (if any exists
    once [next/font custom fonts](../README.md) are introduced) should be
    overridden — the site should render the same light theme regardless of
    device/browser setting.
- Keep the current card layout as the base; adjust font pairing and spacing
  rather than redesigning the component.

## Blocked — needs input from the user before starting

There is an **AO style guide** (a style guide for a "community" app) with
fonts worth reusing here. This material has not been provided yet and lives
outside this repo. **Before implementing this task, ask the user to supply
the AO style guide** (fonts, spec, or reference doc) — don't guess at it or
substitute a lookalike.

## Definition of done

- Fonts updated (typewriter-leaning, informed by the AO style guide once
  provided).
- Color scheme fixed to a light eggshell/black/navy palette, independent of
  system dark-mode.
- Spacing/rhythm tightened toward the Distill.pub / sive.rs reference feel.
- `npm run build` still passes (no schema or content changes expected, but
  confirm).
