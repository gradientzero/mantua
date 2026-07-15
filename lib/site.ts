/** Site-wide constants. Set NEXT_PUBLIC_SITE_URL in Vercel (and .env.local) —
 *  it feeds canonical URLs, Open Graph tags and the sitemap. */
export const site = {
  name: 'SLM Research Notebook',
  tagline: 'Notes on small language model engineering',
  description:
    'A working research notebook on small language model adoption for industry-specific enterprise tasks.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  author: 'gradientzero',
}
