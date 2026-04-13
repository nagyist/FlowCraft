'use client'

import { Analytics } from '@vercel/analytics/react'

import 'reactflow/dist/style.css'

export default function SharedDiagramsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="h-screen w-full">{children}</main>
      <Analytics />
    </>
  )
}
