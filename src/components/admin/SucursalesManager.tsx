'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { confirmDelete } from '@/utils/alerts';

interface Sucursal {
  _id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario: string;
  ciudad: string;
  activa: boolean;
  createdAt: string;
}

export default function SucursalesManager() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    horario: '',
    ciudad: '',
    activa: true
  });

  useEffect(() => {
    fetchSucursales();
  }, []);

  const fetchSucursales = async () => {
    try {
      const response = await fetch('/api/sucursales');
      const data = await response.json();
      if (data.success) {
        setSucursales(data.data);
      }
    } catch (error) {
      showErrorToast('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sucursal?: Sucursal) => {
    if (sucursal) {
      setEditingSucursal(sucursal);
      setFormData({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        email: sucursal.email,
        horario: sucursal.horario,
        ciudad: sucursal.ciudad,
        activa: sucursal.activa
      });
    } else {
      setEditingSucursal(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        horario: '',
        ciudad: '',
        activa: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSucursal(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      horario: '',
      ciudad: '',
      activa: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSucursal ? `/api/sucursales/${editingSucursal._id}` : '/api/sucursales';
      const method = editingSucursal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(editingSucursal ? 'Sucursal actualizada' : 'Sucursal creada');
        fetchSucursales();
        handleCloseModal();
      } else {
        showErrorToast(data.error || 'Error al guardar sucursal');
      }
    } catch (error) {
      showErrorToast('Error al guardar sucursal');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete('¿Eliminar esta sucursal?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/sucursales/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        showSuccessToast('Sucursal eliminada');
        fetchSucursales();
      } else {
        showErrorToast(data.error || 'Error al eliminar sucursal');
      }
    } catch (error) {
      showErrorToast('Error al eliminar sucursal');
    }
  };

  const toggleActiva = async (sucursal: Sucursal) => {
    try {
      const response = await fetch(`/api/sucursales/${sucursal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sucursal, activa: !sucursal.activa })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`Sucursal ${!sucursal.activa ? 'activada' : 'desactivada'}`);
        fetchSucursales();
      }
    } catch (error) {
      showErrorToast('Error al actualizar sucursal');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando sucursales...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">Gestión de Sucursales</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          + Nueva Sucursal
        </button>
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Ciudad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {sucursales.map((sucursal) => (
                <tr key={sucursal._id} className="hover:bg-dark-50 dark:hover:bg-dark-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-light-500">{sucursal.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">{sucursal.ciudad}</td>
                  <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400 max-w-xs truncate">{sucursal.direccion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">{sucursal.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">{sucursal.horario}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActiva(sucursal)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                        sucursal.activa 
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 hover:bg-success-200' 
                          : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200 hover:bg-error-200'
                      }`}
                    >
                      {sucursal.activa ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(sucursal)}
                      className="text-primary hover:text-primary-700 font-semibold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sucursal._id)}
                      className="text-error hover:text-error-dark font-semibold transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sucursales.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay sucursales registradas
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Dirección *</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Horario *</label>
                <input
                  type="text"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  placeholder="Ej: Lun-Vie 9:00-18:00"
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-primary bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600 rounded focus:ring-primary"
                />
                <label htmlFor="activa" className="ml-2 text-sm font-medium text-dark-700 dark:text-dark-300">
                  Sucursal activa
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingSucursal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
