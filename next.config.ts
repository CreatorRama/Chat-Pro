import type { NextConfig } from 'next';

// Extend the experimental config types
type CustomExperimentalConfig = {
  turbopack?: boolean;
};

type CustomNextConfig = NextConfig & {
  experimental?: CustomExperimentalConfig;
};

const nextConfig: CustomNextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  }
};

module.exports = nextConfig;