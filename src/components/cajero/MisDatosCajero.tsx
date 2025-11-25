'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

interface User {
  _id: string;
  name: string;
  email: string;
  telefono?: string;
  domicilio?: string;
  tipoDocumento?: string;
  nroDocumento?: string;
  imgProfile?: string;
}

export default function MisDatosCajero() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    telefono: '',
    domicilio: '',
    tipoDocumento: '',
    nroDocumento: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          telefono: data.user.telefono || '',
          domicilio: data.user.domicilio || '',
          tipoDocumento: data.user.tipoDocumento || '',
          nroDocumento: data.user.nroDocumento || '',
        });
        setPreviewImage(data.user.imgProfile || null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showErrorToast('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploadImage', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setPreviewImage(data.url);
        showSuccessToast('Imagen subida correctamente');
      } else {
        showErrorToast('Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showErrorToast('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        ...formData,
        ...(previewImage && { imgProfile: previewImage }),
      };

      const response = await fetch(`/api/users?id=${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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
          <h2 className="text-3xl font-bold text-secondary">Mis Datos</h2>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Información personal y de contacto
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-secondary hover:bg-secondary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            ✏️ Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de Perfil */}
          {/* <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-secondary"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-dark-200 dark:bg-dark-600 flex items-center justify-center border-4 border-secondary">
                  <span className="text-4xl text-dark-400">📷</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-secondary hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
              {uploadingImage ? '⏳ Subiendo...' : '📸 Cambiar Foto'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div> */}

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
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
                required
              />
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                El email no se puede modificar
              </p>
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
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>

            {/* Domicilio */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Domicilio
              </label>
              <input
                type="text"
                value={formData.domicilio}
                onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Tipo de Documento
              </label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              >
                <option value="">Seleccionar</option>
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            {/* Número de Documento */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Número de Documento
              </label>
              <input
                type="text"
                value={formData.nroDocumento}
                onChange={(e) => setFormData({ ...formData, nroDocumento: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="bg-secondary hover:bg-secondary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
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
          {/* Foto de Perfil */}
          {user?.imgProfile && (
            <div className="flex justify-center mb-6">
              <img
                src={user.imgProfile}
                alt="Perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-secondary"
              />
            </div>
          )}

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

              {user?.domicilio && (
                <div>
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Domicilio
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {user.domicilio}
                  </span>
                </div>
              )}

              {user?.tipoDocumento && (
                <div>
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Tipo de Documento
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {user.tipoDocumento}
                  </span>
                </div>
              )}

              {user?.nroDocumento && (
                <div>
                  <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                    Número de Documento
                  </span>
                  <span className="text-dark-900 dark:text-light-500 text-lg">
                    {user.nroDocumento}
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
