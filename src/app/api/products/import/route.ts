import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Configuración para aceptar archivos grandes
export const maxDuration = 60; // 60 segundos timeout
export const dynamic = 'force-dynamic';

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

// Mapeo de unidades de medida
function mapearUnidadMedida(unidad: string): 'kg' | 'unidad' | 'litro' | 'paquete' | 'caja' {
  const unidadLower = unidad.toLowerCase().trim();
  
  if (unidadLower.includes('kg') || unidadLower.includes('kilo')) return 'kg';
  if (unidadLower.includes('lt') || unidadLower.includes('litro')) return 'litro';
  if (unidadLower.includes('paq') || unidadLower.includes('paquete')) return 'paquete';
  if (unidadLower.includes('caj') || unidadLower.includes('caja')) return 'caja';
  
  return 'unidad';
}

// Determinar categoría basada en la descripción
function determinarCategoria(descripcion: string): string {
  const desc = descripcion.toLowerCase();
  
  if (desc.includes('leche') || desc.includes('yogur') || desc.includes('queso') || desc.includes('manteca')) {
    return 'Lácteos';
  }
  if (desc.includes('carne') || desc.includes('pollo') || desc.includes('pescado') || desc.includes('cerdo')) {
    return 'Carnes';
  }
  if (desc.includes('fruta') || desc.includes('verdura') || desc.includes('lechuga') || desc.includes('tomate')) {
    return 'Frutas y Verduras';
  }
  if (desc.includes('pan') || desc.includes('galleta') || desc.includes('torta')) {
    return 'Panadería';
  }
  if (desc.includes('agua') || desc.includes('gaseosa') || desc.includes('jugo') || desc.includes('vino') || desc.includes('cerveza')) {
    return 'Bebidas';
  }
  if (desc.includes('conserva') || desc.includes('enlatado') || desc.includes('lata')) {
    return 'Conservas';
  }
  if (desc.includes('arroz') || desc.includes('fideos') || desc.includes('pasta') || desc.includes('harina')) {
    return 'Granos y Cereales';
  }
  if (desc.includes('sal') || desc.includes('pimienta') || desc.includes('condimento')) {
    return 'Especias';
  }
  
  return 'Otros';
}

// Limpiar y validar precio
function limpiarPrecio(precio: string): number {
  if (!precio) return 0;
  const precioLimpio = precio.replace(/[^0-9.,]/g, '').replace(',', '.');
  const precioNum = parseFloat(precioLimpio);
  return isNaN(precioNum) ? 0 : Math.max(0, precioNum);
}

