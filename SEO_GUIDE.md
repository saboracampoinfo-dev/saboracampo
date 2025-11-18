# Guía de SEO - Sabor a Campo

## 📋 Contenido

Este proyecto incluye una implementación completa de SEO con:

- ✅ Metadata optimizada en todas las páginas
- ✅ JSON-LD estructurado (Schema.org)
- ✅ Open Graph para redes sociales
- ✅ Twitter Cards
- ✅ Funciones helpers reutilizables

## 🔧 Configuración Implementada

### Layout Principal (layout.tsx)

El layout raíz incluye:

1. **Metadata completa:**
   - Title template para todas las páginas
   - Description optimizada
   - Keywords relevantes
   - Robots meta tags
   - Open Graph completo
   - Twitter Cards
   - Icons y manifest

2. **JSON-LD Schemas:**
   - Organization Schema
   - LocalBusiness Schema (GroceryStore)
   - WebSite Schema con SearchAction

### Helpers de SEO (utils/seoHelpers.ts)

Funciones disponibles para generar metadata dinámica:

#### 1. `generateMetadata()`
Genera metadata completa para cualquier página.

**Ejemplo de uso:**
```typescript
// En cualquier page.tsx
import { generateMetadata } from '@/utils/seoHelpers';

export const metadata = generateMetadata({
  title: 'Productos',
  description: 'Descubre todos nuestros productos frescos',
  path: '/productos',
});
```

#### 2. `generateProductSchema()`
Genera JSON-LD para páginas de productos.

**Ejemplo:**
```typescript
import Script from 'next/script';
import { generateProductSchema } from '@/utils/seoHelpers';

export default function ProductPage({ product }) {
  const schema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
    currency: 'ARS',
    availability: 'InStock',
  });

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Tu contenido */}
    </>
  );
}
```

#### 3. `generateBreadcrumbSchema()`
Genera JSON-LD para breadcrumbs (migajas de pan).

**Ejemplo:**
```typescript
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Inicio', url: '/' },
  { name: 'Productos', url: '/productos' },
  { name: 'Carnes', url: '/productos/carnes' },
]);
```

#### 4. `generateArticleSchema()`
Para páginas de blog o noticias.

**Ejemplo:**
```typescript
const articleSchema = generateArticleSchema({
  title: 'Beneficios de productos frescos',
  description: 'Descubre por qué...',
  image: '/blog/imagen.jpg',
  datePublished: '2025-11-18',
  author: 'Sabor a Campo',
});
```

#### 5. `generateFAQSchema()`
Para páginas con preguntas frecuentes.

**Ejemplo:**
```typescript
const faqSchema = generateFAQSchema([
  {
    question: '¿Cuáles son los horarios de atención?',
    answer: 'Atendemos de lunes a viernes de 8:00 a 20:00...',
  },
  {
    question: '¿Hacen envíos a domicilio?',
    answer: 'Sí, hacemos envíos...',
  },
]);
```

#### 6. `generateOfferSchema()`
Para promociones y ofertas especiales.

**Ejemplo:**
```typescript
const offerSchema = generateOfferSchema({
  name: 'Descuento Verano 2025',
  description: '20% off en frutas y verduras',
  validFrom: '2025-12-01',
  validThrough: '2025-12-31',
  price: 1000,
  currency: 'ARS',
});
```

## 🎯 Ejemplo Completo: Página de Producto

```typescript
// app/productos/[id]/page.tsx
import { Metadata } from 'next';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/utils/seoHelpers';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.id);
  
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
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
        {/* Tu contenido del producto */}
      </main>
    </>
  );
}
```

## 📝 Tareas Pendientes

### 1. Actualizar datos reales en layout.tsx

Busca y actualiza estos valores:

```typescript
// En src/app/layout.tsx
contactPoint: {
  "telephone": "+54-11-xxxx-xxxx", // ⚠️ Actualizar con tu teléfono real
  ...
},
sameAs: [
  // ⚠️ Agregar tus redes sociales reales
  "https://www.facebook.com/saboracampo",
  "https://www.instagram.com/saboracampo",
]
```

### 2. Actualizar SEO_CONFIG

En `src/utils/seoHelpers.ts`:

```typescript
export const SEO_CONFIG = {
  siteUrl: 'https://www.saboracampo.com', // ⚠️ Actualizar con tu dominio real
  twitter: '@saboracampo', // ⚠️ Tu cuenta de Twitter
  ...
};
```

### 3. Agregar códigos de verificación

Cuando tengas tus cuentas de Google Search Console, Bing, etc:

```typescript
// En layout.tsx metadata
verification: {
  google: "tu-codigo-aqui",
  yandex: "tu-codigo-aqui",
  bing: "tu-codigo-aqui",
},
```

### 4. Crear manifest.json

Crea `/public/manifest.json`:

```json
{
  "name": "Sabor a Campo",
  "short_name": "SaborACampo",
  "description": "Productos frescos y naturales",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "icons": [
    {
      "src": "/iconos/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/iconos/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 5. Crear sitemap.xml

Next.js puede generar sitemaps automáticamente. Crea `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.saboracampo.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.saboracampo.com/productos',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Agregar más páginas...
  ];
}
```

### 6. Crear robots.txt

Crea `app/robots.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard*/'],
    },
    sitemap: 'https://www.saboracampo.com/sitemap.xml',
  };
}
```

## 🔍 Validación

### Herramientas de Testing

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Valida tus JSON-LD schemas

2. **Schema Markup Validator**
   - https://validator.schema.org/
   - Verifica la estructura de tus schemas

3. **Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/
   - Verifica Open Graph tags

4. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Verifica Twitter Cards

5. **Google Search Console**
   - Monitorea el rendimiento SEO
   - Envía tu sitemap

## 📈 Mejores Prácticas

1. **Títulos**: 50-60 caracteres
2. **Descripciones**: 150-160 caracteres
3. **URLs**: Cortas, descriptivas, con guiones
4. **Imágenes**: Incluir alt text descriptivo
5. **JSON-LD**: Usar schemas relevantes para cada página
6. **Actualizar**: Mantener fechas de modificación actualizadas

## 🚀 Próximos Pasos

1. ✅ Implementar metadata en páginas de productos
2. ✅ Agregar breadcrumbs en navegación
3. ✅ Crear página de FAQ con schema
4. ✅ Configurar Google Analytics
5. ✅ Registrar en Google Search Console
6. ✅ Optimizar imágenes con alt text
7. ✅ Crear contenido de blog con schemas

## 📚 Recursos

- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search/docs)
- [Open Graph Protocol](https://ogp.me/)
