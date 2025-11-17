import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sucursal from '@/models/Sucursal';

// GET - Obtener todas las sucursales o filtrar
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const ciudad = searchParams.get('ciudad');

    let query: Record<string, unknown> = {};

    if (estado) {
      query.estado = estado;
    }

    if (ciudad) {
      query['direccion.ciudad'] = new RegExp(ciudad, 'i');
    }

    const sucursales = await Sucursal.find(query).sort({ nombre: 1 });

    return NextResponse.json({
      success: true,
      data: sucursales,
      total: sucursales.length,
    });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las sucursales',
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sucursal
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validar datos requeridos
    if (!body.nombre || !body.direccion || !body.contacto || !body.horarios || !body.imagenes) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos obligatorios',
        },
        { status: 400 }
      );
    }

    // Crear nueva sucursal
    const nuevaSucursal = await Sucursal.create(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Sucursal creada exitosamente',
        data: nuevaSucursal,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error al crear sucursal:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationError = error as { errors: Record<string, { message: string }> };
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: Object.values(validationError.errors).map((err) => err.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la sucursal',
      },
      { status: 500 }
    );
  }
}
