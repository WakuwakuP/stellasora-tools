import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // useCache: false,
    // cacheComponents: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'api.ennead.cc',
        pathname: '/stella/assets/**',
        port: '',
        protocol: 'https',
      },
    ],
  },
  typedRoutes: true,
}

export default nextConfig
