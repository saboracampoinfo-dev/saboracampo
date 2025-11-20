'use client';

import { useEffect, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { confirmDelete } from '@/utils/alerts';
import UploadImage from './UploadImage';

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
  peso?: number;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
  };
  proveedor?: string;
  origen?: string;
  ingredientes?: string;
  valorNutricional?: string;
  fechaVencimiento?: string;
  etiquetas: string[];
  visitas: number;
  ventas: number;
  createdAt: string;
}

interface Sucursal {
  _id: string;
  nombre: string;
  estado: string;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMassiveEditOpen, setIsMassiveEditOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'basic' | 'details' | 'inventory'>('basic');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    precio: 0,
    precioPromocion: 0,
    stock: 0,
    stockMinimo: 5,
    stockPorSucursal: [] as StockSucursal[],
    unidadMedida: 'unidad' as 'kg' | 'unidad' | 'litro' | 'paquete' | 'caja',
    imagenes: [] as string[],
    imagenesInput: '',
    destacado: false,
    activo: true,
    sku: '',
    codigoBarras: '',
    peso: 0,
    dimensiones: {
      largo: 0,
      ancho: 0,
      alto: 0
    },
    proveedor: '',
    origen: '',
    ingredientes: '',
    valorNutricional: '',
    fechaVencimiento: '',
    etiquetas: [] as string[],
    etiquetasInput: ''
  });

  const [massiveEditData, setMassiveEditData] = useState({
    precio: '',
    precioPromocion: '',
    stock: '',
    stockMinimo: '',
    activo: '',
    destacado: '',
    categoria: '',
    descuento: ''
  });

  const categorias = [
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

  const unidadesMedida = ['kg', 'unidad', 'litro', 'paquete', 'caja'];

  useEffect(() => {
    fetchProducts();
    fetchSucursales();
  }, []);

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

  const fetchSucursales = async () => {
    try {
      const response = await fetch('/api/sucursales');
      const data = await response.json();
      if (data.success) {
        setSucursales(data.data.filter((s: Sucursal) => s.estado === 'activa'));
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setUploadedImages(product.imagenes);
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        categoria: product.categoria,
        subcategoria: product.subcategoria || '',
        precio: product.precio,
        precioPromocion: product.precioPromocion || 0,
        stock: product.stock,
        stockMinimo: product.stockMinimo,
        stockPorSucursal: product.stockPorSucursal || [],
        unidadMedida: product.unidadMedida,
        imagenes: product.imagenes,
        imagenesInput: product.imagenes.join(', '),
        destacado: product.destacado,
        activo: product.activo,
        sku: product.sku || '',
        codigoBarras: product.codigoBarras || '',
        peso: product.peso || 0,
        dimensiones: {
          largo: product.dimensiones?.largo || 0,
          ancho: product.dimensiones?.ancho || 0,
          alto: product.dimensiones?.alto || 0
        },
        proveedor: product.proveedor || '',
        origen: product.origen || '',
        ingredientes: product.ingredientes || '',
        valorNutricional: product.valorNutricional || '',
        fechaVencimiento: product.fechaVencimiento ? product.fechaVencimiento.split('T')[0] : '',
        etiquetas: product.etiquetas,
        etiquetasInput: product.etiquetas.join(', ')
      });
    } else {
      setEditingProduct(null);
      setUploadedImages([]);
      // Encontrar sucursal CENTRAL
      const sucursalCentral = sucursales.find(s => s.nombre.toUpperCase().includes('CENTRAL'));
      const stockInicial: StockSucursal[] = sucursalCentral ? [{
        sucursalId: sucursalCentral._id,
        sucursalNombre: sucursalCentral.nombre,
        cantidad: 0,
        stockMinimo: 5
      }] : [];
      
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: categorias[0],
        subcategoria: '',
        precio: 0,
        precioPromocion: 0,
        stock: 0,
        stockMinimo: 5,
        stockPorSucursal: stockInicial,
        unidadMedida: 'unidad',
        imagenes: [],
        imagenesInput: '',
        destacado: false,
        activo: true,
        sku: '',
        codigoBarras: '',
        peso: 0,
        dimensiones: { largo: 0, ancho: 0, alto: 0 },
        proveedor: '',
        origen: '',
        ingredientes: '',
        valorNutricional: '',
        fechaVencimiento: '',
        etiquetas: [],
        etiquetasInput: ''
      });
    }
    setCurrentTab('basic');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      // Usar imágenes subidas o del input manual
      const imagenes = uploadedImages.length > 0 ? uploadedImages : formData.imagenesInput
        .split(',')
        .map(img => img.trim())
        .filter(img => img.length > 0);

      const etiquetas = formData.etiquetasInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const submitData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || undefined,
        precio: formData.precio,
        precioPromocion: formData.precioPromocion || undefined,
        stock: formData.stock,
        stockMinimo: formData.stockMinimo,
        stockPorSucursal: formData.stockPorSucursal,
        unidadMedida: formData.unidadMedida,
        imagenes,
        destacado: formData.destacado,
        activo: formData.activo,
        sku: formData.sku || undefined,
        codigoBarras: formData.codigoBarras || undefined,
        peso: formData.peso || undefined,
        dimensiones: {
          largo: formData.dimensiones.largo || undefined,
          ancho: formData.dimensiones.ancho || undefined,
          alto: formData.dimensiones.alto || undefined
        },
        proveedor: formData.proveedor || undefined,
        origen: formData.origen || undefined,
        ingredientes: formData.ingredientes || undefined,
        valorNutricional: formData.valorNutricional || undefined,
        fechaVencimiento: formData.fechaVencimiento || undefined,
        etiquetas
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(editingProduct ? 'Producto actualizado' : 'Producto creado');
        fetchProducts();
        handleCloseModal();
      } else {
        showErrorToast(data.error || 'Error al guardar producto');
      }
    } catch (error) {
      showErrorToast('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete('¿Eliminar este producto?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        showSuccessToast('Producto eliminado');
        fetchProducts();
      } else {
        showErrorToast(data.error || 'Error al eliminar producto');
      }
    } catch (error) {
      showErrorToast('Error al eliminar producto');
    }
  };

  const toggleActivo = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, activo: !product.activo })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(`Producto ${!product.activo ? 'activado' : 'desactivado'}`);
        fetchProducts();
      }
    } catch (error) {
      showErrorToast('Error al actualizar producto');
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleMassiveEdit = async () => {
    if (selectedProducts.length === 0) {
      showErrorToast('Selecciona al menos un producto');
      return;
    }

    try {
      const updates: any = {};
      
      if (massiveEditData.precio) updates.precio = parseFloat(massiveEditData.precio);
      if (massiveEditData.precioPromocion) updates.precioPromocion = parseFloat(massiveEditData.precioPromocion);
      if (massiveEditData.stock) updates.stock = parseInt(massiveEditData.stock);
      if (massiveEditData.stockMinimo) updates.stockMinimo = parseInt(massiveEditData.stockMinimo);
      if (massiveEditData.activo !== '') updates.activo = massiveEditData.activo === 'true';
      if (massiveEditData.destacado !== '') updates.destacado = massiveEditData.destacado === 'true';
      if (massiveEditData.categoria) updates.categoria = massiveEditData.categoria;
      
      // Aplicar descuento porcentual
      if (massiveEditData.descuento) {
        const descuento = parseFloat(massiveEditData.descuento);
        updates.descuentoPorcentual = descuento;
      }

      const promises = selectedProducts.map(id => {
        const product = products.find(p => p._id === id);
        if (!product) return Promise.resolve();

        let finalUpdates = { ...updates };
        
        // Si hay descuento, calcular precio promoción
        if (massiveEditData.descuento) {
          const descuento = parseFloat(massiveEditData.descuento);
          finalUpdates.precioPromocion = product.precio * (1 - descuento / 100);
        }

        return fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, ...finalUpdates })
        });
      });

      await Promise.all(promises);
      
      showSuccessToast(`${selectedProducts.length} productos actualizados`);
      fetchProducts();
      setSelectedProducts([]);
      setIsMassiveEditOpen(false);
      setMassiveEditData({
        precio: '',
        precioPromocion: '',
        stock: '',
        stockMinimo: '',
        activo: '',
        destacado: '',
        categoria: '',
        descuento: ''
      });
    } catch (error) {
      showErrorToast('Error en la actualización masiva');
    }
  };

  // Manejar imágenes subidas (el componente UploadImage maneja esto internamente)
  const handleRemoveImage = (url: string) => {
    setUploadedImages(prev => prev.filter(img => img !== url));
  };

  // Modal de transferencia
  const handleOpenTransferModal = (product: Product) => {
    setTransferProduct(product);
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferProduct(null);
  };

  const [transferData, setTransferData] = useState({
    origenSucursalId: '',
    destinoSucursalId: '',
    cantidad: 0,
  });

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferProduct) return;

    try {
      const destinoSucursal = sucursales.find(s => s._id === transferData.destinoSucursalId);
      
      const response = await fetch('/api/products/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies de autenticación
        body: JSON.stringify({
          productoId: transferProduct._id,
          origenSucursalId: transferData.origenSucursalId,
          destinoSucursalId: transferData.destinoSucursalId,
          destinoSucursalNombre: destinoSucursal?.nombre,
          cantidad: transferData.cantidad,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessToast(data.message || 'Transferencia realizada');
        fetchProducts();
        handleCloseTransferModal();
        setTransferData({ origenSucursalId: '', destinoSucursalId: '', cantidad: 0 });
      } else if (response.status === 401) {
        showErrorToast('No estás autenticado. Por favor, inicia sesión nuevamente.');
      } else if (response.status === 403) {
        showErrorToast('No tienes permisos para realizar transferencias.');
      } else {
        showErrorToast(data.error || 'Error en la transferencia');
      }
    } catch (error) {
      console.error('Error al transferir stock:', error);
      showErrorToast('Error al transferir stock. Verifica tu conexión.');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-primary">Cargando productos...</div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 px-1 md:px-0">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-light-500">Gestión de Productos</h2>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setIsMassiveEditOpen(true)}
              className="bg-warning hover:bg-warning-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              ✏️ Editar {selectedProducts.length} seleccionados
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="bg-secondary hover:bg-secondary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-surface dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border border-dark-200 dark:border-dark-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-100 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-secondary bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600 rounded focus:ring-secondary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-700 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-dark-600 dark:hover:bg-dark-600 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      className="w-4 h-4 text-secondary bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600 rounded focus:ring-secondary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.imagenes[0] && (
                        <img
                          src={product.imagenes[0]}
                          alt={product.nombre}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-dark-900 dark:text-light-500">
                          {product.nombre}
                          {product.destacado && <span className="ml-2 text-warning">⭐</span>}
                        </div>
                        <div className="text-xs text-dark-500 dark:text-dark-400 truncate max-w-xs">{product.descripcion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    {product.categoria}
                    {product.subcategoria && <div className="text-xs text-dark-500">{product.subcategoria}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-semibold text-secondary-700 dark:text-secondary-400">
                      ${product.precio.toFixed(2)}
                    </div>
                    {product.precioPromocion && product.precioPromocion < product.precio && (
                      <div className="text-xs text-success-600 dark:text-success-400">
                        ${product.precioPromocion.toFixed(2)} ↓
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">
                    <span className={product.stock <= product.stockMinimo ? 'text-error font-semibold' : ''}>
                      {product.stock} {product.unidadMedida}
                    </span>
                    <div className="text-xs text-dark-500">Min: {product.stockMinimo}</div>
                    {product.stockPorSucursal && product.stockPorSucursal.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {product.stockPorSucursal.map((stockSuc: StockSucursal) => (
                          <div key={stockSuc.sucursalId} className="text-xs">
                            <span className={stockSuc.cantidad <= stockSuc.stockMinimo ? 'text-error font-semibold' : 'text-dark-500'}>
                              {stockSuc.sucursalNombre}: {stockSuc.cantidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-dark-500 dark:text-dark-400">
                    {product.sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActivo(product)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                        product.activo 
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 hover:bg-success-200' 
                          : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200 hover:bg-error-200'
                      }`}
                    >
                      {product.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenTransferModal(product)}
                      className="text-warning hover:text-warning-700 font-semibold transition-colors cursor-pointer text-yellow-500"
                      title="Transferir stock"
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-secondary hover:text-green-700 font-semibold transition-colors cursor-pointer text-green-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-error hover:text-error-dark font-semibold transition-colors cursor-pointer text-red-500"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 text-dark-600 dark:text-dark-400">
            No hay productos registrados
          </div>
        )}
      </div>

      {/* Modal Edición Individual */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-dark-200 dark:border-dark-700">
              <button
                onClick={() => setCurrentTab('basic')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  currentTab === 'basic'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-dark-600 dark:text-dark-400 hover:text-secondary'
                }`}
              >
                Básico
              </button>
              <button
                onClick={() => setCurrentTab('details')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  currentTab === 'details'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-dark-600 dark:text-dark-400 hover:text-secondary'
                }`}
              >
                Detalles
              </button>
              <button
                onClick={() => setCurrentTab('inventory')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  currentTab === 'inventory'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-dark-600 dark:text-dark-400 hover:text-secondary'
                }`}
              >
                Inventario
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tab Básico */}
              {currentTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Categoría *</label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                        required
                      >
                        {categorias.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Subcategoría</label>
                      <input
                        type="text"
                        value={formData.subcategoria}
                        onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Precio *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Precio Promoción</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precioPromocion}
                        onChange={(e) => setFormData({ ...formData, precioPromocion: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Imágenes del Producto</label>
                    
                    {/* Componente de subida de imágenes */}
                    <div className="mb-3">
                      <UploadImage 
                        imagenes={uploadedImages}
                        updateImages={setUploadedImages}
                        handleRemoveImage={handleRemoveImage}
                      />
                    </div>

                    {/* Opción de ingresar URLs manualmente */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">
                        O ingresa URLs manualmente (separadas por comas)
                      </label>
                      <textarea
                        value={formData.imagenesInput}
                        onChange={(e) => setFormData({ ...formData, imagenesInput: e.target.value })}
                        rows={2}
                        placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Etiquetas (separadas por comas)</label>
                    <input
                      type="text"
                      value={formData.etiquetasInput}
                      onChange={(e) => setFormData({ ...formData, etiquetasInput: e.target.value })}
                      placeholder="orgánico, fresco, promoción"
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.destacado}
                        onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                        className="w-4 h-4 text-secondary bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600 rounded focus:ring-secondary"
                      />
                      <span className="ml-2 text-sm font-medium text-dark-700 dark:text-dark-300">
                        Producto destacado
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 text-secondary bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600 rounded focus:ring-secondary"
                      />
                      <span className="ml-2 text-sm font-medium text-dark-700 dark:text-dark-300">
                        Producto activo
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab Detalles */}
              {currentTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Código de Barras</label>
                      <input
                        type="text"
                        value={formData.codigoBarras}
                        onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Proveedor</label>
                      <input
                        type="text"
                        value={formData.proveedor}
                        onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Origen</label>
                      <input
                        type="text"
                        value={formData.origen}
                        onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Dimensiones (cm)</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.dimensiones.largo}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          dimensiones: { ...formData.dimensiones, largo: parseFloat(e.target.value) }
                        })}
                        placeholder="Largo"
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.dimensiones.ancho}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          dimensiones: { ...formData.dimensiones, ancho: parseFloat(e.target.value) }
                        })}
                        placeholder="Ancho"
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.dimensiones.alto}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          dimensiones: { ...formData.dimensiones, alto: parseFloat(e.target.value) }
                        })}
                        placeholder="Alto"
                        className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Ingredientes</label>
                    <textarea
                      value={formData.ingredientes}
                      onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Valor Nutricional</label>
                    <textarea
                      value={formData.valorNutricional}
                      onChange={(e) => setFormData({ ...formData, valorNutricional: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={formData.fechaVencimiento}
                      onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>
              )}

              {/* Tab Inventario */}
              {currentTab === 'inventory' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Unidad de Medida *</label>
                    <select
                      value={formData.unidadMedida}
                      onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value as any })}
                      className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                      required
                    >
                      {unidadesMedida.map((unidad) => (
                        <option key={unidad} value={unidad}>{unidad}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-dark-200 dark:border-dark-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-dark-800 dark:text-light-400">Stock por Sucursal</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevaSucursal = sucursales.find(
                            s => !formData.stockPorSucursal.some(stock => stock.sucursalId === s._id)
                          );
                          if (nuevaSucursal) {
                            setFormData({
                              ...formData,
                              stockPorSucursal: [
                                ...formData.stockPorSucursal,
                                {
                                  sucursalId: nuevaSucursal._id,
                                  sucursalNombre: nuevaSucursal.nombre,
                                  cantidad: 0,
                                  stockMinimo: 5
                                }
                              ]
                            });
                          } else {
                            showErrorToast('No hay más sucursales disponibles');
                          }
                        }}
                        className="px-3 py-1 bg-secondary hover:bg-secondary-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        + Agregar Sucursal
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.stockPorSucursal.map((stockSuc, index) => (
                        <div key={stockSuc.sucursalId} className="bg-dark-50 dark:bg-dark-900 p-4 rounded-lg border border-dark-200 dark:border-dark-700">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium text-dark-800 dark:text-light-400">Sucursal {index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  stockPorSucursal: formData.stockPorSucursal.filter((_, i) => i !== index)
                                });
                              }}
                              className="text-error hover:text-error-dark text-sm font-semibold"
                            >
                              Eliminar
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-dark-600 dark:text-dark-400 mb-1">Sucursal *</label>
                              <select
                                value={stockSuc.sucursalId}
                                onChange={(e) => {
                                  const sucursal = sucursales.find(s => s._id === e.target.value);
                                  if (sucursal) {
                                    const newStockPorSucursal = [...formData.stockPorSucursal];
                                    newStockPorSucursal[index] = {
                                      ...newStockPorSucursal[index],
                                      sucursalId: sucursal._id,
                                      sucursalNombre: sucursal.nombre
                                    };
                                    setFormData({ ...formData, stockPorSucursal: newStockPorSucursal });
                                  }
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                                required
                              >
                                {sucursales.map((sucursal) => (
                                  <option 
                                    key={sucursal._id} 
                                    value={sucursal._id}
                                    disabled={formData.stockPorSucursal.some((s, i) => i !== index && s.sucursalId === sucursal._id)}
                                  >
                                    {sucursal.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-dark-600 dark:text-dark-400 mb-1">Cantidad *</label>
                              <input
                                type="number"
                                min="0"
                                value={stockSuc.cantidad}
                                onChange={(e) => {
                                  const newStockPorSucursal = [...formData.stockPorSucursal];
                                  newStockPorSucursal[index] = {
                                    ...newStockPorSucursal[index],
                                    cantidad: parseInt(e.target.value) || 0
                                  };
                                  // Calcular stock total
                                  const stockTotal = newStockPorSucursal.reduce((sum, s) => sum + s.cantidad, 0);
                                  setFormData({ 
                                    ...formData, 
                                    stockPorSucursal: newStockPorSucursal,
                                    stock: stockTotal
                                  });
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-dark-600 dark:text-dark-400 mb-1">Stock Mínimo *</label>
                              <input
                                type="number"
                                min="0"
                                value={stockSuc.stockMinimo}
                                onChange={(e) => {
                                  const newStockPorSucursal = [...formData.stockPorSucursal];
                                  newStockPorSucursal[index] = {
                                    ...newStockPorSucursal[index],
                                    stockMinimo: parseInt(e.target.value) || 0
                                  };
                                  setFormData({ ...formData, stockPorSucursal: newStockPorSucursal });
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.stockPorSucursal.length === 0 && (
                        <div className="text-center py-6 text-dark-500 dark:text-dark-400">
                          No hay sucursales agregadas. Haz clic en "+ Agregar Sucursal" para comenzar.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-secondary-50 dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-800">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-200 mb-3">Resumen de Inventario</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-700 dark:text-secondary-300">Stock Total:</span>
                        <span className="font-bold text-lg text-secondary-900 dark:text-secondary-100">
                          {formData.stock} {formData.unidadMedida}
                        </span>
                      </div>
                      
                      {formData.stockPorSucursal.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                          <p className="text-xs font-medium text-secondary-600 dark:text-secondary-400 mb-2">Distribución:</p>
                          {formData.stockPorSucursal.map((stockSuc) => (
                            <div key={stockSuc.sucursalId} className="flex justify-between items-center text-xs py-1">
                              <span className="text-secondary-700 dark:text-secondary-300">
                                {stockSuc.sucursalNombre}:
                              </span>
                              <span className={`font-semibold ${
                                stockSuc.cantidad <= stockSuc.stockMinimo 
                                  ? 'text-error' 
                                  : 'text-success-600 dark:text-success-400'
                              }`}>
                                {stockSuc.cantidad} {formData.unidadMedida}
                                {stockSuc.cantidad <= stockSuc.stockMinimo && ' ⚠️'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-secondary-600 dark:text-secondary-400">
                        💡 El stock total se calcula automáticamente sumando las cantidades de todas las sucursales.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary hover:bg-secondary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edición Masiva */}
      {isMassiveEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Edición Masiva ({selectedProducts.length} productos)
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">
                Solo completa los campos que deseas modificar. Los campos vacíos no se actualizarán.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nuevo Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={massiveEditData.precio}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, precio: e.target.value })}
                    placeholder="Dejar vacío para no cambiar"
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={massiveEditData.descuento}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, descuento: e.target.value })}
                    placeholder="Ej: 20 para 20% descuento"
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Precio Promoción</label>
                  <input
                    type="number"
                    step="0.01"
                    value={massiveEditData.precioPromocion}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, precioPromocion: e.target.value })}
                    placeholder="Dejar vacío para no cambiar"
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Ajustar Stock</label>
                  <input
                    type="number"
                    value={massiveEditData.stock}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, stock: e.target.value })}
                    placeholder="Ej: +10 o -5"
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={massiveEditData.stockMinimo}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, stockMinimo: e.target.value })}
                    placeholder="Dejar vacío para no cambiar"
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Categoría</label>
                  <select
                    value={massiveEditData.categoria}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  >
                    <option value="">No cambiar</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Estado Activo</label>
                  <select
                    value={massiveEditData.activo}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, activo: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  >
                    <option value="">No cambiar</option>
                    <option value="true">Activar</option>
                    <option value="false">Desactivar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Destacado</label>
                  <select
                    value={massiveEditData.destacado}
                    onChange={(e) => setMassiveEditData({ ...massiveEditData, destacado: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-warning"
                  >
                    <option value="">No cambiar</option>
                    <option value="true">Marcar como destacado</option>
                    <option value="false">Quitar destacado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsMassiveEditOpen(false);
                    setMassiveEditData({
                      precio: '',
                      precioPromocion: '',
                      stock: '',
                      stockMinimo: '',
                      activo: '',
                      destacado: '',
                      categoria: '',
                      descuento: ''
                    });
                  }}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMassiveEdit}
                  className="px-4 py-2 bg-warning hover:bg-warning-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Aplicar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Transferencia de Stock */}
      {isTransferModalOpen && transferProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-light-500">
              Transferir Stock - {transferProduct.nombre}
            </h3>
            
            <form onSubmit={handleTransferStock} className="space-y-4">
              <div className="bg-dark-50 dark:bg-dark-900 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-dark-800 dark:text-light-400 mb-2">Stock Actual por Sucursal:</h4>
                {transferProduct.stockPorSucursal && transferProduct.stockPorSucursal.length > 0 ? (
                  <div className="space-y-2">
                    {transferProduct.stockPorSucursal.map((stock: StockSucursal) => (
                      <div key={stock.sucursalId} className="flex justify-between items-center">
                        <span className="text-dark-700 dark:text-dark-300">{stock.sucursalNombre}:</span>
                        <span className={`font-semibold ${stock.cantidad <= stock.stockMinimo ? 'text-error' : 'text-success-600'}`}>
                          {stock.cantidad} {transferProduct.unidadMedida}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-600 dark:text-dark-400">No hay stock distribuido por sucursales</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Sucursal Origen *
                  </label>
                  <select
                    value={transferData.origenSucursalId}
                    onChange={(e) => setTransferData({ ...transferData, origenSucursalId: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    required
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((sucursal) => (
                      <option 
                        key={sucursal._id} 
                        value={sucursal._id}
                        disabled={sucursal._id === transferData.destinoSucursalId}
                      >
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Sucursal Destino *
                  </label>
                  <select
                    value={transferData.destinoSucursalId}
                    onChange={(e) => setTransferData({ ...transferData, destinoSucursalId: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                    required
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((sucursal) => (
                      <option 
                        key={sucursal._id} 
                        value={sucursal._id}
                        disabled={sucursal._id === transferData.origenSucursalId}
                      >
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Cantidad a Transferir *
                </label>
                <input
                  type="number"
                  min="1"
                  value={transferData.cantidad}
                  onChange={(e) => setTransferData({ ...transferData, cantidad: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500 focus:ring-2 focus:ring-secondary"
                  required
                />
                {transferData.origenSucursalId && (
                  <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                    Disponible: {transferProduct.stockPorSucursal?.find(s => s.sucursalId === transferData.origenSucursalId)?.cantidad || 0} {transferProduct.unidadMedida}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={handleCloseTransferModal}
                  className="px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-red-500 dark:hover:bg-red-500 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-warning hover:bg-warning-700 text-white rounded-lg font-semibold transition-colors cursor-pointer hover:bg-green-500"
                >
                  Transferir Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
