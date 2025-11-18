import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboardAdmin/',
          '/dashboardCajero/',
          '/dashboardCliente/',
          '/dashboardVendedor/',
        ],
      },
    ],
    sitemap: 'https://www.saboracampo.com/sitemap.xml',
  };
}
