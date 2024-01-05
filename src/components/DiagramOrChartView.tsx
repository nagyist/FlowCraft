'use client'

import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Controls,
  Background,
  Node,
  addEdge,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  updateEdge,
  BackgroundVariant,
  EdgeTypes,
  Edge,
} from 'reactflow'

import 'reactflow/dist/style.css'
import Lottie from 'lottie-react'
import LottieAnimation from '@/lib/LoaderAnimation.json'
//@ts-ignore
import { ArrowDownIcon } from '@heroicons/react/20/solid'
import DownloadButton from './DownloadImageButton'

import Chart from 'chart.js/auto'
import CustomInputBoxNode from './ReactFlow/CustomInputBoxNode'
import { initialEdges, initialNodes } from '@/lib/react-flow.code'
import EditDiagramButton from './EditDiagramButton'
import CustomEdge from './ReactFlow/CustomEdge'
import SuccessDialog from './SuccessDialog'
import { nodeStyle } from '@/lib/react-flow.code'
import Whiteboard from './Whiteboard/Whiteboard'
import { scenarios } from '@/components/Whiteboard/scenarios'
import ContextMenu from './ReactFlow/CustomContextMenu'
import CustomNode from './ReactFlow/CustomNode'

const defaultEdgeOptions = {
  animated: true,
  type: ConnectionLineType.SimpleBezier,
}

