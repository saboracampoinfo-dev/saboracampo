'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiSave, FiClock, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  telefono?: string;
  domicilio?: string;
  tipoDocumento?: string;
  nroDocumento?: string;
  imgProfile?: string;
  role: string;
  precioHora?: number;
  horasAcumuladas?: number;
  porcentajeComision?: number;
  comprasAcumuladas?: number;
  ultimaLiquidacion?: string;
  createdAt: string;
}

export default function ProfileEditorVendedor() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    telefono: '',
    domicilio: '',
    tipoDocumento: '',
    nroDocumento: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.user) {
        setProfile(data.user);
        setFormData({
          name: data.user.name || '',
          telefono: data.user.telefono || '',
          domicilio: data.user.domicilio || '',
          tipoDocumento: data.user.tipoDocumento || '',
          nroDocumento: data.user.nroDocumento || ''
        });
      }
    } catch (error) {
      showErrorToast('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/users?id=${profile?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('Perfil actualizado correctamente');
        fetchProfile();
      } else {
        showErrorToast(data.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      showErrorToast('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-primary text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-error">
        No se pudo cargar el perfil
      </div>
    );
  }

  const salarioPendiente = (profile.horasAcumuladas || 0) * (profile.precioHora || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Perfil */}
        <div className="md:col-span-2 bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
              <FiUser className="w-10 h-10 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">{profile.name}</h2>
              <p className="text-dark-600 dark:text-dark-400">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">
                Vendedor
              </span>
            </div>
          </div>
        </div>

        {/* Horas Acumuladas */}
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-1">Horas Acumuladas</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-light-500">
                {profile.horasAcumuladas || 0}h
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-dark-500 dark:text-dark-400 mt-2">
            AR$ {profile.precioHora || 0}/h
          </p>
        </div>

        {/* Salario Pendiente */}
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-1">Salario Pendiente</p>
              <p className="text-3xl font-bold text-success">
                AR$ {salarioPendiente.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Comisión */}
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-4 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">Comisión</p>
              <p className="text-xl font-bold text-dark-900 dark:text-light-500">
                {profile.porcentajeComision || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Compras Acumuladas */}
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-4 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-info-100 dark:bg-info-900 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">Compras</p>
              <p className="text-xl font-bold text-dark-900 dark:text-light-500">
                AR$ {(profile.comprasAcumuladas || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Última Liquidación */}
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-4 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">Última Liquidación</p>
              <p className="text-sm font-bold text-dark-900 dark:text-light-500">
                {profile.ultimaLiquidacion 
                  ? new Date(profile.ultimaLiquidacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                  : 'Sin liquidar'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
        <h3 className="text-xl font-bold mb-6 text-dark-900 dark:text-light-500">
          Información Personal
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="flex items-center text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              <FiUser className="mr-2" />
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Email (solo lectura) */}
          <div>
            <label className="flex items-center text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              <FiMail className="mr-2" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={profile.email}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-dark-100 dark:bg-dark-900 text-dark-600 dark:text-dark-400 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
              El correo electrónico no se puede modificar
            </p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="flex items-center text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              <FiPhone className="mr-2" />
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>

          {/* Domicilio */}
          <div>
            <label className="flex items-center text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              <FiMapPin className="mr-2" />
              Domicilio
            </label>
            <input
              type="text"
              value={formData.domicilio}
              onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>

          {/* Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                <FiFileText className="mr-2" />
                Tipo de Documento
              </label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              >
                <option value="">Seleccionar</option>
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                <FiFileText className="mr-2" />
                Número de Documento
              </label>
              <input
                type="text"
                value={formData.nroDocumento}
                onChange={(e) => setFormData({ ...formData, nroDocumento: e.target.value })}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                placeholder="Sin puntos ni guiones"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-secondary hover:bg-secondary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Información adicional */}
      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
        <h3 className="text-lg font-semibold mb-4 text-dark-900 dark:text-light-500">
          Información de Cuenta
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-600 dark:text-dark-400">Fecha de registro:</span>
            <span className="text-dark-900 dark:text-light-500 font-medium">
              {new Date(profile.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-600 dark:text-dark-400">ID de Usuario:</span>
            <span className="text-dark-900 dark:text-light-500 font-mono text-xs">
              {profile._id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
