'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importar componentes con dynamic para evitar SSR issues
const UsersManager = dynamic(() => import('@/components/admin/UsersManager'), { ssr: false });
const SucursalesManager = dynamic(() => import('@/components/admin/SucursalesManager'), { ssr: false });
const ProductsManager = dynamic(() => import('@/components/admin/ProductsManager'), { ssr: false });
const VentasManager = dynamic(() => import('@/components/admin/VentasManager'), { ssr: false });
const LiquidacionesManager = dynamic(() => import('@/components/admin/LiquidacionesManager'), { ssr: false });
const ConfiguracionManager = dynamic(() => import('@/components/admin/ConfiguracionManager'), { ssr: false });
const GestorTransferencias = dynamic(() => import('@/components/admin/GestorTransferencias'), { ssr: false });

export default function DashboardAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'usuarios' | 'sucursales' | 'productos' | 'ventas' | 'liquidaciones' | 'configuracion' | 'transferencias'>('liquidaciones');

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
                <h1 className="text-lg md:text-xl font-bold text-white hidden sm:block">Administrador</h1>
                <h1 className="text-lg font-bold text-white sm:hidden">Admin</h1>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* <a href="/dashboardVendedor" className="text-light-500 hover:text-primary transition-colors font-medium text-sm">
                Ver como Vendedor
              </a>
              <a href="/dashboardCajero" className="text-light-500 hover:text-primary transition-colors font-medium text-sm">
                Ver como Cajero
              </a>
              <a href="/dashboardCliente" className="text-light-500 hover:text-primary transition-colors font-medium text-sm">
                Ver como Cliente
              </a> */}
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
                {/* <a
                  href="/dashboardVendedor"
                  className="block px-3 py-2 rounded-md text-light-500 hover:bg-dark-800 hover:text-primary font-medium text-sm transition-colors"
                >
                  Ver como Vendedor
                </a>
                <a
                  href="/dashboardCajero"
                  className="block px-3 py-2 rounded-md text-light-500 hover:bg-dark-800 hover:text-primary font-medium text-sm transition-colors"
                >
                  Ver como Cajero
                </a>
                <a
                  href="/dashboardCliente"
                  className="block px-3 py-2 rounded-md text-light-500 hover:bg-dark-800 hover:text-primary font-medium text-sm transition-colors"
                >
                  Ver como Cliente
                </a> */}
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
        <div className="px-2 py-6 ">
          {/* Tabs Navigation */}
          <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg mb-6 border border-dark-200 dark:border-dark-700 overflow-x-auto">
            <div className="flex space-x-1 p-2 min-w-max">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                📊 Mis Datos
              </button>
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'usuarios'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                👥 Usuarios
              </button>
              <button
                onClick={() => setActiveTab('sucursales')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'sucursales'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                🏢 Sucursales
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
                onClick={() => setActiveTab('ventas')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'ventas'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                💰 Ventas
              </button>
              <button
                onClick={() => setActiveTab('liquidaciones')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'liquidaciones'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                💵 Liquidaciones
              </button>
              <button
                onClick={() => setActiveTab('transferencias')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'transferencias'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                🔄 Transfer
              </button>
              <button
                onClick={() => setActiveTab('configuracion')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'configuracion'
                    ? 'bg-primary-600 text-gray-200 shadow-md'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700'
                }`}
              >
                ⚙️ Conf
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'dashboard' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Panel de Administración</h2>
              <p className="text-dark-600 dark:text-dark-400 mb-6">Mis Datos</p>
              <div className="space-y-3 mb-8">
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
                  <span className="px-3 py-1 bg-dark-100 dark:bg-dark-700 text-dark-900 dark:text-light-500 rounded-full text-sm font-medium inline-block">{user?.role}</span>
                </div>
              </div>
{/* 
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className="bg-primary-50 dark:bg-primary-900 p-6 rounded-lg border-l-4 border-primary hover:shadow-lg transition-all hover:scale-105 text-left"
                >
                  <h3 className="font-bold text-primary-900 dark:text-primary-200 text-lg mb-2">👥 Usuarios</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">Gestionar usuarios del sistema</p>
                </button>
                <button
                  onClick={() => setActiveTab('sucursales')}
                  className="bg-primary-50 dark:bg-primary-900 p-6 rounded-lg border-l-4 border-primary hover:shadow-lg transition-all hover:scale-105 text-left"
                >
                  <h3 className="font-bold text-primary-900 dark:text-primary-200 text-lg mb-2">🏢 Sucursales</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">Gestionar sucursales del sistema</p>
                </button>
                <button
                  onClick={() => setActiveTab('productos')}
                  className="bg-secondary-50 dark:bg-secondary-900 p-6 rounded-lg border-l-4 border-secondary hover:shadow-lg transition-all hover:scale-105 text-left"
                >
                  <h3 className="font-bold text-secondary-900 dark:text-secondary-200 text-lg mb-2">📦 Productos</h3>
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">Gestionar catálogo de productos</p>
                </button>
                <button
                  onClick={() => setActiveTab('ventas')}
                  className="bg-light-600 dark:bg-dark-700 p-6 rounded-lg border-l-4 border-primary-700 hover:shadow-lg transition-all hover:scale-105 text-left"
                >
                  <h3 className="font-bold text-dark-900 dark:text-light-500 text-lg mb-2">💰 Ventas</h3>
                  <p className="text-sm text-dark-700 dark:text-dark-300">Ver reportes y estadísticas</p>
                </button>
              </div> */}

              {/* <div className="mt-6">
                <button
                  onClick={() => setActiveTab('liquidaciones')}
                  className="w-full bg-warning-50 dark:bg-warning-900 p-6 rounded-lg border-l-4 border-warning hover:shadow-lg transition-all hover:scale-105 text-left"
                >
                  <h3 className="font-bold text-warning-900 dark:text-warning-200 text-lg mb-2">💵 Liquidaciones</h3>
                  <p className="text-sm text-warning-700 dark:text-warning-300">Gestionar pagos de vendedores y cajeros por horas trabajadas</p>
                </button>
              </div>
            <div className="mt-6">
                <button
                  onClick={() => setActiveTab('configuracion')}
                  className="w-full bg-warning-50 dark:bg-warning-900 p-6 rounded-lg border-l-4 border-warning hover:shadow-lg transition-all hover:scale-105 text-left"
                >
                  <h3 className="font-bold text-warning-900 dark:text-warning-200 text-lg mb-2">⚙️ Configuración</h3>
                  <p className="text-sm text-warning-700 dark:text-warning-300">Gestionar configuración del sistema</p>
                </button>
              </div> */}
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <UsersManager />
            </div>
          )}

          {activeTab === 'sucursales' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <SucursalesManager />
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <ProductsManager />
            </div>
          )}

          {activeTab === 'ventas' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <VentasManager />
            </div>
          )}

          {activeTab === 'liquidaciones' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <LiquidacionesManager />
            </div>
          )}

          {activeTab === 'transferencias' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <GestorTransferencias />
            </div>
          )}

          {activeTab === 'configuracion' && (
            <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-xl p-1 md:p-8 border border-dark-200 dark:border-dark-700">
              <ConfiguracionManager />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
