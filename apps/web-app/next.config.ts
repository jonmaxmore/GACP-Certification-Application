import type { NextConfig } from "next";

console.log(`\n🐛 [DEBUG] Frontend Server (Next.js) loading config...`);

// Internal URL for SSR/Proxy (Node -> Node) - Use 127.0.0.1 to avoid resolution issues
const internalBackendUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000';

// Public URL for Client (Browser -> Node) - Use localhost:3000 to route via Next.js Proxy
const publicBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log(`🐛 [DEBUG] Internal Backend: ${internalBackendUrl}`);
console.log(`🐛 [DEBUG] Public Backend: ${publicBackendUrl}\n`);

const nextConfig: NextConfig = {
  // Standalone output for production deployment
  output: 'standalone',

  // Backend API proxy configuration
  async rewrites() {
    const url = internalBackendUrl;
    console.log(`🐛 [DEBUG] Frontend Rewrite Proxy -> ${url}`);
    return [
      {
        source: '/api/:path*',
        destination: `${url}/api/:path*`,
      },
      // Special Rewrite for Mock ThaID direct access if needed (or rely on publicUrl in client)
      {
        source: '/mock-thaid/:path*',
        destination: `${url}/mock-thaid/:path*`,
      }
    ];
  },

  // External packages for server
  serverExternalPackages: ['ioredis'],

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: publicBackendUrl,
  },
};

export default nextConfig;
