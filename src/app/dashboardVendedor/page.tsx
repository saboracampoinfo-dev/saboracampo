'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardVendedor() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
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
      <nav className="bg-primary dark:bg-primary-900 shadow-md border-b-2 border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <img 
                src="/logo/logo.png" 
                alt="Sabor a Campo" 
                className="w-10 h-10 object-contain mr-3 rounded-full"
              />
              <h1 className="text-lg md:text-xl font-bold text-white hidden sm:block">Dashboard Vendedor</h1>
              <h1 className="text-lg font-bold text-white sm:hidden">Vendedor</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-white font-medium text-sm">
                {user?.name} - Comisión: {user?.porcentajeComision || 0}%
              </span>
              <button
                onClick={handleLogout}
                className="bg-white hover:bg-light-600 text-primary px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 focus:outline-none"
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
            <div className="md:hidden pb-3 pt-2 border-t border-primary-700">
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-white font-medium text-sm border-b border-primary-700 mb-2">
                  {user?.name}
                  <div className="text-xs text-white/80 mt-1">Comisión: {user?.porcentajeComision || 0}%</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-white hover:bg-primary-800 font-medium text-sm transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-8 border border-dark-200 dark:border-dark-700">
            <h2 className="text-3xl font-bold mb-2 text-primary">Panel de Vendedor</h2>
            <p className="text-dark-600 dark:text-dark-400 mb-6">Gestiona productos y ventas</p>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-primary font-semibold w-32">Nombre:</span>
                <span className="text-dark-900 dark:text-light-500">{user?.name}</span>
              </div>
              <div className="flex items-start">
                <span className="text-primary font-semibold w-32">Email:</span>
                <span className="text-dark-900 dark:text-light-500">{user?.email}</span>
              </div>
              <div className="flex items-start">
                <span className="text-primary font-semibold w-32">Rol:</span>
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary dark:text-primary-400 rounded-full text-sm font-medium inline-block">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
