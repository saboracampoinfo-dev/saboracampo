'use client';

import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { showConfirmAlert, showPromptAlert } from '@/utils/alerts';

interface Sucursal {
  _id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  activa: boolean;
}

interface Product {
  _id: string;
  nombre: string;
  stockPorSucursal: {
    sucursalId: string;
    sucursalNombre: string;
    cantidad: number;
    stockMinimo: number;
  }[];
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
  const [vista, setVista] = useState<'nueva' | 'historial'>('nueva');

  // Estados para nueva transferencia
  const [sucursalOrigen, setSucursalOrigen] = useState('');
  const [sucursalDestino, setSucursalDestino] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    { productoId: string; cantidad: number }[]
  >([]);
  const [notas, setNotas] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

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
      const res = await fetch('/api/sucursales');
      if (res.ok) {
        const data = await res.json();
        setSucursales(data.sucursales.filter((s: Sucursal) => s.activa));
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch('/api/products?limit=1000');
      if (res.ok) {
        const data = await res.json();
        setProductos(data.products.filter((p: Product) => p.stockPorSucursal?.length > 0));
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
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

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const obtenerStockDisponible = (productoId: string) => {
    const producto = productos.find(p => p._id === productoId);
    if (!producto || !sucursalOrigen) return 0;

    const stock = producto.stockPorSucursal.find(
      s => s.sucursalId === sucursalOrigen
    );
    return stock?.cantidad || 0;
  };

  const agregarProducto = (productoId: string) => {
    if (productosSeleccionados.find(p => p.productoId === productoId)) {
      showErrorToast('Este producto ya está en la lista');
      return;
    }

    const stockDisponible = obtenerStockDisponible(productoId);
    if (stockDisponible === 0) {
      showErrorToast('No hay stock disponible en la sucursal de origen');
      return;
    }

    setProductosSeleccionados([
      ...productosSeleccionados,
      { productoId, cantidad: 1 }
    ]);
    setBusquedaProducto('');
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    const stockDisponible = obtenerStockDisponible(productoId);
    
    if (cantidad > stockDisponible) {
      showErrorToast(`Stock máximo disponible: ${stockDisponible}`);
      return;
    }

    setProductosSeleccionados(
      productosSeleccionados.map(p =>
        p.productoId === productoId ? { ...p, cantidad: Math.max(1, cantidad) } : p
      )
    );
  };

  const eliminarProducto = (productoId: string) => {
    setProductosSeleccionados(
      productosSeleccionados.filter(p => p.productoId !== productoId)
    );
  };

  const crearTransferencia = async (ejecutarInmediatamente: boolean) => {
    if (!sucursalOrigen || !sucursalDestino) {
      showErrorToast('Debe seleccionar sucursal origen y destino');
      return;
    }

    if (productosSeleccionados.length === 0) {
      showErrorToast('Debe agregar al menos un producto');
      return;
    }

    const confirmado = await showConfirmAlert(
      ejecutarInmediatamente ? '¿Ejecutar transferencia ahora?' : '¿Crear transferencia?',
      ejecutarInmediatamente 
        ? 'Se transferirá el stock inmediatamente'
        : 'La transferencia quedará pendiente de aprobación'
    );

    if (!confirmado) return;

    try {
      setLoading(true);

      const res = await fetch('/api/transferencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sucursalOrigenId: sucursalOrigen,
          sucursalDestinoId: sucursalDestino,
          items: productosSeleccionados,
          notas,
          ejecutarInmediatamente
        })
      });

      const data = await res.json();

      if (res.ok) {
        showSuccessToast(data.mensaje);
        // Resetear formulario
        setSucursalOrigen('');
        setSucursalDestino('');
        setProductosSeleccionados([]);
        setNotas('');
        cargarProductos(); // Recargar para actualizar stocks
      } else {
        showErrorToast(data.error || 'Error al crear transferencia');
        if (data.errores) {
          console.error('Errores:', data.errores);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Error al procesar transferencia');
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

  const obtenerProductoPorId = (id: string) => {
    return productos.find(p => p._id === id);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestor de Transferencias de Stock
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setVista('nueva')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vista === 'nueva'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Nueva Transferencia
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

        {vista === 'nueva' && (
          <div className="space-y-6">
            {/* Selección de Sucursales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal Origen
                </label>
                <select
                  value={sucursalOrigen}
                  onChange={(e) => {
                    setSucursalOrigen(e.target.value);
                    setProductosSeleccionados([]);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales
                    .filter(s => s._id !== sucursalDestino)
                    .map(s => (
                      <option key={s._id} value={s._id}>
                        {s.nombre}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal Destino
                </label>
                <select
                  value={sucursalDestino}
                  onChange={(e) => setSucursalDestino(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales
                    .filter(s => s._id !== sucursalOrigen)
                    .map(s => (
                      <option key={s._id} value={s._id}>
                        {s.nombre}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {sucursalOrigen && sucursalDestino && (
              <>
                {/* Búsqueda y Selección de Productos */}
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

                  {busquedaProducto && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                      {productosFiltrados.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">
                          No se encontraron productos
                        </div>
                      ) : (
                        productosFiltrados.slice(0, 10).map(producto => {
                          const stock = obtenerStockDisponible(producto._id);
                          return (
                            <button
                              key={producto._id}
                              onClick={() => agregarProducto(producto._id)}
                              disabled={stock === 0}
                              className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{producto.nombre}</span>
                                <span className={`text-sm ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Stock: {stock}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de Productos Seleccionados */}
                {productosSeleccionados.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Productos a Transferir ({productosSeleccionados.length})
                    </h3>
                    <div className="space-y-2">
                      {productosSeleccionados.map(item => {
                        const producto = obtenerProductoPorId(item.productoId);
                        const stockDisponible = obtenerStockDisponible(item.productoId);
                        
                        return (
                          <div key={item.productoId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{producto?.nombre}</div>
                              <div className="text-sm text-gray-500">
                                Disponible: {stockDisponible}
                              </div>
                            </div>
                            <input
                              type="number"
                              min="1"
                              max={stockDisponible}
                              value={item.cantidad}
                              onChange={(e) => actualizarCantidad(item.productoId, parseInt(e.target.value) || 1)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => eliminarProducto(item.productoId)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-900">
                        Total: {productosSeleccionados.reduce((sum, item) => sum + item.cantidad, 0)} unidades
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Información adicional sobre la transferencia..."
                  />
                </div>

                {/* Botones de Acción */}
                {productosSeleccionados.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => crearTransferencia(false)}
                      disabled={loading}
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Crear Pendiente
                    </button>
                    <button
                      onClick={() => crearTransferencia(true)}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Ejecutar Ahora
                    </button>
                  </div>
                )}
              </>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            t.estado === 'completada' ? 'bg-green-100 text-green-800' :
                            t.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {t.estado.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(t.fechaCreacion).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <div className="text-lg font-semibold">
                          {t.sucursalOrigenNombre} → {t.sucursalDestinoNombre}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t.totalItems} productos • {t.totalCantidad} unidades
                        </div>
                        <div className="text-sm text-gray-500">
                          Creado por: {t.creadoPorNombre}
                        </div>
                      </div>

                      {t.estado === 'pendiente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprobarTransferencia(t._id)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => cancelarTransferencia(t._id)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Detalles de Items */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                        Ver detalles de productos
                      </summary>
                      <div className="mt-2 space-y-1">
                        {t.items.map((item, idx) => (
                          <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                            <span className="font-medium">{item.nombreProducto}</span>
                            <span className="text-gray-600"> - Cantidad: {item.cantidad}</span>
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
