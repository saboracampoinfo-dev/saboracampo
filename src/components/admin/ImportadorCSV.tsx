'use client';

import { useState } from 'react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastHelpers';

interface CSVRow {
  id_comercio: string;
  id_bandera: string;
  id_sucursal: string;
  id_producto: string;
  productos_ean: string;
  productos_descripcion: string;
  productos_cantidad_presentacion: string;
  productos_unidad_medida_presentacion: string;
  productos_marca: string;
  productos_precio_lista: string;
  productos_precio_referencia: string;
  productos_cantidad_referencia: string;
  productos_unidad_medida_referencia: string;
  productos_precio_unitario_promo1: string;
  productos_leyenda_promo1: string;
  productos_precio_unitario_promo2: string;
  productos_leyenda_promo2: string;
}

interface ImportadorCSVProps {
  onImportComplete?: () => void;
  sucursales?: Array<{ _id: string; nombre: string; estado: string }>;
}

export default function ImportadorCSV({ onImportComplete, sucursales = [] }: ImportadorCSVProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string>('');
  const [importMode, setImportMode] = useState<'create' | 'update' | 'upsert'>('upsert');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        showErrorToast('Por favor selecciona un archivo CSV válido');
        return;
      }
      setFile(selectedFile);
      parseCSVFile(selectedFile);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          showErrorToast('El archivo CSV está vacío o no tiene datos');
          return;
        }
        
        // Parsear header
        const headers = lines[0].split('|').map(h => h.trim());
        
        // Validar que tenga las columnas esperadas
        const requiredColumns = [
          'id_producto',
          'productos_descripcion',
          'productos_precio_lista'
        ];
        
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          showErrorToast(`Faltan columnas requeridas: ${missingColumns.join(', ')}`);
          return;
        }
        
        // Parsear datos
        const data: CSVRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split('|').map(v => v.trim());
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          data.push(row as CSVRow);
        }
        
        setCsvData(data);
        setPreview(data.slice(0, 10)); // Mostrar primeros 10
        showSuccessToast(`Archivo cargado: ${data.length} productos encontrados`);
      } catch (error) {
        console.error('Error parseando CSV:', error);
        showErrorToast('Error al procesar el archivo CSV');
      }
    };
    
    reader.onerror = () => {
      showErrorToast('Error al leer el archivo');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      showErrorToast('No hay datos para importar');
      return;
    }

    if (!selectedSucursal && sucursales.length > 0) {
      showErrorToast('Por favor selecciona una sucursal');
      return;
    }

    setProcessing(true);
    
    try {
      const sucursalData = sucursales.find(s => s._id === selectedSucursal);
      
      // Procesar en lotes de 100 productos para evitar errores de tamaño
      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(csvData.length / BATCH_SIZE);
      
      let totalCreados = 0;
      let totalActualizados = 0;
      let totalErrores = 0;
      
      setProgress({ current: 0, total: totalBatches });
      showInfoToast(`Procesando ${csvData.length} productos en ${totalBatches} lotes...`);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, csvData.length);
        const batch = csvData.slice(start, end);
        
        setProgress({ current: i + 1, total: totalBatches });
        
        const response = await fetch('/api/products/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            csvData: batch,
            sucursalId: selectedSucursal || undefined,
            sucursalNombre: sucursalData?.nombre || undefined,
            mode: importMode,
          }),
        });

        const result = await response.json();

        if (result.success) {
          totalCreados += result.data.creados || 0;
          totalActualizados += result.data.actualizados || 0;
          totalErrores += result.data.errores || 0;
        } else {
          showErrorToast(`Error en lote ${i + 1}: ${result.message}`);
          totalErrores += batch.length;
        }
        
        // Pequeña pausa entre lotes para no saturar el servidor
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setProgress({ current: 0, total: 0 });
      
      showSuccessToast(
        `Importación completada: ${totalCreados} creados, ${totalActualizados} actualizados, ${totalErrores} errores`
      );
      
      // Cerrar modal y limpiar
      setIsOpen(false);
      setFile(null);
      setCsvData([]);
      setPreview([]);
      
      // Llamar callback si existe
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error importando productos:', error);
      showErrorToast('Error al importar productos');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setCsvData([]);
    setPreview([]);
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        <span className="text-xl">📊</span>
        Importar CSV
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-secondary text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Importar Productos desde CSV</h3>
                <p className="text-sm text-secondary-light mt-1">
                  Carga un archivo CSV con productos para importar masivamente
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-dark-200 text-2xl font-bold"
                disabled={processing}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Formato esperado */}
              <div className="bg-primary-50 dark:bg-dark-700 border border-primary rounded-lg p-4 mb-6">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  Formato del archivo CSV
                </h4>
                <p className="text-sm text-dark-700 dark:text-dark-300 mb-2">
                  El archivo debe usar <strong>|</strong> (pipe) como separador y tener las siguientes columnas:
                </p>
                <code className="text-xs bg-white dark:bg-dark-800 p-2 rounded block overflow-x-auto text-dark-900 dark:text-light-500">
                  id_comercio|id_bandera|id_sucursal|id_producto|productos_ean|productos_descripcion|
                  productos_cantidad_presentacion|productos_unidad_medida_presentacion|productos_marca|
                  productos_precio_lista|productos_precio_referencia|productos_cantidad_referencia|
                  productos_unidad_medida_referencia|productos_precio_unitario_promo1|
                  productos_leyenda_promo1|productos_precio_unitario_promo2|productos_leyenda_promo2
                </code>
              </div>

              {/* Modo de importación */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-dark-700 dark:text-dark-300 mb-2">
                  Modo de Importación
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setImportMode('create')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      importMode === 'create'
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-300 dark:border-dark-600 hover:border-primary'
                    }`}
                  >
                    <div className="text-2xl mb-2">➕</div>
                    <div className="font-bold text-dark-900 dark:text-light-500">Crear Nuevos</div>
                    <div className="text-xs text-dark-600 dark:text-dark-400">
                      Solo crear productos nuevos
                    </div>
                  </button>

                  <button
                    onClick={() => setImportMode('update')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      importMode === 'update'
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-300 dark:border-dark-600 hover:border-primary'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔄</div>
                    <div className="font-bold text-dark-900 dark:text-light-500">Actualizar</div>
                    <div className="text-xs text-dark-600 dark:text-dark-400">
                      Solo actualizar existentes
                    </div>
                  </button>

                  <button
                    onClick={() => setImportMode('upsert')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      importMode === 'upsert'
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-300 dark:border-dark-600 hover:border-primary'
                    }`}
                  >
                    <div className="text-2xl mb-2">✨</div>
                    <div className="font-bold text-dark-900 dark:text-light-500">Inteligente</div>
                    <div className="text-xs text-dark-600 dark:text-dark-400">
                      Crear o actualizar según corresponda
                    </div>
                  </button>
                </div>
              </div>

              {/* Selección de sucursal */}
              {sucursales.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-dark-700 dark:text-dark-300 mb-2">
                    Asignar a Sucursal (Opcional)
                  </label>
                  <select
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
                  >
                    <option value="">Sin asignar a sucursal específica</option>
                    {sucursales
                      .filter(s => s.estado === 'activa')
                      .map(sucursal => (
                        <option key={sucursal._id} value={sucursal._id}>
                          {sucursal.nombre}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-dark-600 dark:text-dark-400 mt-1">
                    Si no seleccionas una sucursal, los productos se crearán sin stock por sucursal
                  </p>
                </div>
              )}

              {/* Selector de archivo */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-dark-700 dark:text-dark-300 mb-2">
                  Seleccionar Archivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-dark-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-light-500"
                  disabled={processing}
                />
              </div>

              {/* Preview de datos */}
              {preview.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-dark-900 dark:text-light-500 mb-3 flex items-center gap-2">
                    <span>👁️</span>
                    Vista Previa (primeros 10 productos)
                  </h4>
                  <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4 border border-dark-200 dark:border-dark-600 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-300 dark:border-dark-600">
                          <th className="text-left p-2 text-dark-700 dark:text-dark-300">SKU</th>
                          <th className="text-left p-2 text-dark-700 dark:text-dark-300">Descripción</th>
                          <th className="text-left p-2 text-dark-700 dark:text-dark-300">Marca</th>
                          <th className="text-left p-2 text-dark-700 dark:text-dark-300">Precio</th>
                          <th className="text-left p-2 text-dark-700 dark:text-dark-300">Cantidad</th>
                          <th className="text-left p-2 text-dark-700 dark:text-dark-300">EAN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, index) => (
                          <tr key={index} className="border-b border-dark-200 dark:border-dark-600">
                            <td className="p-2 text-dark-900 dark:text-light-500">{row.id_producto}</td>
                            <td className="p-2 text-dark-900 dark:text-light-500">{row.productos_descripcion}</td>
                            <td className="p-2 text-dark-900 dark:text-light-500">{row.productos_marca}</td>
                            <td className="p-2 text-dark-900 dark:text-light-500">${row.productos_precio_lista}</td>
                            <td className="p-2 text-dark-900 dark:text-light-500">
                              {row.productos_cantidad_presentacion} {row.productos_unidad_medida_presentacion}
                            </td>
                            <td className="p-2 text-dark-900 dark:text-light-500">{row.id_producto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-400 mt-2">
                    Total de productos a importar: <strong>{csvData.length}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            {processing && progress.total > 0 && (
              <div className="px-6 py-4 bg-primary-50 dark:bg-primary-900/20 border-t border-dark-200 dark:border-dark-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-dark-900 dark:text-light-500">
                    Procesando lote {progress.current} de {progress.total}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-dark-200 dark:bg-dark-600 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-dark-50 dark:bg-dark-700 px-6 py-4 flex justify-between items-center border-t border-dark-200 dark:border-dark-600">
              <button
                onClick={handleClose}
                className="bg-dark-300 hover:bg-dark-400 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-900 dark:text-light-500 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                disabled={processing}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleImport}
                disabled={processing || csvData.length === 0}
                className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Procesando lote {progress.current}/{progress.total}
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    Importar {csvData.length} Productos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
