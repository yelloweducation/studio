
import type {NextConfig} from 'next';

// IMPORTANT: Content Security Policy (CSP)
// This is a stricter default CSP. You MUST customize this policy thoroughly for your specific application.
// Incorrect CSP can break functionality (scripts, styles, images, iframes, etc.).
// - Add specific domains for any third-party services you use (analytics, payment gateways, media embeds, fonts, CDNs).
// - Test thoroughly after enabling and modifying.
// - Consider using a nonce or hash-based approach for inline scripts if 'unsafe-inline' for scripts is too permissive.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.youtube.com *.googletagmanager.com *.vercel-insights.com your-deployed-domain.com;
  child-src 'self' *.youtube.com *.google.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src 'self' blob: data: https:;
  media-src 'self' *.youtube.com data:; 
  connect-src 'self' *.vercel-insights.com your-api-domain.com;
  font-src 'self' data: *.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim(); // Minify the policy string

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  { 
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy, // CSP is now enabled
  }
];


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
        hostname: '**', 
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add 'fs' to externals for server-side bundles.
      // This helps resolve "Module not found: Can't resolve 'fs'" errors
      // that can occur in serverless environments or specific bundling scenarios.
      // 'fs' is a core Node.js module and should be available in the server runtime.
      if (!config.externals) {
        config.externals = [];
      }
      config.externals.push('fs');
    }
    return config;
  },
};

export default nextConfig;

