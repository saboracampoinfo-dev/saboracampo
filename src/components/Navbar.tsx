'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false); // 👈 nuevo estado

  useEffect(() => {
    // Verificar si hay preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Aplicar tema inicial
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Obtener información del usuario
    fetchUserData();

    // Cerrar menú de usuario al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 👇 efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      // cuando baja más de 10px consideramos que ya scrolleó
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll(); // para setear el estado inicial
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else if (response.status === 401) {
        setUser(null);
      } else {
        console.error('Error fetching user data:', response.status);
      }
    } catch (error) {
      console.error('Network error fetching user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    
    if (newDarkMode) {
      // Activar dark mode
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    } else {
      // Activar light mode
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        showSuccessToast('Sesión cerrada correctamente');
        setUser(null);
        router.push('/');
      } else {
        showErrorToast('Error al cerrar sesión');
      }
    } catch (error) {
      showErrorToast('Error al cerrar sesión');
    }
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'Administrador',
      seller: 'Vendedor',
      cashier: 'Cajero',
      user: 'Cliente',
    };
    return roleNames[role] || 'Usuario';
  };

  const getDashboardRoute = (role: string) => {
    const routes: Record<string, string> = {
      admin: '/dashboardAdmin',
      seller: '/dashboardVendedor',
      cashier: '/dashboardCajero',
      user: '/dashboardCliente',
    };
    return routes[role] || '/dashboardCliente';
  };

  return (
    <nav
      className={`
        fixed w-full top-0 z-50
        border-b border-dark-200 dark:border-dark-800
        transition-colors duration-300 backdrop-blur
        ${isScrolled
          ? 'bg-surface/95 dark:bg-dark-900 shadow-md'
          : 'bg-transparent dark:bg-transparent border-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <img 
                src="/logo/logo.png" 
                alt="Sabor a Campo" 
                width={40}
                height={40}
                className="object-contain rounded-full"
              />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">
              Sabor a Campo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="#locales" 
              className="text-dark-700 dark:text-dark-300 hover:text-primary transition-colors font-medium"
            >
              Locales
            </Link>
            <Link 
              href="#contacto" 
              className="text-dark-700 dark:text-dark-300 hover:text-primary transition-colors font-medium"
            >
              Contacto
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-dark-700 dark:text-dark-300 hover:text-primary transition-colors font-medium"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{getRoleName(user.role)}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 py-2 z-50">
                        <div className="px-4 py-3 border-b border-dark-200 dark:border-dark-700">
                          <p className="text-sm font-semibold text-dark-900 dark:text-light-500">{user.name}</p>
                          <p className="text-xs text-dark-600 dark:text-dark-400">{user.email}</p>
                        </div>
                        <Link
                          href={getDashboardRoute(user.role)}
                          className="block px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700 hover:text-primary transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Mi Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-colors"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-primary hover:text-primary-700 font-semibold transition-colors"
                    >
                      Login
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Dark Mode Toggle */}
            {/* <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-dark-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button> */}
          </div>

          {/* Dark Mode Toggle - Mobile */}
           <div className="md:hidden flex items-center space-x-2">
            {/*<button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-dark-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dark-700 dark:text-dark-300 hover:text-primary focus:outline-none"
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
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface dark:bg-dark-800 border-t border-dark-200 dark:border-dark-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="#locales"
              className="block px-3 py-2 rounded-md text-dark-700 dark:text-dark-300 hover:bg-primary-50 hover:text-primary font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Nuestros Locales
            </Link>
            <Link
              href="#contacto"
              className="block px-3 py-2 rounded-md text-dark-700 dark:text-dark-300 hover:bg-primary-50 hover:text-primary font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <div className="px-3 py-2 border-t border-dark-200 dark:border-dark-700">
                      <p className="text-sm font-semibold text-dark-900 dark:text-light-500">{user.name}</p>
                      <p className="text-xs text-dark-600 dark:text-dark-400">{user.email}</p>
                      <p className="text-xs text-primary font-medium mt-1">{getRoleName(user.role)}</p>
                    </div>
                    <Link
                      href={getDashboardRoute(user.role)}
                      className="block px-3 py-2 rounded-md text-dark-700 dark:text-dark-300 hover:bg-primary-50 hover:text-primary font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-error-light dark:text-error-dark hover:bg-error-light/10 font-medium transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-primary hover:bg-primary-50 font-semibold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-700 text-center font-semibold transition-colors shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
