import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/Mdx/MdxComponents'

export default function ToolBody({ source }: { source: string }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
      <div className="not-prose">
        <MDXRemote
          source={source}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </section>
  )
}
