import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StockAlert from '@/models/StockAlert';
import { verifyToken } from '@/lib/jwt';

// GET /api/stock-alerts - Obtener alertas de stock
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || 'pendiente';
    const tipo = searchParams.get('tipo');
    const sucursalId = searchParams.get('sucursalId');

    const query: any = {};
    if (estado) query.estado = estado;
    if (tipo) query.tipo = tipo;
    if (sucursalId) query.sucursalId = sucursalId;

    const alertas = await StockAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: alertas,
      count: alertas.length,
    });

  } catch (error: any) {
    console.error('Error al obtener alertas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener alertas' },
      { status: 500 }
    );
  }
}

// PUT /api/stock-alerts - Actualizar estado de alerta
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { alertaId, estado } = body;

    if (!alertaId || !estado) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const alerta = await StockAlert.findById(alertaId);
    if (!alerta) {
      return NextResponse.json(
        { success: false, error: 'Alerta no encontrada' },
        { status: 404 }
      );
    }

    if (estado === 'resuelto') {
      alerta.estado = 'resuelto';
      alerta.resueltoPor = decoded.userId;
      alerta.resueltaEn = new Date();
      await alerta.save();
    } else {
      alerta.estado = estado;
      await alerta.save();
    }

    return NextResponse.json({
      success: true,
      data: alerta,
      message: 'Alerta actualizada correctamente',
    });

  } catch (error: any) {
    console.error('Error al actualizar alerta:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar alerta' },
      { status: 500 }
    );
  }
}

// DELETE /api/stock-alerts - Eliminar alerta
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const alertaId = searchParams.get('id');

    if (!alertaId) {
      return NextResponse.json(
        { success: false, error: 'ID de alerta requerido' },
        { status: 400 }
      );
    }

    await StockAlert.findByIdAndDelete(alertaId);

    return NextResponse.json({
      success: true,
      message: 'Alerta eliminada correctamente',
    });

  } catch (error: any) {
    console.error('Error al eliminar alerta:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar alerta' },
      { status: 500 }
    );
  }
}
