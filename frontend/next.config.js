/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'api.example.com', 'backend-pi-six-38.vercel.app'],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/dashboard',
        destination: '/tasks',
        permanent: false,
      }
    ]
  },
  env: {
    NEXT_API_URL: process.env.NEXT_API_URL || 'https://backend01-mu.vercel.app',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Todo App',
  },
}

module.exports = nextConfig
