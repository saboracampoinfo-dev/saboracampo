import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET - Obtener liquidaciones pendientes o historial
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const period = searchParams.get('period'); // '1', '7', '28'
    const action = searchParams.get('action'); // 'calculate' o 'history'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.role !== 'seller' && user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Este usuario no es vendedor ni cajero' },
        { status: 400 }
      );
    }

    // Si se solicita historial
    if (action === 'history') {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          historialPagos: user.historialPagos || [],
          horasAcumuladas: user.horasAcumuladas || 0,
          precioHora: user.precioHora || 0,
          ultimaLiquidacion: user.ultimaLiquidacion,
        }
      });
    }

    // Calcular liquidación según período
    const horasAcumuladas = user.horasAcumuladas || 0;
    const precioHora = user.precioHora || 0;

    let diasPeriodo = 1;
    if (period === '7') diasPeriodo = 7;
    else if (period === '28') diasPeriodo = 28;

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasPeriodo);

    const montoTotal = horasAcumuladas * precioHora;

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        userName: user.name,
        horasAcumuladas,
        precioHora,
        diasPeriodo,
        montoTotal,
        fechaInicio,
        fechaFin: new Date(),
      }
    });

  } catch (error) {
    console.error('Error en GET liquidaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener liquidaciones' },
      { status: 500 }
    );
  }
}

// POST - Registrar horas trabajadas
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, horas, fecha, notas } = body;

    if (!userId || !horas) {
      return NextResponse.json(
        { success: false, error: 'userId y horas son requeridos' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.role !== 'seller' && user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Este usuario no es vendedor ni cajero' },
        { status: 400 }
      );
    }

    // Agregar horas al acumulado
    user.horasAcumuladas = (user.horasAcumuladas || 0) + parseFloat(horas);
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        horasAcumuladas: user.horasAcumuladas,
        horasAgregadas: horas,
      }
    });

  } catch (error) {
    console.error('Error en POST liquidaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar horas' },
      { status: 500 }
    );
  }
}

// PUT - Procesar liquidación (pagar y reiniciar contador)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, periodo, notas } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.role !== 'seller' && user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Este usuario no es vendedor ni cajero' },
        { status: 400 }
      );
    }

    const horasAcumuladas = user.horasAcumuladas || 0;
    const precioHora = user.precioHora || 0;
    const montoTotal = horasAcumuladas * precioHora;

    if (horasAcumuladas === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay horas acumuladas para liquidar' },
        { status: 400 }
      );
    }

    // Calcular período
    let diasPeriodo = 1;
    if (periodo === '7') diasPeriodo = 7;
    else if (periodo === '28') diasPeriodo = 28;

    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasPeriodo);

    // Registrar el pago en el historial
    if (!user.historialPagos) {
      user.historialPagos = [];
    }

    user.historialPagos.push({
      amount: montoTotal,
      hoursWorked: horasAcumuladas,
      period: {
        start: fechaInicio,
        end: fechaFin,
      },
      createdAt: new Date(),
      notes: notas || `Liquidación de ${diasPeriodo} día${diasPeriodo > 1 ? 's' : ''}`,
    });

    // Reiniciar contador de horas y actualizar fecha de liquidación
    user.horasAcumuladas = 0;
    user.ultimaLiquidacion = new Date();
    
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        userName: user.name,
        montoPagado: montoTotal,
        horasTrabajadas: horasAcumuladas,
        precioHora,
        periodo: {
          dias: diasPeriodo,
          inicio: fechaInicio,
          fin: fechaFin,
        },
        ultimaLiquidacion: user.ultimaLiquidacion,
      }
    });

  } catch (error) {
    console.error('Error en PUT liquidaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar liquidación' },
      { status: 500 }
    );
  }
}
