'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  mode: 'owner' | 'viewer'
  diagramId?: string
}

export default function ShareDialog({
  open,
  onClose,
  mode,
  diagramId,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [shareableLink, setShareableLink] = useState<string | null>(null)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGenerateLink = async () => {
    if (!diagramId) return
    setGeneratingLink(true)
    try {
      const res = await fetch('/api/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagramId }),
      })
      const data = await res.json()
      if (data.result?.link) {
        setShareableLink(data.result.link)
      }
    } catch (err) {
      console.error('Failed to generate link:', err)
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleClose = () => {
    setCopied(false)
    setShareableLink(null)
    onClose()
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-base font-semibold text-gray-900">
                    Share
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Current URL */}
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Page link
                    </label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <LinkIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="flex-1 truncate text-sm text-gray-600">
                        {currentUrl}
                      </span>
                      <button
                        onClick={() => handleCopy(currentUrl)}
                        className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Generate shareable link (owner mode only) */}
                  {mode === 'owner' && diagramId && (
                    <div>
                      {shareableLink ? (
                        <div>
                          <label className="text-xs font-medium text-gray-500">
                            Public shareable link
                          </label>
                          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                            <LinkIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                            <span className="flex-1 truncate text-sm text-green-700">
                              {shareableLink}
                            </span>
                            <button
                              onClick={() => handleCopy(shareableLink)}
                              className="flex-shrink-0 rounded-md p-1 text-green-500 transition-colors hover:bg-green-100"
                            >
                              {copied ? (
                                <CheckIcon className="h-4 w-4" />
                              ) : (
                                <ClipboardDocumentIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerateLink}
                          disabled={generatingLink}
                          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                          {generatingLink
                            ? 'Generating...'
                            : 'Generate shareable link'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
