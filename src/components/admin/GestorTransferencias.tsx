'use client';

import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { showConfirmAlert, showPromptAlert } from '@/utils/alerts';
import * as XLSX from 'xlsx';

interface Sucursal {
  _id: string;
  nombre: string;
  direccion?: {
    calle?: string;
    ciudad?: string;
  };
  telefono?: string;
  estado: string;
  activa?: boolean;
}

interface Product {
  _id: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  categoria: string;
  stockPorSucursal: {
    sucursalId: string;
    sucursalNombre: string;
    cantidad: number;
    stockMinimo: number;
  }[];
}

interface TransferenciaInput {
  productoId: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  cantidad: number;
}

interface TransferenciaItem {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  stockOrigenAntes: number;
  stockOrigenDespues: number;
  stockDestinoAntes: number;
  stockDestinoDespues: number;
}

interface Transferencia {
  _id: string;
  sucursalOrigenId: string;
  sucursalOrigenNombre: string;
  sucursalDestinoId: string;
  sucursalDestinoNombre: string;
  items: TransferenciaItem[];
  totalItems: number;
  totalCantidad: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  creadoPor: string;
  creadoPorNombre: string;
  aprobadoPor?: string;
  aprobadoPorNombre?: string;
  fechaCreacion: string;
  fechaAprobacion?: string;
  notas?: string;
  motivoCancelacion?: string;
}

