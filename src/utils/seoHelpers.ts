import { Metadata } from 'next';

/**
 * Configuración base para SEO
 */
export const SEO_CONFIG = {
  siteName: 'Sabor a Campo',
  siteUrl: 'https://www.saboracampo.com',
  description: 'Descubre productos frescos, naturales y de calidad en Sabor a Campo. Carnes, frutas, verduras y más.',
  locale: 'es_AR',
  type: 'website',
  twitter: '@saboracampo',
  images: {
    default: '/logo/logo.png',
    width: 1200,
    height: 630,
  },
};

/**
 * Genera metadata para páginas específicas
 */
export function generateMetadata({
  title,
  description,
  image,
  path = '',
  type = 'website',
  noindex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  const pageTitle = `${title} | ${SEO_CONFIG.siteName}`;
  const pageDescription = description || SEO_CONFIG.description;
  const pageImage = image || SEO_CONFIG.images.default;
  const pageUrl = `${SEO_CONFIG.siteUrl}${path}`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      type,
      locale: SEO_CONFIG.locale,
      url: pageUrl,
      siteName: SEO_CONFIG.siteName,
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: pageImage,
          width: SEO_CONFIG.images.width,
          height: SEO_CONFIG.images.height,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: pageUrl,
    },
  };
}

/**
 * Genera JSON-LD para productos
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || SEO_CONFIG.siteName,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'ARS',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: SEO_CONFIG.siteName,
      },
    },
  };
}

/**
 * Genera JSON-LD para breadcrumbs
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

/**
 * Genera JSON-LD para artículos/blog
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || SEO_CONFIG.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.images.default}`,
      },
    },
  };
}

/**
 * Genera JSON-LD para FAQ
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Genera JSON-LD para ofertas/eventos
 */
export function generateOfferSchema(offer: {
  name: string;
  description: string;
  validFrom: string;
  validThrough: string;
  price?: number;
  currency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.name,
    description: offer.description,
    validFrom: offer.validFrom,
    validThrough: offer.validThrough,
    ...(offer.price && {
      price: offer.price,
      priceCurrency: offer.currency || 'ARS',
    }),
    seller: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
    },
  };
}
