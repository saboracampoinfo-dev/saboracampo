import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TransferenciaStock from '@/models/TransferenciaStock';
import Product from '@/models/Product';
import Sucursal from '@/models/Sucursal';
import { authenticateRequest } from '@/lib/auth';

// GET - Listar transferencias con filtros
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await authenticateRequest(request);
    if (!authenticated || !user || user.rol !== 'administrador') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const sucursalId = searchParams.get('sucursalId');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: any = {};

    if (estado && estado !== 'todas') {
      filter.estado = estado;
    }

    if (sucursalId) {
      filter.$or = [
        { sucursalOrigenId: sucursalId },
        { sucursalDestinoId: sucursalId }
      ];
    }

    if (desde || hasta) {
      filter.fechaCreacion = {};
      if (desde) filter.fechaCreacion.$gte = new Date(desde);
      if (hasta) filter.fechaCreacion.$lte = new Date(hasta);
    }

    const [transferencias, total] = await Promise.all([
      TransferenciaStock.find(filter)
        .sort({ fechaCreacion: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      TransferenciaStock.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      transferencias,
      total,
      limit,
      skip
    });

  } catch (error: any) {
    console.error('Error al obtener transferencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener transferencias', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva transferencia masiva
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await authenticateRequest(request);
    if (!authenticated || !user || user.rol !== 'administrador') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      sucursalOrigenId,
      sucursalDestinoId,
      items, // Array de { productoId, cantidad }
      notas,
      ejecutarInmediatamente = false
    } = body;

    // Validaciones básicas
    if (!sucursalOrigenId || !sucursalDestinoId) {
      return NextResponse.json(
        { error: 'Debe especificar sucursal de origen y destino' },
        { status: 400 }
      );
    }

    if (sucursalOrigenId === sucursalDestinoId) {
      return NextResponse.json(
        { error: 'La sucursal origen y destino no pueden ser la misma' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto para transferir' },
        { status: 400 }
      );
    }

    // Obtener datos de las sucursales
    const [sucursalOrigen, sucursalDestino] = await Promise.all([
      Sucursal.findById(sucursalOrigenId),
      Sucursal.findById(sucursalDestinoId)
    ]);

    if (!sucursalOrigen || !sucursalDestino) {
      return NextResponse.json(
        { error: 'Una o ambas sucursales no existen' },
        { status: 404 }
      );
    }

    // Procesar items y validar stock
    const itemsDetallados = [];
    const errores = [];

    for (const item of items) {
      const { productoId, cantidad } = item;

      if (!productoId || !cantidad || cantidad <= 0) {
        errores.push(`Item inválido: ${productoId}`);
        continue;
      }

      // Buscar producto
      const producto = await Product.findById(productoId);
      if (!producto) {
        errores.push(`Producto no encontrado: ${productoId}`);
        continue;
      }

      // Buscar stock en sucursal origen
      const stockOrigen = producto.stockPorSucursal.find(
        s => s.sucursalId === sucursalOrigenId
      );

      if (!stockOrigen || stockOrigen.cantidad < cantidad) {
        errores.push(
          `${producto.nombre}: stock insuficiente en ${sucursalOrigen.nombre} ` +
          `(disponible: ${stockOrigen?.cantidad || 0}, solicitado: ${cantidad})`
        );
        continue;
      }

      // Buscar o preparar stock en sucursal destino
      const stockDestino = producto.stockPorSucursal.find(
        s => s.sucursalId === sucursalDestinoId
      );

      itemsDetallados.push({
        productoId: producto._id.toString(),
        nombreProducto: producto.nombre,
        cantidad,
        stockOrigenAntes: stockOrigen.cantidad,
        stockOrigenDespues: stockOrigen.cantidad - cantidad,
        stockDestinoAntes: stockDestino?.cantidad || 0,
        stockDestinoDespues: (stockDestino?.cantidad || 0) + cantidad
      });
    }

    if (errores.length > 0) {
      return NextResponse.json(
        { 
          error: 'Errores en la transferencia',
          errores,
          itemsProcesados: itemsDetallados.length,
          itemsConError: errores.length
        },
        { status: 400 }
      );
    }

    // Crear registro de transferencia
    const transferencia = new TransferenciaStock({
      sucursalOrigenId,
      sucursalOrigenNombre: sucursalOrigen.nombre,
      sucursalDestinoId,
      sucursalDestinoNombre: sucursalDestino.nombre,
      items: itemsDetallados,
      totalItems: itemsDetallados.length,
      totalCantidad: itemsDetallados.reduce((sum, item) => sum + item.cantidad, 0),
      estado: ejecutarInmediatamente ? 'completada' : 'pendiente',
      creadoPor: user.userId,
      creadoPorNombre: user.nombre,
      notas
    });

    // Si se ejecuta inmediatamente, actualizar stock
    if (ejecutarInmediatamente) {
      transferencia.aprobadoPor = user.userId;
      transferencia.aprobadoPorNombre = user.nombre;
      transferencia.fechaAprobacion = new Date();

      // Actualizar stock de todos los productos
      for (const item of itemsDetallados) {
        const producto = await Product.findById(item.productoId);
        if (!producto) continue;

        // Actualizar sucursal origen
        const idxOrigen = producto.stockPorSucursal.findIndex(
          s => s.sucursalId === sucursalOrigenId
        );
        if (idxOrigen !== -1) {
          producto.stockPorSucursal[idxOrigen].cantidad -= item.cantidad;
        }

        // Actualizar sucursal destino
        const idxDestino = producto.stockPorSucursal.findIndex(
          s => s.sucursalId === sucursalDestinoId
        );
        if (idxDestino !== -1) {
          producto.stockPorSucursal[idxDestino].cantidad += item.cantidad;
        } else {
          // Si no existe, crear entrada
          producto.stockPorSucursal.push({
            sucursalId: sucursalDestinoId,
            sucursalNombre: sucursalDestino.nombre,
            cantidad: item.cantidad,
            stockMinimo: producto.stockMinimo
          });
        }

        // Recalcular stock total
        producto.stock = producto.stockPorSucursal.reduce(
          (sum, s) => sum + s.cantidad, 
          0
        );

        producto.updatedBy = user.userId;
        await producto.save();
      }
    }

    await transferencia.save();

    return NextResponse.json({
      success: true,
      transferencia,
      mensaje: ejecutarInmediatamente 
        ? 'Transferencia completada exitosamente'
        : 'Transferencia creada, pendiente de aprobación'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error al crear transferencia:', error);
    return NextResponse.json(
      { error: 'Error al crear transferencia', details: error.message },
      { status: 500 }
    );
  }
}
