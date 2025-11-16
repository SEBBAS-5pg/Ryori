// ryori/app/next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Sigue creando la carpeta para Docker
  output: 'standalone',

  // @ts-ignore 
  // Ignora el error de TypeScript sobre 'eslint'
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;