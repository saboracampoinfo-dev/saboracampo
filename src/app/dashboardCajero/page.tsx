'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileEditorCajero from '@/components/ProfileEditorCajero';

export default function DashboardCajero() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inicio' | 'perfil'>('inicio');

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
      <nav className="bg-secondary dark:bg-secondary-900 shadow-md border-b-2 border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <img 
                src="/logo/logo.png" 
                alt="Sabor a Campo" 
                className="w-10 h-10 object-contain mr-3 rounded-full"
              />
              <h1 className="text-lg md:text-xl font-bold text-white hidden sm:block">Dashboard Cajero</h1>
              <h1 className="text-lg font-bold text-white sm:hidden">Cajero</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'inicio' 
                    ? 'bg-white text-secondary' 
                    : 'text-white hover:bg-secondary-800'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => setActiveTab('perfil')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'perfil' 
                    ? 'bg-white text-secondary' 
                    : 'text-white hover:bg-secondary-800'
                }`}
              >
                Mi Perfil
              </button>
              <span className="text-white font-medium text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white hover:bg-light-600 text-secondary px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
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
            <div className="md:hidden pb-3 pt-2 border-t border-secondary-700">
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-white font-medium text-sm border-b border-secondary-700 mb-2">
                  {user?.name}
                </div>
                <button
                  onClick={() => { setActiveTab('inicio'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeTab === 'inicio' 
                      ? 'bg-white text-secondary' 
                      : 'text-white hover:bg-secondary-800'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => { setActiveTab('perfil'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeTab === 'perfil' 
                      ? 'bg-white text-secondary' 
                      : 'text-white hover:bg-secondary-800'
                  }`}
                >
                  Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-white hover:bg-secondary-800 font-medium text-sm transition-colors"
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
          {activeTab === 'inicio' ? (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-8 border border-dark-200 dark:border-dark-700">
              <h2 className="text-3xl font-bold mb-2 text-secondary dark:text-secondary-400">Panel de Cajero</h2>
              <p className="text-dark-600 dark:text-dark-400 mb-6">Gestiona cobros y pagos</p>
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
                  <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary dark:text-secondary-400 rounded-full text-sm font-medium inline-block">{user?.role}</span>
                </div>
              </div>
            </div>
          ) : (
            <ProfileEditorCajero />
          )}
        </div>
      </main>
    </div>
  );
}
