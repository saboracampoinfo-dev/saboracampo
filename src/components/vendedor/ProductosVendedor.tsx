'use client';

import { useEffect, useState } from 'react';
import { showErrorToast } from '@/utils/toastHelpers';

interface StockSucursal {
  sucursalId: string;
  sucursalNombre: string;
  cantidad: number;
  stockMinimo: number;
}

interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  subcategoria?: string;
  precio: number;
  precioPromocion?: number;
  stock: number;
  stockMinimo: number;
  stockPorSucursal: StockSucursal[];
  unidadMedida: 'kg' | 'unidad' | 'litro' | 'paquete' | 'caja';
  imagenes: string[];
  destacado: boolean;
  activo: boolean;
  sku?: string;
  codigoBarras?: string;
}

interface Sucursal {
  _id: string;
  nombre: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
  estado: string;
}

export default function ProductosVendedor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  useEffect(() => {
    fetchSucursales();
    fetchProducts();
  }, []);

  const fetchSucursales = async () => {
    try {
      const response = await fetch('/api/sucursales');
      const data = await response.json();
      if (data.success) {
        const sucursalesActivas = data.data.filter((s: Sucursal) => s.estado === 'activa');
        setSucursales(sucursalesActivas);
        // Seleccionar la primera sucursal por defecto
        if (sucursalesActivas.length > 0) {
          setSelectedSucursal(sucursalesActivas[0]._id);
        }
      }
    } catch (error) {
      showErrorToast('Error al cargar sucursales');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      showErrorToast('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    'Todas',
    'Lácteos',
    'Carnes',
    'Frutas y Verduras',
    'Panadería',
    'Bebidas',
    'Conservas',
    'Granos y Cereales',
    'Especias',
    'Otros'
  ];

  // Obtener stock de la sucursal seleccionada para un producto
  const getStockSucursal = (product: Product) => {
    if (!selectedSucursal) return null;
    return product.stockPorSucursal?.find(s => s.sucursalId === selectedSucursal);
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'Todas' || product.categoria === categoryFilter;
    
    // Filtro de stock crítico
    if (showCriticalOnly && selectedSucursal) {
      const stockSucursal = getStockSucursal(product);
      if (!stockSucursal || stockSucursal.cantidad > stockSucursal.stockMinimo) {
        return false;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock === 0) return { color: 'text-error-light', bg: 'bg-error-dark/10', text: 'Sin stock', icon: '❌' };
    if (stock < stockMinimo) return { color: 'text-warning', bg: 'bg-warning/10', text: 'Stock Crítico', icon: '⚠️' };
    return { color: 'text-success-light', bg: 'bg-success-dark/10', text: 'Stock OK', icon: '✅' };
  };

  // Calcular estadísticas de la sucursal
  const sucursalStats = () => {
    if (!selectedSucursal) return { total: 0, critico: 0, sinStock: 0 };
    
    let critico = 0;
    let sinStock = 0;
    
    products.forEach(product => {
      const stockSucursal = getStockSucursal(product);
      if (stockSucursal) {
        if (stockSucursal.cantidad === 0) sinStock++;
        else if (stockSucursal.cantidad < stockSucursal.stockMinimo) critico++;
      }
    });
    
    return { total: products.length, critico, sinStock };
  };

  const stats = sucursalStats();
  const selectedSucursalData = sucursales.find(s => s._id === selectedSucursal);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-primary font-semibold animate-pulse">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">Inventario de Productos</h2>
        <p className="text-dark-600 dark:text-dark-400 mt-1">
          Consulta el stock de productos en tu sucursal
        </p>
      </div>

      {/* Selección de Sucursal */}
      <div className="bg-primary-50 dark:bg-primary-900 rounded-lg p-6 mb-6 shadow-md border-l-4 border-primary">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏢</span>
          <div>
            <h3 className="text-lg font-bold text-primary-900 dark:text-primary-200">
              Sucursal de Trabajo
            </h3>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Selecciona la sucursal donde estás trabajando
            </p>
          </div>
        </div>
        
        <select
          value={selectedSucursal}
          onChange={(e) => setSelectedSucursal(e.target.value)}
          className="w-full px-4 py-3 border-2 border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500 font-semibold text-lg"
        >
          <option value="">Seleccionar sucursal...</option>
          {sucursales.map(sucursal => (
            <option key={sucursal._id} value={sucursal._id}>
              {sucursal.nombre} - {sucursal.direccion.calle} {sucursal.direccion.numero}, {sucursal.direccion.ciudad}
            </option>
          ))}
        </select>

        {selectedSucursalData && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-dark-700 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-dark-600 dark:text-dark-400">Productos</div>
            </div>
            <div className="bg-warning/10 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-warning">{stats.critico}</div>
              <div className="text-xs text-dark-600 dark:text-dark-400">Stock Crítico</div>
            </div>
            <div className="bg-error-dark/10 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-error-light">{stats.sinStock}</div>
              <div className="text-xs text-dark-600 dark:text-dark-400">Sin Stock</div>
            </div>
          </div>
        )}
      </div>

      {!selectedSucursal ? (
        <div className="bg-white dark:bg-dark-700 rounded-lg p-12 text-center border border-dark-200 dark:border-dark-600">
          <span className="text-6xl mb-4 block">🏢</span>
          <p className="text-xl text-dark-600 dark:text-dark-400">
            Por favor, selecciona una sucursal para ver el inventario
          </p>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-white dark:bg-dark-700 rounded-lg p-4 mb-6 shadow-md border border-dark-200 dark:border-dark-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Buscar producto
            </label>
            <input
              type="text"
              placeholder="Nombre, categoría o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-800 text-dark-900 dark:text-light-500"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-dark-600 dark:text-dark-400">
                Mostrando {filteredProducts.length} de {products.length} productos
              </div>
              
              <button
                onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  showCriticalOnly
                    ? 'bg-warning text-white shadow-md'
                    : 'bg-dark-100 dark:bg-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-500'
                }`}
              >
                {showCriticalOnly ? '⚠️ Mostrando críticos' : '👁️ Ver solo críticos'}
              </button>
            </div>
          </div>

          {/* Listado de Productos */}
          <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md border border-dark-200 dark:border-dark-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Imagen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Stock Sucursal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-600">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-dark-500 dark:text-dark-400">
                        {showCriticalOnly 
                          ? '✅ No hay productos con stock crítico en esta sucursal'
                          : 'No se encontraron productos'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockSucursal = getStockSucursal(product);
                      if (!stockSucursal) return null;
                      
                      const status = getStockStatus(stockSucursal.cantidad, stockSucursal.stockMinimo);
                      return (
                        <tr 
                          key={product._id} 
                          className={`hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors ${
                            stockSucursal.cantidad <= stockSucursal.stockMinimo ? 'bg-warning/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="relative">
                              {product.imagenes && product.imagenes.length > 0 ? (
                                <img
                                  src={product.imagenes[0]}
                                  alt={product.nombre}
                                  className="w-16 h-16 object-cover rounded-lg border border-dark-300 dark:border-dark-600"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-dark-200 dark:bg-dark-600 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📦</span>
                                </div>
                              )}
                              {stockSucursal.cantidad < stockSucursal.stockMinimo && (
                                <span className="absolute -top-1 -right-1 text-xl">⚠️</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-semibold text-dark-900 dark:text-light-500">
                                {product.nombre}
                              </div>
                              {product.sku && (
                                <div className="text-sm text-dark-500 dark:text-dark-400">
                                  SKU: {product.sku}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-800 text-primary dark:text-primary-400 rounded-full text-xs font-medium">
                              {product.categoria}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-dark-900 dark:text-light-500">
                              ${product.precio.toFixed(2)}
                            </div>
                            {product.precioPromocion && product.precioPromocion > 0 && (
                              <div className="text-sm text-secondary">
                                Promo: ${product.precioPromocion.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-lg text-dark-900 dark:text-light-500">
                              {stockSucursal.cantidad} {product.unidadMedida}
                            </div>
                            <div className="text-xs text-dark-500 dark:text-dark-400">
                              Mínimo: {stockSucursal.stockMinimo}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 ${status.bg} ${status.color} rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                              <span>{status.icon}</span>
                              <span>{status.text}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="bg-primary hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300"
                            >
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalle */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Detalle del Producto</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white hover:text-dark-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imagen */}
                <div>
                  {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 ? (
                    <img
                      src={selectedProduct.imagenes[0]}
                      alt={selectedProduct.nombre}
                      className="w-full h-64 object-cover rounded-lg border border-dark-300 dark:border-dark-600"
                    />
                  ) : (
                    <div className="w-full h-64 bg-dark-200 dark:bg-dark-600 rounded-lg flex items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-dark-900 dark:text-light-500">
                      {selectedProduct.nombre}
                    </h4>
                    {selectedProduct.descripcion && (
                      <p className="text-dark-600 dark:text-dark-400 mt-2">
                        {selectedProduct.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                        Categoría
                      </span>
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-800 text-primary dark:text-primary-400 rounded-full text-xs font-medium">
                        {selectedProduct.categoria}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                        SKU
                      </span>
                      <span className="text-dark-900 dark:text-light-500">
                        {selectedProduct.sku || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                        Precio
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${selectedProduct.precio.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm font-semibold text-dark-500 dark:text-dark-400 mb-1">
                        Stock Total
                      </span>
                      <span className="text-lg font-bold text-dark-900 dark:text-light-500">
                        {selectedProduct.stock} {selectedProduct.unidadMedida}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock en Sucursal Actual */}
              {selectedSucursal && selectedProduct.stockPorSucursal && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-dark-900 dark:text-light-500 mb-4">
                    Stock en tu Sucursal
                  </h4>
                  {(() => {
                    const stockActual = selectedProduct.stockPorSucursal.find(s => s.sucursalId === selectedSucursal);
                    if (!stockActual) {
                      return (
                        <div className="bg-dark-50 dark:bg-dark-700 p-6 rounded-lg text-center border border-dark-200 dark:border-dark-600">
                          <p className="text-dark-600 dark:text-dark-400">
                            Este producto no está disponible en tu sucursal
                          </p>
                        </div>
                      );
                    }
                    
                    const status = getStockStatus(stockActual.cantidad, stockActual.stockMinimo);
                    return (
                      <div className={`p-6 rounded-lg border-2 ${
                        stockActual.cantidad === 0 ? 'border-error-light bg-error-dark/10' :
                        stockActual.cantidad <= stockActual.stockMinimo ? 'border-warning bg-warning/10' :
                        'border-success-light bg-success-dark/10'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-xl font-bold text-dark-900 dark:text-light-500">
                            {stockActual.sucursalNombre}
                          </h5>
                          <span className="text-4xl">{status.icon}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-dark-800 p-4 rounded-lg">
                            <p className="text-sm text-dark-600 dark:text-dark-400 mb-1">Stock Disponible</p>
                            <p className="text-3xl font-bold text-dark-900 dark:text-light-500">
                              {stockActual.cantidad}
                            </p>
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                              {selectedProduct.unidadMedida}
                            </p>
                          </div>
                          
                          <div className="bg-white dark:bg-dark-800 p-4 rounded-lg">
                            <p className="text-sm text-dark-600 dark:text-dark-400 mb-1">Stock Mínimo</p>
                            <p className="text-3xl font-bold text-warning">
                              {stockActual.stockMinimo}
                            </p>
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                              {selectedProduct.unidadMedida}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <span className={`px-4 py-2 ${status.bg} ${status.color} rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
                            <span>{status.icon}</span>
                            <span>{status.text}</span>
                          </span>
                        </div>
                        
                        {stockActual.cantidad <= stockActual.stockMinimo && stockActual.cantidad > 0 && (
                          <div className="mt-4 p-3 bg-warning/20 rounded-lg border border-warning">
                            <p className="text-sm font-semibold text-warning">
                              ⚠️ Atención: Este producto está en nivel crítico. Considera solicitar más stock.
                            </p>
                          </div>
                        )}
                        
                        {stockActual.cantidad === 0 && (
                          <div className="mt-4 p-3 bg-error-dark/20 rounded-lg border border-error-light">
                            <p className="text-sm font-semibold text-error-light">
                              ❌ Sin stock disponible. Solicita reposición urgente.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Stock en Otras Sucursales */}
              {selectedProduct.stockPorSucursal && selectedProduct.stockPorSucursal.length > 1 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-dark-900 dark:text-light-500 mb-4">
                    Stock en Otras Sucursales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProduct.stockPorSucursal
                      .filter(stock => stock.sucursalId !== selectedSucursal)
                      .map((stock) => {
                        const status = getStockStatus(stock.cantidad, stock.stockMinimo);
                        return (
                          <div
                            key={stock.sucursalId}
                            className="bg-dark-50 dark:bg-dark-700 p-4 rounded-lg border border-dark-200 dark:border-dark-600"
                          >
                            <h5 className="font-semibold text-dark-900 dark:text-light-500 mb-2">
                              {stock.sucursalNombre}
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-dark-600 dark:text-dark-400">Cantidad:</span>
                                <span className="font-semibold text-dark-900 dark:text-light-500">
                                  {stock.cantidad} {selectedProduct.unidadMedida}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-dark-600 dark:text-dark-400">Mínimo:</span>
                                <span className="text-dark-900 dark:text-light-500">
                                  {stock.stockMinimo}
                                </span>
                              </div>
                              <div className="mt-2">
                                <span className={`px-2 py-1 ${status.bg} ${status.color} rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
                                  <span>{status.icon}</span>
                                  <span>{status.text}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-dark-50 dark:bg-dark-700 px-6 py-4 flex justify-end border-t border-dark-200 dark:border-dark-600">
              <button
                onClick={() => setSelectedProduct(null)}
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
