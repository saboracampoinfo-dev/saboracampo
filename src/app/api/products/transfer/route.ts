import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import StockAlert from '@/models/StockAlert';
import { verifyToken } from '@/lib/jwt';

// POST /api/products/transfer - Transferir stock entre sucursales
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'vendedor')) {
      return NextResponse.json(
        { success: false, error: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productoId, origenSucursalId, destinoSucursalId, cantidad } = body;

    // Validaciones
    if (!productoId || !origenSucursalId || !destinoSucursalId || !cantidad) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (cantidad <= 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (origenSucursalId === destinoSucursalId) {
      return NextResponse.json(
        { success: false, error: 'La sucursal origen y destino no pueden ser iguales' },
        { status: 400 }
      );
    }

    // Obtener producto
    const producto = await Product.findById(productoId);
    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Buscar sucursal origen en el stock
    const stockOrigen = producto.stockPorSucursal.find(
      (s: any) => s.sucursalId === origenSucursalId
    );

    if (!stockOrigen) {
      return NextResponse.json(
        { success: false, error: 'Sucursal origen no encontrada en el inventario' },
        { status: 404 }
      );
    }

    if (stockOrigen.cantidad < cantidad) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Stock insuficiente en sucursal origen. Disponible: ${stockOrigen.cantidad}` 
        },
        { status: 400 }
      );
    }

    // Restar del origen
    stockOrigen.cantidad -= cantidad;

    // Buscar o crear sucursal destino
    let stockDestino = producto.stockPorSucursal.find(
      (s: any) => s.sucursalId === destinoSucursalId
    );

    if (stockDestino) {
      stockDestino.cantidad += cantidad;
    } else {
      // Si no existe, necesitamos el nombre de la sucursal destino
      const { destinoSucursalNombre } = body;
      if (!destinoSucursalNombre) {
        return NextResponse.json(
          { success: false, error: 'Falta el nombre de la sucursal destino' },
          { status: 400 }
        );
      }

      producto.stockPorSucursal.push({
        sucursalId: destinoSucursalId,
        sucursalNombre: destinoSucursalNombre,
        cantidad: cantidad,
        stockMinimo: producto.stockMinimo,
      });
    }

    // Actualizar stock total
    producto.stock = producto.stockPorSucursal.reduce(
      (total: number, s: any) => total + s.cantidad,
      0
    );

    await producto.save();

    // Verificar alertas de stock bajo
    // Verificar origen
    if (stockOrigen.cantidad <= stockOrigen.stockMinimo) {
      await (StockAlert as any).crearAlerta(
        producto._id.toString(),
        producto.nombre,
        stockOrigen.sucursalId,
        stockOrigen.sucursalNombre,
        stockOrigen.cantidad,
        stockOrigen.stockMinimo
      );
    }

    // Verificar destino si existe
    if (stockDestino) {
      if (stockDestino.cantidad <= stockDestino.stockMinimo) {
        await (StockAlert as any).crearAlerta(
          producto._id.toString(),
          producto.nombre,
          stockDestino.sucursalId,
          stockDestino.sucursalNombre,
          stockDestino.cantidad,
          stockDestino.stockMinimo
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: producto,
      message: `Transferencia exitosa: ${cantidad} unidades de ${stockOrigen.sucursalNombre} a ${stockDestino?.sucursalNombre || body.destinoSucursalNombre}`,
    });

  } catch (error: any) {
    console.error('Error en transferencia de stock:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al transferir stock' },
      { status: 500 }
    );
  }
}