const nodeTypes = {
  customNode: CustomNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

const defaultViewport = { x: 0, y: 0, zoom: 1.5 }

export default function DiagramOrChartView() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [menu, setMenu] = useState<any>(true)

  const ref = useRef<any>(null)

  const [tlDrawInputJson, setTlDrawInputJson] = useState<string>(
    JSON.stringify(scenarios.house_buying_process),
  )

  const [chartCreated, setChartCreated] = useState<boolean>(false)

  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false)

  const context = useContext(DiagramContext)

  useEffect(() => {
    console.log('context.type: ', context.type)
    if (context.type === 'Flow Diagram') {
      console.log('we are in the TLDraw')
      console.log('Edges: ', context.edges)
      console.log('Nodes: ', context.nodes)
      if (!context.nodes && !context.edges) return
      if (context.nodes.length === 0 || context.edges.length === 0) return

      console.log('context.nodes --> ', context.nodes)
      console.log('context.edges -->', context.edges)

      const edgesWithMarkerAndStyle = context.edges.map((edge: Edge) => {
        console.log('Individual edge: ', edge)
        return {
          ...edge,
          type: 'custom',
          data: {
            label: edge.label ? edge.label : '',
          },
        }
      })

      const nodesWithStyle = context.nodes.map((node: Node) => {
        return {
          ...node,
          ...nodeStyle,
        }
      })

      setNodes(nodesWithStyle)
      setEdges(edgesWithMarkerAndStyle as any)

      const fitButton = document.getElementsByClassName(
        '.react-flow__controls-fitview',
      )[0] as HTMLButtonElement
      if (fitButton) {
        fitButton.click()
      }

      setSuccessDialogOpen(true)
    } else if (context.type === 'Chart') {
      console.log('context.chartJsData', context.chartJsData)
      const ctx = document.getElementById('myChart') as HTMLCanvasElement

      // if a chart was already created, destroy it
      if (chartCreated) {
        Chart.getChart(ctx)?.destroy()
      }

      const myChart = new Chart(ctx, {
        type: context.chartJsData.type || 'bar',
        ...context.chartJsData,
      })

      setChartCreated(true)
    } else if (context.type === 'TLDraw') {
      console.log('context.tlDrawRecords: ', context.tlDrawRecords)
      if (!context.tlDrawRecords || context.tlDrawRecords.length === 0) {
        return
      }

      const recordsWithNecessaryFields = context.tlDrawRecords.map(
        (record: any) => {
          return {
            ...record,
            parentId: 'page:page',
            isLocked: false,
            meta: {},
            opacity: 1,
            props: {
              ...record.props,
              [record.type === 'geo' ? 'url' : 'font']:
                record.type === 'geo' ? '' : 'draw',
              [record.type === 'geo' ? 'growY' : 'dash']:
                record.type === 'geo' ? 0 : 'draw',
            },
          }
        },
      )

      scenarios.house_buying_process.records = recordsWithNecessaryFields
      setTlDrawInputJson(JSON.stringify(scenarios.house_buying_process))
    }
  }, [
    context.nodes,
    context.edges,
    context.loading,
    context.chartJsData,
    context.type,
  ])

  const onConnect = useCallback(
    (params: any) => {
      console.log('onConnect params', params)
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges],
  )

  const onEdgeUpdate = useCallback(
    (oldEdge: any, newConnection: any) =>
      setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [],
  )

  const addNode = useCallback(() => {
    const copyOfSecondNode = nodes[1]
    setNodes((ns) => [
      ...ns,
      {
        ...copyOfSecondNode,
        id: `${ns.length + 1}`,
        data: {
          ...copyOfSecondNode.data,
          label: `Node ${ns.length + 1}`,
        },
        position: {
          x: 100,
          y: 200,
        },
      },
    ])
  }, [nodes])

  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((ns) => {
        const nodeIndex = ns.findIndex((n) => n.id === nodeId)
        const node = ns[nodeIndex]
        const newNode = {
          ...node,
          data: {
            ...node.data,
            label: newLabel,
          },
        }
        ns[nodeIndex] = newNode
        return ns
      })
    },
    [nodes],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((ns) => {
        const nodeIndex = ns.findIndex((n) => n.id === nodeId)
        ns.splice(nodeIndex, 1)
        return ns
      })
    },
    [nodes],
  )

  const updateEdgeLabel = useCallback(
    (id: string, newValue: string) => {
      setEdges((es) => {
        const edgeIndex = es.findIndex((e) => e.id === id)
        const edge = es[edgeIndex]
        const newEdge = {
          ...edge,
          data: {
            ...edge.data,
            label: newValue,
          },
        }
        es[edgeIndex] = newEdge
        return es
      })
    },
    [edges],
  )

  const onNodeContextMenu = useCallback(
    (event: any, node: any) => {
      // Prevent native context menu from showing
      event.preventDefault()

      if (ref && ref.current) {
        // Calculate position of the context menu. We want to make sure it
        // doesn't get positioned off-screen.

        const pane = ref.current.getBoundingClientRect()
        setMenu({
          id: node.id,
          top: event.clientY < pane.height - 200 && event.clientY,
          left: event.clientX < pane.width - 200 && event.clientX,
          right:
            event.clientX >= pane.width - 200 && pane.width - event.clientX,
          bottom:
            event.clientY >= pane.height - 200 && pane.height - event.clientY,
        })
      }
    },
    [setMenu],
  )

  const onPaneClick = useCallback(() => setMenu(null), [setMenu])

  return (
    <>
      <div className="mr-5 mt-7 flex items-center justify-between">
        <h1 className="text-2xl font-bold leading-7 text-indigo-900 sm:truncate sm:text-3xl">
          {context.title}
        </h1>
        <div className="-mt-96 animate-bounce font-bold text-white">
          Scroll Down
          <ArrowDownIcon className="h-10 w-10" />
        </div>
      </div>

      <div className="mt-14 h-screen rounded-xl bg-black shadow-lg">
        {context.loading ? (
          <>
            <div className="text-md flex items-center justify-center text-center text-pink-500">
              Please be patient while we generate your diagram, it may take a
              couple minutes.
            </div>
            <Lottie animationData={LottieAnimation} loop={true} />
          </>
        ) : (
          <>
            {context.type === 'Flow Diagram' && (
              <>
                <ReactFlow
                  ref={ref}
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onEdgeUpdate={onEdgeUpdate}
                  onConnect={onConnect}
                  connectionLineType={ConnectionLineType.SimpleBezier}
                  snapToGrid={true}
                  snapGrid={[25, 25]}
                  defaultViewport={defaultViewport}
                  fitView
                  attributionPosition="bottom-left"
                  defaultEdgeOptions={defaultEdgeOptions}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  onPaneClick={onPaneClick}
                  // onNodeContextMenu={onNodeContextMenu}
                >
                  <Controls />
                  <Background
                    color="#808080"
                    gap={40}
                    variant={BackgroundVariant.Lines}
                  />
                  <MiniMap />

                  <DownloadButton />
                  <EditDiagramButton
                    nodes={nodes}
                    edges={edges}
                    deleteNode={deleteNode}
                    addNode={addNode}
                    updateNodeLabel={updateNodeLabel}
                    updateEdgeLabel={updateEdgeLabel}
                  />
                  {/* {menu && <ContextMenu onClick={onPaneClick} {...menu} />} */}
                </ReactFlow>
              </>
            )}
            {context.type === 'Chart' && (
              <div className="flex h-screen items-center justify-center rounded-xl bg-white p-10 shadow-lg">
                <canvas id="myChart" className="h-max"></canvas>
              </div>
            )}
            {context.type === 'TLDraw' && (
              <Whiteboard inputJson={tlDrawInputJson} />
            )}
          </>
        )}
      </div>
      <SuccessDialog
        buttonText="View Diagram"
        header="Success!"
        message={`Yayy! Your ${context.type} has been generated! ${
          context.type === 'Flow Diagram'
            ? 'Try clicking on the labels to move them around!'
            : ''
        }'`}
        open={successDialogOpen}
        setOpen={setSuccessDialogOpen}
      />
    </>
  )
}
