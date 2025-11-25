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
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    const loadingToast = showLoadingToast('Enviando email de restablecimiento...');

    try {
      // Primero verificar en el backend si el usuario existe
      const verifyResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Usuario no encontrado');
      }

      // Si el usuario existe, enviar el email usando Firebase client
      const { sendPasswordResetEmail } = await import('firebase/auth');
      
      await sendPasswordResetEmail(auth, resetEmail.toLowerCase(), {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });

      console.log('✅ Email de restablecimiento enviado a:', resetEmail);

      updateToast(loadingToast, '✅ Se ha enviado un email para restablecer tu contraseña', 'success', {
        autoClose: 5000,
      });
      setResetMessage('Se ha enviado un email para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      
      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      let errorMessage = 'Error al enviar el email';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      updateToast(loadingToast, '❌ ' + errorMessage, 'error', {
        autoClose: 4000,
      });
      setResetMessage(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetEmail(formData.email);
    setResetMessage('');
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

          <div className="text-center">
            <button
              type="button"
              onClick={openResetModal}
              className="text-sm font-medium text-primary hover:text-primary-700 transition-colors underline"
            >
              ¿Olvidaste tu contraseña?
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

      {/* Modal de Restablecer Contraseña */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-dark-200 dark:border-dark-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-dark-900 dark:text-light-500">
                Restablecer Contraseña
              </h3>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetEmail('');
                  setResetMessage('');
                }}
                className="text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {resetMessage && resetMessage.includes('Revisa tu bandeja') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-dark-300 dark:border-dark-600 placeholder-dark-500 dark:placeholder-dark-500 text-dark-900 dark:text-light-500 bg-surface dark:bg-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              {resetMessage && (
                <div className={`rounded-lg p-3 text-sm ${
                  resetMessage.includes('enviado') || resetMessage.includes('recibirás')
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
                }`}>
                  {resetMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
