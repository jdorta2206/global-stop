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
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      }
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:9003",
        "10.0.0.90:9003",
        "*.supabase.co",
        "*.vercel.app"
      ],
    },
    allowedDevOrigins: [
      "localhost:3000",
      "localhost:9003",
      "10.0.0.90:9003"
    ],
    turbo: {
      resolveAlias: {
        // Opcional: Configura alias para Turbopack si es necesario
      }
    }
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

module.exports = nextConfig;
