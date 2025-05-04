import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false, // Disable Turbopack
  },
};

export default nextConfig;
