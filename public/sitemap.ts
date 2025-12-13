import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://saboracampo.com.ar';
  const currentDate = new Date();

  return [
    // Página principal - Máxima prioridad
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Páginas de autenticación - Prioridad media
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Páginas públicas futuras - Descomentar cuando estén disponibles
    // {
    //   url: ${baseUrl}/productos,
    //   lastModified: currentDate,
    //   changeFrequency: 'daily',
    //   priority: 0.9,
    // },
    // {
    //   url: ${baseUrl}/sucursales,
    //   lastModified: currentDate,
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
    // {
    //   url: ${baseUrl}/contacto,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
    // {
    //   url: ${baseUrl}/nosotros,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
  ];
}

// Para agregar URLs dinámicas (productos, categorías, etc.), puedes:
// 1. Hacer fetch a tu API o base de datos
// 2. Mapear los resultados a URLs
// Ejemplo:
// const productos = await fetch(${baseUrl}/api/productos).then(res => res.json());
// const productosUrls = productos.map((producto) => ({
//   url: ${baseUrl}/productos/${producto.slug},
//   lastModified: new Date(producto.updatedAt),
//   changeFrequency: 'weekly',
//   priority: 0.8,
// }));