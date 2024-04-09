import { ApifyData, generateEmbeddings } from '@/lib/openai'
import {
  DOCUMENTS_FOR_CHARTJS_TABLE,
  DOCUMENTS_FOR_REACT_FLOW_TABLE,
  getChartJsJSONFile,
  getReactCodeFlowJSONFile,
} from '@/lib/supabase'

import MainLanding from '@/components/Landing/Main.landing'

const getEmbeddings = async () => {
  const reactFlowCodeDocs = await getReactCodeFlowJSONFile()
  const chartJsDocs = await getChartJsJSONFile()

  if (!reactFlowCodeDocs || !chartJsDocs) {
    return {
      status: 404,
      body: JSON.stringify({
        error: 'No embeddings found',
      }),
    }
  }

  try {
    await generateEmbeddings(
      reactFlowCodeDocs as ApifyData[],
      DOCUMENTS_FOR_REACT_FLOW_TABLE,
    )

    await generateEmbeddings(
      chartJsDocs as ApifyData[],
      DOCUMENTS_FOR_CHARTJS_TABLE,
    )

    return {
      status: 200,
      body: JSON.stringify({
        message: 'Embeddings generated',
      }),
    }
  } catch (e) {
    console.log('Error generating embeddings: ', e)

    return {
      status: 500,
      body: JSON.stringify({
        error: 'Could not generate embeddings',
      }),
    }
  }
}

export default async function Home() {
  await getEmbeddings()

  return <MainLanding />
}
