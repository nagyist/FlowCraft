import Navbar from '@/components/Navbar'

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-graphite text-paper">
      <Navbar />
      <div className="pt-[72px]">{children}</div>
    </div>
  )
}
