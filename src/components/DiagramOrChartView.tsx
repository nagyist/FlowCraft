'use client'

import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Controls,
  Background,
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  updateEdge,
  BackgroundVariant,
  EdgeTypes,
  Edge,
  MarkerType,
  getRectOfNodes,
  getTransformForBounds,
  getViewportForBounds,
} from 'reactflow'

import mermaid from 'mermaid'
import 'reactflow/dist/style.css'
import Lottie from 'lottie-react'
import LottieAnimation from '@/lib/LoaderAnimation.json'

import Chart from 'chart.js/auto'
import CustomInputBoxNode from './ReactFlow/CustomInputBoxNode'
import { initialEdges, initialNodes } from '@/lib/react-flow.code'
import SuccessDialog from './SuccessDialog'
import { nodeStyle } from '@/lib/react-flow.code'
import Whiteboard from './Whiteboard/Whiteboard'
import { scenarios } from '@/components/Whiteboard/scenarios'
import { CompletionCommandsAssistant } from './Whiteboard/CompletionCommandsAssistant'
import { DiagramOrChartType, downloadImage } from '@/lib/utils'
import DiagramSettingsBar from './ReactFlow/DiagramSettingsBar'
import { toPng } from 'html-to-image'
import ShareableLinksModal from './ShareableLinkModal'
import SimpleNotification from './SimpleNotification'
import {
  defaultEdgeOptions,
  defaultViewport,
  edgeTypes,
  nodeTypes,
} from '@/lib/react-flow.util'
import { TempMermaidDiagramType } from './Mermaid/OverviewDialog.mermaid'

const Loader = () => {
  return (
    <>
      <div className="text-md flex items-center justify-center text-center text-pink-500">
        Please be patient while we generate your diagram, it may take a couple
        minutes.
      </div>
      <Lottie animationData={LottieAnimation} loop={true} />
    </>
  )
}

const checkIfMermaidDiagram = (
  type: DiagramOrChartType | TempMermaidDiagramType | null,
) => {
  return (
    type === 'classDiagram' ||
    type === 'flowchart' ||
    type === 'sequenceDiagram' ||
    type === 'stateDiagram' ||
    type === 'entityRelationshipDiagram' ||
    type === 'userJourney' ||
    type === 'gantt' ||
    type === 'pieChart' ||
    type === 'quadrantChart' ||
    type === 'requirementDiagram' ||
    type === 'gitgraph' ||
    type === 'mindmaps' ||
    type === 'sankey' ||
    type === 'timeline' ||
    type === 'zenuml'
  )
}

