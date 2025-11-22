'use client';

import { useEffect, useState, useRef } from 'react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastHelpers';
import BarcodeScanner from '@/components/BarcodeScanner';

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
  sucursal?: {
    id: string;
    nombre: string;
  };
  productos: ProductoOrden[];
  total: number;
  estado: string;
  fechaCreacion: string;
}

interface ProductoBusqueda {
  _id: string;
  nombre: string;
  codigoBarras: string;
  precio: number;
  stock: number;
  imagen: string | null;
}

interface EditarOrdenProps {
  ordenId: string;
}

export default function EditarOrden({ ordenId }: EditarOrdenProps) {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  
  // Estados para búsqueda por nombre
  const [busqueda, setBusqueda] = useState('');
  const [productosBusqueda, setProductosBusqueda] = useState<ProductoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  useEffect(() => {
    cargarOrden();
  }, [ordenId]);

  // Debug: ver datos de la orden
  useEffect(() => {
    if (orden) {
      console.log('Orden cargada:', orden);
      console.log('Sucursal:', orden.sucursal);
    }
  }, [orden]);



  const cargarOrden = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ordenes?ordenId=${ordenId}`);
      const data = await response.json();

      if (data.success && data.orden) {
        if (data.orden.estado !== 'en_proceso') {
          showErrorToast('Solo se pueden editar órdenes en proceso');
          window.location.href = '/dashboardVendedor?tab=ordenes';
          return;
        }
        setOrden(data.orden);
      } else {
        showErrorToast('Orden no encontrada');
        window.location.href = '/dashboardVendedor?tab=ordenes';
      }
    } catch (error) {
      showErrorToast('Error al cargar orden');
      window.location.href = '/dashboardVendedor?tab=ordenes';
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = async (codigo: string) => {
    if (!orden || !codigo.trim()) return;

    setProcesando(true);
    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'agregar_producto',
          ordenId: orden._id,
          codigoBarras: codigo.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrden(data.orden);
        showSuccessToast(data.message);
      } else {
        showErrorToast(data.error || 'Error al agregar producto');
      }
    } catch (error) {
      showErrorToast('Error al agregar producto');
    } finally {
      setProcesando(false);
    }
  };

  const handleScan = (codigo: string) => {
    agregarProducto(codigo);
  };

  const buscarProductos = async (termino: string) => {
    if (termino.trim().length < 2) {
      setProductosBusqueda([]);
      setMostrarResultados(false);
      return;
    }

    setBuscando(true);
    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buscar_productos',
          busqueda: termino,
          sucursalId: orden?.sucursal?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setProductosBusqueda(data.productos);
        setMostrarResultados(true);
      } else {
        setProductosBusqueda([]);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setProductosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  };

  const agregarProductoPorId = async (productoId: string) => {
    if (!orden) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'agregar_producto_por_id',
          ordenId: orden._id,
          productoId
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrden(data.orden);
        showSuccessToast(data.message);
        setBusqueda('');
        setProductosBusqueda([]);
        setMostrarResultados(false);
        
        // Reproducir sonido de éxito
        const audio = new Audio('data:audio/wav;base64,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') as any;
        audio.play().catch(() => {});
      } else {
        showErrorToast(data.error || 'Error al agregar producto');
      }
    } catch (error) {
      showErrorToast('Error al agregar producto');
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.trim().length >= 2) {
        buscarProductos(busqueda);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const actualizarCantidad = async (productoId: string, nuevaCantidad: number) => {
    if (!orden) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'actualizar_cantidad',
          ordenId: orden._id,
          productoId,
          cantidad: nuevaCantidad
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrden(data.orden);
        showSuccessToast('Cantidad actualizada');
      } else {
        showErrorToast(data.error || 'Error al actualizar cantidad');
      }
    } catch (error) {
      showErrorToast('Error al actualizar cantidad');
    }
  };

  const cerrarOrden = async () => {
    if (!orden) return;

    if (orden.productos.length === 0) {
      showErrorToast('Agrega al menos un producto antes de cerrar la orden');
      return;
    }

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar_estado',
          ordenId: orden._id,
          estado: 'pendiente_cobro'
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('Orden cerrada y enviada a caja');
        window.location.href = '/dashboardVendedor?tab=ordenes';
      } else {
        showErrorToast(data.error || 'Error al cerrar orden');
      }
    } catch (error) {
      showErrorToast('Error al cerrar orden');
    }
  };

  const volverAOrdenes = () => {
    window.location.href = '/dashboardVendedor?tab=ordenes';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-primary font-semibold animate-pulse">Cargando orden...</div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="bg-error-light/10 border border-error-light text-error-dark rounded-lg p-4">
        Error al cargar la orden. Por favor, intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button
        onClick={volverAOrdenes}
        className="bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
      >
        ← Volver a Mis Órdenes
      </button>

      {/* Header */}
      <div className="bg-linear-to-r from-primary to-primary-700 text-white rounded-lg p-2 md:p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-xl md:text-3xl font-bold">Editar Orden</h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">N° {orden.numeroOrden}</p>
              <p className="text-sm opacity-90">
                Vendedor: {orden.vendedor.nombre}
              </p>
              <p className="text-sm opacity-90">
                Fecha: {new Date(orden.fechaCreacion).toLocaleString('es-ES')}
              </p>
              <p className="text-sm opacity-90 bg-warning/30 py-1 px-2 rounded inline-block">
                Estado: En Proceso
              </p>
              {orden.sucursal && orden.sucursal.nombre ? (
                <p className="text-sm opacity-90 bg-white/20 py-1 px-2 rounded inline-block ml-2">
                  📍 Sucursal: {orden.sucursal.nombre}
                </p>
              ) : (
                <p className="text-sm opacity-90 bg-error-light/30 py-1 px-2 rounded inline-block ml-2">
                  ⚠️ Sin sucursal asignada
                </p>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm opacity-90 mb-1">Total</div>
            <div className="text-4xl font-bold">${orden.total.toFixed(2)}</div>
            <div className="text-sm mt-1">
              {orden.productos.length} producto{orden.productos.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Métodos para agregar productos */}
      <div className="grid md:grid-cols-2 gap-2 md:gap-4">
        {/* Escáner de Código de Barras */}
        <div className="bg-white dark:bg-dark-700 rounded-lg p-2 md:p-6 shadow-md border border-dark-200 dark:border-dark-600">
          <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-4">
            🔍 Escanear Código de Barras
          </h3>
          <BarcodeScanner 
            onScan={handleScan} 
            disabled={procesando}
            placeholder="Escanea o escribe código de barras"
          />
        </div>

        {/* Búsqueda por nombre */}
        <div className="bg-white dark:bg-dark-700 rounded-lg p-2 md:p-6 shadow-md border border-dark-200 dark:border-dark-600 relative">
          <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-4">
            📝 Buscar por Nombre
          </h3>
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onFocus={() => busqueda.length >= 2 && setMostrarResultados(true)}
              placeholder="Buscar producto por nombre..."
              className="w-full px-2 md:px-4 py-3 border border-dark-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-800 dark:text-light-500 text-lg"
            />
            {buscando && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Resultados de búsqueda */}
            {mostrarResultados && productosBusqueda.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {productosBusqueda.map((producto) => (
                  <button
                    key={producto._id}
                    onClick={() => agregarProductoPorId(producto._id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors border-b border-dark-200 dark:border-dark-600 last:border-b-0"
                  >
                    {producto.imagen && (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-dark-900 dark:text-light-500">
                        {producto.nombre}
                      </div>
                      <div className="text-sm text-dark-600 dark:text-dark-400">
                        ${producto.precio.toFixed(2)} | Stock: {producto.stock}
                      </div>
                    </div>
                    <div className="text-primary font-bold">➕</div>
                  </button>
                ))}
              </div>
            )}

            {mostrarResultados && busqueda.length >= 2 && productosBusqueda.length === 0 && !buscando && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 rounded-lg shadow-lg p-4 text-center text-dark-500 dark:text-dark-400">
                No se encontraron productos
              </div>
            )}
          </div>
          <div className="mt-3 text-sm text-dark-600 dark:text-dark-400">
            💡 Escribe al menos 2 letras
          </div>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-2 md:p-6 shadow-md border border-dark-200 dark:border-dark-600">
        <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-4">
          🛒 Productos en la Orden
        </h3>

        {orden.productos.length === 0 ? (
          <div className="text-center py-8 text-dark-500 dark:text-dark-400">
            No hay productos agregados. Escanea un código de barras o busca por nombre.
          </div>
        ) : (
          <div className="space-y-3">
            {orden.productos.map((producto) => (
              <div
                key={producto.productoId}
                className="flex items-center gap-2 md:gap-4 p-2 md:p-4 bg-dark-50 dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-600"
              >
                {producto.imagen && (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-dark-900 dark:text-light-500">
                    {producto.nombre}
                  </div>
                  <div className="text-sm text-dark-600 dark:text-dark-400">
                    Código: {producto.codigoBarras}
                  </div>
                  <div className="text-sm text-primary font-semibold">
                    ${producto.precio.toFixed(2)} c/u
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => actualizarCantidad(producto.productoId, producto.cantidad - 1)}
                    className="w-8 h-8 bg-error-light hover:bg-error-dark text-white rounded-lg font-bold transition-all duration-300"
                  >
                    -
                  </button>
                  <div className="w-16 text-center font-bold text-lg">
                    {producto.cantidad}
                  </div>
                  <button
                    onClick={() => actualizarCantidad(producto.productoId, producto.cantidad + 1)}
                    className="w-8 h-8 bg-success-light hover:bg-success-dark text-white rounded-lg font-bold transition-all duration-300"
                  >
                    +
                  </button>
                </div>

                <div className="text-right w-24">
                  <div className="text-lg font-bold text-primary">
                    ${producto.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={volverAOrdenes}
          className="flex-1 bg-dark-400 hover:bg-red-500 text-white px-2 md:px-6 py-4 rounded-lg text-lg font-bold transition-all duration-300"
        >
          ← Volver sin Guardar
        </button>
        <button
          onClick={cerrarOrden}
          disabled={orden.productos.length === 0}
          className="flex-1 bg-success-light hover:bg-success-dark disabled:bg-dark-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg text-lg font-bold transition-all duration-300"
        >
          ✓ Cerrar Orden y Enviar a Caja
        </button>
      </div>

      {/* Instrucciones */}
      <div className="bg-warning/10 border border-warning rounded-lg p-2 md:p-4">
        <h4 className="font-bold text-warning mb-2">⚠️ Editando Orden en Proceso</h4>
        <ul className="space-y-1 text-sm text-dark-700 dark:text-dark-300">
          <li>• Agrega nuevos productos escaneando o buscando por nombre</li>
          <li>• Modifica las cantidades con los botones + / -</li>
          <li>• Los cambios se guardan automáticamente</li>
          <li>• Cierra la orden cuando termines para enviarla a caja</li>
        </ul>
      </div>
    </div>
  );
}
