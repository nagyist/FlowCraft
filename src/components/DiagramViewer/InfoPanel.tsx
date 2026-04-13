'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import FlowCraftLogo from '@/images/FlowCraftLogo_New.png'

interface InfoPanelProps {
  open: boolean
  onClose: () => void
  title: string
  type: string
  description?: string
  createdAt?: string
}

const TYPE_COLORS: Record<string, string> = {
  'flow diagram': 'bg-blue-100 text-blue-700',
  chart: 'bg-emerald-100 text-emerald-700',
  mermaid: 'bg-purple-100 text-purple-700',
  infographic: 'bg-amber-100 text-amber-700',
  illustration: 'bg-pink-100 text-pink-700',
  generated_image: 'bg-rose-100 text-rose-700',
}

function getTypeBadgeColor(type: string) {
  return TYPE_COLORS[type.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

export default function InfoPanel({
  open,
  onClose,
  title,
  type,
  description,
  createdAt,
}: InfoPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: 340 }}
            animate={{ x: 0 }}
            exit={{ x: 340 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[320px] flex-col border-l border-gray-200/50 bg-white/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Details</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close panel"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Title
                  </label>
                  <p className="mt-1.5 text-sm font-medium text-gray-900">
                    {title || 'Untitled'}
                  </p>
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Type
                  </label>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getTypeBadgeColor(type)}`}
                    >
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Description
                    </label>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                      {description}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                {createdAt && (
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Created
                    </label>
                    <p className="mt-1.5 text-sm text-gray-600">
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer branding */}
            <div className="border-t border-gray-100 px-5 py-4">
              <a
                href="https://flowcraft.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-600"
              >
                <Image
                  src={FlowCraftLogo}
                  alt="FlowCraft"
                  className="h-5 w-5 opacity-60"
                />
                <span>Made with FlowCraft</span>
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
