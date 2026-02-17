import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Lambda deployment
  output: 'export',
  // Disable image optimization (requires Next.js server)
  images: {
    unoptimized: true,
  },
  // Ensure trailing slash for consistent routing
  trailingSlash: false,
};

export default nextConfig;
