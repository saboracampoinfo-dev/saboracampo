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

    // Si se solicita historial de compras
    if (action === 'compras') {
      return NextResponse.json({
        success: true,
        data: {
          historialCompras: user.historialCompras || [],
          comprasAcumuladas: user.comprasAcumuladas || 0,
        }
      });
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
          historialCompras: user.historialCompras || [],
          horasAcumuladas: user.horasAcumuladas || 0,
          comprasAcumuladas: user.comprasAcumuladas || 0,
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
    const { userId, horas, fecha, horaEntrada, horaSalida, cumplioIncentivo, notas } = body;

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
    
    // Si cumplió el incentivo, incrementar contador de incentivos
    if (cumplioIncentivo) {
      user.incentivosAcumulados = (user.incentivosAcumulados || 0) + 1;
    }
    
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        horasAcumuladas: user.horasAcumuladas,
        horasAgregadas: horas,
        incentivosAcumulados: user.incentivosAcumulados || 0,
        cumplioIncentivo,
        horario: horaEntrada && horaSalida ? `${horaEntrada} - ${horaSalida}` : undefined,
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

// PATCH - Registrar compra
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, monto, descripcion, fecha } = body;

    if (!userId || !monto || !descripcion) {
      return NextResponse.json(
        { success: false, error: 'userId, monto y descripcion son requeridos' },
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

    // Agregar compra al historial
    if (!user.historialCompras) {
      user.historialCompras = [];
    }

    user.historialCompras.push({
      monto: parseFloat(monto),
      descripcion,
      fecha: fecha ? new Date(fecha) : new Date(),
      createdAt: new Date(),
    });

    // Acumular el monto de la compra
    user.comprasAcumuladas = (user.comprasAcumuladas || 0) + parseFloat(monto);
    
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        comprasAcumuladas: user.comprasAcumuladas,
        compraRegistrada: {
          monto: parseFloat(monto),
          descripcion,
          fecha: fecha ? new Date(fecha) : new Date(),
        }
      }
    });

  } catch (error) {
    console.error('Error en PATCH liquidaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar compra' },
      { status: 500 }
    );
  }
}

// PUT - Procesar liquidación (pagar y reiniciar contador)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, periodo, notas, metodoPago, nroComprobante } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      );
    }

    if (!metodoPago) {
      return NextResponse.json(
        { success: false, error: 'Método de pago es requerido' },
        { status: 400 }
      );
    }

    if (metodoPago === 'transferencia' && !nroComprobante) {
      return NextResponse.json(
        { success: false, error: 'Número de comprobante es requerido para transferencias' },
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
    const comprasAcumuladas = user.comprasAcumuladas || 0;
    const incentivosAcumulados = user.incentivosAcumulados || 0;
    const montoIncentivo = user.montoIncentivo || 0;
    const montoBruto = horasAcumuladas * precioHora;
    const montoIncentivos = incentivosAcumulados * montoIncentivo;
    const montoTotal = montoBruto - comprasAcumuladas + montoIncentivos;

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
      metodoPago: metodoPago,
      nroComprobante: metodoPago === 'transferencia' ? nroComprobante : undefined,
    });

    // Reiniciar contadores y actualizar fecha de liquidación
    user.horasAcumuladas = 0;
    user.comprasAcumuladas = 0;
    user.incentivosAcumulados = 0;
    user.ultimaLiquidacion = new Date();
    
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        userName: user.name,
        montoPagado: montoTotal,
        montoBruto,
        comprasDescontadas: comprasAcumuladas,
        incentivosAplicados: montoIncentivos,
        diasIncentivo: incentivosAcumulados,
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
