import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cioangelnetwork.com' },
      { protocol: 'https', hostname: 'core-mediagroup.com' },
      { protocol: 'https', hostname: 'mea.cio-choice.com' },
      { protocol: 'https', hostname: 'cxo-capital.com' },
      { protocol: 'https', hostname: 'ciocrown.com' },
      { protocol: 'http', hostname: 'www.cio-choice.in' },
      { protocol: 'http', hostname: 'leader-next.com' },
      { protocol: 'https', hostname: 'ciodialogues.com' },
      { protocol: 'https', hostname: 'www.ciopowerlist.com' },
      { protocol: 'https', hostname: 'ciopowerlist.com' },
    ],
  },
};

export default nextConfig;
