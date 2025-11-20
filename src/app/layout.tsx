import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "Sabor a Campo - Productos Frescos y Naturales",
    template: "%s | Sabor a Campo"
  },
  description: "Descubre productos frescos, naturales y de calidad en Sabor a Campo. Carnes, frutas, verduras y más. Visita nuestras sucursales y disfruta de lo mejor del campo.",
  keywords: ["productos frescos", "carnes", "frutas", "verduras", "alimentos naturales", "mercado", "Sabor a Campo", "productos de calidad"],
  authors: [{ name: "Sabor a Campo" }],
  creator: "Sabor a Campo",
  publisher: "Sabor a Campo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://www.saboracampo.com",
    siteName: "Sabor a Campo",
    title: "Sabor a Campo - Productos Frescos y Naturales",
    description: "Descubre productos frescos, naturales y de calidad en Sabor a Campo. Carnes, frutas, verduras y más.",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Sabor a Campo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabor a Campo - Productos Frescos y Naturales",
    description: "Descubre productos frescos, naturales y de calidad en Sabor a Campo.",
    images: ["/logo/logo.png"],
  },
  icons: {
    icon: "/iconos/favicon.ico",
    apple: "/iconos/apple-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    // Agrega aquí tus códigos de verificación cuando los tengas
    // google: "tu-codigo-de-verificacion",
    // yandex: "tu-codigo-de-verificacion",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD para Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sabor a Campo",
    "url": "https://www.saboracampo.com",
    "logo": "https://www.saboracampo.com/logo/logo.png",
    "description": "Productos frescos, naturales y de calidad",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+54-11-xxxx-xxxx",
      "contactType": "customer service",
      "areaServed": "AR",
      "availableLanguage": ["Spanish"]
    },
    "sameAs": [
      // Agrega aquí tus redes sociales cuando las tengas
      // "https://www.facebook.com/saboracampo",
      // "https://www.instagram.com/saboracampo",
      // "https://www.twitter.com/saboracampo"
    ]
  };

  // JSON-LD para LocalBusiness
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "name": "Sabor a Campo",
    "image": "https://www.saboracampo.com/logo/logo.png",
    "description": "Tienda de productos frescos, carnes, frutas, verduras y alimentos naturales de calidad",
    "priceRange": "$$",
    "servesCuisine": "Productos Frescos",
    "acceptsReservations": false,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
      "addressLocality": "Argentina"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "14:00"
      }
    ]
  };

  // JSON-LD para WebSite
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sabor a Campo",
    "url": "https://www.saboracampo.com",
    "description": "Productos frescos, naturales y de calidad",
    "publisher": {
      "@type": "Organization",
      "name": "Sabor a Campo"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.saboracampo.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="es">
      <head>
        {/* JSON-LD Schemas */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
