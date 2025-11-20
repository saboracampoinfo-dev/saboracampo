import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Validar que las variables de entorno estén presentes
if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  console.error('❌ FIREBASE_ADMIN_PROJECT_ID no está configurada');
}
if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  console.error('❌ FIREBASE_ADMIN_CLIENT_EMAIL no está configurada');
}
if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error('❌ FIREBASE_ADMIN_PRIVATE_KEY no está configurada');
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

export function initAdmin() {
  if (getApps().length === 0) {
    try {
      initializeApp(firebaseAdminConfig);
      console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error: any) {
      console.error('❌ Error al inicializar Firebase Admin:', error.message);
      throw error;
    }
  }
}

export const adminAuth = () => {
  initAdmin();
  return getAuth();
};

export const adminDb = () => {
  initAdmin();
  return getFirestore();
};

// Export auth instance directly for convenience
initAdmin();
export const auth = getAuth();
