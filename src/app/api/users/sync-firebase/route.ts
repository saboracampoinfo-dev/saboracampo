import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Verificar que el usuario esté autenticado y sea admin
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Conectar a MongoDB
    await dbConnect();

    // Buscar usuarios sin firebaseUid
    const usersWithoutFirebaseUid = await User.find({
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    });

    console.log(`📊 Encontrados ${usersWithoutFirebaseUid.length} usuarios sin firebaseUid`);

    if (usersWithoutFirebaseUid.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Todos los usuarios ya están sincronizados',
        stats: {
          total: 0,
          created: 0,
          updated: 0,
          errors: 0,
        },
      });
    }

    const auth = adminAuth();
    let created = 0;
    let updated = 0;
    let errors = 0;
    const details: any[] = [];

    // Procesar cada usuario
    for (const user of usersWithoutFirebaseUid) {
      try {
        console.log(`\n👤 Procesando: ${user.email}`);
        
        // Verificar si el usuario ya existe en Firebase
        let firebaseUser;
        try {
          firebaseUser = await auth.getUserByEmail(user.email.toLowerCase());
          console.log('   ℹ️  Usuario ya existe en Firebase');
          console.log('   🔗 UID:', firebaseUser.uid);
          
          // Actualizar MongoDB con el firebaseUid
          await User.findByIdAndUpdate(user._id, {
            firebaseUid: firebaseUser.uid
          });
          console.log('   ✅ MongoDB actualizado con firebaseUid');
          
          details.push({
            email: user.email,
            status: 'updated',
            message: 'Usuario sincronizado (ya existía en Firebase)',
            firebaseUid: firebaseUser.uid,
          });
          updated++;
        } catch (fbError: any) {
          if (fbError.code === 'auth/user-not-found') {
            // Usuario no existe en Firebase, crearlo
            console.log('   ➕ Creando usuario en Firebase...');
            
            // Generar contraseña temporal segura
            const tempPassword = Math.random().toString(36).slice(-8) + 
                                Math.random().toString(36).slice(-8).toUpperCase() + 
                                '123!';
            
            firebaseUser = await auth.createUser({
              email: user.email.toLowerCase(),
              password: tempPassword,
              displayName: user.name,
              emailVerified: false,
            });
            
            console.log('   ✅ Usuario creado en Firebase');
            console.log('   🔗 UID:', firebaseUser.uid);
            
            // Actualizar MongoDB con el firebaseUid
            await User.findByIdAndUpdate(user._id, {
              firebaseUid: firebaseUser.uid
            });
            console.log('   ✅ MongoDB actualizado con firebaseUid');
            
            details.push({
              email: user.email,
              status: 'created',
              message: 'Usuario creado en Firebase. Debe usar "Olvidé mi contraseña" para establecer su contraseña.',
              firebaseUid: firebaseUser.uid,
              tempPassword: tempPassword, // Solo para referencia del admin
            });
            created++;
          } else {
            throw fbError;
          }
        }
      } catch (error: any) {
        console.error('   ❌ Error:', error.message);
        details.push({
          email: user.email,
          status: 'error',
          message: error.message,
        });
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN:');
    console.log('='.repeat(50));
    console.log(`✅ Usuarios sincronizados (ya existían): ${updated}`);
    console.log(`➕ Usuarios creados en Firebase: ${created}`);
    console.log(`❌ Errores: ${errors}`);
    console.log('='.repeat(50));

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${created} creados, ${updated} actualizados, ${errors} errores`,
      stats: {
        total: usersWithoutFirebaseUid.length,
        created,
        updated,
        errors,
      },
      details,
    });
  } catch (error: any) {
    console.error('❌ Error en sync-users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al sincronizar usuarios',
      },
      { status: 500 }
    );
  }
}

// GET para verificar cuántos usuarios necesitan sincronización
export async function GET(request: Request) {
  try {
    // Verificar que el usuario esté autenticado y sea admin
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Conectar a MongoDB
    await dbConnect();

    // Contar usuarios sin firebaseUid
    const count = await User.countDocuments({
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    });

    // Obtener lista de emails
    const users = await User.find({
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    }).select('email name role');

    return NextResponse.json({
      success: true,
      count,
      needsSync: count > 0,
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error en sync-users GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al verificar usuarios',
      },
      { status: 500 }
    );
  }
}
