'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Configuracion {
  nombreEmpresa: string;
  descripcionCorta?: string;
  correoContacto?: string;
  correoVentas?: string;
  telefonoVentas?: string;
  redesSociales?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  logoUrl?: string;
}

export default function Footer() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/configuracion')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
        }
      })
      .catch(err => console.error('Error al cargar configuración:', err))
      .finally(() => setLoading(false));
  }, []);

  // Valores por defecto mientras carga
  const nombreEmpresa = config?.nombreEmpresa || 'Sabor a Campo';
  const descripcion = config?.descripcionCorta || 'Productos frescos y naturales directo del campo a tu mesa. Comprometidos con la calidad y la satisfacción de nuestros clientes.';
  const logo = config?.logoUrl || '/logo/logo.png';
  const correoContacto = config?.correoContacto || config?.correoVentas || 'info@saboracampo.com';
  const telefono = config?.telefonoVentas || '+54 11 1234-5678';

  return (
    <footer id="contacto" className="bg-secondary dark:bg-dark-950 text-white border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logo}
                alt={nombreEmpresa}
                className="w-10 h-10 object-contain rounded-full"
              />
              <span className="text-2xl font-bold bg-linear-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">
                {nombreEmpresa}
              </span>
            </div>
            <p className="text-dark-300 dark:text-dark-400 mb-4 leading-relaxed">
              {descripcion}
            </p>
            <div className="flex space-x-4">
              {config?.redesSociales?.facebook && (
                <a
                  href={config.redesSociales.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-700 dark:bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 shadow-md hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {config?.redesSociales?.instagram && (
                <a
                  href={config.redesSociales.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-700 dark:bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 shadow-md hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {config?.redesSociales?.twitter && (
                <a
                  href={config.redesSociales.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-700 dark:bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 shadow-md hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#locales" className="text-dark-300 dark:text-dark-400 hover:text-primary transition-colors">
                  Nuestros Locales
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-dark-300 dark:text-dark-400 hover:text-primary transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-dark-300 dark:text-dark-400 hover:text-primary transition-colors">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Contacto</h3>
            <ul className="space-y-2 text-dark-300 dark:text-dark-400">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-1 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${correoContacto}`} className="hover:text-primary transition-colors">
                  {correoContacto}
                </a>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-1 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${telefono.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                  {telefono}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-secondary-700 dark:border-dark-800 mt-8 pt-8 text-center text-dark-300 dark:text-dark-400">
          <p>&copy; {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