// Convertir fila CSV a formato de producto
function convertirCSVAProducto(row: CSVRow, sucursalId?: string, sucursalNombre?: string) {
  const nombre = row.productos_descripcion?.trim() || `Producto ${row.id_producto}`;
  const precio = limpiarPrecio(row.productos_precio_lista);
  const precioPromo1 = limpiarPrecio(row.productos_precio_unitario_promo1);
  const precioPromo2 = limpiarPrecio(row.productos_precio_unitario_promo2);
  
  // Usar el menor precio de promoción si existe y es mayor a 0
  let precioPromocion = 0;
  if (precioPromo1 > 0 && precioPromo2 > 0) {
    precioPromocion = Math.min(precioPromo1, precioPromo2);
  } else if (precioPromo1 > 0) {
    precioPromocion = precioPromo1;
  } else if (precioPromo2 > 0) {
    precioPromocion = precioPromo2;
  }
  
  const cantidad = parseInt(row.productos_cantidad_presentacion) || 1;
  const unidadMedida = mapearUnidadMedida(row.productos_unidad_medida_presentacion);
  const categoria = determinarCategoria(nombre);
  
  const producto: any = {
    nombre,
    descripcion: `${row.productos_marca ? row.productos_marca + ' - ' : ''}${nombre}`,
    categoria,
    precio,
    stock: cantidad,
    stockMinimo: Math.max(1, Math.floor(cantidad * 0.2)), // 20% del stock inicial como mínimo
    unidadMedida,
    destacado: false,
    activo: true,
    sku: row.id_producto,
    codigoBarras: row.id_producto, 
    proveedor: row.productos_marca || '',
    etiquetas: [categoria, row.productos_marca].filter(Boolean),
    imagenes: [],
    visitas: 0,
    ventas: 0,
  };
  
  if (precioPromocion > 0 && precioPromocion < precio) {
    producto.precioPromocion = precioPromocion;
  }
  
  // Si se proporciona sucursal, inicializar stockPorSucursal
  if (sucursalId && sucursalNombre) {
    producto.stockPorSucursal = [{
      sucursalId,
      sucursalNombre,
      cantidad,
      stockMinimo: producto.stockMinimo,
    }];
  }
  
  return producto;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { csvData, sucursalId, sucursalNombre, mode = 'create' } = body;
    
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionaron datos CSV válidos' },
        { status: 400 }
      );
    }
    
    const resultados = {
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    };
    
    // Procesar cada fila del CSV
    for (const row of csvData) {
      try {
        const productoData = convertirCSVAProducto(row, sucursalId, sucursalNombre);
        
        if (mode === 'update' || mode === 'upsert') {
          // Buscar producto existente por SKU o código de barras
          const filtro: any = {};
          if (productoData.sku) {
            filtro.sku = productoData.sku;
          } else if (productoData.codigoBarras) {
            filtro.codigoBarras = productoData.codigoBarras;
          } else {
            filtro.nombre = productoData.nombre;
          }
          
          const productoExistente = await Product.findOne(filtro);
          
          if (productoExistente) {
            // Actualizar producto existente
            if (mode === 'update' || mode === 'upsert') {
              // Actualizar campos básicos
              productoExistente.precio = productoData.precio;
              if (productoData.precioPromocion) {
                productoExistente.precioPromocion = productoData.precioPromocion;
              }
              productoExistente.descripcion = productoData.descripcion;
              
              // Actualizar stock por sucursal si se proporciona
              if (sucursalId && sucursalNombre) {
                const stockExistente = productoExistente.stockPorSucursal?.find(
                  (s: any) => s.sucursalId === sucursalId
                );
                
                if (stockExistente) {
                  stockExistente.cantidad += productoData.stockPorSucursal[0].cantidad;
                } else {
                  if (!productoExistente.stockPorSucursal) {
                    productoExistente.stockPorSucursal = [];
                  }
                  productoExistente.stockPorSucursal.push(productoData.stockPorSucursal[0]);
                }
                
                // Recalcular stock total
                productoExistente.stock = productoExistente.stockPorSucursal.reduce(
                  (sum: number, s: any) => sum + s.cantidad,
                  0
                );
              }
              
              await productoExistente.save();
              resultados.actualizados++;
              resultados.detalles.push({
                accion: 'actualizado',
                producto: productoExistente.nombre,
                sku: productoExistente.sku,
              });
            }
          } else if (mode === 'upsert') {
            // Crear nuevo producto
            const nuevoProducto = new Product(productoData);
            await nuevoProducto.save();
            resultados.creados++;
            resultados.detalles.push({
              accion: 'creado',
              producto: nuevoProducto.nombre,
              sku: nuevoProducto.sku,
            });
          }
        } else {
          // Modo create: siempre crear nuevo producto
          const nuevoProducto = new Product(productoData);
          await nuevoProducto.save();
          resultados.creados++;
          resultados.detalles.push({
            accion: 'creado',
            producto: nuevoProducto.nombre,
            sku: nuevoProducto.sku,
          });
        }
      } catch (error: any) {
        resultados.errores++;
        resultados.detalles.push({
          accion: 'error',
          producto: row.productos_descripcion,
          error: error.message,
        });
        console.error(`Error procesando producto ${row.productos_descripcion}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Importación completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      data: resultados,
    });
    
  } catch (error: any) {
    console.error('Error en importación de productos:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
