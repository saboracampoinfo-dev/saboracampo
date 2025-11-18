'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { confirmDelete } from '@/utils/alerts';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  precioHora?: number;
  horasAcumuladas?: number;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    precioHora: 0,
    telefono: '',
    domicilio: '',
    tipoDocumento: '',
    nroDocumento: '',
    porcentajeComision: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      showErrorToast('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        precioHora: user.precioHora || 0,
        telefono: (user as any).telefono || '',
        domicilio: (user as any).domicilio || '',
        tipoDocumento: (user as any).tipoDocumento || '',
        nroDocumento: (user as any).nroDocumento || '',
        porcentajeComision: (user as any).porcentajeComision || 0
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        precioHora: 0,
        telefono: '',
        domicilio: '',
        tipoDocumento: '',
        nroDocumento: '',
        porcentajeComision: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      precioHora: 0,
      telefono: '',
      domicilio: '',
      tipoDocumento: '',
      nroDocumento: '',
      porcentajeComision: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `/api/users?id=${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      // Preparar el body según si es edición o creación
      const body = editingUser 
        ? { 
            name: formData.name, 
            role: formData.role,
            precioHora: formData.precioHora,
            ...(formData.password && { password: formData.password }) 
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        fetchUsers();
        handleCloseModal();
      } else {
        showErrorToast(data.error || 'Error al guardar usuario');
      }
    } catch (error) {
      showErrorToast('Error al guardar usuario');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete('¿Eliminar este usuario?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        showSuccessToast('Usuario eliminado');
        fetchUsers();
      } else {
        showErrorToast(data.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      showErrorToast('Error al eliminar usuario');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">Gestión de Usuarios</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Horas/Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-dark-50 dark:hover:bg-dark-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-light-500">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
                      user.role === 'vendedor' || user.role === 'seller' ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200' :
                      user.role === 'cajero' || user.role === 'cashier' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                      'bg-dark-100 text-dark-800 dark:bg-dark-700 dark:text-dark-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {(user.role === 'vendedor' || user.role === 'cajero' || user.role === 'seller' || user.role === 'cashier') ? (
                      <div>
                        <div className="font-semibold text-dark-900 dark:text-light-500">
                          {user.horasAcumuladas || 0}h
                        </div>
                        <div className="text-xs">
                          AR$ {user.precioHora || 0}/h
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-primary hover:text-primary-700 font-semibold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
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

        {users.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay usuarios registrados
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                >
                  <option value="user">Cliente</option>
                  <option value="cashier">Cajero</option>
                  <option value="seller">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Domicilio</label>
                <input
                  type="text"
                  value={formData.domicilio}
                  onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Tipo Documento</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar</option>
                    <option value="DNI">DNI</option>
                    <option value="CUIT">CUIT</option>
                    <option value="CUIL">CUIL</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nro. Documento</label>
                  <input
                    type="text"
                    value={formData.nroDocumento}
                    onChange={(e) => setFormData({ ...formData, nroDocumento: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {(formData.role === 'seller' || formData.role === 'cashier') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Precio por Hora (AR$)
                    </label>
                    <input
                      type="number"
                      value={formData.precioHora}
                      onChange={(e) => setFormData({ ...formData, precioHora: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Porcentaje Comisión (%)
                    </label>
                    <input
                      type="number"
                      value={formData.porcentajeComision}
                      onChange={(e) => setFormData({ ...formData, porcentajeComision: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </>
              )}
              
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
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
