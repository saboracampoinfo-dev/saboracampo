'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastHelpers';

interface ProductoOrden {
  productoId: string;
  nombre: string;
  codigoBarras?: string;
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
  sucursal?: {
    id: string;
    nombre: string;
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

export default function OrdenesCajero() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendiente_cobro' | 'completada' | 'cancelada'>('pendiente_cobro');
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [ordenACompletar, setOrdenACompletar] = useState<Orden | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>('efectivo');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para selector de sucursal
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  
  // Estados para cambiar sucursal de orden
  const [showCambiarSucursalModal, setShowCambiarSucursalModal] = useState(false);
  const [ordenACambiarSucursal, setOrdenACambiarSucursal] = useState<Orden | null>(null);
  const [nuevaSucursalId, setNuevaSucursalId] = useState<string>('');

  useEffect(() => {
    fetchSucursales();
    fetchOrdenes();
    // Cargar sucursal guardada en localStorage
    const sucursalGuardada = localStorage.getItem('sucursalActivaCajero');
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
    localStorage.setItem('sucursalActivaCajero', sucursalId);
    localStorage.setItem('sucursalActivaCajeroNombre', sucursal?.nombre || '');
    
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

  const fetchOrdenes = async () => {
    try {
      const response = await fetch('/api/ordenes');
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo órdenes relevantes para cajero (pendiente_cobro, completada, cancelada)
        const ordenesCajero = data.ordenes.filter((orden: Orden) => 
          orden.estado === 'pendiente_cobro' || 
          orden.estado === 'completada' || 
          orden.estado === 'cancelada'
        );
        setOrdenes(ordenesCajero);
      } else {
        showErrorToast('Error al cargar órdenes');
      }
    } catch (error) {
      showErrorToast('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarOrden = async () => {
    if (!ordenACompletar) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completar_orden',
          ordenId: ordenACompletar._id,
          metodoPago
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('Orden completada exitosamente');
        setShowCompletarModal(false);
        setOrdenACompletar(null);
        setMetodoPago('efectivo');
        fetchOrdenes();
      } else {
        showErrorToast(data.error || 'Error al completar orden');
      }
    } catch (error) {
      showErrorToast('Error al completar orden');
    }
  };

  const handleCambiarSucursal = async () => {
    if (!ordenACambiarSucursal || !nuevaSucursalId) return;

    const sucursal = sucursales.find(s => s._id === nuevaSucursalId);
    if (!sucursal) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar_sucursal',
          ordenId: ordenACambiarSucursal._id,
          sucursalId: nuevaSucursalId,
          sucursalNombre: sucursal.nombre
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`Sucursal cambiada a: ${sucursal.nombre}`);
        setShowCambiarSucursalModal(false);
        setOrdenACambiarSucursal(null);
        setNuevaSucursalId('');
        fetchOrdenes();
      } else {
        showErrorToast(data.error || 'Error al cambiar sucursal');
      }
    } catch (error) {
      showErrorToast('Error al cambiar sucursal');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
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

  // Filtrar órdenes
  let ordenesFiltradas = filtroEstado === 'todas' 
    ? ordenes 
    : ordenes.filter(orden => orden.estado === filtroEstado);

  // Filtrar por sucursal si hay una seleccionada
  if (sucursalSeleccionada) {
    ordenesFiltradas = ordenesFiltradas.filter(orden => 
      orden.sucursal?.id === sucursalSeleccionada
    );
  }

  // Búsqueda
  if (searchTerm) {
    ordenesFiltradas = ordenesFiltradas.filter(orden => 
      orden.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.vendedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.vendedor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-secondary font-semibold animate-pulse">Cargando órdenes...</div>
      </div>
    );
  }

  const crearNuevaOrden = () => {
    if (!sucursalSeleccionada) {
      showInfoToast('Por favor, selecciona una sucursal antes de crear una orden');
      return;
    }
    
    // Sincronizar con el localStorage que usa el componente CrearOrden del vendedor
    const sucursalNombre = localStorage.getItem('sucursalActivaCajeroNombre');
    localStorage.setItem('sucursalActiva', sucursalSeleccionada);
    localStorage.setItem('sucursalActivaNombre', sucursalNombre || '');
    
    window.location.href = '/dashboardCajero?tab=crear_orden';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-secondary">Órdenes de Cobro</h2>
        <p className="text-dark-600 dark:text-dark-400 mt-1">
          Gestiona el cobro de las órdenes de venta
        </p>
      </div>

      {/* Selector de Sucursal y Botón Nueva Orden */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between md:h-24 h-36">
          {/* Selector de Sucursal */}
          <div className="flex-1 w-full md:w-auto align-top self-start">
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              📍 Sucursal Activa
            </label>
            {loadingSucursales ? (
              <div className="animate-pulse bg-dark-200 dark:bg-dark-600 h-10 rounded-lg"></div>
            ) : (
              <select
                value={sucursalSeleccionada}
                onChange={(e) => handleSucursalChange(e.target.value)}
                className="w-full px-4 py-2 border border-dark-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal._id} value={sucursal._id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            )}
            {sucursalSeleccionada && (
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-2">
                ℹ️ Mostrando solo órdenes de esta sucursal
              </p>
            )}
          </div>

          {/* Botón Nueva Orden */}
          <div className="w-full md:w-auto flex items-center">
            <label className="block text-sm font-semibold text-transparent mb-2 md:invisible">
              .
            </label>
            <button
              onClick={crearNuevaOrden}
              disabled={!sucursalSeleccionada}
              className={`w-full md:w-auto px-6 py-2 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                sucursalSeleccionada
                  ? 'bg-success-light hover:bg-success-dark text-white shadow-md hover:shadow-xl cursor-pointer'
                  : 'bg-dark-300 dark:bg-dark-600 text-dark-500 dark:text-dark-400 cursor-not-allowed'
              }`}
            >
              ➕ Nueva Orden
            </button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <input
          type="text"
          placeholder="🔍 Buscar por número de orden, vendedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('pendiente_cobro')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'pendiente_cobro'
                ? 'bg-warning text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            ⏳ Pendiente Cobro ({
              sucursalSeleccionada 
                ? ordenes.filter(o => o.estado === 'pendiente_cobro' && o.sucursal?.id === sucursalSeleccionada).length
                : ordenes.filter(o => o.estado === 'pendiente_cobro').length
            })
          </button>
          <button
            onClick={() => setFiltroEstado('completada')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'completada'
                ? 'bg-success-light text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            ✅ Completadas ({
              sucursalSeleccionada 
                ? ordenes.filter(o => o.estado === 'completada' && o.sucursal?.id === sucursalSeleccionada).length
                : ordenes.filter(o => o.estado === 'completada').length
            })
          </button>
          <button
            onClick={() => setFiltroEstado('cancelada')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'cancelada'
                ? 'bg-error-light text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            ❌ Canceladas ({
              sucursalSeleccionada 
                ? ordenes.filter(o => o.estado === 'cancelada' && o.sucursal?.id === sucursalSeleccionada).length
                : ordenes.filter(o => o.estado === 'cancelada').length
            })
          </button>
          <button
            onClick={() => setFiltroEstado('todas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              filtroEstado === 'todas'
                ? 'bg-secondary text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            📋 Todas ({
              sucursalSeleccionada 
                ? ordenes.filter(o => o.sucursal?.id === sucursalSeleccionada).length
                : ordenes.length
            })
          </button>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="space-y-4">
        {ordenesFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-dark-700 rounded-lg p-8 text-center border border-dark-200 dark:border-dark-600">
            <p className="text-dark-500 dark:text-dark-400">
              {searchTerm ? 'No se encontraron órdenes con ese criterio' : 'No hay órdenes para mostrar'}
            </p>
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
                      {orden.sucursal && (
                        <div>📍 Sucursal: {orden.sucursal.nombre}</div>
                      )}
                      <div>👤 Vendedor: {orden.vendedor.nombre}</div>
                      <div>📅 Creada: {new Date(orden.fechaCreacion).toLocaleString('es-ES')}</div>
                      {orden.fechaCierre && (
                        <div>🔔 Enviada a caja: {new Date(orden.fechaCierre).toLocaleString('es-ES')}</div>
                      )}
                      {orden.fechaCompletada && (
                        <div>✅ Completada: {new Date(orden.fechaCompletada).toLocaleString('es-ES')}</div>
                      )}
                      {orden.metodoPago && <div>💳 Método: {orden.metodoPago}</div>}
                      {orden.cajero && <div>💰 Cajero: {orden.cajero.nombre}</div>}
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-1">
                        Productos ({orden.productos.length}):
                      </div>
                      <div className="space-y-1">
                        {orden.productos.slice(0, 3).map((prod, idx) => (
                          <div key={idx} className="text-sm text-dark-600 dark:text-dark-400">
                            • {prod.nombre} - {prod.cantidad} × ${prod.precio.toFixed(2)} = ${prod.subtotal.toFixed(2)}
                          </div>
                        ))}
                        {orden.productos.length > 3 && (
                          <div className="text-sm text-dark-500 dark:text-dark-500 italic">
                            ... y {orden.productos.length - 3} producto(s) más
                          </div>
                        )}
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
                    <div className="text-2xl font-bold text-secondary">
                      ${orden.total.toFixed(2)}
                    </div>

                    {orden.estado === 'pendiente_cobro' && (
                      <>
                        <button
                          onClick={() => {
                            // Redirigir a editar orden
                            const sucursalNombre = orden.sucursal?.nombre || '';
                            localStorage.setItem('sucursalActiva', orden.sucursal?.id || '');
                            localStorage.setItem('sucursalActivaNombre', sucursalNombre);
                            window.location.href = `/dashboardCajero?tab=crear_orden&edit=${orden._id}`;
                          }}
                          className="cursor-pointer w-full bg-warning hover:bg-warning/80 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg"
                        >
                          ✏️ Editar Orden
                        </button>
                        <button
                          onClick={() => {
                            setOrdenACompletar(orden);
                            setShowCompletarModal(true);
                          }}
                          className="cursor-pointer w-full bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg"
                        >
                          💰 Cobrar Orden
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setSelectedOrden(orden)}
                      className="cursor-pointer w-full bg-secondary hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                    >
                      👁️ Ver Detalle
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
            <div className="sticky top-0 bg-secondary text-white px-6 py-4 flex justify-between items-center">
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
                  {selectedOrden.sucursal && (
                    <div><strong>Sucursal:</strong> {selectedOrden.sucursal.nombre}</div>
                  )}
                  <div><strong>Vendedor:</strong> {selectedOrden.vendedor.nombre}</div>
                  <div><strong>Email:</strong> {selectedOrden.vendedor.email}</div>
                  <div><strong>Estado:</strong> {getEstadoColor(selectedOrden.estado).label}</div>
                  <div><strong>Fecha Creación:</strong> {new Date(selectedOrden.fechaCreacion).toLocaleString('es-ES')}</div>
                  {selectedOrden.fechaCierre && (
                    <div><strong>Fecha Envío a Caja:</strong> {new Date(selectedOrden.fechaCierre).toLocaleString('es-ES')}</div>
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
                  {selectedOrden.notas && (
                    <div className="pt-2 border-t border-dark-300 dark:border-dark-600">
                      <strong>Notas:</strong>
                      <div className="mt-1 text-dark-700 dark:text-dark-300">{selectedOrden.notas}</div>
                    </div>
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
                          {prod.codigoBarras && (
                            <div className="text-xs text-dark-500 dark:text-dark-400">
                              Código: {prod.codigoBarras}
                            </div>
                          )}
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
                  <span className="text-2xl font-bold text-secondary">
                    ${selectedOrden.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-50 dark:bg-dark-700 px-6 py-4 flex justify-end gap-3 border-t border-dark-200 dark:border-dark-600">
              {(selectedOrden.estado === 'pendiente_cobro' || selectedOrden.estado === 'en_proceso') && (
                <button
                  onClick={() => {
                    setOrdenACambiarSucursal(selectedOrden);
                    setNuevaSucursalId(selectedOrden.sucursal?.id || '');
                    setSelectedOrden(null);
                    setShowCambiarSucursalModal(true);
                  }}
                  className="cursor-pointer bg-warning hover:bg-warning/80 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  🔄 Cambiar Sucursal
                </button>
              )}
              {selectedOrden.estado === 'pendiente_cobro' && (
                <>
                  <button
                    onClick={() => {
                      const sucursalNombre = selectedOrden.sucursal?.nombre || '';
                      localStorage.setItem('sucursalActiva', selectedOrden.sucursal?.id || '');
                      localStorage.setItem('sucursalActivaNombre', sucursalNombre);
                      window.location.href = `/dashboardCajero?tab=crear_orden&edit=${selectedOrden._id}`;
                    }}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    ✏️ Editar Orden
                  </button>
                  <button
                    onClick={() => {
                      setOrdenACompletar(selectedOrden);
                      setSelectedOrden(null);
                      setShowCompletarModal(true);
                    }}
                    className="cursor-pointer bg-green-700 hover:bg-green-900 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    💰 Cobrar Orden
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedOrden(null)}
                className="bg-dark-300 cursor-pointer hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Completar Orden */}
      {showCompletarModal && ordenACompletar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-success-light text-white px-6 py-4">
              <h3 className="text-xl font-bold">Completar Cobro</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-dark-700 dark:text-dark-300 mb-2">
                  <strong>Orden:</strong> #{ordenACompletar.numeroOrden}
                </p>
                {ordenACompletar.sucursal && (
                  <p className="text-dark-700 dark:text-dark-300 mb-2">
                    <strong>Sucursal:</strong> {ordenACompletar.sucursal.nombre}
                  </p>
                )}
                <p className="text-dark-700 dark:text-dark-300 mb-2">
                  <strong>Vendedor:</strong> {ordenACompletar.vendedor.nombre}
                </p>
                <p className="text-2xl font-bold text-secondary mb-4">
                  Total: ${ordenACompletar.total.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                  <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="mercadopago">📱 Mercado Pago</option>
                  <option value="otro">🔄 Otro</option>
                </select>
              </div>
            </div>

            <div className="bg-dark-50 dark:bg-dark-700 px-6 py-4 flex justify-end gap-3 border-t border-dark-200 dark:border-dark-600">
              <button
                onClick={() => {
                  setShowCompletarModal(false);
                  setOrdenACompletar(null);
                  setMetodoPago('efectivo');
                }}
                className="cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompletarOrden}
                className="cursor-pointer bg-green-700 hover:bg-green-900 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ✅ Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Sucursal */}
      {showCambiarSucursalModal && ordenACambiarSucursal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-warning text-white px-6 py-4">
              <h3 className="text-xl font-bold">Cambiar Sucursal</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-dark-700 dark:text-dark-300 mb-2">
                  <strong>Orden:</strong> #{ordenACambiarSucursal.numeroOrden}
                </p>
                <p className="text-dark-700 dark:text-dark-300 mb-2">
                  <strong>Sucursal Actual:</strong> {ordenACambiarSucursal.sucursal?.nombre || 'Sin asignar'}
                </p>
                <p className="text-dark-700 dark:text-dark-300 mb-4">
                  <strong>Estado:</strong> {getEstadoColor(ordenACambiarSucursal.estado).label}
                </p>
              </div>

              {ordenACambiarSucursal.estado === 'pendiente_cobro' && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-warning font-semibold mb-1">⚠️ Importante</p>
                  <p className="text-xs text-dark-700 dark:text-dark-300">
                    Esta orden ya está en caja. Al cambiar la sucursal se ajustará el stock automáticamente:
                    se devolverá a la sucursal actual y se descontará de la nueva.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Nueva Sucursal *
                </label>
                <select
                  value={nuevaSucursalId}
                  onChange={(e) => setNuevaSucursalId(e.target.value)}
                  className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning focus:border-transparent"
                >
                  <option value="">Seleccionar sucursal...</option>
                  {sucursales.map((sucursal) => (
                    <option 
                      key={sucursal._id} 
                      value={sucursal._id}
                      disabled={sucursal._id === ordenACambiarSucursal.sucursal?.id}
                    >
                      {sucursal.nombre} {sucursal._id === ordenACambiarSucursal.sucursal?.id ? '(actual)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {nuevaSucursalId && nuevaSucursalId !== ordenACambiarSucursal.sucursal?.id && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
                  <p className="text-sm text-secondary font-semibold">
                    ℹ️ Se verificará disponibilidad de stock en la nueva sucursal
                  </p>
                </div>
              )}
            </div>

            <div className="bg-dark-50 dark:bg-dark-700 px-6 py-4 flex justify-end gap-3 border-t border-dark-200 dark:border-dark-600">
              <button
                onClick={() => {
                  setShowCambiarSucursalModal(false);
                  setOrdenACambiarSucursal(null);
                  setNuevaSucursalId('');
                }}
                className="bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarSucursal}
                disabled={!nuevaSucursalId || nuevaSucursalId === ordenACambiarSucursal.sucursal?.id}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  nuevaSucursalId && nuevaSucursalId !== ordenACambiarSucursal.sucursal?.id
                    ? 'bg-warning hover:bg-warning/80 text-white shadow-md hover:shadow-lg cursor-pointer'
                    : 'bg-dark-300 dark:bg-dark-600 text-dark-500 dark:text-dark-400 cursor-not-allowed'
                }`}
              >
                🔄 Cambiar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
