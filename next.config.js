/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      // Add Supabase storage domain if needed
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      }
    ],
  },
  experimental: {
    serverActions: true, // Recommended for Supabase integration
    allowedDevOrigins: [
      "http://localhost:3000", // Standard Next.js dev port
      "http://localhost:9003" // Keep if still needed
    ],
  },
  // Vercel-specific optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

module.exports = nextConfig;