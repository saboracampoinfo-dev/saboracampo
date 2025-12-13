import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://saboracampo.com.ar';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // APIs - No indexar
          '/api/',
          // Dashboards - Áreas privadas
          '/dashboardAdmin/',
          '/dashboardCajero/',
          '/dashboardCliente/',
          '/dashboardVendedor/',
          // Archivos privados
          '/private/',
          '/*.json$',
          // Parámetros de sesión
          '/?sessionId=',
          '/?token=',
        ],
      },
      {
        // Optimización para Googlebot
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboardAdmin/',
          '/dashboardCajero/',
          '/dashboardCliente/',
          '/dashboardVendedor/',
        ],
      },
      {
        // Optimización para Googlebot Images
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/dashboardAdmin/',
          '/dashboardCajero/',
          '/dashboardCliente/',
          '/dashboardVendedor/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // Host principal (opcional, pero recomendado)
    host: baseUrl,
  };
}