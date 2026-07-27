'use client'

import { useState } from 'react'

// Self-hides outside `next dev`: NODE_ENV is inlined at build time, so a
// production build never ships this button, deployed or not.
export function EditInEditorButton({ path }: { path: string }) {
  const [status, setStatus] = useState<'idle' | 'opening' | 'error'>('idle')

  if (process.env.NODE_ENV !== 'development') return null

  async function handleClick() {
    setStatus('opening')
    try {
      const res = await fetch('/api/open-in-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus('idle')
    } catch (error) {
      console.error('[edit-in-editor]', error)
      setStatus('error')
    }
  }

  return (
    <button
      type="button"
      className="edit-in-editor-button"
      onClick={handleClick}
      disabled={status === 'opening'}
    >
      {status === 'error' ? 'Couldn’t open — is the app running?' : 'Edit locally'}
    </button>
  )
}
