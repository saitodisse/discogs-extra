import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* add i.discogs.com */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.discogs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'st.discogs.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
