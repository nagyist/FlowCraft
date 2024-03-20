import { PlayIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

import { DiagramData } from '@/lib/DiagramType.db'

import { GET as _getDiagrams } from '@/app/api/get-diagrams/route'
import { GET as _getShares } from '@/app/api/shares/route'
import { Metadata } from 'next'
import { DiagramType, navigationOptions } from '@/lib/utils'

async function getDiagrams() {
  const data = await _getDiagrams()

  if (data.status === 200) {
    const result = await data.json()
    return { diagrams: result.diagrams }
  }

  return { diagrams: [] }
}

async function getShares() {
  const data = await _getShares()

  if (data.status === 200) {
    const result = await data.json()
    return { shares: result.shares }
  }

  return { shares: [] }
}

// Metadata
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Create and manage your diagrams and charts',
}

export default async function Dashboard() {
  const stats = [
    { id: 1, name: 'Flow Diagrams Created', value: 0 },
    { id: 2, name: 'Charts Created', value: 0 },
    { id: 3, name: 'Whiteboard Sketches Created', value: 0 },
    { id: 4, name: 'Total Shares', value: 0 },
  ]
  const { diagrams } = await getDiagrams()
  const { shares } = await getShares()

  if (diagrams.length > 0) {
    stats[0].value = diagrams.filter(
      (d: any) => d.type === DiagramType.FlowDiagram,
    ).length
    stats[1].value = diagrams.filter(
      (d: any) => d.type === DiagramType.Chart,
    ).length
    stats[2].value = diagrams.filter(
      (d: any) => d.type === DiagramType.Whiteboard,
    ).length
  }

  if (shares.length > 0) {
    stats[3].value = shares.length
  }

  return (
    <div className="min-h-screen bg-gray-100 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="min-h-screen rounded-lg p-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <h2 className="border-b-2 border-indigo-500 text-base text-lg font-semibold text-indigo-500">
                  What would you like to create?
                </h2>
              </div>

              <ul
                role="list"
                className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 xl:grid-cols-3"
              >
                {navigationOptions.map((option) => (
                  <li
                    key={option.title}
                    className="col-span-1 flex transform flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white text-center shadow-lg transition duration-300 ease-in-out hover:scale-105"
                  >
                    <div className="flex flex-1 flex-col p-8">
                      <Image
                        className="mx-auto h-32 w-32 flex-shrink-0 rounded-full object-cover shadow-lg"
                        src={option.source}
                        height={128}
                        width={128}
                        alt={option.title}
                      />
                      <h3 className="font-large mt-6 text-lg font-bold text-indigo-500 sm:text-sm md:text-xl">
                        {option.title}
                      </h3>
                      <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dt className="sr-only">Description</dt>
                        <dd className="text-md text-indigo-700">
                          {option.description}
                        </dd>
                      </dl>
                    </div>
                    <div>
                      <div className="-mt-px flex">
                        <div className="flex w-0 flex-1">
                          <Link
                            href={option.link}
                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg rounded-br-lg border border-transparent py-4 text-lg font-medium text-pink-400 transition duration-300 ease-in-out hover:scale-105 hover:bg-indigo-700 hover:text-white"
                          >
                            <PlayIcon
                              className="h-5 w-5 text-pink-400 transition duration-150 ease-in-out group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                            Create
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {diagrams && diagrams.length > 0 ? (
              <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                  <div className="flex items-center justify-between">
                    <h2 className="border-b-2 border-indigo-500 text-base text-lg font-semibold text-indigo-500">
                      Recent Diagrams
                    </h2>
                  </div>
                  <dl className="mt-6 grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl text-center shadow-lg sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                      <div key={stat.id} className="flex flex-col bg-white p-8">
                        <dt className="text-sm font-semibold leading-6 text-indigo-500">
                          {stat.name}
                        </dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-black">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <ul
                    role="list"
                    className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
                  >
                    {diagrams.map((diagram: DiagramData) => (
                      <li
                        key={diagram.id}
                        className="transform overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 ease-in-out hover:scale-105"
                      >
                        <div className="flex items-center gap-x-4 border-b border-indigo-900/5 bg-gray-50 p-6">
                          <div className="text-md font-medium leading-6 text-indigo-700">
                            {diagram.title}
                          </div>
                        </div>
                        <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
                          <div className="flex justify-between gap-x-4 py-3">
                            <dt className="text-gray-500">Created On</dt>
                            <dd className="text-gray-700">
                              <time dateTime={diagram.created_at}>
                                {new Date(
                                  diagram.created_at,
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </time>
                            </dd>
                          </div>
                          <div className="flex justify-between gap-x-4 py-3">
                            <dt className="text-gray-500">Details</dt>
                            <dd className="flex items-start gap-x-2">
                              <div className="text-md rounded-lg px-2 py-1 font-medium shadow-lg ring-1 ring-inset">
                                {diagram.type}
                              </div>
                            </dd>
                          </div>
                          {/** button to view the diagram */}
                          <Link
                            href={`/dashboard/diagram/${diagram.id}`}
                            className="text-md relative inline-flex items-center justify-center gap-x-3 rounded-lg bg-pink-300 p-2 font-medium text-indigo-700 transition duration-300 ease-in-out hover:scale-105 hover:bg-indigo-300 hover:text-white"
                          >
                            <PlayIcon
                              className="h-5 w-5 text-pink-700"
                              aria-hidden="true"
                            />
                            View
                          </Link>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
