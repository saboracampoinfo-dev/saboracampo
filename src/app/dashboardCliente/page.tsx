'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileEditor from '@/components/ProfileEditor';

export default function DashboardCliente() {
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
      <nav className="bg-surface dark:bg-dark-800 shadow-md border-b-2 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <img 
                src="/logo/logo.png" 
                alt="Sabor a Campo" 
                className="w-10 h-10 object-contain mr-3 rounded-full"
              />
              <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
                Dashboard Cliente
              </h1>
              <h1 className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent sm:hidden">
                Cliente
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'inicio' 
                    ? 'bg-primary text-white' 
                    : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => setActiveTab('perfil')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'perfil' 
                    ? 'bg-primary text-white' 
                    : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                Mi Perfil
              </button>
              <span className="text-dark-700 dark:text-dark-300 font-medium text-sm">Hola, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary-700 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-dark-700 dark:text-dark-300 hover:text-primary focus:outline-none"
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
            <div className="md:hidden pb-3 pt-2 border-t border-dark-200 dark:border-dark-700">
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-dark-900 dark:text-light-500 font-medium text-sm border-b border-dark-200 dark:border-dark-700 mb-2">
                  Hola, {user?.name}
                </div>
                <button
                  onClick={() => { setActiveTab('inicio'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeTab === 'inicio' 
                      ? 'bg-primary text-white' 
                      : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => { setActiveTab('perfil'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeTab === 'perfil' 
                      ? 'bg-primary text-white' 
                      : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                  }`}
                >
                  Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 font-medium text-sm transition-colors"
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
              <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Bienvenido a Sabor a Campo</h2>
              <div className="space-y-4">
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
                {user?.telefono && (
                  <div className="flex items-start">
                    <span className="text-primary font-semibold w-32">Teléfono:</span>
                    <span className="text-dark-900 dark:text-light-500">{user.telefono}</span>
                  </div>
                )}
                {user?.domicilio && (
                  <div className="flex items-start">
                    <span className="text-primary font-semibold w-32">Domicilio:</span>
                    <span className="text-dark-900 dark:text-light-500">{user.domicilio}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ProfileEditor />
          )}
        </div>
      </main>
    </div>
  );
}
