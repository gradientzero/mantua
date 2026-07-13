import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <h1 className="page-title">Page not found</h1>
      <p>
        This page doesn’t exist — or it’s a draft that isn’t published yet. Try{' '}
        <Link href="/notes">all notes</Link> or head <Link href="/">home</Link>.
      </p>
    </>
  )
}
