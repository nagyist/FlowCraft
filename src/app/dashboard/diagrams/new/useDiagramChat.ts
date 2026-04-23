import { useCallback, useRef, useState } from 'react'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  code_snapshot?: string | null
  created_at?: string
  // client-side only: marks an assistant message that's still streaming
  streaming?: boolean
}

function uid() {
  return `m_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

/**
 * Owns chat state for the diagram workbench: message list + streaming
 * follow-up turns against /api/diagram-chat, plus Supabase persistence
 * via /api/diagram-chat/messages.
 */
export function useDiagramChat(opts: {
  diagramType: string
  onCodeUpdate: (code: string) => void
}) {
  const { diagramType, onCodeUpdate } = opts
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const codeRef = useRef<string>('')

  const setInitialCode = useCallback((code: string) => {
    codeRef.current = code
  }, [])

  const loadHistory = useCallback(async (diagramId: number | string) => {
    const res = await fetch(
      `/api/diagram-chat/messages?diagramId=${encodeURIComponent(String(diagramId))}`,
    )
    if (!res.ok) return
    const json = (await res.json()) as { messages: ChatMessage[] }
    setMessages(json.messages ?? [])
  }, [])

  const seedInitial = useCallback(
    async (args: {
      diagramId: number | string | null
      userPrompt: string
      assistantCode: string
      assistantTitle?: string
    }) => {
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: args.userPrompt,
      }
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: args.assistantTitle
          ? `Drafted "${args.assistantTitle}". Ask for edits to iterate.`
          : 'Drafted your diagram. Ask for edits to iterate.',
        code_snapshot: args.assistantCode,
      }
      codeRef.current = args.assistantCode
      setMessages([userMsg, assistantMsg])

      if (args.diagramId) {
        try {
          await fetch('/api/diagram-chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              diagramId: args.diagramId,
              messages: [
                { role: 'user', content: userMsg.content },
                {
                  role: 'assistant',
                  content: assistantMsg.content,
                  code_snapshot: args.assistantCode,
                },
              ],
            }),
          })
        } catch {
          /* swallow; chat still works in-memory */
        }
      }
    },
    [],
  )

  const sendMessage = useCallback(
    async (args: {
      message: string
      diagramId: number | string | null
      currentCode: string
    }) => {
      if (isStreaming) return
      codeRef.current = args.currentCode

      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: args.message,
      }
      const assistantId = uid()
      const pendingAssistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
      }

      // Snapshot history BEFORE appending the new user message, so we
      // don't double-send it as history + prompt.
      const historyForLLM = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      setMessages((prev) => [...prev, userMsg, pendingAssistant])
      setIsStreaming(true)
      setError(null)

      let accumulated = ''
      let finalCode = ''
      let finalTitle = ''

      try {
        const res = await fetch('/api/diagram-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagramType,
            currentCode: args.currentCode,
            message: args.message,
            history: historyForLLM,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Chat failed' }))
          throw new Error(errData.error || errData.detail || 'Chat failed')
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const event of events) {
            if (!event.trim()) continue
            const lines = event.split('\n')
            let eventType = ''
            let eventData = ''
            for (const line of lines) {
              if (line.startsWith('event: ')) eventType = line.slice(7)
              else if (line.startsWith('data: ')) eventData = line.slice(6)
            }
            if (!eventData) continue
            let parsed: any
            try {
              parsed = JSON.parse(eventData)
            } catch {
              continue
            }

            if (eventType === 'chunk' && parsed.code_delta) {
              accumulated += parsed.code_delta
              // Stream the working code into the editor/preview live.
              onCodeUpdate(accumulated)
            } else if (eventType === 'replace' && typeof parsed.code === 'string') {
              accumulated = parsed.code
              onCodeUpdate(accumulated)
            } else if (eventType === 'complete' && parsed.done) {
              finalCode = parsed.code || accumulated
              finalTitle = parsed.title || ''
              onCodeUpdate(finalCode)
            } else if (eventType === 'error') {
              throw new Error(parsed.error || 'Stream error')
            }
          }
        }

        const assistantContent = finalTitle
          ? `Updated: "${finalTitle}"`
          : 'Diagram updated.'

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: assistantContent,
                  code_snapshot: finalCode,
                  streaming: false,
                }
              : m,
          ),
        )
        codeRef.current = finalCode

        // Persist both sides + save the updated code.
        if (args.diagramId && finalCode) {
          try {
            await Promise.all([
              fetch('/api/update-diagram', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  diagramId: args.diagramId,
                  data: finalCode,
                }),
              }),
              fetch('/api/diagram-chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  diagramId: args.diagramId,
                  messages: [
                    { role: 'user', content: userMsg.content },
                    {
                      role: 'assistant',
                      content: assistantContent,
                      code_snapshot: finalCode,
                    },
                  ],
                }),
              }),
            ])
          } catch {
            /* chat still works without persistence */
          }
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message || 'Chat failed')
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    streaming: false,
                    content: `Error: ${e.message || 'Chat failed'}`,
                  }
                : m,
            ),
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsStreaming(false)
        }
      }
    },
    [diagramType, isStreaming, messages, onCodeUpdate],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return {
    messages,
    setMessages,
    isStreaming,
    error,
    sendMessage,
    seedInitial,
    loadHistory,
    setInitialCode,
    cancel,
  }
}
