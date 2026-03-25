import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static export for API routes
  output: 'standalone',
  // Turbopack root configuration
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
