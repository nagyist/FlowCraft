'use client'

import 'reactflow/dist/style.css'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from 'reactflow'

export default function ReactFlowViewer({
  nodes,
  edges,
}: {
  nodes: Node[]
  edges: Edge[]
}) {
  return (
    <div className="h-[480px] rounded-xl bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
