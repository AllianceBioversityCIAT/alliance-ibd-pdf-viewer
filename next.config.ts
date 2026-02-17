import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Lambda deployment
  // This creates a minimal server bundle that can run on Lambda
  output: 'standalone',
  // Disable image optimization (optional, reduces dependencies)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
