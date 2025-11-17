import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET - Obtener todos los productos con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Parámetros de búsqueda
    const categoria = searchParams.get('categoria');
    const activo = searchParams.get('activo');
    const destacado = searchParams.get('destacado');
    const search = searchParams.get('search');
    const minPrecio = searchParams.get('minPrecio');
    const maxPrecio = searchParams.get('maxPrecio');
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Parámetros de ordenamiento
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Construir filtro
    const filter: any = {};
    
    if (categoria) filter.categoria = categoria;
    if (activo !== null && activo !== undefined) filter.activo = activo === 'true';
    if (destacado !== null && destacado !== undefined) filter.destacado = destacado === 'true';
    
    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } },
        { etiquetas: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrecio || maxPrecio) {
      filter.precio = {};
      if (minPrecio) filter.precio.$gte = parseFloat(minPrecio);
      if (maxPrecio) filter.precio.$lte = parseFloat(maxPrecio);
    }

    // Obtener productos
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Contar total de documentos
    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validar campos requeridos
    if (!body.nombre || !body.categoria || body.precio === undefined) {
      return NextResponse.json(
        { success: false, error: 'Nombre, categoría y precio son requeridos' },
        { status: 400 }
      );
    }

    // Validar precio
    if (body.precio < 0) {
      return NextResponse.json(
        { success: false, error: 'El precio no puede ser negativo' },
        { status: 400 }
      );
    }

    // Validar stock
    if (body.stock !== undefined && body.stock < 0) {
      return NextResponse.json(
        { success: false, error: 'El stock no puede ser negativo' },
        { status: 400 }
      );
    }

    // Crear producto
    const product = await Product.create(body);

    return NextResponse.json(
      { success: true, data: product, message: 'Producto creado exitosamente' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    
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
      { success: false, error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}
