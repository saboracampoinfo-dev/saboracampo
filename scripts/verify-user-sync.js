// Script para verificar y sincronizar usuarios entre MongoDB y Firebase
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function verifyUserSync() {
  console.log('🔧 Verificando sincronización de usuarios MongoDB <-> Firebase\n');

  try {
    // 1. Conectar a MongoDB
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 2. Inicializar Firebase Admin
    console.log('🔥 Inicializando Firebase Admin...');
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');

    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({ credential: cert(serviceAccount) });
    }
    const auth = getAuth();
    console.log('✅ Firebase Admin inicializado\n');

    // 3. Cargar modelo de Usuario
    const UserSchema = new mongoose.Schema({
      firebaseUid: String,
      name: String,
      email: String,
      role: String,
      createdAt: Date,
    });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // 4. Solicitar email del usuario
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('📧 Ingresa el email del usuario a verificar: ', async (email) => {
      try {
        console.log(`\n🔍 Buscando usuario: ${email}\n`);

        // Buscar en MongoDB
        console.log('📦 Verificando en MongoDB...');
        const mongoUser = await User.findOne({ email: email.toLowerCase() });
        
        if (mongoUser) {
          console.log('✅ Usuario encontrado en MongoDB:');
          console.log('   ID:', mongoUser._id.toString());
          console.log('   Nombre:', mongoUser.name);
          console.log('   Email:', mongoUser.email);
          console.log('   Rol:', mongoUser.role);
          console.log('   Firebase UID:', mongoUser.firebaseUid || '❌ NO TIENE');
          console.log('');
        } else {
          console.log('❌ Usuario NO encontrado en MongoDB\n');
        }

        // Buscar en Firebase
        console.log('🔥 Verificando en Firebase...');
        try {
          const firebaseUser = await auth.getUserByEmail(email.toLowerCase());
          console.log('✅ Usuario encontrado en Firebase:');
          console.log('   UID:', firebaseUser.uid);
          console.log('   Email:', firebaseUser.email);
          console.log('   Display Name:', firebaseUser.displayName);
          console.log('   Email Verificado:', firebaseUser.emailVerified);
          console.log('');
        } catch (fbError) {
          console.log('❌ Usuario NO encontrado en Firebase');
          console.log('   Código:', fbError.code);
          console.log('');
        }

        // Verificar sincronización
        if (mongoUser && mongoUser.firebaseUid) {
          console.log('🔄 Verificando sincronización...');
          try {
            const firebaseUserByUid = await auth.getUser(mongoUser.firebaseUid);
            if (firebaseUserByUid.email === mongoUser.email) {
              console.log('✅ Usuario sincronizado correctamente');
              console.log('');

              // Preguntar si quiere actualizar contraseña
              readline.question('¿Deseas actualizar la contraseña de este usuario? (s/n): ', async (answer) => {
                if (answer.toLowerCase() === 's') {
                  readline.question('🔑 Ingresa la nueva contraseña (mínimo 6 caracteres): ', async (newPassword) => {
                    try {
                      if (newPassword.length < 6) {
                        console.log('❌ La contraseña debe tener al menos 6 caracteres');
                      } else {
                        console.log('\n🔄 Actualizando contraseña...');
                        await auth.updateUser(mongoUser.firebaseUid, { password: newPassword });
                        console.log('✅ Contraseña actualizada exitosamente');
                        console.log('');
                        console.log('🎉 El usuario ahora puede iniciar sesión con:');
                        console.log(`   Email: ${email}`);
                        console.log(`   Contraseña: ${newPassword}`);
                      }
                    } catch (error) {
                      console.error('❌ Error al actualizar contraseña:', error.message);
                    } finally {
                      await mongoose.disconnect();
                      readline.close();
                    }
                  });
                } else {
                  await mongoose.disconnect();
                  readline.close();
                }
              });
            } else {
              console.log('⚠️ ADVERTENCIA: Los emails no coinciden');
              console.log('   MongoDB:', mongoUser.email);
              console.log('   Firebase:', firebaseUserByUid.email);
              await mongoose.disconnect();
              readline.close();
            }
          } catch (error) {
            console.log('❌ Error al verificar sincronización:', error.message);
            await mongoose.disconnect();
            readline.close();
          }
        } else {
          await mongoose.disconnect();
          readline.close();
        }

      } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        readline.close();
      }
    });

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyUserSync();
