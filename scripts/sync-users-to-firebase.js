// Script para sincronizar usuarios de MongoDB con Firebase
// Crea usuarios en Firebase si solo existen en MongoDB
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function syncUsersToFirebase() {
  console.log('🔧 Sincronizando usuarios MongoDB → Firebase\n');

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

    // 4. Buscar usuarios sin firebaseUid
    console.log('🔍 Buscando usuarios sin firebaseUid...');
    const usersWithoutFirebaseUid = await User.find({
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    });

    console.log(`📊 Encontrados ${usersWithoutFirebaseUid.length} usuarios sin firebaseUid\n`);

    if (usersWithoutFirebaseUid.length === 0) {
      console.log('✅ Todos los usuarios ya están sincronizados');
      await mongoose.disconnect();
      return;
    }

    // 5. Sincronizar cada usuario
    let created = 0;
    let updated = 0;
    let errors = 0;

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
          updated++;
        } catch (fbError) {
          if (fbError.code === 'auth/user-not-found') {
            // Usuario no existe en Firebase, crearlo
            console.log('   ➕ Creando usuario en Firebase...');
            
            // Generar contraseña temporal
            const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
            
            firebaseUser = await auth.createUser({
              email: user.email.toLowerCase(),
              password: tempPassword,
              displayName: user.name,
              emailVerified: false,
            });
            
            console.log('   ✅ Usuario creado en Firebase');
            console.log('   🔗 UID:', firebaseUser.uid);
            console.log('   🔑 Contraseña temporal:', tempPassword);
            console.log('   ⚠️  El usuario debe usar "Olvidé mi contraseña" para establecer su contraseña');
            
            // Actualizar MongoDB con el firebaseUid
            await User.findByIdAndUpdate(user._id, {
              firebaseUid: firebaseUser.uid
            });
            console.log('   ✅ MongoDB actualizado con firebaseUid');
            created++;
          } else {
            throw fbError;
          }
        }
      } catch (error) {
        console.error('   ❌ Error:', error.message);
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

    if (created > 0) {
      console.log('\n⚠️  IMPORTANTE:');
      console.log('Los usuarios creados tienen contraseñas temporales.');
      console.log('Deben usar "Olvidé mi contraseña" para establecer su propia contraseña.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Proceso completado');

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar
syncUsersToFirebase();
