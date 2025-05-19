
import type {NextConfig} from 'next';

console.log("--- next.config.js execution start ---");
console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Cambiado a false
  },
  eslint: {
    ignoreDuringBuilds: false, // Cambiado a false
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
};

console.log("Effective ignoreBuildErrors (TypeScript):", nextConfig.typescript?.ignoreBuildErrors);
console.log("Effective ignoreDuringBuilds (ESLint):", nextConfig.eslint?.ignoreDuringBuilds);
console.log("--- next.config.js execution end ---");

export default nextConfig;
