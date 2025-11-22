'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastHelpers';

interface ProductoOrden {
  productoId: string;
  nombre: string;
  codigoBarras?: string; // Opcional
  cantidad: number;
  precio: number;
  subtotal: number;
  imagen?: string;
}

interface Orden {
  _id: string;
  numeroOrden: string;
  vendedor: {
    id: string;
    nombre: string;
    email: string;
  };
  productos: ProductoOrden[];
  total: number;
  estado: 'en_proceso' | 'pendiente_cobro' | 'completada' | 'cancelada';
  fechaCreacion: string;
  fechaCierre?: string;
  fechaCompletada?: string;
  metodoPago?: string;
  cajero?: {
    id: string;
    nombre: string;
  };
  notas?: string;
}

interface Sucursal {
  _id: string;
  nombre: string;
  estado: string;
}

export default function OrdenesVendedor() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'en_proceso' | 'pendiente_cobro' | 'completada' | 'cancelada'>('todas');
  
  // Estados para selector de sucursal
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  useEffect(() => {
    fetchSucursales();
    fetchOrdenes();
    // Cargar sucursal guardada en localStorage
    const sucursalGuardada = localStorage.getItem('sucursalActiva');
    if (sucursalGuardada) {
      setSucursalSeleccionada(sucursalGuardada);
    }
  }, []);

  const fetchSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const response = await fetch('/api/sucursales?estado=activa');
      const data = await response.json();
      
      if (data.success) {
        setSucursales(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoadingSucursales(false);
    }
  };

  const handleSucursalChange = async (sucursalId: string) => {
    setSucursalSeleccionada(sucursalId);
    const sucursal = sucursales.find(s => s._id === sucursalId);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('sucursalActiva', sucursalId);
    localStorage.setItem('sucursalActivaNombre', sucursal?.nombre || '');
    
    // Actualizar sucursal del usuario en el backend
    try {
      const response = await fetch('/api/users/update-sucursal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sucursalId,
          sucursalNombre: sucursal?.nombre || ''
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccessToast(`Sucursal cambiada a: ${sucursal?.nombre}`);
      }
    } catch (error) {
      console.error('Error al actualizar sucursal:', error);
    }
  };

  const crearNuevaOrden = () => {
    if (!sucursalSeleccionada) {
      showInfoToast('Por favor, selecciona una sucursal antes de crear una orden');
      return;
    }
    window.location.href = '/dashboardVendedor?tab=crear_orden';
  };

  const fetchOrdenes = async () => {
    try {
      const response = await fetch('/api/ordenes');
      const data = await response.json();
      
      if (data.success) {
        setOrdenes(data.ordenes);
      } else {
        showErrorToast('Error al cargar órdenes');
      }
    } catch (error) {
      showErrorToast('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (ordenId: string, nuevoEstado: string) => {
    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar_estado',
          ordenId,
          estado: nuevoEstado
        })
      });

      const data = await response.json();

      if (data.success) {
        // Recargar órdenes
        fetchOrdenes();
        showSuccessToast(data.message || 'Estado actualizado correctamente');
      } else {
        showErrorToast(data.error || 'Error al actualizar estado');
      }
    } catch (error) {
      showErrorToast('Error al actualizar estado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_proceso':
        return { bg: 'bg-primary-600', text: 'text-primary', label: 'En Proceso' };
      case 'pendiente_cobro':
        return { bg: 'bg-warning/10', text: 'text-warning', label: 'Pendiente Cobro' };
      case 'completada':
        return { bg: 'bg-success-dark/10', text: 'text-success-light', label: 'Completada' };
      case 'cancelada':
        return { bg: 'bg-error-dark/10', text: 'text-error-light', label: 'Cancelada' };
      default:
        return { bg: 'bg-dark-100', text: 'text-dark-600', label: estado };
    }
  };

  const ordenesFiltradas = filtroEstado === 'todas' 
    ? ordenes 
    : ordenes.filter(orden => orden.estado === filtroEstado);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-primary font-semibold animate-pulse">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">Órdenes de Venta</h2>
        <p className="text-dark-600 dark:text-dark-400 mt-1">
          Gestiona las órdenes de tus clientes
        </p>
      </div>

      {/* Selector de Sucursal y Botón Nueva Orden */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Selector de Sucursal */}
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              📍 Sucursal Activa
            </label>
            {loadingSucursales ? (
              <div className="animate-pulse bg-dark-200 dark:bg-dark-600 h-10 rounded-lg"></div>
            ) : (
              <select
                value={sucursalSeleccionada}
                onChange={(e) => handleSucursalChange(e.target.value)}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Seleccionar sucursal...</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal._id} value={sucursal._id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Botón Nueva Orden */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-semibold text-transparent mb-2 md:invisible">
              .
            </label>
            <button
              onClick={crearNuevaOrden}
              disabled={!sucursalSeleccionada}
              className={`w-full md:w-auto px-6 py-2 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer hover:bg-amber-600 ${
                sucursalSeleccionada
                  ? 'bg-success-light hover:bg-success-dark text-white shadow-md hover:shadow-xl'
                  : 'bg-dark-300 dark:bg-dark-600 text-dark-500 dark:text-dark-400 cursor-not-allowed'
              }`}
            >
              ➕ Nueva Orden
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('todas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'todas'
                ? 'bg-primary text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            Todas ({ordenes.length})
          </button>
          <button
            onClick={() => setFiltroEstado('pendiente_cobro')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'pendiente_cobro'
                ? 'bg-warning text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            Pendiente Cobro ({ordenes.filter(o => o.estado === 'pendiente_cobro').length})
          </button>
          <button
            onClick={() => setFiltroEstado('en_proceso')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'en_proceso'
                ? 'bg-primary text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            En Proceso ({ordenes.filter(o => o.estado === 'en_proceso').length})
          </button>
          <button
            onClick={() => setFiltroEstado('completada')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer${
              filtroEstado === 'completada'
                ? 'bg-success-light text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            Completadas ({ordenes.filter(o => o.estado === 'completada').length})
          </button>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="space-y-4">
        {ordenesFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-dark-700 rounded-lg p-8 text-center border border-dark-200 dark:border-dark-600">
            <p className="text-dark-500 dark:text-dark-400">No hay órdenes para mostrar</p>
          </div>
        ) : (
          ordenesFiltradas.map((orden) => {
            const estadoInfo = getEstadoColor(orden.estado);
            return (
              <div
                key={orden._id}
                className="bg-white dark:bg-dark-700 rounded-lg p-2 md:p-6 shadow-md border border-dark-200 dark:border-dark-600 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-dark-900 dark:text-light-500">
                        Orden #{orden.numeroOrden}
                      </h3>
                      <span className={`px-3 py-1 ${estadoInfo.bg} ${estadoInfo.text} rounded-full text-xs font-medium`}>
                        {estadoInfo.label}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-dark-600 dark:text-dark-400">
                      <div>� Vendedor: {orden.vendedor.nombre}</div>
                      <div>📅 Creada: {new Date(orden.fechaCreacion).toLocaleString('es-ES')}</div>
                      {orden.fechaCierre && (
                        <div>� Cerrada: {new Date(orden.fechaCierre).toLocaleString('es-ES')}</div>
                      )}
                      {orden.fechaCompletada && (
                        <div>✅ Completada: {new Date(orden.fechaCompletada).toLocaleString('es-ES')}</div>
                      )}
                      {orden.metodoPago && <div>💳 {orden.metodoPago}</div>}
                      {orden.cajero && <div>💰 Cajero: {orden.cajero.nombre}</div>}
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-1">
                        Productos ({orden.productos.length}):
                      </div>
                      <div className="space-y-1">
                        {orden.productos.map((prod, idx) => (
                          <div key={idx} className="text-sm text-dark-600 dark:text-dark-400">
                            • {prod.nombre} - {prod.cantidad} unidad(es) × ${prod.precio} = ${prod.subtotal}
                          </div>
                        ))}
                      </div>
                    </div>

                    {orden.notas && (
                      <div className="mt-3 p-2 bg-warning/10 rounded-lg">
                        <span className="text-sm font-semibold text-warning">Notas: </span>
                        <span className="text-sm text-dark-700 dark:text-dark-300">{orden.notas}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:text-right space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      ${orden.total.toFixed(2)}
                    </div>

                    {orden.estado === 'en_proceso' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => window.location.href = `/dashboardVendedor?tab=editar_orden&ordenId=${orden._id}`}
                          className="cursor-pointer bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        >
                          ✏️ Editar Orden
                        </button>
                        <button
                          onClick={() => handleEstadoChange(orden._id, 'pendiente_cobro')}
                          className="cursor-pointer bg-green-600 hover:bg-green-800 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        >
                          Enviar a Caja
                        </button>
                        <button
                          onClick={() => handleEstadoChange(orden._id, 'cancelada')}
                          className="cursor-pointer bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedOrden(orden)}
                      className="cursor-pointer w-full bg-dark-300 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-800 text-dark-900 dark:text-light-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedOrden && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Detalle de Orden</h3>
              <button
                onClick={() => setSelectedOrden(null)}
                className="text-white hover:text-dark-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Orden */}
              <div>
                <h4 className="text-lg font-bold text-dark-900 dark:text-light-500 mb-3">
                  Información de la Orden
                </h4>
                <div className="bg-dark-50 dark:bg-dark-700 p-4 rounded-lg space-y-2">
                  <div><strong>Número:</strong> {selectedOrden.numeroOrden}</div>
                  <div><strong>Vendedor:</strong> {selectedOrden.vendedor.nombre}</div>
                  <div><strong>Email:</strong> {selectedOrden.vendedor.email}</div>
                  <div><strong>Estado:</strong> {getEstadoColor(selectedOrden.estado).label}</div>
                  <div><strong>Fecha Creación:</strong> {new Date(selectedOrden.fechaCreacion).toLocaleString('es-ES')}</div>
                  {selectedOrden.fechaCierre && (
                    <div><strong>Fecha Cierre:</strong> {new Date(selectedOrden.fechaCierre).toLocaleString('es-ES')}</div>
                  )}
                  {selectedOrden.fechaCompletada && (
                    <div><strong>Fecha Completada:</strong> {new Date(selectedOrden.fechaCompletada).toLocaleString('es-ES')}</div>
                  )}
                  {selectedOrden.metodoPago && (
                    <div><strong>Método Pago:</strong> {selectedOrden.metodoPago}</div>
                  )}
                  {selectedOrden.cajero && (
                    <div><strong>Cajero:</strong> {selectedOrden.cajero.nombre}</div>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="text-lg font-bold text-dark-900 dark:text-light-500 mb-3">
                  Productos
                </h4>
                <div className="space-y-2">
                  {selectedOrden.productos.map((prod, idx) => (
                    <div key={idx} className="bg-dark-50 dark:bg-dark-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{prod.nombre}</div>
                          <div className="text-sm text-dark-600 dark:text-dark-400">
                            {prod.cantidad} × ${prod.precio.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-bold">${prod.subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-dark-300 dark:border-dark-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedOrden.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-50 dark:bg-dark-700 px-6 py-4 flex justify-end border-t border-dark-200 dark:border-dark-600">
              <button
                onClick={() => setSelectedOrden(null)}
                className="bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
