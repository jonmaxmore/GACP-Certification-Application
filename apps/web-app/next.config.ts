import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for production deployment
  output: 'standalone',

  // Backend API proxy configuration
  // NOTE: v2, auth-farmer, auth-dtam are handled by API route handlers
  // that properly forward Set-Cookie headers. Only establishments uses rewrite.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/establishments/:path*',
        destination: `${backendUrl}/api/establishments/:path*`,
      },
      {
        source: '/api/standards',
        destination: `${backendUrl}/api/standards`,
      },
      {
        source: '/api/plants/:path*',
        destination: `${backendUrl}/api/plants/:path*`,
      },
      {
        source: '/api/applications/:path*',
        destination: `${backendUrl}/api/applications/:path*`,
      },
    ];
  },

  // External packages for server
  serverExternalPackages: ['ioredis'],

  // Environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  },
};

export default nextConfig;
