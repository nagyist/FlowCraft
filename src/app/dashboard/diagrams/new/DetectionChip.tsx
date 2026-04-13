import React, { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Menu, Transition } from '@headlessui/react'
import {
  ChevronDownIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/20/solid'
import { InputClassification, OptionType } from '@/lib/utils'
import clsx from 'clsx'

const INPUT_TYPE_LABELS: Record<string, string> = {
  plain_text: 'Text Description',
  meeting_transcript: 'Meeting Transcript',
  python_code: 'Python Code',
  javascript_code: 'JavaScript/TypeScript',
  generic_code: 'Source Code',
  markdown_bullets: 'Markdown / List',
  json_data: 'JSON Data',
  yaml_data: 'YAML Data',
  sql_schema: 'SQL Schema',
  api_spec_openapi: 'OpenAPI Spec',
}

const ALL_DIAGRAM_TYPES: OptionType[] = [
  'Flowchart',
  'Sequence Diagram',
  'Class Diagram',
  'State Diagram',
  'Entity Relationship Diagram',
  'User Journey',
  'Gantt',
  'Pie Chart',
  'Quadrant Chart',
  'Requirement Diagram',
  'Mindmaps',
  'Timeline',
  'Sankey',
  'XY Chart',
  'Block Diagram',
  'Architecture',
  'Kanban',
  'Radar',
  'Treemap',
  'Infographic',
]

export default function DetectionChip({
  classification,
  onOverride,
  selectedOption,
}: {
  classification: InputClassification
  onOverride: (type: OptionType) => void
  selectedOption?: OptionType
}) {
  const inputLabel =
    INPUT_TYPE_LABELS[classification.inputType] || classification.inputType

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
    >
      <SparklesIcon className="h-4 w-4 text-amber-500" />

      <span className="text-sm font-medium text-zinc-700">
        Detected:{' '}
        <span className="rounded-md bg-zinc-200/60 px-1.5 py-0.5 font-semibold text-zinc-900">
          {inputLabel}
        </span>
      </span>

      <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-400" />

      <span className="text-sm text-zinc-600">Suggested:</span>

      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
          {selectedOption ?? classification.suggestedDiagram}
          <ChevronDownIcon className="h-4 w-4 text-blue-500" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-50 mt-1.5 max-h-64 w-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-xl ring-1 ring-black/5 focus:outline-none">
            {ALL_DIAGRAM_TYPES.map((type) => (
              <Menu.Item key={type}>
                {({ active }) => (
                  <button
                    className={clsx(
                      'w-full px-3 py-2 text-left text-sm',
                      active && 'bg-blue-50',
                      type === (selectedOption ?? classification.suggestedDiagram)
                        ? 'font-semibold text-blue-700'
                        : 'text-zinc-700',
                    )}
                    onClick={() => onOverride(type)}
                  >
                    {type}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      {classification.confidence >= 0.8 && (
        <span className="ml-auto text-xs text-zinc-400">
          {Math.round(classification.confidence * 100)}% confidence
        </span>
      )}
    </motion.div>
  )
}
