import { Metadata } from 'next'
import MainLanding from '@/components/Landing/Main.landing'

export const metadata: Metadata = {
  title: 'FlowCraft',
  description:
    'FlowCraft is a diagramming tool that helps you create flowcharts, process maps, and system diagrams with AI and with ease. Some diagram types include Flowcharts, sequence diagrams, User journey maps, mind maps, knowledge graphs, and more.',
}

export default async function Home() {
  return <MainLanding />
}
