import remarkGfm from 'remark-gfm'
import createMDX from '@next/mdx'
import withBundleAnalyzer from '@next/bundle-analyzer'

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_PRIVATE_KEY,
    NEXT_PUBLIC_BLOG_ADMIN_ID: process.env.BLOG_ADMIN_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_FLOWCRAFT_API: process.env.FLOWCRAFT_API_URL,
    NEXT_PUBLIC_MICROSOFT_CLARITY: 'm7btrxqq27',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'fllqlodhrvmnynkffoss.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@heroicons/react',
      'react-icons',
      'chart.js',
      'react-chartjs-2',
      '@headlessui/react',
    ],
  },
  turbopack: {},
}

export default bundleAnalyzer(withMDX(nextConfig))
