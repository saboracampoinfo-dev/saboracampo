'use client';

import { useEffect, useState } from 'react';
import { showErrorToast } from '@/utils/toastHelpers';

interface Venta {
  _id: string;
  fecha: string;
  cliente: string;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  total: number;
  sucursal: string;
  vendedor: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

interface Estadisticas {
  totalVentas: number;
  ventasHoy: number;
  ventasMes: number;
  productoMasVendido: string;
  sucursalTop: string;
}

export default function VentasManager() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [estadisticas] = useState<Estadisticas>({
    totalVentas: 0,
    ventasHoy: 0,
    ventasMes: 0,
    productoMasVendido: 'N/A',
    sucursalTop: 'N/A'
  });

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      // Simulación de datos - en producción, esto vendría de /api/ventas
      const ventasSimuladas: Venta[] = [
        {
          _id: '1',
          fecha: new Date().toISOString(),
          cliente: 'Juan Pérez',
          productos: [
            { nombre: 'Leche Entera 1L', cantidad: 2, precio: 1.50 },
            { nombre: 'Pan Integral', cantidad: 1, precio: 2.00 }
          ],
          total: 5.00,
          sucursal: 'Sucursal Centro',
          vendedor: 'María López',
          estado: 'completada'
        },
        {
          _id: '2',
          fecha: new Date(Date.now() - 86400000).toISOString(),
          cliente: 'Ana García',
          productos: [
            { nombre: 'Queso Fresco 500g', cantidad: 1, precio: 4.50 },
            { nombre: 'Yogurt Natural', cantidad: 3, precio: 1.20 }
          ],
          total: 8.10,
          sucursal: 'Sucursal Norte',
          vendedor: 'Carlos Ruiz',
          estado: 'completada'
        },
        {
          _id: '3',
          fecha: new Date(Date.now() - 172800000).toISOString(),
          cliente: 'Pedro Martínez',
          productos: [
            { nombre: 'Carne de Res 1kg', cantidad: 2, precio: 8.00 }
          ],
          total: 16.00,
          sucursal: 'Sucursal Sur',
          vendedor: 'Laura Díaz',
          estado: 'pendiente'
        }
      ];

      setVentas(ventasSimuladas);
    } catch (error) {
      showErrorToast('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas = ventas.filter(venta => {
    if (filtro === 'todas') return true;
    if (filtro === 'hoy') {
      const hoy = new Date().toDateString();
      return new Date(venta.fecha).toDateString() === hoy;
    }
    if (filtro === 'semana') {
      const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(venta.fecha) >= hace7dias;
    }
    return venta.estado === filtro;
  });

  const totalGeneral = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando ventas...</div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-light-500">Reportes de Ventas</h2>
        <div className="flex items-center space-x-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-2 md:px-4 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-xs md:text-base"
          >
            <option value="todas">Todas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="completada">Completadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-primary-50 dark:bg-primary-900 p-3 md:p-6 rounded-lg border-l-4 border-primary">
          <h3 className="text-xs md:text-sm font-medium text-primary-700 dark:text-primary-300">Total Ventas</h3>
          <p className="text-xl md:text-3xl font-bold text-primary-900 dark:text-primary-200 mt-1 md:mt-2">
            ${totalGeneral.toFixed(2)}
          </p>
        </div>
        <div className="bg-success-50 dark:bg-success-900 p-3 md:p-6 rounded-lg border-l-4 border-success">
          <h3 className="text-xs md:text-sm font-medium text-success-700 dark:text-success-300">Ventas Hoy</h3>
          <p className="text-xl md:text-3xl font-bold text-success-900 dark:text-success-200 mt-1 md:mt-2">
            {ventasFiltradas.filter(v => new Date(v.fecha).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-secondary-50 dark:bg-secondary-900 p-3 md:p-6 rounded-lg border-l-4 border-secondary">
          <h3 className="text-xs md:text-sm font-medium text-secondary-700 dark:text-secondary-300">Ventas del Mes</h3>
          <p className="text-xl md:text-3xl font-bold text-secondary-900 dark:text-secondary-200 mt-1 md:mt-2">
            {ventas.length}
          </p>
        </div>
        <div className="bg-warning-50 dark:bg-warning-900 p-3 md:p-6 rounded-lg border-l-4 border-warning">
          <h3 className="text-xs md:text-sm font-medium text-warning-700 dark:text-warning-300">Pendientes</h3>
          <p className="text-xl md:text-3xl font-bold text-warning-900 dark:text-warning-200 mt-1 md:mt-2">
            {ventas.filter(v => v.estado === 'pendiente').length}
          </p>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto -mx-1 md:mx-0">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Sucursal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {ventasFiltradas.map((venta) => (
                <tr key={venta._id} className="hover:bg-dark-50 dark:hover:bg-dark-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {new Date(venta.fecha).toLocaleDateString()} <br />
                    <span className="text-xs text-dark-500">{new Date(venta.fecha).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-light-500">
                    {venta.cliente}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                    <ul className="list-disc list-inside">
                      {venta.productos.map((prod, idx) => (
                        <li key={idx} className="text-xs">
                          {prod.nombre} x{prod.cantidad}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {venta.sucursal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {venta.vendedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary-700 dark:text-secondary-400">
                    ${venta.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      venta.estado === 'completada' 
                        ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' 
                        : venta.estado === 'pendiente'
                        ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                        : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                    }`}>
                      {venta.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ventasFiltradas.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay ventas registradas con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Gráficos y estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-3 md:p-6 border border-dark-200 dark:border-dark-700">
          <h3 className="text-base md:text-lg font-bold text-dark-900 dark:text-light-500 mb-2 md:mb-4">Top 5 Productos</h3>
          <div className="space-y-2 md:space-y-3">
            {['Leche Entera 1L', 'Queso Fresco 500g', 'Pan Integral', 'Yogurt Natural', 'Carne de Res 1kg'].map((prod, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-dark-700 dark:text-dark-300">{prod}</span>
                <span className="text-sm font-semibold text-primary">{Math.floor(Math.random() * 50) + 10} ventas</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-3 md:p-6 border border-dark-200 dark:border-dark-700">
          <h3 className="text-base md:text-lg font-bold text-dark-900 dark:text-light-500 mb-2 md:mb-4">Ventas por Sucursal</h3>
          <div className="space-y-2 md:space-y-3">
            {['Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur'].map((suc, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-dark-700 dark:text-dark-300">{suc}</span>
                <span className="text-sm font-semibold text-secondary">${(Math.random() * 1000 + 500).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
