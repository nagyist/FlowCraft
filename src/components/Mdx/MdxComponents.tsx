import type { ComponentProps } from 'react'

export const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => (
    <h1
      className="mb-4 mt-8 text-3xl font-bold tracking-tight text-gray-900"
      {...props}
    />
  ),
  h2: (props: ComponentProps<'h2'>) => (
    <h2
      className="mb-4 mt-10 text-2xl font-semibold tracking-tight text-gray-900"
      {...props}
    />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h3
      className="mb-3 mt-8 text-xl font-semibold tracking-tight text-gray-900"
      {...props}
    />
  ),
  p: (props: ComponentProps<'p'>) => (
    <p
      className="not-prose mb-6 text-lg leading-relaxed text-gray-700"
      {...props}
    />
  ),
  a: (props: ComponentProps<'a'>) => (
    <a
      className="font-medium text-gray-900 underline decoration-gray-400 underline-offset-4 transition-all hover:decoration-black"
      {...props}
    />
  ),
  ul: (props: ComponentProps<'ul'>) => (
    <ul className="my-6 ml-6 list-disc space-y-2 text-gray-700" {...props} />
  ),
  ol: (props: ComponentProps<'ol'>) => (
    <ol className="my-6 ml-6 list-decimal space-y-2 text-gray-700" {...props} />
  ),
  li: (props: ComponentProps<'li'>) => (
    <li className="text-lg leading-relaxed text-gray-700" {...props} />
  ),
  blockquote: (props: ComponentProps<'blockquote'>) => (
    <blockquote
      className="my-6 border-l-4 border-gray-200 pl-4 italic text-gray-800"
      {...props}
    />
  ),
  code: (props: ComponentProps<'code'>) => (
    <code
      className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-900"
      {...props}
    />
  ),
}
