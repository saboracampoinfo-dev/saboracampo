import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role, 
      precioHora, 
      telefono, 
      domicilio, 
      tipoDocumento, 
      nroDocumento, 
      porcentajeComision 
    } = body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, contraseña y nombre son requeridos',
        },
        { status: 400 }
      );
    }

    // Crear usuario en Firebase
    let firebaseUser;
    try {
      firebaseUser = await adminAuth().createUser({
        email: email.toLowerCase(),
        password,
        displayName: name,
      });
    } catch (firebaseError: any) {
      console.error('Error creating Firebase user:', firebaseError);
      return NextResponse.json(
        {
          success: false,
          error: `Error al crear usuario en Firebase: ${firebaseError.message}`,
        },
        { status: 400 }
      );
    }

    // Crear usuario en MongoDB
    const userData: any = {
      firebaseUid: firebaseUser.uid,
      name,
      email: email.toLowerCase(),
      role: role || 'user',
      activo: true,
    };

    // Agregar campos opcionales si están presentes
    if (telefono) userData.telefono = telefono;
    if (domicilio) userData.domicilio = domicilio;
    if (tipoDocumento) userData.tipoDocumento = tipoDocumento;
    if (nroDocumento) userData.nroDocumento = nroDocumento;

    // Agregar precioHora, montoIncentivo y porcentajeComision si el rol es seller o cashier
    if ((role === 'seller' || role === 'cashier')) {
      if (precioHora !== undefined) userData.precioHora = precioHora;
      if (body.montoIncentivo !== undefined) userData.montoIncentivo = body.montoIncentivo;
      if (porcentajeComision !== undefined) userData.porcentajeComision = porcentajeComision;
    }

    const user = await User.create(userData);
    
    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'Usuario creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de usuario requerido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, role, password, precioHora, telefono, domicilio, tipoDocumento, nroDocumento, porcentajeComision } = body;

    // Buscar usuario en MongoDB
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    // Preparar datos a actualizar
    const updateData: any = {};

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (domicilio !== undefined) updateData.domicilio = domicilio;
    if (tipoDocumento !== undefined) updateData.tipoDocumento = tipoDocumento;
    if (nroDocumento !== undefined) updateData.nroDocumento = nroDocumento;

    // Si el rol es seller o cashier, actualizar precioHora, montoIncentivo y porcentajeComision
    if ((role === 'seller' || role === 'cashier') && precioHora !== undefined) {
      updateData.precioHora = precioHora;
    }
    if ((role === 'seller' || role === 'cashier') && body.montoIncentivo !== undefined) {
      updateData.montoIncentivo = body.montoIncentivo;
    }
    if ((role === 'seller' || role === 'cashier') && porcentajeComision !== undefined) {
      updateData.porcentajeComision = porcentajeComision;
    }

    // Si se proporciona contraseña, actualizar en Firebase
    if (password && user.firebaseUid) {
      try {
        console.log('🔑 Intentando actualizar contraseña en Firebase para:', user.email);
        const auth = adminAuth();
        await auth.updateUser(user.firebaseUid, {
          password,
          displayName: name || user.name,
        });
        console.log('✅ Contraseña actualizada en Firebase para:', user.email);
      } catch (firebaseError: any) {
        console.error('❌ Error actualizando contraseña en Firebase:', {
          email: user.email,
          firebaseUid: user.firebaseUid,
          error: firebaseError.message,
          code: firebaseError.code,
        });
        return NextResponse.json(
          {
            success: false,
            error: `Error al actualizar contraseña en Firebase: ${firebaseError.message}. Código: ${firebaseError.code}`,
          },
          { status: 400 }
        );
      }
    } else if (password && !user.firebaseUid) {
      console.warn('⚠️ Usuario sin firebaseUid, no se puede actualizar contraseña:', user.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Este usuario no tiene cuenta en Firebase. Contacte al administrador.',
        },
        { status: 400 }
      );
    }

    // Actualizar usuario en MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de usuario requerido',
        },
        { status: 400 }
      );
    }

    // Buscar usuario en MongoDB
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    // Eliminar usuario de Firebase si existe
    if (user.firebaseUid) {
      try {
        await adminAuth().deleteUser(user.firebaseUid);
      } catch (firebaseError: any) {
        console.error('Error deleting Firebase user:', firebaseError);
        // Continuar con la eliminación en MongoDB aunque falle en Firebase
      }
    }

    // Eliminar usuario de MongoDB
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}
