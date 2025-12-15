import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Backend API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/v2/:path*',
        destination: 'http://localhost:5000/api/v2/:path*',
      },
      {
        source: '/api/auth-farmer/:path*',
        destination: 'http://localhost:5000/api/auth-farmer/:path*',
      },
      {
        source: '/api/establishments/:path*',
        destination: 'http://localhost:5000/api/establishments/:path*',
      },
    ];
  },

  // Suppress middleware deprecation warning (still works)
  experimental: {
    // Middleware config - still supported
  },

  // External packages for server
  serverExternalPackages: ['ioredis'],

  // Environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  },
};

export default nextConfig;

