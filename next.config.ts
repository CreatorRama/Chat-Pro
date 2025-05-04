import type { NextConfig } from 'next';

// Extend the experimental config types
type CustomExperimentalConfig = {
  turbopack?: boolean;
};

type CustomNextConfig = NextConfig & {
  experimental?: CustomExperimentalConfig;
};

const nextConfig: CustomNextConfig = {
  experimental: {
    turbopack: false,
  },
};

module.exports = nextConfig;