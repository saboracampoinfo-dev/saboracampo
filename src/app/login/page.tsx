'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { showLoadingToast, updateToast, getFirebaseErrorMessage } from '@/utils/toastHelpers';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Toast de carga
    const loadingToast = showLoadingToast('Iniciando sesión...');

    try {
      // Login en Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Obtener token de Firebase
      const idToken = await userCredential.user.getIdToken();

      // Enviar token al backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Toast de éxito
      updateToast(loadingToast, '¡Inicio de sesión exitoso! Redirigiendo...', 'success', {
        autoClose: 1500,
      });

      // Redirigir según el rol - usar window.location para forzar recarga
      const role = data.data.role;
      let dashboardRoute = '/dashboardCliente';
      
      switch (role) {
        case 'admin':
          dashboardRoute = '/dashboardAdmin';
          break;
        case 'seller':
          dashboardRoute = '/dashboardVendedor';
          break;
        case 'cashier':
          dashboardRoute = '/dashboardCajero';
          break;
      }
      
      // Pequeño delay para que se vea el toast de éxito
      setTimeout(() => {
        window.location.href = dashboardRoute;
      }, 800);
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Determinar el mensaje de error apropiado
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.code) {
        errorMessage = getFirebaseErrorMessage(err.code);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Toast de error
      updateToast(loadingToast, errorMessage, 'error', {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 via-light-500 to-secondary-50 dark:from-dark-900 dark:via-dark-800 dark:to-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface dark:bg-dark-800 p-8 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-700">
        <div className='text-center'>
          <div className="flex justify-center mb-4">
            <a href="/" className="flex items-center space-x-2" >
                <img 
                src="/logo/logo.png" 
                alt="Sabor a Campo" 
                className="w-24 h-24 object-contain shadow-lg rounded-full"
                title='Sabor a Campo'
                aria-label='Sabor a Campo'
                />
            </a>
          </div>
            <span className="text-2xl uppercase font-bold bg-linear-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">
                Sabor a Campo
                </span>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-error-light/10 dark:bg-error-dark/10 p-4 border border-error-light dark:border-error-dark">
              <div className="text-sm text-error-light dark:text-error-dark font-medium">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 dark:placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 dark:placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          {/* <div className="text-center">
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary-700 transition-colors"
            >
              ¿No tienes cuenta? Regístrate
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
}