export default function DiagramOrChartView({
  type,
}: {
  type: DiagramOrChartType | TempMermaidDiagramType
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [toggleReactFlowGird, setToggleReactFlowGird] = useState<boolean>(true)

  const [openShareableLinkModal, setOpenShareableLinkModal] =
    useState<boolean>(false)
  const [shareableLink, setShareableLink] = useState<{
    link: string
    inviteCode: string
  }>({
    link: '',
    inviteCode: '',
  })

  const [tlDrawInputJson, setTlDrawInputJson] = useState<string>(
    JSON.stringify(scenarios.house_buying_process),
  )

  const [chartCreated, setChartCreated] = useState<boolean>(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false)
  const [isMermaidError, setIsMermaidError] = useState<boolean>(false)

  const [notification, setNotification] = useState<{
    message: string
    title: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>()

  const context = useContext(DiagramContext)

  useEffect(() => {
    context.setMermaidData('')
    context.setChartJsData({})
    context.setNodes([])
    context.setEdges([])
    context.setTlDrawRecords([])
  }, [type])

  useEffect(() => {
    console.log('context.type: ', context.type)
    if (context.type === 'Flow Diagram') {
      console.log('we are in the Flow Diagram context!')
      if (!context.nodes && !context.edges) return
      if (context.nodes.length === 0 || context.edges.length === 0) return

      const edgesWithMarkerAndStyle = context.edges.map((edge: Edge) => {
        console.log('Individual edge: ', edge)
        return {
          ...edge,
          type: 'floating',
          data: {
            label: edge.label ? edge.label : '',
          },
        }
      })

      const nodesWithStyle = context.nodes.map((node: Node) => {
        return {
          ...node,
          ...nodeStyle,
          type: 'customNode',
        }
      })

      // const { nodes: arrangedNodes, edges: arrangedEdges } =
      //   autoArrangeNodesAndEdges(nodesWithStyle, edgesWithMarkerAndStyle)
      // console.log('arrangedNodes', arrangedNodes)

      setNodes(nodesWithStyle)
      setEdges(edgesWithMarkerAndStyle as Edge[])

      const fitButton = document.getElementsByClassName(
        '.react-flow__controls-fitview',
      )[0] as HTMLButtonElement
      if (fitButton) {
        fitButton.click()
      }

      console.log('Setting success dialog open to true', nodesWithStyle.length)
      setSuccessDialogOpen(true && !context.loading)
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
    } else if (context.type === 'Whiteboard') {
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
    } else if (
      checkIfMermaidDiagram(context.type) &&
      context.mermaidData !== '' &&
      !context.loading
    ) {
      console.log('context.mermaidData: ', context.mermaidData)

      mermaid.mermaidAPI
        .parse(context.mermaidData, { suppressErrors: true })
        .then(async (res) => {
          console.log('Mermaid API Response: ', res)
          if (res) {
            setIsMermaidError(false)
            mermaid.initialize({
              startOnLoad: false,
              theme: 'forest',
            })
            mermaid.run({
              querySelector: '.mermaid',
            })

            await mermaid.init(
              undefined,
              document.querySelectorAll('.mermaid')[0] as HTMLElement,
            )

            return
          }

          setIsMermaidError(true)
          return
        })
        .catch((err) => {
          console.error('Mermaid API Error: ', err)
          setIsMermaidError(true)
        })
    }
  }, [
    context.nodes,
    context.edges,
    context.loading,
    context.chartJsData,
    context.type,
    context.mermaidData,
  ])

  const onConnect = useCallback(
    (params: any) => {
      console.log('Connecting: ', params)
      setEdges((eds) => {
        context.setEdges(
          eds.map((edge) => {
            if (
              edge.source === params.source &&
              edge.target === params.target
            ) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  label: params.label,
                },
              }
            }
            return edge
          }),
        )
        return addEdge(
          {
            ...params,
            type: 'floating',
            markerEnd: { type: MarkerType.Arrow },
          },
          eds,
        )
      })
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

  const deleteEdge = useCallback(
    (edgeId: string) => {
      context.setEdges(edges.filter((e) => e.id !== edgeId))
      setEdges((es) => {
        const edgeIndex = es.findIndex((e) => e.id === edgeId)
        es.splice(edgeIndex, 1)
        return es
      })
    },
    [edges],
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

  const donwloadChart = () => {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement
    const image = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = 'chart.png'
    link.href = image
    link.click()
  }

  const clearReactFlowDiagram = () => {
    setNodes([])
    setEdges([])
  }

  if (type === 'Chart') {
    if (context.loading) {
      return <Loader />
    }
    return (
      <div className="ml-auto mr-auto mt-14 w-5/6 rounded-xl bg-white p-5 shadow-lg">
        {/** A button to download the chart */}
        <button
          className="rounded-md bg-indigo-700 p-2 text-white"
          onClick={donwloadChart}
        >
          Download Chart
        </button>
        <canvas id="myChart"></canvas>
      </div>
    )
  }

  const createShareableLink = async () => {
    const type = context.type
    let data = {
      type: '',
      diagramData: {},
      title: context.title,
      description: context.description,
    }
    if (type === 'Flow Diagram') {
      data.type = 'Flow Diagram'
      data.diagramData = { nodes, edges }
    } else if (type === 'Whiteboard') {
      data.type = 'Whiteboard'
      data.diagramData = { tlDrawRecords: JSON.parse(tlDrawInputJson).records }
    }

    const response = await fetch('/api/generate-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response && response.status !== 200) {
      console.error('Error creating shareable link')
      setNotification({
        message: 'Error creating shareable link',
        title: 'Error',
        type: 'error',
      })
      return
    }

    const responseJson = await response.json()
    console.log('responseJson', responseJson)

    if (!responseJson.result) {
      setNotification({
        message:
          'There was an error creating the shareable link, please try again later!',
        title: 'Error',
        type: 'error',
      })
      return
    }

    setShareableLink({
      link: responseJson.result.link,
      inviteCode: responseJson.result.inviteCode,
    })
    setOpenShareableLinkModal(true)
  }

  const toggleGrid = (enabled: boolean) => {
    setToggleReactFlowGird(enabled)
  }

  const downloadFlowDiagramAsPng = async () => {
    const reactFlowContainer = document.querySelector(
      '.react-flow__container',
    ) as HTMLElement

    if (!reactFlowContainer) {
      console.error('reactFlowContainer not found')
      return
    }
    const imageWidth = 1024
    const imageHeight = 768

    const nodesBounds = getRectOfNodes(nodes)
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    )

    const tempNodes = [...nodes]
    const tempEdges = [...edges]

    const nodesWithDefaultStyle = nodes.map((node: Node) => {
      return {
        ...node,
        type: '',
      }
    })

    setNodes(nodesWithDefaultStyle)

    const fitButton = document.getElementsByClassName(
      '.react-flow__controls-fitview',
    )[0] as HTMLButtonElement
    if (fitButton) {
      fitButton.click()
    }

    const source = document.querySelector(
      '.react-flow__viewport',
    ) as HTMLElement

    const dataUrl = await toPng(source, {
      backgroundColor: '#1a365d',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    })

    const fileName = context.title
      ? context.title.replace(' ', '-')
      : 'flow-diagram'
    downloadImage(dataUrl, fileName)

    setNodes(tempNodes)
    setEdges(tempEdges)
  }

  const downloadMermaidDiagramAsPng = async () => {
    const mermaidContainer = document.querySelector('.mermaid') as HTMLElement

    if (!mermaidContainer) {
      console.error('mermaidContainer not found')
      return
    }

    const imageWidth = 1024
    const imageHeight = 768

    const dataUrl = await toPng(mermaidContainer, {
      backgroundColor: '#1a365d',
      width: imageWidth,
      height: imageHeight,
    })

    const fileName = context.title
      ? context.title.replace(' ', '-')
      : 'mermaid-diagram'
    downloadImage(dataUrl, fileName)
  }

  return (
    <>
      {notification && (
        <SimpleNotification
          message={notification?.message}
          title={notification?.title}
          type={notification?.type}
        />
      )}

      <div className="mt-4">
        {context.type === 'Flow Diagram' && (
          <DiagramSettingsBar
            nodes={nodes}
            edges={edges}
            deleteNode={deleteNode}
            addNode={addNode}
            updateNodeLabel={updateNodeLabel}
            updateEdgeLabel={updateEdgeLabel}
            deleteEdge={deleteEdge}
            clearReactFlowDiagram={clearReactFlowDiagram}
            createShareableLink={createShareableLink}
            toggleGrid={toggleGrid}
            downloadFlowDiagramAsPng={downloadFlowDiagramAsPng}
          />
        )}
      </div>

      <div className="ml-auto mr-auto h-screen w-11/12 rounded-xl bg-gray-100 shadow-lg">
        {context.loading ? (
          <Loader />
        ) : (
          <>
            {context.type === 'Flow Diagram' && (
              <>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onEdgeUpdate={onEdgeUpdate}
                  onConnect={onConnect}
                  connectionLineType={ConnectionLineType.SimpleBezier}
                  snapToGrid={false}
                  snapGrid={[25, 25]}
                  defaultViewport={defaultViewport}
                  fitView
                  attributionPosition="bottom-left"
                  defaultEdgeOptions={defaultEdgeOptions}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  className="react-flow__container"
                >
                  <Controls />
                  {toggleReactFlowGird && (
                    <Background
                      color="#808080"
                      gap={40}
                      variant={BackgroundVariant.Cross}
                    />
                  )}
                </ReactFlow>
              </>
            )}
            {type === 'Whiteboard' && (
              <Whiteboard inputJson={tlDrawInputJson} />
            )}
            {checkIfMermaidDiagram(type) && (
              <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mx-auto h-screen max-w-7xl items-center justify-center rounded-xl bg-white px-4 py-4 shadow-lg sm:px-6 lg:px-8">
                <p className="text-center text-2xl font-bold text-pink-500">
                  {context.title && !context.title.includes('SAMPLE')
                    ? context.title
                    : ''}
                </p>
                <button
                  className="mb-2 mt-2 rounded-md bg-pink-500 p-2 text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-pink-600 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={downloadMermaidDiagramAsPng}
                  disabled={isMermaidError || context.loading}
                >
                  Download Diagram
                </button>
                {isMermaidError ? (
                  <div className="text-center text-red-500">
                    There was an error generating the diagram. Please try again
                    later.
                  </div>
                ) : context.mermaidData === '' ? (
                  <div className="text-center text-red-500">
                    No data to display
                  </div>
                ) : (
                  <pre className="mermaid mx-auto h-full w-full text-center">
                    {context.mermaidData}
                  </pre>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <SuccessDialog
        buttonText="View Diagram"
        header="Success!"
        message={`Yayy! Your ${type} has been generated! ${
          type === 'Flow Diagram'
            ? 'Scroll down and try clicking on the labels to move them around!'
            : ''
        }'`}
        open={successDialogOpen}
        setOpen={setSuccessDialogOpen}
      />
      <ShareableLinksModal
        isOpen={openShareableLinkModal}
        onClose={() => setOpenShareableLinkModal(false)}
        shareableLink={shareableLink?.link}
        inviteCode={shareableLink?.inviteCode}
      />
    </>
  )
}
