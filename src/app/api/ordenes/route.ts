import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Orden from '@/models/Orden';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Obtener órdenes
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const vendedorId = searchParams.get('vendedorId');
    const ordenId = searchParams.get('ordenId');

    // Si pide una orden específica
    if (ordenId) {
      const orden = await Orden.findById(ordenId);
      
      if (!orden) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      // Verificar permisos
      if (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId) {
        return NextResponse.json(
          { error: 'No tienes permiso para ver esta orden' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        orden
      });
    }

    // Construir query para listar órdenes
    const query: any = {};

    // Si es vendedor, solo ve sus propias órdenes
    if (user.role === 'seller') {
      query['vendedor.id'] = user.userId;
    } 
    // Si viene un vendedorId específico
    else if (vendedorId) {
      query['vendedor.id'] = vendedorId;
    }

    // Filtrar por estado
    if (estado && estado !== 'todas') {
      query.estado = estado;
    }

    const ordenes = await Orden.find(query)
      .sort({ fechaCreacion: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      ordenes
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva orden o actualizar existente
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { action, ordenId, codigoBarras, estado, metodoPago, cajeroInfo, sucursalId, sucursalNombre } = body;

    // CREAR NUEVA ORDEN
    if (action === 'crear') {
      if (user.role !== 'seller' && user.role !== 'cashier') {
        return NextResponse.json(
          { error: 'Solo vendedores y cajeros pueden crear órdenes' },
          { status: 403 }
        );
      }

      // Obtener información del usuario incluyendo sucursal
      const User = (await import('@/models/User')).default;
      const usuario = await User.findById(user.userId);
      
      if (!usuario) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      // Usar sucursal del body si viene, sino la del usuario
      let sucursalData = undefined;
      if (sucursalId && sucursalNombre) {
        // Convertir string a ObjectId
        try {
          sucursalData = {
            id: new mongoose.Types.ObjectId(sucursalId),
            nombre: sucursalNombre
          };
        } catch (error) {
          console.error('Error al convertir sucursalId:', error);
        }
      } else if (usuario.sucursalId) {
        sucursalData = {
          id: usuario.sucursalId,
          nombre: usuario.sucursalNombre || 'Sin nombre'
        };
      }

      const numeroOrden = await (Orden as any).generarNumeroOrden();

      const nuevaOrden = new Orden({
        numeroOrden,
        vendedor: {
          id: user.userId,
          nombre: user.name || 'Vendedor',
          email: user.email
        },
        sucursal: sucursalData,
        productos: [],
        total: 0,
        estado: 'en_proceso'
      });

      await nuevaOrden.save();

      return NextResponse.json({
        success: true,
        orden: nuevaOrden,
        message: 'Orden creada exitosamente'
      }, { status: 201 });
    }

    // AGREGAR PRODUCTO POR CÓDIGO DE BARRAS
    if (action === 'agregar_producto') {
      if (!ordenId || !codigoBarras) {
        return NextResponse.json(
          { error: 'Faltan datos requeridos' },
          { status: 400 }
        );
      }

      const orden = await Orden.findById(ordenId);
      if (!orden) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      // Verificar que el vendedor es dueño de la orden
      if (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId) {
        return NextResponse.json(
          { error: 'No tienes permiso para modificar esta orden' },
          { status: 403 }
        );
      }

      // Verificar que la orden esté en proceso
      if (orden.estado !== 'en_proceso') {
        return NextResponse.json(
          { error: 'Solo se pueden modificar órdenes en proceso' },
          { status: 400 }
        );
      }

      // Buscar producto por código de barras
      const producto = await Product.findOne({ codigoBarras });
      if (!producto) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        );
      }

      // Verificar stock según sucursal
      let stockDisponible = producto.stock;
      if (orden.sucursal && orden.sucursal.id && producto.stockPorSucursal && Array.isArray(producto.stockPorSucursal)) {
        const stockSucursal = producto.stockPorSucursal.find(
          (s: any) => s.sucursalId === orden.sucursal?.id.toString()
        );
        stockDisponible = stockSucursal ? stockSucursal.cantidad : 0;
      }

      if (stockDisponible <= 0) {
        return NextResponse.json(
          { error: `Producto sin stock disponible en ${orden.sucursal?.nombre || 'esta sucursal'}` },
          { status: 400 }
        );
      }

      // Verificar si el producto ya está en la orden
      const productoExistente = orden.productos.find(
        (p: any) => p.codigoBarras === codigoBarras
      );

      // Calcular cantidad total que se intentaría agregar
      const cantidadTotal = productoExistente ? productoExistente.cantidad + 1 : 1;
      
      if (cantidadTotal > stockDisponible) {
        return NextResponse.json(
          { error: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles` },
          { status: 400 }
        );
      }

      if (productoExistente) {
        // Aumentar cantidad
        productoExistente.cantidad += 1;
        productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
      } else {
        // Agregar nuevo producto
        const nuevoProducto: any = {
          productoId: producto._id,
          nombre: producto.nombre,
          cantidad: 1,
          precio: producto.precio,
          subtotal: producto.precio
        };
        
        // Solo agregar codigoBarras si existe y no está vacío
        if (producto.codigoBarras && producto.codigoBarras.trim() !== '') {
          nuevoProducto.codigoBarras = producto.codigoBarras.trim();
        }
        // Si no tiene código de barras o está vacío, simplemente no agregamos el campo
        
        // Solo agregar imagen si existe
        if (producto.imagenes && producto.imagenes.length > 0) {
          nuevoProducto.imagen = producto.imagenes[0];
        }
        
        orden.productos.push(nuevoProducto);
      }

      // Recalcular total
      (orden as any).calcularTotal();
      await orden.save();

      return NextResponse.json({
        success: true,
        orden,
        producto: productoExistente || orden.productos[orden.productos.length - 1],
        message: productoExistente ? 'Cantidad aumentada' : 'Producto agregado'
      });
    }

    // BUSCAR PRODUCTOS POR NOMBRE
    if (action === 'buscar_productos') {
      const { busqueda, sucursalId } = body;
      
      if (!busqueda || busqueda.trim().length < 2) {
        return NextResponse.json(
          { error: 'Ingresa al menos 2 caracteres para buscar' },
          { status: 400 }
        );
      }

      const productos = await Product.find({
        $or: [
          { nombre: { $regex: busqueda.trim(), $options: 'i' } },
          { codigoBarras: { $regex: busqueda.trim(), $options: 'i' } },
          { sku: { $regex: busqueda.trim(), $options: 'i' } }
        ],
        activo: true
      })
      .limit(10)
      .select('_id nombre codigoBarras precio stock stockPorSucursal imagenes');

      return NextResponse.json({
        success: true,
        productos: productos.map(p => {
          // Si hay sucursalId, buscar stock de esa sucursal
          let stockDisponible = p.stock;
          if (sucursalId && p.stockPorSucursal && Array.isArray(p.stockPorSucursal)) {
            const stockSucursal = p.stockPorSucursal.find(
              (s: any) => s.sucursalId === sucursalId
            );
            stockDisponible = stockSucursal ? stockSucursal.cantidad : 0;
          }

          return {
            _id: p._id,
            nombre: p.nombre,
            codigoBarras: p.codigoBarras,
            precio: p.precio,
            stock: stockDisponible,
            imagen: p.imagenes && p.imagenes.length > 0 ? p.imagenes[0] : null
          };
        }).filter(p => p.stock > 0) // Solo productos con stock disponible
      });
    }

    // AGREGAR PRODUCTO POR ID
    if (action === 'agregar_producto_por_id') {
      try {
        console.log('🟢 [API] Acción: agregar_producto_por_id');
        console.log('🟢 ordenId recibido:', ordenId);
        console.log('🟢 productoId recibido:', body.productoId);
        console.log('🟢 body completo:', body);

        if (!ordenId || !body.productoId) {
          console.log('❌ Faltan datos requeridos');
          return NextResponse.json(
            { error: 'Faltan datos requeridos' },
            { status: 400 }
          );
        }

      console.log('🟢 Buscando orden por ID...');
      const orden = await Orden.findById(ordenId);
      if (!orden) {
        console.log('❌ Orden no encontrada');
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }
      console.log('🟢 Orden encontrada:', orden.numeroOrden);
      console.log('🟢 Sucursal de la orden:', orden.sucursal);
      console.log('🟢 Estado de la orden:', orden.estado);

      // Verificar que el vendedor es dueño de la orden
      if (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId) {
        console.log('❌ Usuario no tiene permiso');
        return NextResponse.json(
          { error: 'No tienes permiso para modificar esta orden' },
          { status: 403 }
        );
      }

      // Verificar que la orden esté en proceso
      if (orden.estado !== 'en_proceso') {
        console.log('❌ Orden no está en proceso');
        return NextResponse.json(
          { error: 'Solo se pueden modificar órdenes en proceso' },
          { status: 400 }
        );
      }

      // Buscar producto por ID
      console.log('🟢 Buscando producto por ID...');
      const producto = await Product.findById(body.productoId);
      if (!producto) {
        console.log('❌ Producto no encontrado');
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        );
      }
      console.log('🟢 Producto encontrado:', producto.nombre);
      console.log('🟢 Stock general:', producto.stock);
      console.log('🟢 stockPorSucursal:', producto.stockPorSucursal);

      // Verificar stock según sucursal
      let stockDisponible = producto.stock;
      console.log('🟢 Stock inicial (general):', stockDisponible);
      
      if (orden.sucursal && orden.sucursal.id && producto.stockPorSucursal && Array.isArray(producto.stockPorSucursal)) {
        console.log('🟢 Verificando stock por sucursal...');
        const sucursalIdStr = typeof orden.sucursal.id === 'string' 
          ? orden.sucursal.id 
          : orden.sucursal.id.toString();
        console.log('🟢 Sucursal ID de la orden:', sucursalIdStr);
        console.log('🟢 Stock por sucursales disponibles:', producto.stockPorSucursal);
        
        const stockSucursal = producto.stockPorSucursal.find(
          (s: any) => {
            console.log('🔵 Comparando:', s.sucursalId, '===', sucursalIdStr);
            return s.sucursalId === sucursalIdStr || s.sucursalId === sucursalIdStr;
          }
        );
        console.log('🟢 Stock encontrado en sucursal:', stockSucursal);
        stockDisponible = stockSucursal ? stockSucursal.cantidad : 0;
        console.log('🟢 Stock disponible final:', stockDisponible);
      }

      if (stockDisponible <= 0) {
        console.log('❌ Sin stock disponible');
        return NextResponse.json(
          { error: `Producto sin stock disponible en ${orden.sucursal?.nombre || 'esta sucursal'}` },
          { status: 400 }
        );
      }

      // Verificar si el producto ya está en la orden
      console.log('🟢 Verificando si producto ya existe en orden...');
      const productoExistente = orden.productos.find(
        (p: any) => p.productoId.toString() === body.productoId
      );
      console.log('🟢 Producto existente:', productoExistente);

      // Calcular cantidad total que se intentaría agregar
      const cantidadTotal = productoExistente ? productoExistente.cantidad + 1 : 1;
      console.log('🟢 Cantidad total a agregar:', cantidadTotal);
      
      if (cantidadTotal > stockDisponible) {
        console.log('❌ Stock insuficiente');
        return NextResponse.json(
          { error: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles` },
          { status: 400 }
        );
      }

      if (productoExistente) {
        console.log('🟢 Actualizando cantidad de producto existente');
        // Aumentar cantidad
        productoExistente.cantidad += 1;
        productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
        console.log('🟢 Nueva cantidad:', productoExistente.cantidad);
      } else {
        console.log('🟢 Agregando nuevo producto a la orden');
        // Agregar nuevo producto
        const nuevoProducto: any = {
          productoId: producto._id,
          nombre: producto.nombre,
          cantidad: 1,
          precio: producto.precio,
          subtotal: producto.precio
        };
        
        // Solo agregar codigoBarras si existe y no está vacío
        if (producto.codigoBarras && producto.codigoBarras.trim() !== '') {
          nuevoProducto.codigoBarras = producto.codigoBarras.trim();
        }
        // Si no tiene código de barras o está vacío, simplemente no agregamos el campo
        
        // Solo agregar imagen si existe
        if (producto.imagenes && producto.imagenes.length > 0) {
          nuevoProducto.imagen = producto.imagenes[0];
        }
        
        console.log('🟢 Nuevo producto a agregar:', nuevoProducto);
        orden.productos.push(nuevoProducto);
        console.log('🟢 Total productos en orden:', orden.productos.length);
      }

      // Recalcular total
      console.log('🟢 Recalculando total...');
      (orden as any).calcularTotal();
      console.log('🟢 Total calculado:', orden.total);
      
      console.log('🟢 Guardando orden...');
      await orden.save();
      console.log('✅ Orden guardada exitosamente');

      const response = {
        success: true,
        orden,
        producto: productoExistente || orden.productos[orden.productos.length - 1],
        message: productoExistente ? 'Cantidad aumentada' : 'Producto agregado'
      };
      console.log('🟢 Enviando respuesta exitosa');
      return NextResponse.json(response);
      } catch (error) {
        console.error('❌ [API] Error en agregar_producto_por_id:', error);
        return NextResponse.json(
          { error: 'Error al agregar producto: ' + (error instanceof Error ? error.message : 'Error desconocido') },
          { status: 500 }
        );
      }
    }

    // ACTUALIZAR CANTIDAD DE PRODUCTO
    if (action === 'actualizar_cantidad') {
      const { productoId, cantidad } = body;
      
      if (!ordenId || !productoId || cantidad === undefined) {
        return NextResponse.json(
          { error: 'Faltan datos requeridos' },
          { status: 400 }
        );
      }

      const orden = await Orden.findById(ordenId);
      if (!orden) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      // Verificar permisos
      if (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId) {
        return NextResponse.json(
          { error: 'No tienes permiso para modificar esta orden' },
          { status: 403 }
        );
      }

      if (orden.estado !== 'en_proceso') {
        return NextResponse.json(
          { error: 'Solo se pueden modificar órdenes en proceso' },
          { status: 400 }
        );
      }

      const producto = orden.productos.find(
        (p: any) => p.productoId.toString() === productoId
      );

      if (!producto) {
        return NextResponse.json(
          { error: 'Producto no encontrado en la orden' },
          { status: 404 }
        );
      }

      if (cantidad <= 0) {
        // Eliminar producto
        orden.productos = orden.productos.filter(
          (p: any) => p.productoId.toString() !== productoId
        );
      } else {
        // Validar stock disponible antes de actualizar
        const productoDb = await Product.findById(productoId);
        if (productoDb) {
          let stockDisponible = productoDb.stock;
          if (orden.sucursal && orden.sucursal.id && productoDb.stockPorSucursal && Array.isArray(productoDb.stockPorSucursal)) {
            const stockSucursal = productoDb.stockPorSucursal.find(
              (s: any) => s.sucursalId === orden.sucursal?.id.toString()
            );
            stockDisponible = stockSucursal ? stockSucursal.cantidad : 0;
          }

          if (cantidad > stockDisponible) {
            return NextResponse.json(
              { error: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles` },
              { status: 400 }
            );
          }
        }

        // Actualizar cantidad
        producto.cantidad = cantidad;
        producto.subtotal = producto.cantidad * producto.precio;
      }

      (orden as any).calcularTotal();
      await orden.save();

      return NextResponse.json({
        success: true,
        orden,
        message: 'Cantidad actualizada'
      });
    }

    // CAMBIAR ESTADO
    if (action === 'cambiar_estado') {
      if (!ordenId || !estado) {
        return NextResponse.json(
          { error: 'Faltan datos requeridos' },
          { status: 400 }
        );
      }

      const orden = await Orden.findById(ordenId);
      if (!orden) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      // Validar transiciones de estado
      if (estado === 'pendiente_cobro') {
        if (orden.estado !== 'en_proceso') {
          return NextResponse.json(
            { error: 'Solo órdenes en proceso pueden pasar a pendiente de cobro' },
            { status: 400 }
          );
        }
        if (orden.productos.length === 0) {
          return NextResponse.json(
            { error: 'No se puede cerrar una orden sin productos' },
            { status: 400 }
          );
        }
        if (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId) {
          return NextResponse.json(
            { error: 'No tienes permiso para cerrar esta orden' },
            { status: 403 }
          );
        }

        // 🔥 DESCONTAR STOCK cuando el vendedor cierra la orden
        console.log('📦 Descontando stock al cerrar orden...');
        for (const prod of orden.productos) {
          if (orden.sucursal && orden.sucursal.id) {
            // Descontar del stock de la sucursal específica
            const producto = await Product.findById(prod.productoId);
            if (producto && producto.stockPorSucursal && Array.isArray(producto.stockPorSucursal)) {
              const stockSucursalIndex = producto.stockPorSucursal.findIndex(
                (s: any) => s.sucursalId === orden.sucursal?.id.toString()
              );
              
              if (stockSucursalIndex !== -1) {
                console.log(`📦 Descontando ${prod.cantidad} unidades de "${prod.nombre}" en ${orden.sucursal.nombre}`);
                // Descontar de la sucursal
                producto.stockPorSucursal[stockSucursalIndex].cantidad -= prod.cantidad;
                
                // Actualizar stock total
                producto.stock = producto.stockPorSucursal.reduce(
                  (total: number, s: any) => total + s.cantidad, 
                  0
                );
                
                await producto.save();
                console.log(`✅ Stock actualizado. Nuevo stock en ${orden.sucursal.nombre}: ${producto.stockPorSucursal[stockSucursalIndex].cantidad}`);
              } else {
                console.log(`⚠️ No se encontró stock para la sucursal ${orden.sucursal.nombre}`);
              }
            }
          } else {
            // Si no hay sucursal, descontar del stock general
            console.log(`📦 Descontando ${prod.cantidad} unidades de "${prod.nombre}" del stock general`);
            await Product.findByIdAndUpdate(
              prod.productoId,
              { $inc: { stock: -prod.cantidad } }
            );
          }
        }
        console.log('✅ Stock descontado exitosamente');
      }

      if (estado === 'completada') {
        if (orden.estado !== 'pendiente_cobro') {
          return NextResponse.json(
            { error: 'Solo órdenes pendientes de cobro pueden completarse' },
            { status: 400 }
          );
        }
        if (user.role !== 'admin' && user.role !== 'cajero') {
          return NextResponse.json(
            { error: 'Solo cajeros pueden completar órdenes' },
            { status: 403 }
          );
        }
        // Guardar info del cajero
        if (cajeroInfo) {
          orden.cajero = cajeroInfo;
        }
        if (metodoPago) {
          orden.metodoPago = metodoPago;
        }
        
        // Ya no necesitamos descontar stock aquí porque se hizo al cerrar la orden
        console.log('✅ Orden completada por cajero (stock ya descontado previamente)');
      }

      if (estado === 'cancelada') {
        // Validar que la orden pueda cancelarse
        if (orden.estado === 'completada') {
          return NextResponse.json(
            { error: 'No se puede cancelar una orden completada' },
            { status: 400 }
          );
        }

        // Solo admin o el vendedor dueño pueden cancelar
        if (user.role !== 'admin' && 
            (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId)) {
          return NextResponse.json(
            { error: 'No tienes permiso para cancelar esta orden' },
            { status: 403 }
          );
        }

        // 🔄 DEVOLVER STOCK si la orden estaba en pendiente_cobro (ya se había descontado)
        if (orden.estado === 'pendiente_cobro') {
          console.log('🔄 Devolviendo stock al cancelar orden...');
          for (const prod of orden.productos) {
            if (orden.sucursal && orden.sucursal.id) {
              // Devolver al stock de la sucursal específica
              const producto = await Product.findById(prod.productoId);
              if (producto && producto.stockPorSucursal && Array.isArray(producto.stockPorSucursal)) {
                const stockSucursalIndex = producto.stockPorSucursal.findIndex(
                  (s: any) => s.sucursalId === orden.sucursal?.id.toString()
                );
                
                if (stockSucursalIndex !== -1) {
                  console.log(`🔄 Devolviendo ${prod.cantidad} unidades de "${prod.nombre}" en ${orden.sucursal.nombre}`);
                  // Devolver a la sucursal
                  producto.stockPorSucursal[stockSucursalIndex].cantidad += prod.cantidad;
                  
                  // Actualizar stock total
                  producto.stock = producto.stockPorSucursal.reduce(
                    (total: number, s: any) => total + s.cantidad, 
                    0
                  );
                  
                  await producto.save();
                  console.log(`✅ Stock devuelto. Nuevo stock en ${orden.sucursal.nombre}: ${producto.stockPorSucursal[stockSucursalIndex].cantidad}`);
                } else {
                  console.log(`⚠️ No se encontró stock para la sucursal ${orden.sucursal.nombre}`);
                }
              }
            } else {
              // Si no hay sucursal, devolver al stock general
              console.log(`🔄 Devolviendo ${prod.cantidad} unidades de "${prod.nombre}" al stock general`);
              await Product.findByIdAndUpdate(
                prod.productoId,
                { $inc: { stock: prod.cantidad } }
              );
            }
          }
          console.log('✅ Stock devuelto exitosamente');
        } else if (orden.estado === 'en_proceso') {
          console.log('ℹ️ Orden en proceso cancelada - no se había descontado stock');
        }
      }

      orden.estado = estado;
      await orden.save();

      return NextResponse.json({
        success: true,
        orden,
        message: `Orden ${estado === 'pendiente_cobro' ? 'cerrada' : estado}`
      });
    }

    // ELIMINAR ORDEN
    if (action === 'eliminar') {
      if (!ordenId) {
        return NextResponse.json(
          { error: 'Falta el ID de la orden' },
          { status: 400 }
        );
      }

      const orden = await Orden.findById(ordenId);
      if (!orden) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      // Solo el vendedor dueño o admin pueden eliminar
      if (user.role === 'seller' && orden.vendedor.id.toString() !== user.userId) {
        return NextResponse.json(
          { error: 'No tienes permiso para eliminar esta orden' },
          { status: 403 }
        );
      }

      // Solo órdenes en proceso o pendiente_cobro pueden eliminarse
      if (orden.estado === 'completada') {
        return NextResponse.json(
          { error: 'No se puede eliminar una orden completada' },
          { status: 400 }
        );
      }

      // 🔄 DEVOLVER STOCK si la orden estaba en pendiente_cobro
      if (orden.estado === 'pendiente_cobro') {
        console.log('🔄 Devolviendo stock al eliminar orden...');
        for (const prod of orden.productos) {
          if (orden.sucursal && orden.sucursal.id) {
            // Devolver al stock de la sucursal específica
            const producto = await Product.findById(prod.productoId);
            if (producto && producto.stockPorSucursal && Array.isArray(producto.stockPorSucursal)) {
              const stockSucursalIndex = producto.stockPorSucursal.findIndex(
                (s: any) => s.sucursalId === orden.sucursal?.id.toString()
              );
              
              if (stockSucursalIndex !== -1) {
                console.log(`🔄 Devolviendo ${prod.cantidad} unidades de "${prod.nombre}" en ${orden.sucursal.nombre}`);
                producto.stockPorSucursal[stockSucursalIndex].cantidad += prod.cantidad;
                
                producto.stock = producto.stockPorSucursal.reduce(
                  (total: number, s: any) => total + s.cantidad, 
                  0
                );
                
                await producto.save();
                console.log(`✅ Stock devuelto`);
              }
            }
          } else {
            console.log(`🔄 Devolviendo ${prod.cantidad} unidades de "${prod.nombre}" al stock general`);
            await Product.findByIdAndUpdate(
              prod.productoId,
              { $inc: { stock: prod.cantidad } }
            );
          }
        }
        console.log('✅ Stock devuelto al eliminar orden');
      }

      await Orden.findByIdAndDelete(ordenId);

      return NextResponse.json({
        success: true,
        message: 'Orden eliminada'
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error en operación de orden:', error);
    return NextResponse.json(
      { error: 'Error en operación de orden' },
      { status: 500 }
    );
  }
}
