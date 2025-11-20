'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

interface StockAlert {
  _id: string;
  productoId: string;
  productoNombre: string;
  sucursalId: string;
  sucursalNombre: string;
  stockActual: number;
  stockMinimo: number;
  tipo: 'critico' | 'bajo' | 'agotado';
  estado: 'pendiente' | 'revisado' | 'resuelto';
  mensaje?: string;
  createdAt: string;
}

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pendiente' | 'revisado' | 'resuelto'>('pendiente');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/stock-alerts?estado=${filter}`);
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      showErrorToast('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (alertaId: string, nuevoEstado: 'revisado' | 'resuelto') => {
    try {
      const response = await fetch('/api/stock-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId, estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`Alerta marcada como ${nuevoEstado}`);
        fetchAlerts();
      } else {
        showErrorToast(data.error || 'Error al actualizar alerta');
      }
    } catch (error) {
      showErrorToast('Error al actualizar alerta');
    }
  };

  const handleDeleteAlert = async (alertaId: string) => {
    try {
      const response = await fetch(`/api/stock-alerts?id=${alertaId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('Alerta eliminada');
        fetchAlerts();
      } else {
        showErrorToast(data.error || 'Error al eliminar alerta');
      }
    } catch (error) {
      showErrorToast('Error al eliminar alerta');
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'agotado':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      case 'critico':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'bajo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-dark-100 text-dark-800 dark:bg-dark-700 dark:text-dark-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'agotado':
        return '🚫';
      case 'critico':
        return '⚠️';
      case 'bajo':
        return '📉';
      default:
        return '📊';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando alertas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">
          Alertas de Stock Bajo
        </h2>
        
        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'pendiente'
                ? 'bg-error text-white'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('revisado')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'revisado'
                ? 'bg-warning text-white'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300'
            }`}
          >
            Revisadas
          </button>
          <button
            onClick={() => setFilter('resuelto')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'resuelto'
                ? 'bg-success text-white'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300'
            }`}
          >
            Resueltas
          </button>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-8 text-center border border-dark-200 dark:border-dark-700">
            <p className="text-dark-600 dark:text-dark-400">
              No hay alertas {filter === 'pendiente' ? 'pendientes' : filter === 'revisado' ? 'revisadas' : 'resueltas'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-4 border border-dark-200 dark:border-dark-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTipoIcon(alert.tipo)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-dark-900 dark:text-light-500">
                        {alert.productoNombre}
                      </h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        {alert.sucursalNombre}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(alert.tipo)}`}>
                      {alert.tipo.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-dark-500 dark:text-dark-400">Stock Actual</p>
                      <p className="text-xl font-bold text-error">{alert.stockActual}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 dark:text-dark-400">Stock Mínimo</p>
                      <p className="text-xl font-bold text-dark-700 dark:text-dark-300">{alert.stockMinimo}</p>
                    </div>
                  </div>

                  {alert.mensaje && (
                    <p className="text-sm text-dark-700 dark:text-dark-300 bg-dark-50 dark:bg-dark-900 p-2 rounded mb-3">
                      {alert.mensaje}
                    </p>
                  )}

                  <p className="text-xs text-dark-500 dark:text-dark-400">
                    Creada el {new Date(alert.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 ml-4">
                  {alert.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleUpdateEstado(alert._id, 'revisado')}
                        className="px-3 py-1 bg-warning hover:bg-warning-700 text-white rounded text-sm font-semibold transition-colors"
                      >
                        Revisar
                      </button>
                      <button
                        onClick={() => handleUpdateEstado(alert._id, 'resuelto')}
                        className="px-3 py-1 bg-success hover:bg-success-700 text-white rounded text-sm font-semibold transition-colors"
                      >
                        Resolver
                      </button>
                    </>
                  )}
                  {alert.estado === 'revisado' && (
                    <button
                      onClick={() => handleUpdateEstado(alert._id, 'resuelto')}
                      className="px-3 py-1 bg-success hover:bg-success-700 text-white rounded text-sm font-semibold transition-colors"
                    >
                      Resolver
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="px-3 py-1 bg-error hover:bg-error-dark text-white rounded text-sm font-semibold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
