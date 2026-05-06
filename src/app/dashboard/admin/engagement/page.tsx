import { adminFetch } from '../lib/admin-api'
import { EngagementChart } from '../components/AdminChart.client'

export const dynamic = 'force-dynamic'

type Engagement = { rows: { day: string; likes: number; saves: number }[] }

export default async function AdminEngagementPage() {
  const data = await adminFetch<Engagement>('/engagement?days=30')
  return (
    <div className="space-y-6">
      <EngagementChart rows={data.rows} title="Likes & saves per day, last 30d" />
    </div>
  )
}
