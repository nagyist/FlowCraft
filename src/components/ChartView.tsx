'use client'

import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { useCallback, useContext, useEffect } from 'react'
import ReactFlow, {
  Controls,
  Background,
  Node,
  addEdge,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from 'reactflow'

import 'reactflow/dist/style.css'
import Lottie from 'lottie-react'
import LottieAnimation from '@/lib/LoaderAnimation.json'
//@ts-ignore
import { saveAsPng } from 'save-html-as-image'
import { ArrowDownIcon } from '@heroicons/react/20/solid'
import DownloadButton from './DownloadImageButton'

import Chart from 'chart.js/auto'

const connectionLineStyle = { stroke: '#00FF00' }

const defaultEdgeOptions = {
  animated: true,
  type: ConnectionLineType.SimpleBezier,
}

const defaultViewport = { x: 0, y: 0, zoom: 1.5 }

const initialNodes: Node[] = [
  {
    id: '1',
    data: {
      label: 'Start',
    },
    position: {
      x: 100,
      y: 100,
    },
    type: 'input',
  },
  {
    id: '2',
    data: {
      label: 'Fold the Paper in Half',
    },
    position: {
      x: 300,
      y: 100,
    },
  },
  {
    id: '3',
    data: {
      label: 'Unfold the Paper',
    },
    position: {
      x: 300,
      y: 200,
    },
  },
  {
    id: '4',
    data: {
      label: 'Fold the Top Corners to the Center',
    },
    position: {
      x: 500,
      y: 100,
    },
  },
  {
    id: '5',
    data: {
      label: 'Fold the Top Edges to the Center',
    },
    position: {
      x: 500,
      y: 200,
    },
  },
  {
    id: '6',
    data: {
      label: 'Fold the Plane in Half',
    },
    position: {
      x: 700,
      y: 100,
    },
  },
  {
    id: '7',
    data: {
      label: 'Fold the Wings Down',
    },
    position: {
      x: 900,
      y: 100,
    },
  },
  {
    id: '8',
    data: {
      label: 'Finish',
    },
    position: {
      x: 1100,
      y: 100,
    },
    type: 'output',
  },
]

const initialEdges = [
  {
    id: '1-2',
    source: '1',
    target: '2',
  },
  {
    id: '2-3',
    source: '2',
    target: '3',
  },
  {
    id: '3-4',
    source: '3',
    target: '4',
  },
  {
    id: '3-5',
    source: '3',
    target: '5',
  },
  {
    id: '4-6',
    source: '4',
    target: '6',
  },
  {
    id: '5-6',
    source: '5',
    target: '6',
  },
  {
    id: '6-7',
    source: '6',
    target: '7',
  },
  {
    id: '7-8',
    source: '7',
    target: '8',
  },
]

export default function ChartView() {
  // const [nodes, setNodes] = useState<Node[]>(initialNodes)
  // const [edges, setEdges] = useState<Edge[]>(initialEdges)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const context = useContext(DiagramContext)

  useEffect(() => {
    if (!context.nodes || !context.edges) return
    if (context.nodes.length === 0 || context.edges.length === 0) return

    console.log('context.nodes', context.nodes)
    console.log('context.edges', context.edges)

    setNodes(context.nodes)
    setEdges(context.edges)
  }, [context.nodes, context.edges])

  useEffect(() => {
    if (!context.loading && context.chartJsData) {
      console.log('context.chartJsData', context.chartJsData)
      const ctx = document.getElementById('myChart') as HTMLCanvasElement
      const myChart = new Chart(ctx, {
        type: context.chartJsData.type || 'bar',
        ...context.chartJsData,
      })
    }
  }, [context.loading, context.chartJsData])

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  )

  return (
    <>
      <div className="mr-5 mt-7 flex items-center justify-between">
        <h1 className="text-2xl font-bold leading-7 text-indigo-900 sm:truncate sm:text-3xl">
          {context.title}
        </h1>
        <div className="animate-bounce font-bold text-white">
          Scroll Down
          <ArrowDownIcon className="h-10 w-10" />
        </div>
      </div>

      <div className="mt-14 h-screen rounded-xl bg-pink-50 shadow-lg">
        {context.loading ? (
          <>
            <div className="text-md flex items-center justify-center text-center text-pink-500">
              Please be patient while we generate your diagram, it may take a
              couple minutes.
            </div>
            <Lottie animationData={LottieAnimation} loop={true} />
          </>
        ) : (
          // <ReactFlow
          //   nodes={nodes}
          //   edges={edges}
          //   onNodesChange={onNodesChange}
          //   onEdgesChange={onEdgesChange}
          //   onConnect={onConnect}
          //   connectionLineStyle={connectionLineStyle}
          //   connectionLineType={ConnectionLineType.SmoothStep}
          //   snapToGrid={true}
          //   snapGrid={[25, 25]}
          //   defaultViewport={defaultViewport}
          //   fitView
          //   attributionPosition="bottom-left"
          //   defaultEdgeOptions={defaultEdgeOptions}
          // >
          //   <Controls />
          //   <Background color="#aaa" gap={16} />
          //   <MiniMap />
          //   <DownloadButton />
          // </ReactFlow>
          <div className="flex items-center justify-center">
            <canvas id="myChart" className="h-max"></canvas>
          </div>
        )}
      </div>
    </>
  )
}
