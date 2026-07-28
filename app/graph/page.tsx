import type { Metadata } from 'next'
import { GraphView } from '@/components/graph/graph-view'
import { buildGraph } from '@/lib/graph'

export const metadata: Metadata = {
  title: 'Graph',
  description: 'The notebook as a map: every page and tag, connected by wikilinks.',
}

export default function GraphPage() {
  const graph = buildGraph()
  return (
    <div className="graph-page">
      <GraphView data={graph} height="100%" />
    </div>
  )
}
