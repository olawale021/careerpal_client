import { NextConfig } from 'next';

const headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NEXT_PUBLIC_FRONTEND_URL || '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        },
      ],
    },
  ];
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers,
};

export default nextConfig;
