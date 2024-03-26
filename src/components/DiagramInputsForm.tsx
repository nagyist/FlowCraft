import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { useContext, useEffect, useMemo, useState } from 'react'

import {
  chartJsAverageNewYorkWeatherReport,
  chartJsCancerRatesExampleReport,
  chartJsNetflixFinancialExampleReport,
  chartJsTeslaStockPricesExampleReport,
} from '@/lib/chart-js.code'
import { DiagramOrChartType, extractParsableJSON } from '@/lib/utils'
import {
  ChartBarIcon,
  ComputerDesktopIcon,
  PencilIcon,
} from '@heroicons/react/20/solid'
import { track } from '@vercel/analytics'
import ExamplesDropdown from './Dropdown'
import ErrorDialog from './ErrorDialog'
import { CompletionCommandsAssistant } from './Whiteboard/CompletionCommandsAssistant'
import { useAssistant } from './Whiteboard/UserPrompt'
import StepLine from './StepLine'
import { TempMermaidDiagramType } from './Mermaid/OverviewDialog.mermaid'
import { DiagramSelectionOptionsAndExamples } from '@/lib/DiagramSelectionOptionsAndExamples'

export const exampleMermaidPrompts = [
  { title: 'Sequence Diagram of a User Login', description: '' },
  { title: 'Flowchart of a User Registration Process', description: '' },
  { title: 'Mindmap of a Product Roadmap', description: '' },
  { title: 'Gantt Chart of a Project Timeline', description: '' },
  { title: 'Pie Chart of a Sales Report', description: '' },
  { title: 'Quadrant Chart of a Product Analysis', description: '' },
  { title: 'Requirement Diagram of a Software Project', description: '' },
  { title: 'Gitgraph (Git) Diagram of a Repository', description: '' },
  { title: 'State Diagram of a User Journey', description: '' },
  { title: 'Entity Relationship Diagram of a Database', description: '' },
  { title: 'User Journey of a Customer', description: '' },
  { title: 'Zenuml of a Software Architecture', description: '' },
  { title: 'Sankey of a Data Flow', description: '' },
]

