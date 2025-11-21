'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

interface Orden {
  _id: string;
  cliente: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  productos: {
    productoId: string;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
  total: number;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  metodoPago: string;
  fechaCreacion: string;
  vendedor?: {
    id: string;
    nombre: string;
  };
  notas?: string;
}

export default function OrdenesVendedor() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'>('todas');

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      // Por ahora, simulamos datos de órdenes
      // En producción, esto vendría de una API real
      const ordenesSimuladas: Orden[] = [
        {
          _id: '1',
          cliente: {
            nombre: 'Juan Pérez',
            email: 'juan@email.com',
            telefono: '555-1234'
          },
          productos: [
            {
              productoId: 'prod1',
              nombre: 'Leche Entera 1L',
              cantidad: 2,
              precio: 150,
              subtotal: 300
            },
            {
              productoId: 'prod2',
              nombre: 'Pan Integral',
              cantidad: 1,
              precio: 80,
              subtotal: 80
            }
          ],
          total: 380,
          estado: 'pendiente',
          metodoPago: 'Efectivo',
          fechaCreacion: new Date().toISOString(),
          notas: 'Entregar antes de las 18:00'
        },
        {
          _id: '2',
          cliente: {
            nombre: 'María García',
            email: 'maria@email.com',
            telefono: '555-5678'
          },
          productos: [
            {
              productoId: 'prod3',
              nombre: 'Queso Fresco 500g',
              cantidad: 1,
              precio: 280,
              subtotal: 280
            }
          ],
          total: 280,
          estado: 'en_proceso',
          metodoPago: 'Tarjeta',
          fechaCreacion: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '3',
          cliente: {
            nombre: 'Carlos López',
            email: 'carlos@email.com'
          },
          productos: [
            {
              productoId: 'prod4',
              nombre: 'Manzanas 1kg',
              cantidad: 3,
              precio: 120,
              subtotal: 360
            },
            {
              productoId: 'prod5',
              nombre: 'Naranjas 1kg',
              cantidad: 2,
              precio: 100,
              subtotal: 200
            }
          ],
          total: 560,
          estado: 'completada',
          metodoPago: 'Transferencia',
          fechaCreacion: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setOrdenes(ordenesSimuladas);
    } catch (error) {
      showErrorToast('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (ordenId: string, nuevoEstado: string) => {
    try {
      // Aquí iría la llamada a la API para actualizar el estado
      // Por ahora solo actualizamos localmente
      setOrdenes(ordenes.map(orden => 
        orden._id === ordenId 
          ? { ...orden, estado: nuevoEstado as any }
          : orden
      ));
      showSuccessToast('Estado actualizado correctamente');
    } catch (error) {
      showErrorToast('Error al actualizar estado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { bg: 'bg-warning/10', text: 'text-warning', label: 'Pendiente' };
      case 'en_proceso':
        return { bg: 'bg-primary-100', text: 'text-primary', label: 'En Proceso' };
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

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('todas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === 'todas'
                ? 'bg-primary text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            Todas ({ordenes.length})
          </button>
          <button
            onClick={() => setFiltroEstado('pendiente')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === 'pendiente'
                ? 'bg-warning text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            Pendientes ({ordenes.filter(o => o.estado === 'pendiente').length})
          </button>
          <button
            onClick={() => setFiltroEstado('en_proceso')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === 'en_proceso'
                ? 'bg-primary text-white'
                : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
            }`}
          >
            En Proceso ({ordenes.filter(o => o.estado === 'en_proceso').length})
          </button>
          <button
            onClick={() => setFiltroEstado('completada')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
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
                className="bg-white dark:bg-dark-700 rounded-lg p-6 shadow-md border border-dark-200 dark:border-dark-600 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-dark-900 dark:text-light-500">
                        {orden.cliente.nombre}
                      </h3>
                      <span className={`px-3 py-1 ${estadoInfo.bg} ${estadoInfo.text} rounded-full text-xs font-medium`}>
                        {estadoInfo.label}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-dark-600 dark:text-dark-400">
                      <div>📧 {orden.cliente.email}</div>
                      {orden.cliente.telefono && <div>📱 {orden.cliente.telefono}</div>}
                      <div>📅 {new Date(orden.fechaCreacion).toLocaleString('es-ES')}</div>
                      <div>💳 {orden.metodoPago}</div>
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

                    {orden.estado !== 'completada' && orden.estado !== 'cancelada' && (
                      <div className="flex flex-col gap-2">
                        {orden.estado === 'pendiente' && (
                          <button
                            onClick={() => handleEstadoChange(orden._id, 'en_proceso')}
                            className="bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                          >
                            Iniciar Proceso
                          </button>
                        )}
                        {orden.estado === 'en_proceso' && (
                          <button
                            onClick={() => handleEstadoChange(orden._id, 'completada')}
                            className="bg-success-light hover:bg-success-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                          >
                            Completar
                          </button>
                        )}
                        <button
                          onClick={() => handleEstadoChange(orden._id, 'cancelada')}
                          className="bg-error-light hover:bg-error-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedOrden(orden)}
                      className="w-full bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
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
              {/* Cliente */}
              <div>
                <h4 className="text-lg font-bold text-dark-900 dark:text-light-500 mb-3">
                  Información del Cliente
                </h4>
                <div className="bg-dark-50 dark:bg-dark-700 p-4 rounded-lg space-y-2">
                  <div><strong>Nombre:</strong> {selectedOrden.cliente.nombre}</div>
                  <div><strong>Email:</strong> {selectedOrden.cliente.email}</div>
                  {selectedOrden.cliente.telefono && (
                    <div><strong>Teléfono:</strong> {selectedOrden.cliente.telefono}</div>
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
