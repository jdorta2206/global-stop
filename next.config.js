/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'https://stop-game-b8083-firebase-studio-17d739d567875.cluster-4vycg53jczsvn3dvsizj3ahs.cloudworkstations.dev',
 'https://9003-firebase-studio-1747394567673.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev', // Added comma here
 '9003-firebase-studio-1747394567673.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev'
 ]
  },
};

module.exports = nextConfig;