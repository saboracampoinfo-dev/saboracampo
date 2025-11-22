'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  fechaNacimiento?: string;
}

export default function MisDatosVendedor() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    fechaNacimiento: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          telefono: data.user.telefono || '',
          direccion: data.user.direccion || '',
          ciudad: data.user.ciudad || '',
          codigoPostal: data.user.codigoPostal || '',
          fechaNacimiento: data.user.fechaNacimiento || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showErrorToast('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/users/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('Datos actualizados correctamente');
        setIsEditing(false);
        fetchUser();
      } else {
        showErrorToast(data.message || 'Error al actualizar datos');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorToast('Error al actualizar datos');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-primary font-semibold animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Mis Datos</h2>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Información personal y de contacto
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            ✏️ Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>

            {/* Código Postal */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              💾 Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchUser();
              }}
              className="bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-dark-700 rounded-lg p-2 md:p-6 shadow-md border border-dark-200 dark:border-dark-600">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                  Nombre Completo
                </span>
                <span className="text-dark-900 dark:text-light-500 text-lg">
                  {user?.name || 'No especificado'}
                </span>
              </div>

              <div>
                <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                  Email
                </span>
                <span className="text-dark-900 dark:text-light-500 text-lg">
                  {user?.email}
                </span>
              </div>

              <div>
                <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                  Teléfono
                </span>
                <span className="text-dark-900 dark:text-light-500 text-lg">
                  {user?.telefono || 'No especificado'}
                </span>
              </div>

              <div>
                <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                  Rol
                </span>
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary dark:text-primary-400 rounded-full text-sm font-medium inline-block">
                  {user?.role}
                </span>
              </div>

              {user?.fechaNacimiento && (
                <div>
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Fecha de Nacimiento
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {new Date(user.fechaNacimiento).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}

              {user?.direccion && (
                <div className="md:col-span-2">
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Dirección
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {user.direccion}
                  </span>
                </div>
              )}

              {user?.ciudad && (
                <div>
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Ciudad
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {user.ciudad}
                  </span>
                </div>
              )}

              {user?.codigoPostal && (
                <div>
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Código Postal
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {user.codigoPostal}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
