'use client'

import { useCallback, useRef, useState } from 'react'
import { Node, Edge } from 'reactflow'

type Snapshot = { nodes: Node[]; edges: Edge[] }

const MAX_HISTORY = 50

export function useUndoRedo() {
  const past = useRef<Snapshot[]>([])
  const future = useRef<Snapshot[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateFlags = useCallback(() => {
    setCanUndo(past.current.length > 0)
    setCanRedo(future.current.length > 0)
  }, [])

  const takeSnapshot = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      past.current.push({
        nodes: nodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
        edges: edges.map((e) => ({ ...e })),
      })
      if (past.current.length > MAX_HISTORY) {
        past.current.shift()
      }
      future.current = []
      updateFlags()
    },
    [updateFlags],
  )

  const undo = useCallback(
    (
      currentNodes: Node[],
      currentEdges: Edge[],
    ): Snapshot | null => {
      const prev = past.current.pop()
      if (!prev) return null

      future.current.push({
        nodes: currentNodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
        edges: currentEdges.map((e) => ({ ...e })),
      })
      updateFlags()
      return prev
    },
    [updateFlags],
  )

  const redo = useCallback(
    (
      currentNodes: Node[],
      currentEdges: Edge[],
    ): Snapshot | null => {
      const next = future.current.pop()
      if (!next) return null

      past.current.push({
        nodes: currentNodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
        edges: currentEdges.map((e) => ({ ...e })),
      })
      updateFlags()
      return next
    },
    [updateFlags],
  )

  return { takeSnapshot, undo, redo, canUndo, canRedo }
}
