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

    const query: Record<string, unknown> = {};

    if (estado) {
      query.estado = estado; // 'activa' | 'inactiva' | 'mantenimiento'
    }

    if (ciudad) {
      // búsqueda por ciudad (case-insensitive)
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

    // Validar datos requeridos mínimos según el schema
    if (
      !body.nombre ||
      !body.direccion ||
      !body.direccion.calle ||
      !body.direccion.numero ||
      !body.direccion.ciudad ||
      !body.direccion.provincia ||
      !body.direccion.codigoPostal ||
      !body.contacto ||
      !body.contacto.telefono ||
      !body.contacto.email ||
      !body.horarios ||
      !body.horarios.semanal ||
      !body.horarios.finDeSemana ||
      !body.imagenes ||
      !body.imagenes.principal
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos obligatorios',
        },
        { status: 400 }
      );
    }

    // Normalización ligera (por si vienen como string)
    if (body.capacidad !== undefined && body.capacidad !== null) {
      body.capacidad = Number(body.capacidad);
    }

    if (body.direccion?.coordenadas) {
      if (body.direccion.coordenadas.latitud !== undefined) {
        body.direccion.coordenadas.latitud = Number(
          body.direccion.coordenadas.latitud
        );
      }
      if (body.direccion.coordenadas.longitud !== undefined) {
        body.direccion.coordenadas.longitud = Number(
          body.direccion.coordenadas.longitud
        );
      }
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
  } catch (error: any) {
    console.error('Error al crear sucursal:', error);

    if (error?.name === 'ValidationError' && error.errors) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: Object.values(error.errors).map(
            (err: any) => err.message
          ),
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
