import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Añadir aquí el dominio de la imagen de perfil de Google si es necesario
      // Por ejemplo: lh3.googleusercontent.com
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Añadir aquí el dominio de la imagen de perfil de Facebook si es necesario
      // Por ejemplo: graph.facebook.com
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
