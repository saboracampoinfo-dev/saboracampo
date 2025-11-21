'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importar componentes con dynamic para evitar SSR issues
const MisDatosVendedor = dynamic(() => import('@/components/vendedor/MisDatosVendedor'), { ssr: false });
const ProductosVendedor = dynamic(() => import('@/components/vendedor/ProductosVendedor'), { ssr: false });
const OrdenesVendedor = dynamic(() => import('@/components/vendedor/OrdenesVendedor'), { ssr: false });
const HistorialVendedor = dynamic(() => import('@/components/vendedor/HistorialVendedor'), { ssr: false });

export default function DashboardVendedor() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inicio' | 'productos' | 'ordenes' | 'historial'>('inicio');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base dark:bg-dark-900">
        <div className="text-xl text-primary font-semibold animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base dark:bg-dark-900">
      <nav className="bg-dark-900 dark:bg-dark-950 shadow-md border-b-2 border-primary">
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/logo/logo.png" 
                  alt="Sabor a Campo" 
                  className="w-10 h-10 object-contain mr-3 rounded-full"
                />
                <h1 className="text-lg md:text-xl font-bold text-white hidden sm:block">Panel Vendedor</h1>
                <h1 className="text-lg font-bold text-white sm:hidden">Vendedor</h1>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-white font-medium text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-primary focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-3 pt-2 border-t border-dark-700">
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-white font-medium text-sm border-b border-dark-700 mb-2">
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-error-light hover:bg-error-dark/10 font-medium text-sm transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-2 md:px-6">
        <div className="px-2 py-6">
          {/* Tabs Navigation */}
          <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg mb-6 border border-dark-200 dark:border-dark-700 overflow-x-auto">
            <div className="flex space-x-1 p-2 min-w-max">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'inicio'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                📊 Mis Datos
              </button>
              <button
                onClick={() => setActiveTab('productos')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'productos'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                📦 Productos
              </button>
              <button
                onClick={() => setActiveTab('ordenes')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'ordenes'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                📋 Órdenes
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'historial'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                📜 Historial
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'inicio' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <MisDatosVendedor />
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <ProductosVendedor />
            </div>
          )}

          {activeTab === 'ordenes' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <OrdenesVendedor />
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <HistorialVendedor />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
