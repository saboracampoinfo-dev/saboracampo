import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET - Obtener un producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Incrementar visitas
    await Product.findByIdAndUpdate(id, { $inc: { visitas: 1 } });

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Validar precio si se proporciona
    if (body.precio !== undefined && body.precio < 0) {
      return NextResponse.json(
        { success: false, error: 'El precio no puede ser negativo' },
        { status: 400 }
      );
    }

    // Validar stock si se proporciona
    if (body.stock !== undefined && body.stock < 0) {
      return NextResponse.json(
        { success: false, error: 'El stock no puede ser negativo' },
        { status: 400 }
      );
    }

    // No permitir actualizar ciertos campos
    delete body._id;
    delete body.createdAt;
    delete body.visitas;
    delete body.ventas;

    const product = await Product.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating product:', error);

    // Manejar errores de duplicados
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `Ya existe un producto con ese ${field}` },
        { status: 409 }
      );
    }

    // Manejar errores de validación
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// PATCH - Actualización parcial (para cambios rápidos como stock, activo, destacado)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error patching product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Opción 1: Eliminación lógica (recomendado para mantener historial)
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Eliminación física
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Producto no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Producto eliminado permanentemente'
      });
    } else {
      // Eliminación lógica
      const product = await Product.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true }
      );

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Producto no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: product,
        message: 'Producto desactivado exitosamente'
      });
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
