'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Node, Edge } from 'reactflow'

type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error'

export function useAutoSave(
  diagramId: string,
  nodes: Node[],
  edges: Edge[],
  enabled: boolean = true,
) {
  const [status, setStatus] = useState<SaveStatus>('saved')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const save = useCallback(
    async (nodesToSave: Node[], edgesToSave: Edge[]) => {
      if (!diagramId || !enabled) return

      const payload = JSON.stringify({ nodes: nodesToSave, edges: edgesToSave })
      if (payload === lastSavedRef.current) return

      setStatus('saving')
      try {
        const res = await fetch('/api/update-diagram', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagramId,
            data: JSON.stringify(JSON.stringify({ nodes: nodesToSave, edges: edgesToSave })),
          }),
        })

        if (!res.ok) throw new Error('Save failed')

        lastSavedRef.current = payload
        if (isMountedRef.current) setStatus('saved')
      } catch {
        if (isMountedRef.current) setStatus('error')
      }
    },
    [diagramId, enabled],
  )

  // Debounced auto-save on nodes/edges change
  useEffect(() => {
    if (!enabled || !diagramId || nodes.length === 0) return

    const payload = JSON.stringify({ nodes, edges })
    if (payload === lastSavedRef.current) return

    setStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      save(nodes, edges)
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, diagramId, enabled, save])

  // Warn on page unload if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'unsaved' || status === 'saving') {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [status])

  return { status, saveNow: () => save(nodes, edges) }
}