export default function GestorTransferencias() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [vista, setVista] = useState<'masiva' | 'historial'>('masiva');

  // Estados para transferencias masivas
  const [transferenciasInput, setTransferenciasInput] = useState<Record<string, TransferenciaInput>>({});
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Estados para filtros de historial
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [filtroSucursal, setFiltroSucursal] = useState<string>('');
  const [filtroSucursalOrigen, setFiltroSucursalOrigen] = useState<string>('');
  const [filtroSucursalDestino, setFiltroSucursalDestino] = useState<string>('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
  const [busquedaProductoHistorial, setBusquedaProductoHistorial] = useState<string>('');

  // Cargar datos iniciales
  useEffect(() => {
    cargarSucursales();
    cargarProductos();
    if (vista === 'historial') {
      cargarTransferencias();
    }
  }, [vista]);

  const cargarSucursales = async () => {
    try {
      console.log('🔄 Cargando sucursales...');
      console.log('🍪 Cookies disponibles:', document.cookie);
      
      const res = await fetch('/api/sucursales?estado=activa', {
        credentials: 'include'
      });
      
      console.log('📥 Response status (sucursales):', res.status);
      
      if (res.ok) {
        const data = await res.json();
        setSucursales(data.data || data.sucursales || []);
        console.log('✅ Sucursales cargadas:', data.data?.length || data.sucursales?.length);
      } else if (res.status === 401) {
        console.error('❌ Error 401: No autenticado al cargar sucursales');
        showErrorToast('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error al cargar sucursales:', error);
      showErrorToast('Error al cargar sucursales');
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?limit=10000', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const productosCargados = data.data || data.products || [];
        setProductos(productosCargados);
      } else if (res.status === 401) {
        showErrorToast('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showErrorToast('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const cargarTransferencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado && filtroEstado !== 'todas') params.append('estado', filtroEstado);
      if (filtroSucursal) params.append('sucursalId', filtroSucursal);

      console.log('🔄 Cargando transferencias con filtros:', params.toString());
      console.log('🍪 Cookies disponibles:', document.cookie);

      const res = await fetch(`/api/transferencias?${params.toString()}`, {
        credentials: 'include'
      });
      
      console.log('📥 Response status (transferencias):', res.status);
      
      if (res.ok) {
        const data = await res.json();
        setTransferencias(data.transferencias);
        console.log('✅ Transferencias cargadas:', data.transferencias?.length);
      } else if (res.status === 401) {
        console.error('❌ Error 401: No autenticado al cargar transferencias');
        const errorData = await res.json();
        console.error('❌ Error data:', errorData);
        showErrorToast('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error al cargar transferencias:', error);
      showErrorToast('Error al cargar historial de transferencias');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar transferencias localmente con los nuevos filtros
  const transferenciasFiltradas = transferencias.filter(t => {
    // Filtro por sucursal origen
    if (filtroSucursalOrigen && t.sucursalOrigenId !== filtroSucursalOrigen) return false;
    
    // Filtro por sucursal destino
    if (filtroSucursalDestino && t.sucursalDestinoId !== filtroSucursalDestino) return false;
    
    // Filtro por fecha desde
    if (filtroFechaDesde && new Date(t.fechaCreacion) < new Date(filtroFechaDesde)) return false;
    
    // Filtro por fecha hasta
    if (filtroFechaHasta) {
      const fechaHasta = new Date(filtroFechaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      if (new Date(t.fechaCreacion) > fechaHasta) return false;
    }
    
    // Filtro por búsqueda de producto
    if (busquedaProductoHistorial) {
      const busquedaLower = busquedaProductoHistorial.toLowerCase();
      const tieneProducto = t.items.some(item => 
        item.nombreProducto.toLowerCase().includes(busquedaLower)
      );
      if (!tieneProducto) return false;
    }
    
    return true;
  });

  const handleExportarHistorial = () => {
    try {
      if (transferenciasFiltradas.length === 0) {
        showErrorToast('No hay transferencias para exportar');
        return;
      }

      // Preparar datos generales de transferencias
      const transferenciasData = transferenciasFiltradas.map((t, index) => ({
        'N°': index + 1,
        'Fecha': new Date(t.fechaCreacion).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        'Sucursal Origen': t.sucursalOrigenNombre,
        'Sucursal Destino': t.sucursalDestinoNombre,
        'Total Productos': t.totalItems,
        'Total Unidades': t.totalCantidad,
        'Estado': t.estado.toUpperCase(),
        'Creado Por': t.creadoPorNombre,
        'Aprobado Por': t.aprobadoPorNombre || '-',
        'Fecha Aprobación': t.fechaAprobacion 
          ? new Date(t.fechaAprobacion).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-',
        'Notas': t.notas || '-',
        'Motivo Cancelación': t.motivoCancelacion || '-',
      }));

      // Preparar detalles de items por transferencia
      const itemsData: any[] = [];
      transferenciasFiltradas.forEach((t, idx) => {
        t.items.forEach(item => {
          itemsData.push({
            'N° Transferencia': idx + 1,
            'Fecha': new Date(t.fechaCreacion).toLocaleDateString('es-AR'),
            'Producto': item.nombreProducto,
            'Cantidad Transferida': item.cantidad,
            'Origen': t.sucursalOrigenNombre,
            'Stock Origen Antes': item.stockOrigenAntes,
            'Stock Origen Después': item.stockOrigenDespues,
            'Destino': t.sucursalDestinoNombre,
            'Stock Destino Antes': item.stockDestinoAntes,
            'Stock Destino Después': item.stockDestinoDespues,
            'Estado': t.estado.toUpperCase(),
          });
        });
      });

      // Preparar resumen por sucursal
      const resumenPorSucursal: Record<string, { enviadas: number, recibidas: number, unidadesEnviadas: number, unidadesRecibidas: number }> = {};
      
      transferenciasFiltradas.forEach(t => {
        if (t.estado === 'completada') {
          // Origen
          if (!resumenPorSucursal[t.sucursalOrigenNombre]) {
            resumenPorSucursal[t.sucursalOrigenNombre] = { enviadas: 0, recibidas: 0, unidadesEnviadas: 0, unidadesRecibidas: 0 };
          }
          resumenPorSucursal[t.sucursalOrigenNombre].enviadas++;
          resumenPorSucursal[t.sucursalOrigenNombre].unidadesEnviadas += t.totalCantidad;

          // Destino
          if (!resumenPorSucursal[t.sucursalDestinoNombre]) {
            resumenPorSucursal[t.sucursalDestinoNombre] = { enviadas: 0, recibidas: 0, unidadesEnviadas: 0, unidadesRecibidas: 0 };
          }
          resumenPorSucursal[t.sucursalDestinoNombre].recibidas++;
          resumenPorSucursal[t.sucursalDestinoNombre].unidadesRecibidas += t.totalCantidad;
        }
      });

      const resumenData = Object.entries(resumenPorSucursal).map(([sucursal, datos]) => ({
        'Sucursal': sucursal,
        'Transferencias Enviadas': datos.enviadas,
        'Unidades Enviadas': datos.unidadesEnviadas,
        'Transferencias Recibidas': datos.recibidas,
        'Unidades Recibidas': datos.unidadesRecibidas,
        'Balance Neto': datos.unidadesRecibidas - datos.unidadesEnviadas,
      }));

      // Preparar estadísticas generales
      const totalCompletadas = transferenciasFiltradas.filter(t => t.estado === 'completada').length;
      const totalPendientes = transferenciasFiltradas.filter(t => t.estado === 'pendiente').length;
      const totalCanceladas = transferenciasFiltradas.filter(t => t.estado === 'cancelada').length;
      const totalUnidades = transferenciasFiltradas.reduce((sum, t) => sum + t.totalCantidad, 0);

      const estadisticasData = [
        { 'Concepto': 'Total de Transferencias', 'Valor': transferenciasFiltradas.length },
        { 'Concepto': 'Transferencias Completadas', 'Valor': totalCompletadas },
        { 'Concepto': 'Transferencias Pendientes', 'Valor': totalPendientes },
        { 'Concepto': 'Transferencias Canceladas', 'Valor': totalCanceladas },
        { 'Concepto': 'Total de Unidades Transferidas', 'Valor': totalUnidades },
        { 'Concepto': 'Promedio Unidades por Transferencia', 'Valor': (totalUnidades / transferenciasFiltradas.length).toFixed(2) },
      ];

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();

      // Hoja 1: Estadísticas
      const ws1 = XLSX.utils.json_to_sheet(estadisticasData);
      ws1['!cols'] = [{ wch: 40 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Estadísticas');

      // Hoja 2: Transferencias Generales
      const ws2 = XLSX.utils.json_to_sheet(transferenciasData);
      ws2['!cols'] = [
        { wch: 5 }, { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, 
        { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, 
        { wch: 30 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Transferencias');

      // Hoja 3: Detalle de Productos
      const ws3 = XLSX.utils.json_to_sheet(itemsData);
      ws3['!cols'] = [
        { wch: 18 }, { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 25 }, 
        { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 20 }, 
        { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, ws3, 'Detalle de Productos');

      // Hoja 4: Resumen por Sucursal
      if (resumenData.length > 0) {
        const ws4 = XLSX.utils.json_to_sheet(resumenData);
        ws4['!cols'] = [
          { wch: 25 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 15 }
        ];
        XLSX.utils.book_append_sheet(wb, ws4, 'Resumen por Sucursal');
      }

      // Generar archivo
      const fechaActual = new Date().toISOString().split('T')[0];
      const fileName = `historial_transferencias_${fechaActual}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showSuccessToast(`Excel descargado: ${transferenciasFiltradas.length} transferencias`);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      showErrorToast('Error al generar el archivo Excel');
    }
  };

  // Obtener categorías únicas
  const categorias = productos && productos.length > 0 
    ? Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))
    : [];

  // Filtrar productos
  const productosFiltrados = (productos || []).filter(p => {
    if (!p) return false;
    const matchNombre = p.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase());
    const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria;
    return matchNombre && matchCategoria;
  });

  // Actualizar input de transferencia
  const actualizarTransferencia = (productoId: string, field: keyof TransferenciaInput, value: string | number) => {
    setTransferenciasInput(prev => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        productoId,
        [field]: value
      }
    }));
  };

  // Obtener stock disponible en sucursal origen
  const obtenerStockOrigen = (productoId: string, sucursalOrigenId: string): number => {
    if (!productos || productos.length === 0 || !productoId || !sucursalOrigenId) return 0;
    
    const producto = productos.find(p => p._id === productoId);
    if (!producto || !producto.stockPorSucursal) return 0;
    
    const stock = producto.stockPorSucursal.find(s => s.sucursalId === sucursalOrigenId);
    return stock?.cantidad || 0;
  }

  // Validar y ejecutar transferencias masivas
  const ejecutarTransferenciasMasivas = async () => {
    const transferenciasValidas = Object.values(transferenciasInput).filter(t => 
      t.sucursalOrigenId && 
      t.sucursalDestinoId && 
      t.cantidad > 0 &&
      t.sucursalOrigenId !== t.sucursalDestinoId
    );

    if (transferenciasValidas.length === 0) {
      showErrorToast('No hay transferencias válidas para procesar');
      return;
    }

    // Validar stocks disponibles
    const errores: string[] = [];
    transferenciasValidas.forEach(t => {
      const stockDisponible = obtenerStockOrigen(t.productoId, t.sucursalOrigenId);
      const producto = productos?.find(p => p._id === t.productoId);
      if (t.cantidad > stockDisponible) {
        errores.push(`${producto?.nombre || 'Producto'}: Stock insuficiente (Disponible: ${stockDisponible}, Solicitado: ${t.cantidad})`);
      }
    });

    if (errores.length > 0) {
      showErrorToast(`Errores:\n${errores.join('\n')}`);
      return;
    }

    const confirmado = await showConfirmAlert(
      '¿Ejecutar transferencias masivas?',
      `Se procesarán ${transferenciasValidas.length} transferencia(s)`
    );

    if (!confirmado) return;

    try {
      setLoading(true);
      let exitosas = 0;
      let fallidas = 0;

      console.log('🔄 Iniciando transferencias masivas...');
      console.log('📦 Total a procesar:', transferenciasValidas.length);
      console.log('🍪 Cookies disponibles:', document.cookie);

      for (const t of transferenciasValidas) {
        const producto = productos?.find(p => p._id === t.productoId);
        if (!producto) continue;

        const requestBody = {
          sucursalOrigenId: t.sucursalOrigenId,
          sucursalDestinoId: t.sucursalDestinoId,
          items: [{
            productoId: t.productoId,
            cantidad: t.cantidad
          }],
          notas: `Transferencia masiva - ${producto.nombre}`,
          ejecutarInmediatamente: true
        };

        console.log('📤 Enviando transferencia:', producto.nombre, requestBody);

        const res = await fetch('/api/transferencias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        console.log('📥 Response status:', res.status);

        if (res.status === 401) {
          console.error('❌ Error 401: No autenticado');
          const errorData = await res.json();
          console.error('❌ Error data:', errorData);
          showErrorToast('No estás autenticado. Por favor, inicia sesión nuevamente.');
          fallidas++;
          break;
        } else if (res.status === 403) {
          console.error('❌ Error 403: Sin permisos');
          showErrorToast('No tienes permisos para realizar transferencias.');
          fallidas++;
          break;

        } else if (res.ok) {
          console.log('✅ Transferencia exitosa:', producto.nombre);
          exitosas++;
        } else {
          const errorData = await res.json();
          console.error('❌ Error:', res.status, errorData);
          fallidas++;
        }
      }

      if (exitosas > 0) {
        showSuccessToast(`${exitosas} transferencia(s) ejecutada(s) exitosamente`);
        setTransferenciasInput({});
        cargarProductos();
      }
      
      if (fallidas > 0) {
        showErrorToast(`${fallidas} transferencia(s) fallida(s)`);
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Error al procesar transferencias');
    } finally {
      setLoading(false);
    }
  };

  const aprobarTransferencia = async (id: string) => {
    const confirmado = await showConfirmAlert(
      '¿Aprobar transferencia?',
      'Se ejecutará la transferencia de stock'
    );

    if (!confirmado) return;

    try {
      setLoading(true);
      console.log('🔄 Aprobando transferencia:', id);
      console.log('🍪 Cookies disponibles:', document.cookie);

      const res = await fetch(`/api/transferencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accion: 'aprobar' })
      });

      console.log('📥 Response status (aprobar):', res.status);
      const data = await res.json();
      console.log('📥 Response data:', data);

      if (res.ok) {
        console.log('✅ Transferencia aprobada exitosamente');
        showSuccessToast('Transferencia aprobada exitosamente');
        cargarTransferencias();
        cargarProductos();
      } else if (res.status === 401) {
        console.error('❌ Error 401: No autenticado');
        showErrorToast('No estás autenticado. Por favor, inicia sesión nuevamente.');
      } else if (res.status === 403) {
        console.error('❌ Error 403: Sin permisos');
        showErrorToast('No tienes permisos para aprobar transferencias.');
      } else {
        console.error('❌ Error:', data);
        showErrorToast(data.error || 'Error al aprobar transferencia');
      }
    } catch (error) {
      console.error('❌ Error al aprobar:', error);
      showErrorToast('Error al aprobar transferencia');
    } finally {
      setLoading(false);
    }
  };

  const cancelarTransferencia = async (id: string) => {
    const motivoCancelacion = await showPromptAlert(
      '¿Cancelar transferencia?',
      'Ingrese el motivo de cancelación'
    );

    if (!motivoCancelacion) return;

    try {
      setLoading(true);
      console.log('🔄 Cancelando transferencia:', id);
      console.log('🍪 Cookies disponibles:', document.cookie);

      const res = await fetch(`/api/transferencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          accion: 'cancelar',
          motivoCancelacion
        })
      });

      console.log('📥 Response status (cancelar):', res.status);
      const data = await res.json();
      console.log('📥 Response data:', data);

      if (res.ok) {
        console.log('✅ Transferencia cancelada exitosamente');
        showSuccessToast('Transferencia cancelada');
        cargarTransferencias();
      } else if (res.status === 401) {
        console.error('❌ Error 401: No autenticado');
        showErrorToast('No estás autenticado. Por favor, inicia sesión nuevamente.');
      } else if (res.status === 403) {
        console.error('❌ Error 403: Sin permisos');
        showErrorToast('No tienes permisos para cancelar transferencias.');
      } else {
        console.error('❌ Error:', data);
        showErrorToast(data.error || 'Error al cancelar transferencia');
      }
    } catch (error) {
      console.error('❌ Error al cancelar:', error);
      showErrorToast('Error al cancelar transferencia');
    } finally {
      setLoading(false);
    }
  };

  const transferenciasCount = Object.keys(transferenciasInput).length;

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-200 dark:border-dark-700">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">
            Transferencias de Stock
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setVista('masiva')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                vista === 'masiva'
                  ? 'bg-secondary hover:bg-secondary-700 text-white'
                  : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
              }`}
            >
              Transferencias Masivas
            </button>
            <button
              onClick={() => setVista('historial')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                vista === 'historial'
                  ? 'bg-secondary hover:bg-secondary-700 text-white'
                  : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
              }`}
            >
              Historial
            </button>
          </div>
        </div>

        {vista === 'masiva' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-50 dark:bg-dark-900 p-4 rounded-lg border border-dark-200 dark:border-dark-700">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Buscar Producto
                </label>
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Filtrar por Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información de sucursales disponibles */}
            {sucursales.length > 0 && (
              <div className="bg-secondary-50 dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-800">
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-200 mb-2">Sucursales Disponibles:</h3>
                <div className="flex flex-wrap gap-2">
                  {sucursales.map(s => (
                    <span key={s._id} className="bg-secondary-200 dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 py-1 rounded-full text-sm">
                      {s.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de Guardar Masivo */}
            {transferenciasCount > 0 && (
              <div className="bg-success-50 dark:bg-success-900 p-4 rounded-lg flex justify-between items-center sticky top-0 z-10 shadow-lg border border-success-200 dark:border-success-800">
                <div>
                  <p className="font-semibold text-success-900 dark:text-success-100">
                    {transferenciasCount} transferencia(s) pendiente(s)
                  </p>
                  <p className="text-sm text-success-700 dark:text-success-300">
                    Revisa y presiona "Guardar Todas" para ejecutar
                  </p>
                </div>
                <button
                  onClick={ejecutarTransferenciasMasivas}
                  disabled={loading}
                  className="bg-secondary hover:bg-secondary-400 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  💾 Guardar Todas las Transferencias
                </button>
              </div>
            )}

            {/* Tabla de Productos */}
            {loading ? (
              <div className="text-center py-8 text-primary">Cargando productos...</div>
            ) : (
              <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
                    <thead className="bg-dark-100 dark:bg-dark-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Categoría</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Stock Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Stock Mínimo</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Sucursal Origen</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Stock Origen</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Sucursal Destino</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
                      {productosFiltrados.map(producto => {
                        if (!producto || !producto._id) return null;
                        const transferencia = transferenciasInput[producto._id] || {};
                        const stockOrigen = obtenerStockOrigen(producto._id, transferencia.sucursalOrigenId || '');

                        return (
                          <tr key={producto._id} className="hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-dark-900 dark:text-light-500">
                              {producto.nombre}
                            </td>
                            <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-400">
                              {producto.categoria}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-secondary-700 dark:text-secondary-400">
                              {producto.stock}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-dark-600 dark:text-dark-400">
                              {producto.stockMinimo}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={transferencia.sucursalOrigenId || ''}
                                onChange={(e) => actualizarTransferencia(producto._id, 'sucursalOrigenId', e.target.value)}
                                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary text-sm"
                              >
                                <option value="">Seleccionar</option>
                                {sucursales
                                  .filter(s => s._id !== transferencia.sucursalDestinoId)
                                  .map(s => (
                                    <option key={s._id} value={s._id}>{s.nombre}</option>
                                  ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-semibold ${stockOrigen === 0 ? 'text-error' : 'text-success-600 dark:text-success-400'}`}>
                                {stockOrigen}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={transferencia.sucursalDestinoId || ''}
                                onChange={(e) => actualizarTransferencia(producto._id, 'sucursalDestinoId', e.target.value)}
                                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary text-sm"
                                disabled={!transferencia.sucursalOrigenId}
                              >
                                <option value="">Seleccionar</option>
                                {sucursales
                                  .filter(s => s._id !== transferencia.sucursalOrigenId)
                                  .map(s => (
                                    <option key={s._id} value={s._id}>{s.nombre}</option>
                                  ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={stockOrigen}
                                value={transferencia.cantidad || ''}
                                onChange={(e) => actualizarTransferencia(producto._id, 'cantidad', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary text-sm"
                                disabled={!transferencia.sucursalOrigenId || !transferencia.sucursalDestinoId}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {productosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-dark-600 dark:text-dark-400">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {vista === 'historial' && (
          <div className="space-y-4">
            {/* Botón de Exportar Excel */}
            <div className="flex justify-end">
              <button
                onClick={handleExportarHistorial}
                disabled={transferenciasFiltradas.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📊 Exportar a Excel
              </button>
            </div>

            {/* Filtros Expandidos */}
            <div className="bg-dark-50 dark:bg-dark-900 p-4 rounded-lg border border-dark-200 dark:border-dark-700 space-y-4">
              <h3 className="font-semibold text-dark-900 dark:text-light-500 mb-3">Filtros de Búsqueda</h3>
              
              {/* Primera fila de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      cargarTransferencias();
                    }}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  >
                    <option value="todas">Todas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="completada">Completadas</option>
                    <option value="cancelada">Canceladas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Sucursal Origen
                  </label>
                  <select
                    value={filtroSucursalOrigen}
                    onChange={(e) => setFiltroSucursalOrigen(e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Todas las sucursales</option>
                    {sucursales.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Sucursal Destino
                  </label>
                  <select
                    value={filtroSucursalDestino}
                    onChange={(e) => setFiltroSucursalDestino(e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Todas las sucursales</option>
                    {sucursales.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segunda fila de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filtroFechaDesde}
                    onChange={(e) => setFiltroFechaDesde(e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filtroFechaHasta}
                    onChange={(e) => setFiltroFechaHasta(e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Buscar Producto
                  </label>
                  <input
                    type="text"
                    value={busquedaProductoHistorial}
                    onChange={(e) => setBusquedaProductoHistorial(e.target.value)}
                    placeholder="Nombre del producto..."
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Botones de acción de filtros */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setFiltroEstado('todas');
                    setFiltroSucursalOrigen('');
                    setFiltroSucursalDestino('');
                    setFiltroFechaDesde('');
                    setFiltroFechaHasta('');
                    setBusquedaProductoHistorial('');
                    setFiltroSucursal('');
                  }}
                  className="px-4 py-2 bg-dark-200 dark:bg-dark-700 hover:bg-dark-300 dark:hover:bg-dark-600 text-dark-900 dark:text-light-500 rounded-lg font-medium transition-colors text-sm"
                >
                  🔄 Limpiar Filtros
                </button>
              </div>

              {/* Contador de resultados */}
              <div className="text-sm text-dark-600 dark:text-dark-400 pt-2 border-t border-dark-200 dark:border-dark-700">
                Mostrando {transferenciasFiltradas.length} de {transferencias.length} transferencias
              </div>
            </div>

            {/* Lista de Transferencias */}
            {loading ? (
              <div className="text-center py-8 text-primary">Cargando...</div>
            ) : transferenciasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-dark-600 dark:text-dark-400">
                {transferencias.length === 0 
                  ? 'No hay transferencias registradas'
                  : 'No se encontraron transferencias con los filtros aplicados'}
              </div>
            ) : (
              <div className="space-y-4">
                {transferenciasFiltradas.map(t => (
                  <div key={t._id} className="bg-surface dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-dark-900 dark:text-light-500">
                          {t.sucursalOrigenNombre} → {t.sucursalDestinoNombre}
                        </h3>
                        <p className="text-sm text-dark-600 dark:text-dark-400">
                          {t.totalItems} producto(s) - {t.totalCantidad} unidades
                        </p>
                        <p className="text-xs text-dark-500 dark:text-dark-500">
                          Creado: {new Date(t.fechaCreacion).toLocaleString()} por {t.creadoPorNombre}
                        </p>
                        {t.fechaAprobacion && (
                          <p className="text-xs text-dark-500 dark:text-dark-500">
                            {t.estado === 'completada' ? 'Aprobado' : 'Cancelado'}: {new Date(t.fechaAprobacion).toLocaleString()} por {t.aprobadoPorNombre}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.estado === 'completada' ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' :
                          t.estado === 'pendiente' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                          'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                        }`}>
                          {t.estado.toUpperCase()}
                        </span>

                        {t.estado === 'pendiente' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => aprobarTransferencia(t._id)}
                              className="bg-success-600 hover:bg-success-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors shadow-md"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => cancelarTransferencia(t._id)}
                              className="bg-error hover:bg-error-dark text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors shadow-md"
                            >
                              ✗ Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detalles de Items */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-secondary hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300">
                        Ver detalles de productos
                      </summary>
                      <div className="mt-2 space-y-1 bg-dark-50 dark:bg-dark-900 p-3 rounded-lg">
                        {t.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-dark-700 dark:text-dark-300 pl-4">
                            • <span className="font-medium">{item.nombreProducto}</span>: {item.cantidad} unidades
                            <div className="text-xs text-dark-500 dark:text-dark-500 pl-2">
                              (Origen: {item.stockOrigenAntes} → {item.stockOrigenDespues} |
                              Destino: {item.stockDestinoAntes} → {item.stockDestinoDespues})
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    {t.notas && (
                      <div className="mt-2 text-sm text-dark-600 dark:text-dark-400 italic bg-dark-50 dark:bg-dark-900 p-2 rounded">
                        <span className="font-medium">Notas:</span> {t.notas}
                      </div>
                    )}

                    {t.motivoCancelacion && (
                      <div className="mt-2 text-sm text-error bg-error-light/10 dark:bg-error-dark/10 p-2 rounded">
                        <span className="font-medium">Motivo cancelación:</span> {t.motivoCancelacion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
