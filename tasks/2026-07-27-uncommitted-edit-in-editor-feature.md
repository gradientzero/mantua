---
title: Decide what to do with the uncommitted "edit in editor" feature
date: 2026-07-27
priority: medium
status: open
area: infra
---

## What this is

The 2026-07-27 ingest found an unfinished feature in the working tree and **deliberately
left it out of its commit**. Files involved:

- `app/api/open-in-editor/route.ts` (untracked)
- `components/edit-in-editor-button.tsx` (untracked)
- `app/globals.css` (the `.edit-in-editor-button` block, ~27 lines — the only change in
  that file)
- `app/[slug]/page.tsx` and `app/notes/[slug]/page.tsx` (one import + one `<EditInEditorButton />`
  each)

Everything else in the tree at that point — the harness-design cluster edits, `log.md`, the
task files, the `SimplifiedHarness` figure and its registration in `components/mdx.tsx` —
was committed. The five files above are a clean, separable set, so nothing else depends on
them.

## Why it was held back

It's a **local-authoring convenience that becomes a live production endpoint** if pushed.
`/api/open-in-editor` shows up in the build output as a dynamic route (`ƒ /api/open-in-editor`),
so it deploys to mantua.io along with everything else. An endpoint whose job is to open a
path on the host, reachable from the public internet, wants a deliberate decision rather
than being swept into an ingest commit by an agent that didn't write it.

It also produces the only warning in `npm run build`:

```
Turbopack build encountered 1 warnings:
./next.config.mjs
Encountered unexpected file in NFT list — the whole project was traced unintentionally
Import trace: App Route: ./next.config.mjs → ./app/api/open-in-editor/route.ts
```

The route imports something that pulls `next.config.mjs` into the server bundle and drags
the whole project into the trace. Worth fixing before it ships regardless of the security
question.

## Options

1. **Gate it to development** — render the button and register the route only when
   `process.env.NODE_ENV === 'development'`, so nothing exists in production. Probably the
   right answer for a tool whose whole purpose is editing files on the machine running the
   dev server.
2. **Keep it out of the repo** — leave it as a local working-tree patch.
3. **Ship it deliberately** — only with a path allowlist confined to `content/`, and a
   reason why a deployed static notebook needs it.

## Definition of done

Either the feature is committed in a form that is inert in production and the build warning
is gone, or the files are removed and this task is closed.
