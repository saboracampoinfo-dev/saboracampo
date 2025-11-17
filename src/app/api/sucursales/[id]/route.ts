import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sucursal from '@/models/Sucursal';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET - Obtener sucursal por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

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
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

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
  } catch (error: unknown) {
    console.error('Error al actualizar sucursal:', error);

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
        error: 'Error al actualizar la sucursal',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sucursal
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

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
