---
title: Fix the Turbopack whole-project trace warning from the open-in-editor route
date: 2026-07-27
priority: low
status: open
area: infra
---

## Correction to this task's first version

Filed during the 2026-07-27 ingest, which found the "edit in editor" feature uncommitted in
the working tree and left it out of its commit. The original version of this file claimed
the feature "becomes a live production endpoint if pushed" and framed that as a security
question. **That was wrong, and it was written without reading the route.**

The feature is already gated, in both halves:

- `app/api/open-in-editor/route.ts` returns 404 unless `process.env.NODE_ENV === 'development'`.
- `components/edit-in-editor-button.tsx` returns `null` under the same check, and `NODE_ENV`
  is inlined at build time, so the button isn't in the production bundle at all.
- The path is validated against the same per-segment slug regex as `velite.config.ts`, and
  the resolved file must still sit under `content/`.

Vercel builds with `NODE_ENV=production` for preview deployments as well as production, so
the gate holds on every deployed target. The route appears in build output as
`ƒ /api/open-in-editor` because it is dynamic, not because it does anything there.

## What is actually left

One build warning, and it is the only warning `npm run build` emits:

```
Turbopack build encountered 1 warnings:
./next.config.mjs
Encountered unexpected file in NFT list — the whole project was traced unintentionally
Import trace: App Route: ./next.config.mjs → ./app/api/open-in-editor/route.ts
```

The cause looks like the module-scope `path.join(process.cwd(), 'content')` on line 13 —
the warning text names `path.join`/`path.resolve` on a non-static base as the trigger, and
tracing then can't bound the file set. Two candidate fixes:

1. Move the `CONTENT_ROOT` computation inside the `POST` handler, so it isn't evaluated
   during tracing.
2. Keep it at module scope and mark it: `path.join(/*turbopackIgnore: true*/ process.cwd(), 'content')`.

Worth doing because the unbounded trace inflates the deployed function bundle, and because
one persistent warning trains you to skim past build output.

## Definition of done

`npm run build` is warning-free and the button still works in `npm run dev`.
