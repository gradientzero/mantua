// Velite runs as part of `next dev` / `next build` — no separate content build
// step to remember (https://velite.js.org/guide/with-nextjs). Dev/build is
// detected via the `phase` argument Next passes to a config function: in
// Next 16 this config is evaluated only in the dev-server worker process
// (start-server.js), whose argv contains no 'dev', so the process.argv
// sniffing the Velite docs recommend silently never runs.
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants.js'

/** @type {import('next').NextConfig} */
const nextConfig = {}

// Next calls this more than once per process; VELITE_STARTED keeps it to a
// single Velite instance (and a single content watcher in dev).
export default async function config(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER
  const isBuild = phase === PHASE_PRODUCTION_BUILD
  if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
    process.env.VELITE_STARTED = '1'
    const { build } = await import('velite')
    await build({ watch: isDev, clean: !isDev })
  }
  return nextConfig
}
