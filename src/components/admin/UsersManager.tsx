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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;
  const [sortField, setSortField] = useState<'name' | 'email' | 'role' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else if (response.status === 401) {
        showErrorToast('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    } catch (error) {
      showErrorToast('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar usuarios
  useEffect(() => {
    let filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Convertir a minúsculas si es string
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se busca u ordena
  }, [searchTerm, users, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'email' | 'role' | 'createdAt') => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, ordenar ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 inline-block ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Calcular usuarios de la página actual
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setShowPassword(false);
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
    
    console.log('=== INICIO handleSubmit ===');
    console.log('editingUser:', editingUser);
    console.log('formData completo:', formData);
    
    try {
      const url = editingUser ? `/api/users?id=${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      console.log('URL:', url);
      console.log('Method:', method);
      
      // Preparar el body según si es edición o creación
      const body = editingUser 
        ? { 
            name: formData.name, 
            role: formData.role,
            precioHora: formData.precioHora,
            telefono: formData.telefono,
            domicilio: formData.domicilio,
            tipoDocumento: formData.tipoDocumento,
            nroDocumento: formData.nroDocumento,
            porcentajeComision: formData.porcentajeComision,
            ...(formData.password && { password: formData.password }) 
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            precioHora: formData.precioHora,
            telefono: formData.telefono,
            domicilio: formData.domicilio,
            tipoDocumento: formData.tipoDocumento,
            nroDocumento: formData.nroDocumento,
            porcentajeComision: formData.porcentajeComision
          };

      console.log('Body a enviar:', body);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ Usuario guardado exitosamente');
        showSuccessToast(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        fetchUsers();
        handleCloseModal();
      } else if (response.status === 401) {
        console.log('❌ Error 401: No autenticado');
        showErrorToast('No estás autenticado. Por favor, inicia sesión nuevamente.');
      } else if (response.status === 403) {
        console.log('❌ Error 403: Sin permisos');
        showErrorToast('No tienes permisos para gestionar usuarios.');
      } else {
        console.log('❌ Error al guardar:', data.error || 'Error desconocido');
        showErrorToast(data.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('❌ EXCEPCIÓN al guardar usuario:', error);
      showErrorToast('Error al guardar usuario');
    }
    console.log('=== FIN handleSubmit ===');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete('¿Eliminar este usuario?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users?id=${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessToast('Usuario eliminado');
        fetchUsers();
      } else if (response.status === 401) {
        showErrorToast('No estás autenticado. Por favor, inicia sesión nuevamente.');
      } else if (response.status === 403) {
        showErrorToast('No tienes permisos para eliminar usuarios.');
      } else {
        showErrorToast(data.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showErrorToast('Error al eliminar usuario');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-light-500">Gestión de Usuarios</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-64 px-3 md:px-4 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
          />
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary-700 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm md:text-base whitespace-nowrap"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-dark-600 dark:text-dark-400">
        Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
        {searchTerm && ` (filtrados de ${users.length} totales)`}
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto -mx-1 md:mx-0 overflow-y-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700 text-xs md:text-sm">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  Nombre <SortIcon field="name" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('email')}
                >
                  Email <SortIcon field="email" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('role')}
                >
                  Rol <SortIcon field="role" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Horas/Precio</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  Fecha Registro <SortIcon field="createdAt" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-dark-600 dark:hover:bg-dark-600 transition-colors">
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
                  <td className="block md:hidden px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-primary hover:text-green-700 font-semibold transition-colors cursor-pointer text-green-500"
                    >
                      E
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-error hover:text-error-dark font-semibold transition-colors cursor-pointer text-red-500"
                    >
                      X
                    </button>
                  </td>
                  <td className="hidden md:block px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-primary hover:text-green-700 font-semibold transition-colors cursor-pointer text-green-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-error hover:text-error-dark font-semibold transition-colors cursor-pointer text-red-500"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-dark-300 dark:border-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          {/* Páginas */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Mostrar siempre primera, última, actual y 2 páginas alrededor de la actual
            const showPage = 
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 2 && page <= currentPage + 2);
            
            const showEllipsis = 
              (page === currentPage - 3 && currentPage > 4) ||
              (page === currentPage + 3 && currentPage < totalPages - 3);

            if (showEllipsis) {
              return (
                <span key={page} className="px-2 text-dark-600 dark:text-dark-400">
                  ...
                </span>
              );
            }

            if (!showPage) return null;

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg border transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-dark-300 dark:border-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-dark-300 dark:border-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

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
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-10 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Domicilio</label>
                <input
                  type="text"
                  value={formData.domicilio}
                  onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
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
