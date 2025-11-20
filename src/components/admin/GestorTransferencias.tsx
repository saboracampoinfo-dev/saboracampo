'use client';

import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { showConfirmAlert, showPromptAlert } from '@/utils/alerts';

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
      const res = await fetch('/api/sucursales?estado=activa');
      if (res.ok) {
        const data = await res.json();
        setSucursales(data.data || data.sucursales || []);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      showErrorToast('Error al cargar sucursales');
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?limit=10000');
      if (res.ok) {
        const data = await res.json();
        const productosCargados = data.data || data.products || [];
        setProductos(productosCargados);
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

      const res = await fetch(`/api/transferencias?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransferencias(data.transferencias);
      }
    } catch (error) {
      console.error('Error al cargar transferencias:', error);
      showErrorToast('Error al cargar historial de transferencias');
    } finally {
      setLoading(false);
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

      for (const t of transferenciasValidas) {
        const producto = productos?.find(p => p._id === t.productoId);
        if (!producto) continue;

        const res = await fetch('/api/transferencias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sucursalOrigenId: t.sucursalOrigenId,
            sucursalDestinoId: t.sucursalDestinoId,
            items: [{
              productoId: t.productoId,
              cantidad: t.cantidad
            }],
            notas: `Transferencia masiva - ${producto.nombre}`,
            ejecutarInmediatamente: true
          })
        });

        if (res.ok) {
          exitosas++;
        } else {
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
      const res = await fetch(`/api/transferencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'aprobar' })
      });

      const data = await res.json();

      if (res.ok) {
        showSuccessToast('Transferencia aprobada exitosamente');
        cargarTransferencias();
        cargarProductos();
      } else {
        showErrorToast(data.error || 'Error al aprobar transferencia');
      }
    } catch (error) {
      console.error('Error:', error);
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
      const res = await fetch(`/api/transferencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accion: 'cancelar',
          motivoCancelacion
        })
      });

      const data = await res.json();

      if (res.ok) {
        showSuccessToast('Transferencia cancelada');
        cargarTransferencias();
      } else {
        showErrorToast(data.error || 'Error al cancelar transferencia');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Error al cancelar transferencia');
    } finally {
      setLoading(false);
    }
  };

  const transferenciasCount = Object.keys(transferenciasInput).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestor de Transferencias de Stock
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setVista('masiva')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vista === 'masiva'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Transferencias Masivas
            </button>
            <button
              onClick={() => setVista('historial')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vista === 'historial'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Historial
            </button>
          </div>
        </div>

        {vista === 'masiva' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Producto
                </label>
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Sucursales Disponibles:</h3>
                <div className="flex flex-wrap gap-2">
                  {sucursales.map(s => (
                    <span key={s._id} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm">
                      {s.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de Guardar Masivo */}
            {transferenciasCount > 0 && (
              <div className="bg-green-50 p-4 rounded-lg flex justify-between items-center sticky top-0 z-10 shadow-md">
                <div>
                  <p className="font-semibold text-green-900">
                    {transferenciasCount} transferencia(s) pendiente(s)
                  </p>
                  <p className="text-sm text-green-700">
                    Revisa y presiona "Guardar Todas" para ejecutar
                  </p>
                </div>
                <button
                  onClick={ejecutarTransferenciasMasivas}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  💾 Guardar Todas las Transferencias
                </button>
              </div>
            )}

            {/* Tabla de Productos */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando productos...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Producto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Categoría</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Stock Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Stock Mínimo</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Sucursal Origen</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Stock Origen</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Sucursal Destino</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map(producto => {
                      if (!producto || !producto._id) return null;
                      const transferencia = transferenciasInput[producto._id] || {};
                      const stockOrigen = obtenerStockOrigen(producto._id, transferencia.sucursalOrigenId || '');

                      return (
                        <tr key={producto._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {producto.categoria}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                            {producto.stock}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {producto.stockMinimo}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={transferencia.sucursalOrigenId || ''}
                              onChange={(e) => actualizarTransferencia(producto._id, 'sucursalOrigenId', e.target.value)}
                              className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
                            >
                              <option value="">Seleccionar</option>
                              {sucursales
                                .filter(s => s._id !== transferencia.sucursalDestinoId)
                                .map(s => (
                                  <option key={s._id} value={s._id} className=''>{s.nombre}</option>
                                ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-semibold ${stockOrigen === 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {stockOrigen}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={transferencia.sucursalDestinoId || ''}
                              onChange={(e) => actualizarTransferencia(producto._id, 'sucursalDestinoId', e.target.value)}
                              className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-primary text-sm md:text-base"
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
                              className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                              disabled={!transferencia.sucursalOrigenId || !transferencia.sucursalDestinoId}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {productosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {vista === 'historial' && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    cargarTransferencias();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="todas">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completada">Completadas</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal
                </label>
                <select
                  value={filtroSucursal}
                  onChange={(e) => {
                    setFiltroSucursal(e.target.value);
                    cargarTransferencias();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
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

            {/* Lista de Transferencias */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : transferencias.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay transferencias registradas
              </div>
            ) : (
              <div className="space-y-4">
                {transferencias.map(t => (
                  <div key={t._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {t.sucursalOrigenNombre} → {t.sucursalDestinoNombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t.totalItems} producto(s) - {t.totalCantidad} unidades
                        </p>
                        <p className="text-xs text-gray-500">
                          Creado: {new Date(t.fechaCreacion).toLocaleString()} por {t.creadoPorNombre}
                        </p>
                        {t.fechaAprobacion && (
                          <p className="text-xs text-gray-500">
                            {t.estado === 'completada' ? 'Aprobado' : 'Cancelado'}: {new Date(t.fechaAprobacion).toLocaleString()} por {t.aprobadoPorNombre}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.estado === 'completada' ? 'bg-green-100 text-green-800' :
                          t.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t.estado.toUpperCase()}
                        </span>

                        {t.estado === 'pendiente' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => aprobarTransferencia(t._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => cancelarTransferencia(t._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              ✗ Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detalles de Items */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                        Ver detalles de productos
                      </summary>
                      <div className="mt-2 space-y-1">
                        {t.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700 pl-4">
                            • {item.nombreProducto}: {item.cantidad} unidades
                            (Origen: {item.stockOrigenAntes} → {item.stockOrigenDespues} |
                            Destino: {item.stockDestinoAntes} → {item.stockDestinoDespues})
                          </div>
                        ))}
                      </div>
                    </details>

                    {t.notas && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        Notas: {t.notas}
                      </div>
                    )}

                    {t.motivoCancelacion && (
                      <div className="mt-2 text-sm text-red-600">
                        Motivo cancelación: {t.motivoCancelacion}
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
