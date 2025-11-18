import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).select('-password').limit(10);
    
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
    const { email, password, name, role, precioHora } = body;

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
      firebaseUser = await auth.createUser({
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

    // Agregar precioHora si el rol es seller o cashier
    if ((role === 'seller' || role === 'cashier') && precioHora !== undefined) {
      userData.precioHora = precioHora;
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
    const { name, role, password, precioHora } = body;

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

    // Si el rol es seller o cashier, actualizar precioHora
    if ((role === 'seller' || role === 'cashier') && precioHora !== undefined) {
      updateData.precioHora = precioHora;
    }

    // Si se proporciona contraseña, actualizar en Firebase
    if (password && user.firebaseUid) {
      try {
        await auth.updateUser(user.firebaseUid, {
          password,
          displayName: name || user.name,
        });
      } catch (firebaseError: any) {
        console.error('Error updating Firebase user:', firebaseError);
        return NextResponse.json(
          {
            success: false,
            error: `Error al actualizar contraseña en Firebase: ${firebaseError.message}`,
          },
          { status: 400 }
        );
      }
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
        await auth.deleteUser(user.firebaseUid);
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
