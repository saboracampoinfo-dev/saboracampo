'use client';

import { useEffect, useState } from 'react';
import { showErrorToast, showSuccessToast } from '@/utils/toastHelpers';
import * as XLSX from 'xlsx';

interface Producto {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface Venta {
  _id: string;
  numeroOrden: string;
  fechaCreacion: string;
  fechaCompletada?: string;
  productos: Producto[];
  total: number;
  sucursal?: {
    id: string;
    nombre: string;
  };
  vendedor: {
    id: string;
    nombre: string;
    email: string;
  };
  cajero?: {
    id: string;
    nombre: string;
  };
  metodoPago?: string;
  estado: 'en_proceso' | 'pendiente_cobro' | 'completada' | 'cancelada';
}

interface Sucursal {
  _id: string;
  nombre: string;
  estado: string;
}

interface Vendedor {
  _id: string;
  name: string;
  email: string;
}

export default function VentasManager() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroSucursal, setFiltroSucursal] = useState('todas');
  const [filtroVendedor, setFiltroVendedor] = useState('todos');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Cargar todas las órdenes (no solo completadas)
      const resOrdenes = await fetch('/api/ordenes');
      const dataOrdenes = await resOrdenes.json();
      
      if (dataOrdenes.success && dataOrdenes.ordenes) {
        setVentas(dataOrdenes.ordenes);
      }

      // Cargar sucursales
      const resSucursales = await fetch('/api/sucursales');
      const dataSucursales = await resSucursales.json();
      
      if (dataSucursales.success && dataSucursales.data && Array.isArray(dataSucursales.data)) {
        setSucursales(dataSucursales.data.filter((s: Sucursal) => s.estado === 'activa'));
      }

      // Cargar vendedores
      const resVendedores = await fetch('/api/users');
      const dataVendedores = await resVendedores.json();
      
      console.log('📋 Respuesta API vendedores:', dataVendedores);
      
      if (dataVendedores.success && dataVendedores.data && Array.isArray(dataVendedores.data)) {
        // Filtrar solo vendedores (role: 'seller')
        const vendedoresFiltrados = dataVendedores.data.filter((u: any) => u.role === 'seller');
        console.log('✅ Vendedores cargados:', vendedoresFiltrados.length, 'vendedores');
        console.log('📋 Detalles:', vendedoresFiltrados.map((v: Vendedor) => ({
          id: v._id,
          name: v.name
        })));
        setVendedores(vendedoresFiltrados);
      } else {
        console.error('❌ No se pudieron cargar vendedores:', {
          success: dataVendedores.success,
          hasData: !!dataVendedores.data,
          isArray: Array.isArray(dataVendedores.data)
        });
      }
    } catch (error) {
      showErrorToast('Error al cargar datos');
      console.error('Error en fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas = ventas.filter(venta => {
    // Filtro por estado
    if (filtroEstado !== 'todas') {
      if (filtroEstado === 'hoy') {
        const hoy = new Date().toDateString();
        const fechaVenta = new Date(venta.fechaCompletada || venta.fechaCreacion).toDateString();
        if (fechaVenta !== hoy) return false;
      } else if (filtroEstado === 'semana') {
        const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const fechaVenta = new Date(venta.fechaCompletada || venta.fechaCreacion);
        if (fechaVenta < hace7dias) return false;
      } else if (filtroEstado === 'mes') {
        const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fechaVenta = new Date(venta.fechaCompletada || venta.fechaCreacion);
        if (fechaVenta < hace30dias) return false;
      } else if (venta.estado !== filtroEstado) {
        return false;
      }
    }

    // Filtro por sucursal
    if (filtroSucursal !== 'todas') {
      const sucursalId = venta.sucursal?.id?.toString();
      if (sucursalId !== filtroSucursal) {
        return false;
      }
    }

    // Filtro por vendedor
    if (filtroVendedor !== 'todos') {
      const vendedorId = String(venta.vendedor.id);
      
      console.log('🔍 Comparando vendedor:', {
        vendedorId,
        filtroVendedor,
        sonIguales: vendedorId === filtroVendedor,
        vendedorNombre: venta.vendedor.nombre
      });
      
      if (vendedorId !== filtroVendedor) {
        return false;
      }
    }

    return true;
  });

  const totalGeneral = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);

  const exportarExcel = () => {
    try {
      // Hoja 1: Listado de ventas
      const ventasData = ventasFiltradas.map(venta => {
        const fecha = new Date(venta.fechaCompletada || venta.fechaCreacion);
        return {
          'N° Orden': venta.numeroOrden,
          'Fecha': fecha.toLocaleDateString('es-AR'),
          'Hora': fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          'Estado': venta.estado === 'pendiente_cobro' ? 'Pendiente Cobro' : venta.estado,
          'Sucursal': venta.sucursal?.nombre || 'N/A',
          'Vendedor': venta.vendedor.nombre,
          'Cajero': venta.cajero?.nombre || '-',
          'Método Pago': venta.metodoPago || '-',
          'Cantidad Productos': venta.productos.length,
          'Total': `$${venta.total.toFixed(2)}`
        };
      });

      // Hoja 2: Detalle de productos vendidos
      const productosDetalle: any[] = [];
      ventasFiltradas.forEach(venta => {
        venta.productos.forEach(prod => {
          productosDetalle.push({
            'N° Orden': venta.numeroOrden,
            'Producto': prod.nombre,
            'Cantidad': prod.cantidad,
            'Precio Unitario': `$${prod.precio.toFixed(2)}`,
            'Subtotal': `$${prod.subtotal.toFixed(2)}`,
            'Vendedor': venta.vendedor.nombre,
            'Sucursal': venta.sucursal?.nombre || 'N/A'
          });
        });
      });

      // Hoja 3: Estadísticas generales
      const estadisticas = [
        { 'Concepto': 'Total Ventas', 'Valor': `$${totalGeneral.toFixed(2)}` },
        { 'Concepto': 'Total Órdenes', 'Valor': ventasFiltradas.length },
        { 'Concepto': 'Órdenes Completadas', 'Valor': ventasFiltradas.filter(v => v.estado === 'completada').length },
        { 'Concepto': 'Órdenes Pendientes de Cobro', 'Valor': ventasFiltradas.filter(v => v.estado === 'pendiente_cobro').length },
        { 'Concepto': 'Órdenes En Proceso', 'Valor': ventasFiltradas.filter(v => v.estado === 'en_proceso').length },
        { 'Concepto': 'Órdenes Canceladas', 'Valor': ventasFiltradas.filter(v => v.estado === 'cancelada').length },
        { 'Concepto': 'Promedio por Orden', 'Valor': ventasFiltradas.length > 0 ? `$${(totalGeneral / ventasFiltradas.length).toFixed(2)}` : '$0.00' }
      ];

      // Calcular top productos
      const productosCount: { [key: string]: { nombre: string; cantidad: number; total: number } } = {};
      ventasFiltradas.forEach(venta => {
        venta.productos.forEach(prod => {
          if (!productosCount[prod.nombre]) {
            productosCount[prod.nombre] = { nombre: prod.nombre, cantidad: 0, total: 0 };
          }
          productosCount[prod.nombre].cantidad += prod.cantidad;
          productosCount[prod.nombre].total += prod.subtotal;
        });
      });
      
      const topProductos = Object.values(productosCount)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((prod, idx) => ({
          'Posición': idx + 1,
          'Producto': prod.nombre,
          'Unidades Vendidas': prod.cantidad,
          'Total Vendido': `$${prod.total.toFixed(2)}`
        }));

      // Calcular ventas por sucursal
      const ventasPorSucursal: { [key: string]: { nombre: string; total: number; ordenes: number } } = {};
      ventasFiltradas.forEach(venta => {
        const sucursalNombre = venta.sucursal?.nombre || 'Sin sucursal';
        if (!ventasPorSucursal[sucursalNombre]) {
          ventasPorSucursal[sucursalNombre] = { nombre: sucursalNombre, total: 0, ordenes: 0 };
        }
        ventasPorSucursal[sucursalNombre].total += venta.total;
        ventasPorSucursal[sucursalNombre].ordenes += 1;
      });
      
      const ventasPorSucursalArray = Object.values(ventasPorSucursal)
        .sort((a, b) => b.total - a.total)
        .map(suc => ({
          'Sucursal': suc.nombre,
          'Órdenes': suc.ordenes,
          'Total Vendido': `$${suc.total.toFixed(2)}`,
          'Promedio por Orden': `$${(suc.total / suc.ordenes).toFixed(2)}`
        }));

      // Calcular ventas por vendedor
      const ventasPorVendedor: { [key: string]: { nombre: string; total: number; ordenes: number } } = {};
      ventasFiltradas.forEach(venta => {
        const vendedorNombre = venta.vendedor.nombre;
        if (!ventasPorVendedor[vendedorNombre]) {
          ventasPorVendedor[vendedorNombre] = { nombre: vendedorNombre, total: 0, ordenes: 0 };
        }
        ventasPorVendedor[vendedorNombre].total += venta.total;
        ventasPorVendedor[vendedorNombre].ordenes += 1;
      });
      
      const ventasPorVendedorArray = Object.values(ventasPorVendedor)
        .sort((a, b) => b.total - a.total)
        .map(vend => ({
          'Vendedor': vend.nombre,
          'Órdenes': vend.ordenes,
          'Total Vendido': `$${vend.total.toFixed(2)}`,
          'Promedio por Orden': `$${(vend.total / vend.ordenes).toFixed(2)}`
        }));

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Agregar hojas
      const ws1 = XLSX.utils.json_to_sheet(ventasData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Ventas');

      if (productosDetalle.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(productosDetalle);
        XLSX.utils.book_append_sheet(wb, ws2, 'Detalle Productos');
      }

      const ws3 = XLSX.utils.json_to_sheet(estadisticas);
      XLSX.utils.book_append_sheet(wb, ws3, 'Estadísticas');

      if (topProductos.length > 0) {
        const ws4 = XLSX.utils.json_to_sheet(topProductos);
        XLSX.utils.book_append_sheet(wb, ws4, 'Top Productos');
      }

      if (ventasPorSucursalArray.length > 0) {
        const ws5 = XLSX.utils.json_to_sheet(ventasPorSucursalArray);
        XLSX.utils.book_append_sheet(wb, ws5, 'Ventas por Sucursal');
      }

      if (ventasPorVendedorArray.length > 0) {
        const ws6 = XLSX.utils.json_to_sheet(ventasPorVendedorArray);
        XLSX.utils.book_append_sheet(wb, ws6, 'Ventas por Vendedor');
      }

      // Generar archivo
      const fechaActual = new Date().toISOString().split('T')[0];
      const fileName = `reporte-ventas-${fechaActual}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showSuccessToast('Reporte Excel descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      showErrorToast('Error al generar el reporte Excel');
    }
  };

  const abrirModalProductos = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVentaSeleccionada(null);
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando ventas...</div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-light-500">Reportes de Ventas</h2>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-2 md:px-4 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-xs md:text-base"
            >
            <option value="todas">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="completada">Completadas</option>
            <option value="pendiente_cobro">Pendientes de cobro</option>
            <option value="en_proceso">En proceso</option>
            <option value="cancelada">Canceladas</option>
          </select>
          
          <select
            value={filtroSucursal}
            onChange={(e) => setFiltroSucursal(e.target.value)}
            className="px-2 md:px-4 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-xs md:text-base"
          >
            <option value="todas">Todas las sucursales</option>
            {sucursales.map(suc => (
              <option key={suc._id} value={suc._id}>{suc.nombre}</option>
            ))}
          </select>

          <select
            value={filtroVendedor}
            onChange={(e) => {
              console.log('🎯 Filtro vendedor cambiado a:', e.target.value);
              setFiltroVendedor(e.target.value);
            }}
            className="px-2 md:px-4 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-xs md:text-base"
          >
            <option value="todos">Todos los vendedores</option>
            {vendedores.map(vend => (
              <option key={vend._id} value={vend._id}>{vend.name}</option>
            ))}
          </select>
          </div>
          
          <button
            onClick={exportarExcel}
            className="cursor-pointer hover:bg-primary-600 px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-primary-50 dark:bg-secondary-500 p-3 md:p-6 rounded-lg border-l-4 border-primary">
          <h3 className="text-xs md:text-sm font-medium text-primary-700 dark:text-primary-300">Total Ventas</h3>
          <p className="text-xl md:text-3xl font-bold text-primary-900 dark:text-primary-200 mt-1 md:mt-2">
            ${totalGeneral.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-3 md:p-6 rounded-lg border-l-4 border-green">
          <h3 className="text-xs md:text-sm font-medium text-green-700 dark:text-green-300">Órdenes</h3>
          <p className="text-xl md:text-3xl font-bold text-green-900 dark:text-green-200 mt-1 md:mt-2">
            {ventasFiltradas.length}
          </p>
        </div>
        <div className="bg-secondary-50 dark:bg-secondary-900 p-3 md:p-6 rounded-lg border-l-4 border-secondary">
          <h3 className="text-xs md:text-sm font-medium text-secondary-700 dark:text-secondary-300">Completadas</h3>
          <p className="text-xl md:text-3xl font-bold text-secondary-900 dark:text-secondary-200 mt-1 md:mt-2">
            {ventasFiltradas.filter(v => v.estado === 'completada').length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-3 md:p-6 rounded-lg border-l-4 border-red">
          <h3 className="text-xs md:text-sm font-medium text-red-700 dark:text-red-300">Pendiente Cobro</h3>
          <p className="text-xl md:text-3xl font-bold text-red-900 dark:text-red-200 mt-1 md:mt-2">
            {ventasFiltradas.filter(v => v.estado === 'pendiente_cobro').length}
          </p>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto -mx-1 md:mx-0">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">N° Orden</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Fecha</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Productos</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Sucursal</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Vendedor</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Cajero</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Método Pago</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Total</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {ventasFiltradas.map((venta) => {
                const fechaMostrar = venta.fechaCompletada || venta.fechaCreacion;
                return (
                  <tr key={venta._id} className="hover:bg-dark-600 dark:hover:bg-dark-600 transition-colors">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-mono text-primary-700 dark:text-primary-400 font-semibold">
                      {venta.numeroOrden}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-dark-600 dark:text-dark-400">
                      {new Date(fechaMostrar).toLocaleDateString('es-AR')} <br />
                      <span className="text-xs text-dark-500">{new Date(fechaMostrar).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-1 py-4 text-xs text-dark-600 dark:text-dark-400">
                      {venta.productos.length <= 2 ? (
                        <ul className="list-disc list-inside">
                          {venta.productos.map((prod, idx) => (
                            <li key={idx} className="text-xs lowercase">
                              {prod.nombre} x{prod.cantidad}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <button
                          onClick={() => abrirModalProductos(venta)}
                          className="cursor-pointer bg-primary hover:bg-primary-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Ver detalle ({venta.productos.length})
                        </button>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-dark-600 dark:text-dark-400">
                      {venta.sucursal?.nombre || 'N/A'}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-dark-600 dark:text-dark-400">
                      {venta.vendedor.nombre}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-dark-600 dark:text-dark-400">
                      {venta.cajero?.nombre || '-'}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-dark-600 dark:text-dark-400">
                      {venta.metodoPago ? (
                        <span className="capitalize">{venta.metodoPago}</span>
                      ) : '-'}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-bold text-secondary-700 dark:text-secondary-400">
                      ${venta.total.toFixed(2)}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 md:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        venta.estado === 'completada' 
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' 
                          : venta.estado === 'pendiente_cobro'
                          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                          : venta.estado === 'en_proceso'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                      }`}>
                        {venta.estado === 'pendiente_cobro' ? 'Pend. Cobro' : venta.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {ventasFiltradas.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay ventas registradas con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-3 md:p-6 border border-dark-200 dark:border-dark-700">
          <h3 className="text-base md:text-lg font-bold text-dark-900 dark:text-light-500 mb-2 md:mb-4">Top 5 Productos</h3>
          <div className="space-y-2 md:space-y-3">
            {(() => {
              // Calcular productos más vendidos
              const productosCount: { [key: string]: { nombre: string; cantidad: number } } = {};
              ventasFiltradas.forEach(venta => {
                venta.productos.forEach(prod => {
                  if (!productosCount[prod.nombre]) {
                    productosCount[prod.nombre] = { nombre: prod.nombre, cantidad: 0 };
                  }
                  productosCount[prod.nombre].cantidad += prod.cantidad;
                });
              });
              
              const topProductos = Object.values(productosCount)
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);

              if (topProductos.length === 0) {
                return <p className="text-sm text-dark-500 dark:text-dark-400">No hay datos disponibles</p>;
              }

              return topProductos.map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-dark-700 dark:text-dark-300">{prod.nombre}</span>
                  <span className="text-sm font-semibold text-primary">{prod.cantidad} unidades</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-3 md:p-6 border border-dark-200 dark:border-dark-700">
          <h3 className="text-base md:text-lg font-bold text-dark-900 dark:text-light-500 mb-2 md:mb-4">Ventas por Sucursal</h3>
          <div className="space-y-2 md:space-y-3">
            {(() => {
              // Calcular ventas por sucursal
              const ventasPorSucursal: { [key: string]: { nombre: string; total: number } } = {};
              ventasFiltradas.forEach(venta => {
                const sucursalNombre = venta.sucursal?.nombre || 'Sin sucursal';
                if (!ventasPorSucursal[sucursalNombre]) {
                  ventasPorSucursal[sucursalNombre] = { nombre: sucursalNombre, total: 0 };
                }
                ventasPorSucursal[sucursalNombre].total += venta.total;
              });
              
              const topSucursales = Object.values(ventasPorSucursal)
                .sort((a, b) => b.total - a.total);

              if (topSucursales.length === 0) {
                return <p className="text-sm text-dark-500 dark:text-dark-400">No hay datos disponibles</p>;
              }

              return topSucursales.map((suc, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-dark-700 dark:text-dark-300">{suc.nombre}</span>
                  <span className="text-sm font-semibold text-secondary">${suc.total.toFixed(2)}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Productos */}
      {modalAbierto && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={cerrarModal}>
          <div 
            className="bg-white dark:bg-dark-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Detalle de Productos</h3>
                <p className="text-sm opacity-90">Orden: {ventaSeleccionada.numeroOrden}</p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-3">
                {ventaSeleccionada.productos.map((prod, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-dark-900 dark:text-light-500">{prod.nombre}</h4>
                      <div className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                        <span>Precio unitario: ${prod.precio.toFixed(2)}</span>
                        <span className="mx-2">•</span>
                        <span>Cantidad: {prod.cantidad}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${prod.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t-2 border-gray-300 dark:border-dark-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-dark-900 dark:text-light-500">Total:</span>
                  <span className="text-2xl font-bold text-primary">${ventaSeleccionada.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 dark:bg-dark-700 px-6 py-4 flex justify-end">
              <button
                onClick={cerrarModal}
                className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
