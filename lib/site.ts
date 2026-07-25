/** Site-wide constants. Set NEXT_PUBLIC_SITE_URL in Vercel (and .env.local) —
 *  it feeds canonical URLs, Open Graph tags and the sitemap. */
export const site = {
  name: 'mantua.io',
  tagline: 'a commonplace notebook',
  description:
    'mantua.io — a commonplace notebook: one inbox for everything worth keeping, a wiki maintained by agents, densely interlinked and continuously deployed.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  /** The human whose notebook this is. Hand-written pages carry this byline. */
  owner: 'Wolfgang Gross',
  /** Byline for pages written and maintained by agents (origin: agent). */
  agentByline: 'mantua agents',
}

/** Provenance → byline. Keeps the "who wrote this" labeling in one place. */
export function bylineFor(doc: { origin: 'human' | 'agent' | 'mixed'; author?: string }): string {
  const human = doc.author ?? site.owner
  if (doc.origin === 'human') return human
  if (doc.origin === 'mixed') return `${human} · with agents`
  return site.agentByline
}
