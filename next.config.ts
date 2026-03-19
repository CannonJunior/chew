import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'sharp'],
  images: {
    domains: ['www.reddit.com', 'i.redd.it', 'external-preview.redd.it', 'food52.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.redd.it' },
      { protocol: 'https', hostname: '**.reddit.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
