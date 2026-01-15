import type { NextConfig } from "next";

console.log(`\n🐛 [DEBUG] Frontend Server (Next.js) loading config...`);
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
console.log(`🐛 [DEBUG] Target Backend URL: ${backendUrl}\n`);

const nextConfig: NextConfig = {
  // Standalone output for production deployment
  output: 'standalone',

  // Backend API proxy configuration
  // NOTE: v2, auth-farmer, auth-dtam are handled by API route handlers
  // that properly forward Set-Cookie headers. 
  // We use a catch-all rewrite for all other backend services.
  async rewrites() {
    // backendUrl is defined at top level
    const url = process.env.BACKEND_URL || 'http://localhost:5000';
    console.log(`🐛 [DEBUG] Frontend Rewrite Proxy -> ${url}`);
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
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
