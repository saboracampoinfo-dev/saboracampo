// Ejemplo de uso en páginas específicas
// Copia estos ejemplos en tus páginas según necesites

// ============================================
// EJEMPLO 1: Página de Productos
// ============================================

/*
// app/productos/page.tsx
import { Metadata } from 'next';
import { generateMetadata } from '@/utils/seoHelpers';

export const metadata: Metadata = generateMetadata({
  title: 'Productos Frescos',
  description: 'Descubre nuestra amplia variedad de productos frescos y naturales: carnes, frutas, verduras y más.',
  path: '/productos',
});

export default function ProductosPage() {
  return (
    <main>
      <h1>Nuestros Productos</h1>
      // Tu contenido
    </main>
  );
}
*/

// ============================================
// EJEMPLO 2: Página de Producto Individual
// ============================================

/*
// app/productos/[id]/page.tsx
import { Metadata } from 'next';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/utils/seoHelpers';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Obtener datos del producto de tu API
  const product = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`)
    .then(res => res.json());
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`)
    .then(res => res.json());
  
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
    currency: 'ARS',
    availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Productos', url: '/productos' },
    { name: product.name, url: `/productos/${params.id}` },
  ]);

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <main>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>Precio: ${product.price}</p>
        // Más contenido del producto
      </main>
    </>
  );
}
*/

// ============================================
// EJEMPLO 3: Página de Sucursales
// ============================================

/*
// app/sucursales/page.tsx
import { Metadata } from 'next';
import Script from 'next/script';
import { generateMetadata } from '@/utils/seoHelpers';

export const metadata: Metadata = generateMetadata({
  title: 'Nuestras Sucursales',
  description: 'Encuentra la sucursal de Sabor a Campo más cercana a ti. Visítanos y descubre productos frescos.',
  path: '/sucursales',
});

export default function SucursalesPage() {
  // Schema para múltiples ubicaciones
  const locationsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "LocalBusiness",
        "name": "Sabor a Campo - Sucursal Centro",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Calle Principal 123",
          "addressLocality": "Ciudad",
          "addressRegion": "Provincia",
          "postalCode": "1234",
          "addressCountry": "AR"
        },
        "telephone": "+54-11-1234-5678",
        "openingHours": "Mo-Fr 08:00-20:00, Sa 08:00-14:00"
      }
    ]
  };

  return (
    <>
      <Script
        id="locations-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationsSchema) }}
      />
      <main>
        <h1>Nuestras Sucursales</h1>
        // Tu contenido
      </main>
    </>
  );
}
*/

// ============================================
// EJEMPLO 4: Página con FAQ
// ============================================

/*
// app/ayuda/page.tsx
import { Metadata } from 'next';
import Script from 'next/script';
import { generateMetadata, generateFAQSchema } from '@/utils/seoHelpers';

export const metadata: Metadata = generateMetadata({
  title: 'Preguntas Frecuentes',
  description: 'Encuentra respuestas a las preguntas más comunes sobre Sabor a Campo.',
  path: '/ayuda',
});

export default function AyudaPage() {
  const faqSchema = generateFAQSchema([
    {
      question: '¿Cuáles son los horarios de atención?',
      answer: 'Atendemos de lunes a viernes de 8:00 a 20:00 y sábados de 8:00 a 14:00.'
    },
    {
      question: '¿Hacen envíos a domicilio?',
      answer: 'Sí, realizamos envíos a domicilio en toda la zona. El costo varía según la distancia.'
    },
    {
      question: '¿Cómo puedo realizar un pedido?',
      answer: 'Puedes realizar tu pedido a través de nuestra web, por WhatsApp o visitando nuestras sucursales.'
    },
  ]);

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main>
        <h1>Preguntas Frecuentes</h1>
        // Tu contenido de FAQ
      </main>
    </>
  );
}
*/

// ============================================
// EJEMPLO 5: Dashboards (Sin indexar)
// ============================================

/*
// app/dashboardAdmin/page.tsx
import { Metadata } from 'next';
import { generateMetadata } from '@/utils/seoHelpers';

// Dashboard no debe ser indexado por buscadores
export const metadata: Metadata = generateMetadata({
  title: 'Dashboard Admin',
  description: 'Panel de administración',
  path: '/dashboardAdmin',
  noindex: true, // ← Importante: no indexar dashboards
});

export default function DashboardAdminPage() {
  return (
    <main>
      <h1>Dashboard Administrador</h1>
      // Tu contenido
    </main>
  );
}
*/

// ============================================
// EJEMPLO 6: Página de Blog/Artículo
// ============================================

/*
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import Script from 'next/script';
import { generateArticleSchema } from '@/utils/seoHelpers';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  
  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: article.author,
  });

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article>
        <h1>{article.title}</h1>
        <time dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString('es-AR')}
        </time>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </>
  );
}
*/

export {};