export default function DiagramInputsForm({
  type,
}: {
  type: DiagramOrChartType | TempMermaidDiagramType
}) {
  const assistant = useMemo(() => new CompletionCommandsAssistant(), [])

  const controls = useAssistant(assistant)

  const [description, setDescription] = useState<string>('')
  const [error, setError] = useState<string | null>('')
  const [openErrorDialog, setOpenErrorDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<any>(
    DiagramSelectionOptionsAndExamples[2],
  )
  const [title, setTitle] = useState<string>('')

  const context = useContext(DiagramContext)

  useEffect(() => {
    setSelectedType(
      DiagramSelectionOptionsAndExamples.find((option) => option.id === type),
    )
    context.setType(type)
  }, [type])

  const handleSubmit = async () => {
    const type = context.type

    console.log('--- title', title)
    console.log('---- type', type)
    context.setTitle(title)
    context.setDescription(description)

    try {
      setError(null)

      // Submit analytics event
      if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
        track('create', {
          type: type,
          title: title,
        })
      }

      console.log('Selected Type: ', type)

      if (type === 'Whiteboard') {
        await controls?.start(title)
      } else {
        context.setLoading(true)
        context.setChartJsData(null)
        context.setMermaidData('')
        context.setNodes([])
        context.setEdges([])
        const diagram = await fetch('/api/generate-diagram', {
          method: 'POST',
          body: JSON.stringify({
            title: title,
            description: description,
            type: type,
          }),
        })

        console.log('Diagram Response: ', diagram)

        const diagramJson = await diagram.json()

        console.log('Diagram JSON 2: ', diagramJson)

        const whatToParse = diagramJson.result
          ? diagramJson.result
          : diagramJson.records

        const parseableJson = extractParsableJSON(whatToParse)

        if (parseableJson === null) {
          setError(
            'There was an error generating the diagram, please try again',
          )
          setOpenErrorDialog(true)
          context.setLoading(false)
          return
        }

        console.log('Diagram JSON: ', JSON.parse(parseableJson), 'Type: ', type)

        let diagramResult = JSON.parse(diagramJson.result)

        console.log('Diagram Result: ', diagramResult)

        if (
          diagramResult &&
          diagramResult.nodes &&
          diagramResult.edges &&
          type === 'Flow Diagram'
        ) {
          context.setNodes(diagramResult.nodes)
          context.setEdges(diagramResult.edges)
        } else if (diagramResult && diagramResult.data && type === 'Chart') {
          context.setChartJsData(diagramResult)
        } else if (diagramResult && diagramResult.mermaid) {
          console.log('Setting Mermaid Data: ', diagramResult.mermaid)
          context.setMermaidData(diagramResult.mermaid)
        }

        context.setLoading(false)
      }
    } catch (e) {
      console.log('Error generating diagram: ', e)
      context.setLoading(false)
      setError('There was an error generating the diagram, please try again')
    }
  }

  const selectExample = (title: string, description: string) => {
    setTitle(title)
    setDescription(description)
  }

  const selectOption = (option: {
    id: string
    title: string
    description: string
    prompts: { title: string; description: string }[]
  }) => {
    console.log('Selecting option', option)
    setSelectedType(option)
    // selectExample(option.prompts[2].title, option.prompts[2].description)
    context.setType(option.id as DiagramOrChartType)
  }

  if (context.loading) {
    return (
      <>
        <div className="mt-14 h-96 w-full rounded-lg bg-pink-50 shadow-lg">
          <p className="text-md text-center text-pink-900">
            Please be patient while we generate your diagram, it may take a
            couple minutes.
          </p>
          <div className="flex h-full items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-pink-500"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-xl leading-7 lg:max-w-none lg:grid-cols-2">
        <nav aria-label="Progress">
          <ol role="list" className="overflow-hidden">
            <li key="1" className="relative mt-2">
              <>
                <StepLine />
                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                      <p className="text-lg font-semibold text-white">1</p>
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-xl font-medium font-semibold">
                      Diagram Title
                    </span>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="mt-2 block w-96 border-0 border-b-2 border-indigo-500 pt-2.5 text-lg font-medium text-black placeholder:text-gray-400 focus:border-pink-200 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Enter Diagram Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </span>
                </div>
              </>
            </li>
            <li key="2" className="relative mt-2">
              <>
                <StepLine />

                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                      <p className="text-lg font-semibold text-white">2</p>
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-xl font-medium font-semibold">
                      {type === 'Chart'
                        ? 'Chart Data'
                        : 'Describe what you want to create'}
                    </span>
                    <textarea
                      rows={5}
                      name="description"
                      id="description"
                      className="mt-2 block w-96 resize-none border-0 border-b-2 border-indigo-500 py-2 text-gray-900 placeholder:text-gray-400 focus:border-pink-200 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder={
                        context.type === 'Chart'
                          ? 'Enter Chart Data. Data should be in CSV format with headers.'
                          : 'Enter Diagram details here'
                      }
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </span>
                </div>
              </>
            </li>
            <li key="3" className="relative mt-2">
              <>
                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                      <p className="text-lg font-semibold text-white">3</p>
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-xl font-medium font-semibold">
                      Generate
                    </span>
                    <button
                      className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleSubmit}
                      disabled={
                        context.loading || !title || description.length < 10
                      }
                    >
                      Create
                    </button>
                  </span>
                </div>
              </>
            </li>
          </ol>
        </nav>

        <div className="mt-2">
          <ExamplesDropdown
            values={selectedType.prompts}
            selectExample={selectExample}
            selectedType={selectedType.id}
            selectedTypeDescription={selectedType.description}
          />
        </div>
      </div>

      <ErrorDialog
        title="Error Generating Diagram"
        message={error || ''}
        setOpen={setOpenErrorDialog}
        open={openErrorDialog}
      />
    </>
  )
}
