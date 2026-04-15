import MainShell from './MainShell.client'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainShell>{children}</MainShell>
}
