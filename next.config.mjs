// Velite runs as part of `next dev` / `next build` — no separate build step to
// remember. This is the integration pattern recommended by the Velite docs
// (https://velite.js.org/guide/with-nextjs): it is a plain build-time hook, not
// a webpack/turbopack plugin, so it survives Next.js major upgrades.
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  const { build } = await import('velite')
  await build({ watch: isDev, clean: !isDev })
}

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
