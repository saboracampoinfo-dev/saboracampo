import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TransferenciaStock from '@/models/TransferenciaStock';
import Product from '@/models/Product';
import { authenticateRequest } from '@/lib/auth';

// GET - Obtener una transferencia específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authenticated, user } = await authenticateRequest(request);
    if (!authenticated || !user || user.rol !== 'administrador') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const transferencia = await TransferenciaStock.findById(params.id);

    if (!transferencia) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transferencia
    });

  } catch (error: any) {
    console.error('Error al obtener transferencia:', error);
    return NextResponse.json(
      { error: 'Error al obtener transferencia', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Aprobar o cancelar transferencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { accion, motivoCancelacion } = body;

    const transferencia = await TransferenciaStock.findById(params.id);

    if (!transferencia) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    if (transferencia.estado !== 'pendiente') {
      return NextResponse.json(
        { error: `No se puede modificar una transferencia ${transferencia.estado}` },
        { status: 400 }
      );
    }

    if (accion === 'aprobar') {
      // Validar stock nuevamente antes de aprobar
      const errores = [];

      for (const item of transferencia.items) {
        const producto = await Product.findById(item.productoId);
        if (!producto) {
          errores.push(`Producto no encontrado: ${item.nombreProducto}`);
          continue;
        }

        const stockOrigen = producto.stockPorSucursal.find(
          s => s.sucursalId === transferencia.sucursalOrigenId
        );

        if (!stockOrigen || stockOrigen.cantidad < item.cantidad) {
          errores.push(
            `${item.nombreProducto}: stock insuficiente ` +
            `(disponible: ${stockOrigen?.cantidad || 0}, requerido: ${item.cantidad})`
          );
        }
      }

      if (errores.length > 0) {
        return NextResponse.json(
          { 
            error: 'No se puede aprobar la transferencia',
            errores
          },
          { status: 400 }
        );
      }

      // Ejecutar transferencia
      for (const item of transferencia.items) {
        const producto = await Product.findById(item.productoId);
        if (!producto) continue;

        // Actualizar sucursal origen
        const idxOrigen = producto.stockPorSucursal.findIndex(
          s => s.sucursalId === transferencia.sucursalOrigenId
        );
        if (idxOrigen !== -1) {
          producto.stockPorSucursal[idxOrigen].cantidad -= item.cantidad;
        }

        // Actualizar sucursal destino
        const idxDestino = producto.stockPorSucursal.findIndex(
          s => s.sucursalId === transferencia.sucursalDestinoId
        );
        if (idxDestino !== -1) {
          producto.stockPorSucursal[idxDestino].cantidad += item.cantidad;
        } else {
          // Crear entrada si no existe
          producto.stockPorSucursal.push({
            sucursalId: transferencia.sucursalDestinoId,
            sucursalNombre: transferencia.sucursalDestinoNombre,
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

      transferencia.estado = 'completada';
      transferencia.aprobadoPor = user.userId;
      transferencia.aprobadoPorNombre = user.nombre;
      transferencia.fechaAprobacion = new Date();

    } else if (accion === 'cancelar') {
      if (!motivoCancelacion) {
        return NextResponse.json(
          { error: 'Debe proporcionar un motivo de cancelación' },
          { status: 400 }
        );
      }

      transferencia.estado = 'cancelada';
      transferencia.motivoCancelacion = motivoCancelacion;
      transferencia.aprobadoPor = user.userId;
      transferencia.aprobadoPorNombre = user.nombre;
      transferencia.fechaAprobacion = new Date();

    } else {
      return NextResponse.json(
        { error: 'Acción no válida. Use "aprobar" o "cancelar"' },
        { status: 400 }
      );
    }

    await transferencia.save();

    return NextResponse.json({
      success: true,
      transferencia,
      mensaje: accion === 'aprobar' 
        ? 'Transferencia aprobada y ejecutada exitosamente'
        : 'Transferencia cancelada'
    });

  } catch (error: any) {
    console.error('Error al actualizar transferencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar transferencia', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar transferencia (solo si está cancelada o pendiente)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authenticated, user } = await authenticateRequest(request);
    if (!authenticated || !user || user.rol !== 'administrador') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const transferencia = await TransferenciaStock.findById(params.id);

    if (!transferencia) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    if (transferencia.estado === 'completada') {
      return NextResponse.json(
        { error: 'No se puede eliminar una transferencia completada' },
        { status: 400 }
      );
    }

    await TransferenciaStock.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      mensaje: 'Transferencia eliminada exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar transferencia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar transferencia', details: error.message },
      { status: 500 }
    );
  }
}
