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
    <>
      <h1 className="page-title">Graph</h1>
      <p className="graph-page-intro">
        Every page in the notebook, connected by its wikilinks. Hubs are ringed, tags hollow,
        dashed circles are pages other notes link to that nobody has written yet. Hover to trace
        a neighborhood, drag to rearrange, scroll to zoom, click to open.
      </p>
      <GraphView data={graph} />
    </>
  )
}
