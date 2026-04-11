import { useState, useRef, useCallback } from 'react'

export type StreamingResult = {
  code: string
  title: string
  diagramId: string
}

export function useStreamingGenerate() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [partialCode, setPartialCode] = useState('')
  const [finalResult, setFinalResult] = useState<StreamingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(
    async (params: {
      type: string
      description: string
      isPublic: boolean
      colorPalette: string
      complexityLevel: string
    }) => {
      // Cancel any in-flight stream
      if (abortRef.current) {
        abortRef.current.abort()
      }

      const controller = new AbortController()
      abortRef.current = controller

      setIsStreaming(true)
      setPartialCode('')
      setFinalResult(null)
      setError(null)

      try {
        const res = await fetch('/api/generate-visual-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: controller.signal,
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Generation failed' }))
          throw new Error(errData.error || errData.detail || 'Generation failed')
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Process complete SSE events (separated by \n\n)
          const events = buffer.split('\n\n')
          buffer = events.pop() || '' // Keep incomplete event in buffer

          for (const event of events) {
            if (!event.trim()) continue

            const lines = event.split('\n')
            let eventType = ''
            let eventData = ''

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7)
              } else if (line.startsWith('data: ')) {
                eventData = line.slice(6)
              }
            }

            if (!eventData) continue

            try {
              const parsed = JSON.parse(eventData)

              if (eventType === 'chunk' && parsed.code_delta) {
                accumulated += parsed.code_delta
                setPartialCode(accumulated)
              } else if (eventType === 'complete' && parsed.done) {
                setFinalResult({
                  code: parsed.code,
                  title: parsed.title || '',
                  diagramId: parsed.diagram_id || '',
                })
              } else if (eventType === 'error') {
                throw new Error(parsed.error || 'Stream error')
              }
            } catch (parseErr: any) {
              if (parseErr.message && parseErr.message !== 'Stream error') {
                // JSON parse error — skip this event
                continue
              }
              throw parseErr
            }
          }
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message || 'Streaming generation failed')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsStreaming(false)
        }
      }
    },
    [],
  )

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      setIsStreaming(false)
    }
  }, [])

  const reset = useCallback(() => {
    cancel()
    setPartialCode('')
    setFinalResult(null)
    setError(null)
  }, [cancel])

  return { generate, isStreaming, partialCode, finalResult, error, cancel, reset }
}
