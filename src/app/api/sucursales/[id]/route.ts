import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Sucursal from '@/models/Sucursal';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Helper para validar ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Obtener sucursal por ID
export async function GET(request: NextRequest, segmentData: Params) {
  try {
    await connectDB();

    const { id } = await segmentData.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de sucursal inválido',
        },
        { status: 400 }
      );
    }

    const sucursal = await Sucursal.findById(id);

    if (!sucursal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sucursal no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sucursal,
    });
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la sucursal',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar sucursal
export async function PUT(request: NextRequest, segmentData: Params) {
  try {
    await connectDB();

    const { id } = await segmentData.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de sucursal inválido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Normalización ligera igual que en POST
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

    const sucursalActualizada = await Sucursal.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!sucursalActualizada) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sucursal no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sucursal actualizada exitosamente',
      data: sucursalActualizada,
    });
  } catch (error: any) {
    console.error('Error al actualizar sucursal:', error);

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
        error: 'Error al actualizar la sucursal',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sucursal
export async function DELETE(request: NextRequest, segmentData: Params) {
  try {
    await connectDB();

    const { id } = await segmentData.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de sucursal inválido',
        },
        { status: 400 }
      );
    }

    const sucursalEliminada = await Sucursal.findByIdAndDelete(id);

    if (!sucursalEliminada) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sucursal no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sucursal eliminada exitosamente',
      data: sucursalEliminada,
    });
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar la sucursal',
      },
      { status: 500 }
    );
  }
}
