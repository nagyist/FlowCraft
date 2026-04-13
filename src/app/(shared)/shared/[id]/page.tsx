import SharedDiagramViewer from '@/components/SharedPage/SharedDiagramViewer'
import { createClient } from '@/lib/supabase-auth/server'
import { notFound } from 'next/navigation'

export default async function SharedDiagramPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabaseClient = await createClient()

  const { data, error } = await supabaseClient
    .from('shareable_links')
    .select('id, type, data, title, created_at')
    .eq('id', id)

  if (error || !data || data.length === 0) {
    return notFound()
  }

  const link = data[0]

  return (
    <SharedDiagramViewer
      type={link.type}
      data={link.data}
      title={link.title}
      createdAt={link.created_at}
    />
  )
}
