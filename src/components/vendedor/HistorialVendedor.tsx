'use client';

import { useEffect, useState } from 'react';
import { showErrorToast } from '@/utils/toastHelpers';

interface Actividad {
  _id: string;
  tipo: 'venta' | 'orden' | 'producto' | 'cliente';
  descripcion: string;
  fecha: string;
  monto?: number;
  detalles?: any;
}

export default function HistorialVendedor() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'venta' | 'orden' | 'producto' | 'cliente'>('todas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      // Simulamos datos de actividades
      const actividadesSimuladas: Actividad[] = [
        {
          _id: '1',
          tipo: 'venta',
          descripcion: 'Venta completada - Juan Pérez',
          fecha: new Date().toISOString(),
          monto: 380,
          detalles: {
            productos: 2,
            metodoPago: 'Efectivo'
          }
        },
        {
          _id: '2',
          tipo: 'orden',
          descripcion: 'Nueva orden creada - María García',
          fecha: new Date(Date.now() - 3600000).toISOString(),
          monto: 280,
          detalles: {
            productos: 1,
            estado: 'pendiente'
          }
        },
        {
          _id: '3',
          tipo: 'producto',
          descripcion: 'Producto consultado - Leche Entera 1L',
          fecha: new Date(Date.now() - 7200000).toISOString()
        },
        {
          _id: '4',
          tipo: 'cliente',
          descripcion: 'Nuevo cliente registrado - Carlos López',
          fecha: new Date(Date.now() - 10800000).toISOString()
        },
        {
          _id: '5',
          tipo: 'venta',
          descripcion: 'Venta completada - Ana Martínez',
          fecha: new Date(Date.now() - 86400000).toISOString(),
          monto: 560,
          detalles: {
            productos: 3,
            metodoPago: 'Tarjeta'
          }
        },
        {
          _id: '6',
          tipo: 'orden',
          descripcion: 'Orden cancelada - Pedro Sánchez',
          fecha: new Date(Date.now() - 172800000).toISOString(),
          monto: 150,
          detalles: {
            productos: 1,
            estado: 'cancelada'
          }
        },
        {
          _id: '7',
          tipo: 'venta',
          descripcion: 'Venta completada - Laura González',
          fecha: new Date(Date.now() - 259200000).toISOString(),
          monto: 420,
          detalles: {
            productos: 4,
            metodoPago: 'Transferencia'
          }
        }
      ];
      
      setActividades(actividadesSimuladas);
    } catch (error) {
      showErrorToast('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'venta':
        return '💰';
      case 'orden':
        return '📋';
      case 'producto':
        return '📦';
      case 'cliente':
        return '👤';
      default:
        return '📌';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venta':
        return { bg: 'bg-success-dark/10', text: 'text-success-light' };
      case 'orden':
        return { bg: 'bg-primary-100', text: 'text-primary' };
      case 'producto':
        return { bg: 'bg-warning/10', text: 'text-warning' };
      case 'cliente':
        return { bg: 'bg-secondary/10', text: 'text-secondary' };
      default:
        return { bg: 'bg-dark-100', text: 'text-dark-600' };
    }
  };

  // Filtrar actividades
  const actividadesFiltradas = actividades.filter(act => {
    const matchesTipo = filtroTipo === 'todas' || act.tipo === filtroTipo;
    
    let matchesFecha = true;
    if (fechaInicio && fechaFin) {
      const actFecha = new Date(act.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      matchesFecha = actFecha >= inicio && actFecha <= fin;
    }
    
    return matchesTipo && matchesFecha;
  });

  // Calcular estadísticas
  const totalVentas = actividades
    .filter(a => a.tipo === 'venta')
    .reduce((sum, a) => sum + (a.monto || 0), 0);
  
  const cantidadVentas = actividades.filter(a => a.tipo === 'venta').length;
  const cantidadOrdenes = actividades.filter(a => a.tipo === 'orden').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-primary font-semibold animate-pulse">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">Historial de Actividades</h2>
        <p className="text-dark-600 dark:text-dark-400 mt-1">
          Registro de todas tus actividades y transacciones
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-success-dark/10 rounded-lg p-6 border-l-4 border-success-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-success-light mb-1">Total Ventas</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-light-500">
                ${totalVentas.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary mb-1">Ventas Realizadas</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-light-500">
                {cantidadVentas}
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>

        <div className="bg-warning/10 rounded-lg p-6 border-l-4 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-warning mb-1">Órdenes Gestionadas</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-light-500">
                {cantidadOrdenes}
              </p>
            </div>
            <span className="text-4xl">📋</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Tipo de Actividad
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500"
            >
              <option value="todas">Todas</option>
              <option value="venta">Ventas</option>
              <option value="orden">Órdenes</option>
              <option value="producto">Productos</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500"
            />
          </div>
        </div>

        {(fechaInicio || fechaFin) && (
          <button
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
            }}
            className="mt-3 text-sm text-primary hover:text-primary-700 font-semibold"
          >
            Limpiar filtros de fecha
          </button>
        )}

        <div className="mt-4 text-sm text-dark-600 dark:text-dark-400">
          Mostrando {actividadesFiltradas.length} de {actividades.length} actividades
        </div>
      </div>

      {/* Lista de Actividades */}
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md border border-dark-200 dark:border-dark-600">
        <div className="p-4 border-b border-dark-200 dark:border-dark-600">
          <h3 className="text-lg font-bold text-dark-900 dark:text-light-500">
            Registro de Actividades
          </h3>
        </div>

        <div className="divide-y divide-dark-200 dark:divide-dark-600">
          {actividadesFiltradas.length === 0 ? (
            <div className="p-8 text-center text-dark-500 dark:text-dark-400">
              No hay actividades para mostrar
            </div>
          ) : (
            actividadesFiltradas.map((actividad) => {
              const tipoColor = getTipoColor(actividad.tipo);
              return (
                <div
                  key={actividad._id}
                  className="p-4 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${tipoColor.bg} rounded-full p-3 text-2xl shrink-0`}>
                      {getTipoIcon(actividad.tipo)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 ${tipoColor.bg} ${tipoColor.text} rounded-full text-xs font-medium uppercase`}>
                          {actividad.tipo}
                        </span>
                        <span className="text-sm text-dark-500 dark:text-dark-400">
                          {new Date(actividad.fecha).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <p className="text-dark-900 dark:text-light-500 font-medium">
                        {actividad.descripcion}
                      </p>

                      {actividad.monto && (
                        <p className="text-lg font-bold text-primary mt-1">
                          ${actividad.monto.toFixed(2)}
                        </p>
                      )}

                      {actividad.detalles && (
                        <div className="mt-2 text-sm text-dark-600 dark:text-dark-400">
                          {actividad.detalles.productos && (
                            <span className="mr-3">
                              📦 {actividad.detalles.productos} producto(s)
                            </span>
                          )}
                          {actividad.detalles.metodoPago && (
                            <span className="mr-3">
                              💳 {actividad.detalles.metodoPago}
                            </span>
                          )}
                          {actividad.detalles.estado && (
                            <span>
                              📊 {actividad.detalles.estado}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
