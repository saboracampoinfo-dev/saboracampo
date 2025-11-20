import type { NextConfig } from "next";

const nextConfig: NextConfig = {
      images: {
        domains: ['localhost', 'res.cloudinary.com', 'saboracampo.vercel.app',],  // Agrega dominios adicionales si es necesario
        unoptimized: true
    },
    compress: true,
};

export default nextConfig;
