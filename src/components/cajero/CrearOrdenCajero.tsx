'use client';

import { useEffect, useState, useRef } from 'react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastHelpers';
import SelectorPesoKg from '@/components/SelectorPesoKg';

interface ProductoOrden {
  productoId: string;
  nombre: string;
  codigoBarras?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  imagen?: string;
  unidadMedida?: string;
  gramos?: number;
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
  codigoBarras?: string;
  precio: number;
  stock: number;
  imagen: string | null;
  unidadMedida?: string;
}

export default function CrearOrdenCajero() {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Estados para búsqueda por nombre
  const [busqueda, setBusqueda] = useState('');
  const [productosBusqueda, setProductosBusqueda] = useState<ProductoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados para selector de peso (productos por kg)
  const [mostrarSelectorPeso, setMostrarSelectorPeso] = useState(false);
  const [productoParaPeso, setProductoParaPeso] = useState<{
    _id: string;
    nombre: string;
    precio: number;
    codigoBarras?: string;
    imagen?: string | null;
  } | null>(null);

  useEffect(() => {
    // Verificar si hay un parámetro de edición en la URL
    const params = new URLSearchParams(window.location.search);
    const ordenId = params.get('edit');
    
    if (ordenId) {
      cargarOrdenParaEditar(ordenId);
    } else {
      crearNuevaOrden();
    }
  }, []);

  // Auto-focus en el input
  useEffect(() => {
    if (inputRef.current && !procesando) {
      inputRef.current.focus();
    }
  }, [procesando, orden]);

  const cargarOrdenParaEditar = async (ordenId: string) => {
    setLoading(true);
    setModoEdicion(true);
    try {
      const response = await fetch(`/api/ordenes?ordenId=${ordenId}`);
      const data = await response.json();

      if (data.success && data.orden) {
        if (data.orden.estado !== 'pendiente_cobro' && data.orden.estado !== 'en_proceso') {
          showErrorToast('Solo se pueden editar órdenes en estado "Pendiente de Cobro" o "En Proceso"');
          window.location.href = '/dashboardCajero?tab=ordenes';
          return;
        }
        
        setOrden(data.orden);
        showInfoToast(`Editando orden #${data.orden.numeroOrden}`);
      } else {
        showErrorToast('No se pudo cargar la orden');
        window.location.href = '/dashboardCajero?tab=ordenes';
      }
    } catch (error) {
      showErrorToast('Error al cargar orden');
      window.location.href = '/dashboardCajero?tab=ordenes';
    } finally {
      setLoading(false);
    }
  };

  const crearNuevaOrden = async () => {
    setLoading(true);
    try {
      // Obtener sucursal desde localStorage del cajero
      const sucursalGuardada = localStorage.getItem('sucursalActivaCajero');
      const sucursalNombreGuardado = localStorage.getItem('sucursalActivaCajeroNombre');

      if (!sucursalGuardada) {
        showErrorToast('Por favor, selecciona una sucursal antes de crear una orden');
        setLoading(false);
        return;
      }

      const requestBody: any = { action: 'crear' };
      
      requestBody.sucursalId = sucursalGuardada;
      requestBody.sucursalNombre = sucursalNombreGuardado;

      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setOrden(data.orden);
        const mensaje = data.orden.sucursal 
          ? `Orden ${data.orden.numeroOrden} creada en ${data.orden.sucursal.nombre}`
          : `Orden ${data.orden.numeroOrden} creada`;
        showSuccessToast(mensaje);
      } else {
        showErrorToast(data.error || 'Error al crear orden');
      }
    } catch (error) {
      showErrorToast('Error al crear orden');
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
        // Si el producto requiere selección de peso (es por kg)
        if (data.requiereSeleccionPeso && data.producto) {
          setProductoParaPeso(data.producto);
          setMostrarSelectorPeso(true);
          setCodigoBarras('');
        } else {
          setOrden(data.orden);
          showSuccessToast(data.message);
          setCodigoBarras('');
        }
      } else {
        showErrorToast(data.error || 'Error al agregar producto');
      }
    } catch (error) {
      showErrorToast('Error al agregar producto');
    } finally {
      setProcesando(false);
    }
  };

  const handleCodigoBarrasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoBarras.trim()) {
      agregarProducto(codigoBarras);
    }
  };

  const buscarProductos = async (termino: string) => {
    if (termino.length < 2) {
      setProductosBusqueda([]);
      return;
    }

    setBuscando(true);
    try {
      const sucursalId = orden?.sucursal?.id || '';
      
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buscar_productos',
          busqueda: termino,
          sucursalId
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

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    buscarProductos(valor);
  };

  const agregarProductoPorId = async (productoId: string) => {
    if (!orden) return;

    setProcesando(true);
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
        // Si el producto requiere selección de peso (es por kg)
        if (data.requiereSeleccionPeso && data.producto) {
          setProductoParaPeso(data.producto);
          setMostrarSelectorPeso(true);
          setBusqueda('');
          setProductosBusqueda([]);
          setMostrarResultados(false);
        } else {
          setOrden(data.orden);
          showSuccessToast(data.message);
          setBusqueda('');
          setMostrarResultados(false);
          setProductosBusqueda([]);
        }
      } else {
        showErrorToast(data.error || 'Error al agregar producto');
      }
    } catch (error) {
      showErrorToast('Error al agregar producto');
    } finally {
      setProcesando(false);
    }
  };

  // Función para agregar producto por kg con gramos especificados
  const agregarProductoKg = async (gramos: number, subtotal: number) => {
    if (!orden || !productoParaPeso) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'agregar_producto_kg',
          ordenId: orden._id,
          productoId: productoParaPeso._id,
          gramos
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrden(data.orden);
        showSuccessToast(data.message);
        setMostrarSelectorPeso(false);
        setProductoParaPeso(null);
      } else {
        showErrorToast(data.error || 'Error al agregar producto');
      }
    } catch (error) {
      showErrorToast('Error al agregar producto');
    }
  };

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
        if (nuevaCantidad === 0) {
          showInfoToast('Producto eliminado');
        }
      } else {
        showErrorToast(data.error || 'Error al actualizar cantidad');
      }
    } catch (error) {
      showErrorToast('Error al actualizar cantidad');
    }
  };

  const enviarACaja = async () => {
    if (!orden) return;

    if (orden.productos.length === 0) {
      showErrorToast('Agrega al menos un producto antes de enviar a caja');
      return;
    }

    try {
      if (modoEdicion && orden.estado === 'pendiente_cobro') {
        // Si ya está en pendiente_cobro, solo guardar cambios
        showSuccessToast('Cambios guardados exitosamente');
        window.location.href = '/dashboardCajero?tab=ordenes';
      } else {
        // Cambiar estado a pendiente_cobro
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
          showSuccessToast(modoEdicion ? 'Orden actualizada exitosamente' : 'Orden enviada a caja exitosamente');
          window.location.href = '/dashboardCajero?tab=ordenes';
        } else {
          showErrorToast(data.error || 'Error al enviar a caja');
        }
      }
    } catch (error) {
      showErrorToast('Error al procesar la orden');
    }
  };

  const eliminarProducto = async (productoId: string) => {
    if (!orden) return;

    const confirmar = confirm('¿Deseas eliminar este producto de la orden?');
    if (!confirmar) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eliminar_producto',
          ordenId: orden._id,
          productoId
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrden(data.orden);
        showSuccessToast('Producto eliminado');
      } else {
        showErrorToast(data.error || 'Error al eliminar producto');
      }
    } catch (error) {
      showErrorToast('Error al eliminar producto');
    }
  };

  const cancelarOrden = async () => {
    if (!orden) return;

    const confirmar = confirm('¿Estás seguro de cancelar esta orden?');
    if (!confirmar) return;

    try {
      const response = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eliminar',
          ordenId: orden._id
        })
      });

      const data = await response.json();

      if (data.success) {
        showInfoToast('Orden cancelada');
        window.location.href = '/dashboardCajero?tab=ordenes';
      } else {
        showErrorToast(data.error || 'Error al cancelar orden');
      }
    } catch (error) {
      showErrorToast('Error al cancelar orden');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-secondary font-semibold animate-pulse">Creando orden...</div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="bg-white dark:bg-dark-700 rounded-lg p-8 text-center border border-dark-200 dark:border-dark-600">
        <p className="text-dark-500 dark:text-dark-400">Error al crear la orden</p>
        <button
          onClick={crearNuevaOrden}
          className="mt-4 bg-secondary hover:bg-secondary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-secondary">
          {modoEdicion ? '✏️ Editar Orden' : 'Crear Nueva Orden'}
        </h2>
        <p className="text-dark-600 dark:text-dark-400 mt-1">
          Orden #{orden.numeroOrden} {orden.sucursal && `- ${orden.sucursal.nombre}`}
          {modoEdicion && (
            <span className="ml-2 px-2 py-1 bg-warning/20 text-warning text-xs font-semibold rounded">
              MODO EDICIÓN
            </span>
          )}
        </p>
      </div>

      {/* Escaneo de código de barras */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-6 shadow-md border border-dark-200 dark:border-dark-600">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-light-500 mb-4">
          📦 Escanear Código de Barras
        </h3>
        <form onSubmit={handleCodigoBarrasSubmit} className="flex flex-col md:flex-row gap-3">
          <input
            ref={inputRef}
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            placeholder="Escanea o ingresa código de barras..."
            className="flex-1 px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={procesando}
          />
          <button
            type="submit"
            disabled={procesando || !codigoBarras.trim()}
            className="bg-secondary hover:bg-secondary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Búsqueda por nombre */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-6 shadow-md border border-dark-200 dark:border-dark-600">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-light-500 mb-4">
          🔍 Buscar por Nombre
        </h3>
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={handleBusquedaChange}
            placeholder="Buscar producto por nombre..."
            className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={procesando}
          />
          {buscando && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Resultados de búsqueda */}
          {mostrarResultados && productosBusqueda.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              {productosBusqueda.map((producto) => (
                <button
                  key={producto._id}
                  onClick={() => agregarProductoPorId(producto._id)}
                  className="w-full p-4 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-left border-b border-dark-200 dark:border-dark-600 last:border-b-0"
                  disabled={procesando}
                >
                  <div className="flex items-center gap-3">
                    {producto.imagen && (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-dark-900 dark:text-light-500">
                        {producto.nombre}
                      </div>
                      <div className="text-sm text-dark-600 dark:text-dark-400">
                        {producto.codigoBarras && `Código: ${producto.codigoBarras} | `}
                        Stock: {producto.stock} | ${producto.precio.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {mostrarResultados && productosBusqueda.length === 0 && busqueda.length >= 2 && !buscando && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 rounded-lg shadow-xl p-4 text-center text-dark-500 dark:text-dark-400">
              No se encontraron productos
            </div>
          )}
        </div>
      </div>

      {/* Lista de productos en la orden */}
      <div className="bg-white dark:bg-dark-700 rounded-lg p-6 shadow-md border border-dark-200 dark:border-dark-600">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-light-500 mb-4">
          🛒 Productos en la Orden ({orden.productos.length})
        </h3>

        {orden.productos.length === 0 ? (
          <div className="text-center py-8 text-dark-500 dark:text-dark-400">
            No hay productos en la orden. Escanea o busca productos para agregar.
          </div>
        ) : (
          <div className="space-y-3">
            {orden.productos.map((producto, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-dark-50 dark:bg-dark-800 rounded-lg"
              >
                {producto.imagen && (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-dark-900 dark:text-light-500">
                    {producto.nombre}
                    {producto.unidadMedida === 'kg' && producto.gramos && (
                      <span className="ml-2 text-sm bg-secondary/20 text-secondary px-2 py-1 rounded">
                        {producto.gramos}gr
                      </span>
                    )}
                  </div>
                  {producto.codigoBarras && (
                    <div className="text-xs text-dark-500 dark:text-dark-400">
                      Código: {producto.codigoBarras}
                    </div>
                  )}
                  <div className="text-sm text-dark-600 dark:text-dark-400">
                    {producto.unidadMedida === 'kg' && producto.gramos
                      ? `$${producto.precio.toFixed(2)} por ${producto.gramos}gr`
                      : `$${producto.precio.toFixed(2)} c/u`
                    }
                  </div>
                </div>
                {producto.unidadMedida === 'kg' ? (
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-dark-600 dark:text-dark-400 italic">
                      Cant: {producto.cantidad}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarCantidad(producto.productoId, producto.cantidad - 1)}
                      className="bg-error-light hover:bg-error-dark text-white w-8 h-8 rounded-full font-bold transition-all"
                    >
                      -
                    </button>
                    <span className="font-bold text-dark-900 dark:text-light-500 min-w-8 text-center">
                      {producto.cantidad}
                    </span>
                    <button
                      onClick={() => actualizarCantidad(producto.productoId, producto.cantidad + 1)}
                      className="bg-success-light hover:bg-success-dark text-white w-8 h-8 rounded-full font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                )}
                <div className="text-right flex items-center gap-3">
                  <div className="font-bold text-lg text-secondary">
                    ${producto.subtotal.toFixed(2)}
                  </div>
                  <button
                    onClick={() => eliminarProducto(producto.productoId)}
                    className="bg-error-light hover:bg-error-dark text-white w-8 h-8 rounded-full font-bold transition-all flex items-center justify-center"
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {orden.productos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-dark-300 dark:border-dark-600">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-dark-900 dark:text-light-500">Total:</span>
              <span className="text-3xl font-bold text-secondary">
                ${orden.total.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={enviarACaja}
          disabled={orden.productos.length === 0}
          className="flex-1 bg-success-light hover:bg-success-dark text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {modoEdicion ? '💾 Guardar Cambios' : '✅ Enviar a Caja'}
        </button>
        {modoEdicion && (
          <button
            onClick={() => window.location.href = '/dashboardCajero?tab=ordenes'}
            className="bg-dark-400 hover:bg-dark-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            ← Volver sin Guardar
          </button>
        )}
        <button
          onClick={cancelarOrden}
          className="bg-error-light hover:bg-error-dark text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          {modoEdicion ? '🗑️ Eliminar Orden' : '❌ Cancelar Orden'}
        </button>
      </div>

      {/* Selector de peso para productos por kg */}
      {mostrarSelectorPeso && productoParaPeso && (
        <SelectorPesoKg
          precioKilo={productoParaPeso.precio}
          nombreProducto={productoParaPeso.nombre}
          onConfirm={agregarProductoKg}
          onCancel={() => {
            setMostrarSelectorPeso(false);
            setProductoParaPeso(null);
          }}
        />
      )}
    </div>
  );
}
