
import type {NextConfig} from 'next';

console.log("--- next.config.js execution start ---");
console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);

const nextConfig: NextConfig = {
  /* config options here */
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
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: { // Added experimental configuration
    allowedDevOrigins: [
      "http://localhost:9003", // Keep if you also test on localhost:9003
      "https://9003-firebase-studio-1747394567673.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev" // Domain from your log
    ],
  },
};

console.log("Effective ignoreBuildErrors (TypeScript):", nextConfig.typescript?.ignoreBuildErrors);
console.log("Effective ignoreDuringBuilds (ESLint):", nextConfig.eslint?.ignoreDuringBuilds);
console.log("--- next.config.js execution end ---");

export default nextConfig;
