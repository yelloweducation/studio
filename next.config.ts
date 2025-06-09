
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enforce TypeScript checks
  },
  eslint: {
    ignoreDuringBuilds: false, // Enforce ESLint checks
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows any hostname over HTTPS
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
