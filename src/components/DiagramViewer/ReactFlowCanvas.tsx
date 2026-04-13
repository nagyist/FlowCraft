'use client'

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
} from 'reactflow'
import {
  defaultEdgeOptions,
  defaultViewport,
  edgeTypes,
  nodeTypes,
} from '@/lib/react-flow.util'
import 'reactflow/dist/style.css'

interface ReactFlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
}

export default function ReactFlowCanvas({
  nodes,
  edges,
}: ReactFlowCanvasProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      defaultViewport={defaultViewport}
      nodesConnectable={false}
      nodesDraggable={false}
      fitView
      zoomOnScroll
      panOnScroll={false}
      attributionPosition="bottom-right"
    >
      <Controls
        position="bottom-left"
        className="!rounded-lg !border-gray-200/80 !bg-white/90 !shadow-lg !shadow-black/5 !backdrop-blur-xl"
      />
      <Background
        color="#d1d5db"
        gap={20}
        variant={BackgroundVariant.Dots}
        size={1}
      />
    </ReactFlow>
  )
}
