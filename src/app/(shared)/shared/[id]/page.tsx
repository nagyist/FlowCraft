import SharedDiagramInviteCodeForm from '@/components/SharedPage/SharedPageInviteCodeForm'
import { createClient } from '@/lib/supabase-auth/server'
import { notFound } from 'next/navigation'

export default async function SharedDiagramPage({
  params,
}: {
  params: { id: string }
}) {
  const supabaseClient = createClient()

  const { data, error } = await supabaseClient
    .from('shareable_links')
    .select('id')
    .eq('id', params.id)

  if (error) {
    console.log('Error fetching data:', error)
    return notFound()
  }

  if (!data || data.length === 0) {
    return notFound()
  }

  return (
    <div>
      <SharedDiagramInviteCodeForm linkId={params.id} />
    </div>
  )
}
