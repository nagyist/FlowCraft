'use client'

import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import ChatThread from './ChatThread'
import ChatComposer from './ChatComposer'
import CodePane from './CodePane'
import PreviewPane from './PreviewPane'
import type { ChatMessage } from './useDiagramChat'

type Pane = 'chat' | 'code' | 'preview'

export default function Workbench({
  title,
  diagramType,
  code,
  onCodeChange,
  messages,
  isStreaming,
  error,
  composerValue,
  onComposerChange,
  onSend,
  onCancel,
  onNewDraft,
}: {
  title: string
  diagramType: string
  code: string
  onCodeChange: (v: string) => void
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  composerValue: string
  onComposerChange: (v: string) => void
  onSend: () => void
  onCancel: () => void
  onNewDraft: () => void
}) {
  // Desktop: resizable two dividers (chat | code | preview).
  // Mobile: tabbed single-pane view.
  const [chatWidth, setChatWidth] = useState(380) // px
  const [codeWidth, setCodeWidth] = useState(460) // px
  const [mobilePane, setMobilePane] = useState<Pane>('chat')
  const rootRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ kind: 'chat' | 'code'; startX: number; startWidth: number } | null>(
    null,
  )

  const beginDrag = (kind: 'chat' | 'code') => (e: React.MouseEvent) => {
    dragRef.current = {
      kind,
      startX: e.clientX,
      startWidth: kind === 'chat' ? chatWidth : codeWidth,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const delta = e.clientX - d.startX
      if (d.kind === 'chat') {
        setChatWidth(Math.max(280, Math.min(560, d.startWidth + delta)))
      } else {
        setCodeWidth(Math.max(320, Math.min(720, d.startWidth + delta)))
      }
    }
    const up = () => {
      dragRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])

  const Divider = ({ kind }: { kind: 'chat' | 'code' }) => (
    <div
      onMouseDown={beginDrag(kind)}
      className="group relative hidden w-px shrink-0 cursor-col-resize bg-rule md:block"
      role="separator"
      aria-orientation="vertical"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
      <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rule transition group-hover:bg-signal/60" />
    </div>
  )

  return (
    <div
      ref={rootRef}
      className="relative flex h-[calc(100dvh-64px)] min-h-[560px] w-full flex-col bg-ink text-paper"
    >
      {/* Top crossbar */}
      <div className="relative flex items-center justify-between border-b border-rule/60 bg-ink/90 px-6 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
            <span className="text-signal">FC</span>
            <span className="h-px w-6 bg-rule" />
            <span className="text-paper/80">{diagramType}</span>
          </div>
          <h1 className="truncate font-serif text-xl italic text-paper">
            {title || 'Untitled draft'}
          </h1>
          {isStreaming && (
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-signal sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-tick" />
              streaming
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile pane switcher */}
          <div className="flex rounded-sm border border-rule md:hidden">
            {(['chat', 'code', 'preview'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setMobilePane(p)}
                className={clsx(
                  'px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]',
                  mobilePane === p
                    ? 'bg-paper text-ink'
                    : 'text-fog hover:text-paper',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={onNewDraft}
            className="rounded-sm border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fog hover:border-signal/60 hover:text-paper"
          >
            New draft
          </button>
        </div>
      </div>

      {/* Split body */}
      <div className="relative flex min-h-0 flex-1">
        {/* Chat pane */}
        <section
          className={clsx(
            'flex min-h-0 flex-col border-r border-rule/40 bg-ink',
            'md:shrink-0',
            mobilePane === 'chat' ? 'flex' : 'hidden md:flex',
          )}
          style={{
            width:
              typeof window !== 'undefined' && window.innerWidth >= 768
                ? chatWidth
                : undefined,
          }}
        >
          <ChatThread messages={messages} />
          <div className="border-t border-rule/60 bg-ink/90 p-4">
            {error && (
              <div className="mb-3 rounded-sm border border-red-400/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-300">
                {error}
              </div>
            )}
            <ChatComposer
              value={composerValue}
              onChange={onComposerChange}
              onSubmit={onSend}
              disabled={isStreaming}
              footerRight={
                isStreaming && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-sm border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-fog hover:border-red-400/60 hover:text-red-300"
                  >
                    Stop
                  </button>
                )
              }
            />
          </div>
        </section>

        <Divider kind="chat" />

        {/* Code pane */}
        <section
          className={clsx(
            'flex min-h-0 flex-col',
            'md:shrink-0',
            mobilePane === 'code' ? 'flex' : 'hidden md:flex',
          )}
          style={{
            width:
              typeof window !== 'undefined' && window.innerWidth >= 768
                ? codeWidth
                : undefined,
          }}
        >
          <CodePane
            value={code}
            onChange={onCodeChange}
            streaming={isStreaming}
          />
        </section>

        <Divider kind="code" />

        {/* Preview pane (flex-1) */}
        <section
          className={clsx(
            'flex min-h-0 flex-1 flex-col',
            mobilePane === 'preview' ? 'flex' : 'hidden md:flex',
          )}
        >
          <PreviewPane code={code} streaming={isStreaming} />
        </section>
      </div>
    </div>
  )
}
