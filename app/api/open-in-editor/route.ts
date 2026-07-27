/**
 * Dev-only escape hatch: opens a content file in whatever app the OS has
 * registered as the default for .mdx/.md (VS Code, Typora, etc.), the same
 * as double-clicking it in Finder. Never available in production builds —
 * NODE_ENV there is always 'production', regardless of deployment target.
 */

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

// Mirrors velite.config.ts's SLUG_RE, applied per path segment.
const isSafeDocPath = (docPath: string): boolean =>
  docPath.split('/').every((segment) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))

function openWithDefaultApp(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, args] =
      process.platform === 'darwin'
        ? ['open', [filePath]]
        : process.platform === 'win32'
          ? ['cmd', ['/c', 'start', '""', filePath]]
          : ['xdg-open', [filePath]]
    execFile(cmd, args, (error) => (error ? reject(error) : resolve()))
  })
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'only available in dev' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const docPath = body?.path
  if (typeof docPath !== 'string' || !isSafeDocPath(docPath)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  }

  const filePath = ['mdx', 'md']
    .map((ext) => path.join(CONTENT_ROOT, `${docPath}.${ext}`))
    .find((candidate) => candidate.startsWith(CONTENT_ROOT + path.sep) && existsSync(candidate))

  if (!filePath) {
    return NextResponse.json({ error: 'file not found' }, { status: 404 })
  }

  try {
    await openWithDefaultApp(filePath)
  } catch (error) {
    console.error('[open-in-editor]', error)
    return NextResponse.json({ error: 'failed to open file' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
