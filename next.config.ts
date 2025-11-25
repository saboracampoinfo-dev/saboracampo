import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'saboracampo.vercel.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true
  },
  compress: true,
  // Aumentar el tamaño máximo del body para importaciones grandes
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Transpilar solo paquetes de Firebase que tienen problemas de parsing
  transpilePackages: [
    'firebase',
    '@firebase/firestore',
    '@firebase/auth',
  ],
  // Marcar paquetes grandes como externos para server-side (evitar bundling)
  serverExternalPackages: [
    'firebase-admin',
    'pdfkit',
    'cloudinary',
    'mongodb',
    'mongoose',
  ],
};

export default nextConfig;
