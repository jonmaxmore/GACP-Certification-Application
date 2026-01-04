import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for production deployment
  output: 'standalone',

  // Backend API proxy configuration
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/v2/:path*',
        destination: `${backendUrl}/api/v2/:path*`,
      },
      {
        source: '/api/auth-farmer/:path*',
        destination: `${backendUrl}/api/auth-farmer/:path*`,
      },
      {
        source: '/api/auth-dtam/:path*',
        destination: `${backendUrl}/api/auth-dtam/:path*`,
      },
      {
        source: '/api/establishments/:path*',
        destination: `${backendUrl}/api/establishments/:path*`,
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
