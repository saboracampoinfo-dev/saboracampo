'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { showErrorToast, showLoadingToast, updateToast, getFirebaseErrorMessage } from '@/utils/toastHelpers';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    domicilio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Las contraseñas no coinciden';
      setError(errorMsg);
      showErrorToast(errorMsg);
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'La contraseña debe tener al menos 6 caracteres';
      setError(errorMsg);
      showErrorToast(errorMsg);
      return;
    }

    if (!formData.name.trim()) {
      const errorMsg = 'El nombre es requerido';
      setError(errorMsg);
      showErrorToast(errorMsg);
      return;
    }

    setLoading(true);

    // Toast de carga
    const loadingToast = showLoadingToast('Creando tu cuenta...');

    try {
      // Registrar en el backend (que creará en Firebase y MongoDB)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          domicilio: formData.domicilio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Toast de éxito
      updateToast(loadingToast, '¡Cuenta creada exitosamente! Bienvenido/a 🎉', 'success', {
        autoClose: 1500,
      });

      // Redirigir al dashboard de cliente - usar window.location para forzar recarga
      setTimeout(() => {
        window.location.href = '/dashboardCliente';
      }, 800);
    } catch (err: any) {
      console.error('Register error:', err);
      
      // Determinar el mensaje de error apropiado
      let errorMessage = 'Error al registrar usuario';
      
      if (err.code) {
        errorMessage = getFirebaseErrorMessage(err.code);
      } else if (err.message) {
        // Casos especiales del backend
        if (err.message.includes('ya existe')) {
          errorMessage = 'Este email ya está registrado';
        } else {
          errorMessage = err.message;
        }
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
            <a href="/" className="flex items-center space-x-2">
                <img 
                src="/logo/logo.png" 
                alt="Sabor a Campo" 
                className="w-24 h-24 object-contain shadow-lg rounded-full"
                title='Sabor a Campo'
                aria-label='Sabor a Campo'
                />
            </a>
          </div>
          <span className="text-2xl text-center uppercase font-bold bg-linear-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">
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
              <label htmlFor="name" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Nombre completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="Opcional"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="domicilio" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Domicilio
              </label>
              <input
                id="domicilio"
                name="domicilio"
                type="text"
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="Opcional"
                value={formData.domicilio}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Confirmar contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
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
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary-700 transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
