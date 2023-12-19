'use client'
import { Fragment, useContext, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { Edge, Node } from 'reactflow'
import { TrashIcon } from '@heroicons/react/20/solid'
import { DiagramContext } from '@/lib/Contexts/DiagramContext'

export default function EditDiagramModal({
  open,
  setOpen,
  nodes,
  edges,
  setNodes,
  onNodesChange,
  addNode,
  updateNodeLabel,
  deleteNode,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  nodes: Node[]
  edges: Edge[]
  setNodes: (ndoes: Node[]) => void
  onNodesChange: any
  addNode: (node: Node) => void
  updateNodeLabel: (nodeId: string, label: string) => void
  deleteNode: (nodeId: string) => void
}) {
  const cancelButtonRef = useRef(null)

  const context = useContext(DiagramContext)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <PencilIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Edit Your Diagram
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="mx-auto max-w-5xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                          <div className="flex flex-col">
                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                              <div className="inline-block min-w-full py-2 align-middle">
                                <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                  <table className="min-w-full divide-y divide-pink-200">
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                      {nodes &&
                                        nodes.map((node: any) => {
                                          return (
                                            <tr key={node.id}>
                                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                <div className="flex shrink-0 items-center gap-x-6">
                                                  <input
                                                    type="text"
                                                    defaultValue={
                                                      node.data.label
                                                    }
                                                    onChange={(event) => {
                                                      node.data.label =
                                                        event.target.value
                                                      // setNodesState([...nodesState])
                                                      updateNodeLabel(
                                                        node.id,
                                                        event.target.value,
                                                      )
                                                    }}
                                                    className="mt-1 block w-full rounded-md border border-indigo-300 px-3 py-2 text-lg text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                  />
                                                  <button
                                                    className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-base text-sm font-semibold ring-1 ring-inset ring-green-300 hover:bg-green-300 hover:text-white"
                                                    onClick={() => {
                                                      context.setLoading(true)
                                                      context.setNodes([])
                                                      setTimeout(() => {
                                                        context.setNodes(nodes)
                                                        context.setLoading(
                                                          false,
                                                        )
                                                      }, 200)
                                                    }}
                                                  >
                                                    Update
                                                  </button>
                                                  <button
                                                    className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md bg-red-500 px-3 py-2 text-base text-sm font-semibold text-white ring-1 ring-inset ring-green-300 hover:bg-green-300 hover:text-white"
                                                    onClick={() => {
                                                      context.setLoading(true)
                                                      context.setNodes([])
                                                      setTimeout(() => {
                                                        deleteNode(node.id)
                                                        context.setLoading(
                                                          false,
                                                        )
                                                      }, 200)
                                                    }}
                                                  >
                                                    <TrashIcon className="h-5 w-5" />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      <tr>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                          <div className="flex shrink-0 items-center gap-x-6">
                                            <button
                                              className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-base text-sm font-semibold text-white ring-1 ring-inset ring-green-300 hover:bg-indigo-900 hover:text-white"
                                              onClick={() => {
                                                addNode({
                                                  ...nodes[1],
                                                  id: `${nodes.length + 1}`,
                                                  data: {
                                                    ...nodes[1].data,
                                                    label: `Entry ${
                                                      nodes.length + 1
                                                    }`,
                                                  },
                                                  position: {
                                                    x: 0,
                                                    y: 0,
                                                  },
                                                })
                                              }}
                                            >
                                              Add Item
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
