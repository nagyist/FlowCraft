'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  PhotoIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'
import { toPng } from 'html-to-image'

interface DownloadMenuProps {
  contentRef: React.RefObject<HTMLDivElement | null>
  title: string
  type: string
}

function downloadSVG(svgContent: string, filename = 'diagram') {
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
  const svgElement = svgDoc.querySelector('svg')

  if (!svgElement) return

  if (!svgElement.hasAttribute('width')) svgElement.setAttribute('width', '800')
  if (!svgElement.hasAttribute('height'))
    svgElement.setAttribute('height', '600')

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function DownloadMenu({
  contentRef,
  title,
  type,
}: DownloadMenuProps) {
  const filename = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'diagram'
  const isSvgType = ['infographic', 'mermaid'].includes(type.toLowerCase()) ||
    (!['illustration', 'generated_image', 'flow diagram', 'chart'].includes(type.toLowerCase()))

  const handleDownloadPng = async () => {
    if (!contentRef.current) return
    try {
      const dataUrl = await toPng(contentRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('PNG export failed:', err)
    }
  }

  const handleDownloadSvg = () => {
    if (!contentRef.current) return
    const svgElement = contentRef.current.querySelector('svg')
    if (!svgElement) return
    const svgContent = new XMLSerializer().serializeToString(svgElement)
    downloadSVG(svgContent, filename)
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="rounded-full p-2 text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
        title="Download"
        aria-label="Download"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-gray-200/80 bg-white py-1 shadow-xl shadow-black/5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleDownloadPng}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm ${
                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                <PhotoIcon className="h-4 w-4 text-gray-400" />
                Download as PNG
              </button>
            )}
          </Menu.Item>
          {isSvgType && (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleDownloadSvg}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm ${
                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <CodeBracketIcon className="h-4 w-4 text-gray-400" />
                  Download as SVG
                </button>
              )}
            </Menu.Item>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
