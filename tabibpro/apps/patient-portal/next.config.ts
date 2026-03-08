import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output standalone pour Docker
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
