import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Función para procesar la clave privada de múltiples formatos
function processPrivateKey(key: string): string {
  if (!key) {
    throw new Error('❌ Private key is empty');
  }

  let processedKey = key;

  // 1. Remover comillas externas si existen
  processedKey = processedKey.replace(/^["']|["']$/g, '');

  // 2. Reemplazar \n literales con saltos de línea reales
  // Esto maneja tanto \\n como \n
  processedKey = processedKey.replace(/\\n/g, '\n');

  // 3. Si la clave viene en una sola línea sin saltos, intentar decodificar Base64
  if (!processedKey.includes('\n') && processedKey.length > 100) {
    try {
      processedKey = Buffer.from(processedKey, 'base64').toString('utf-8');
    } catch (e) {
      // No es base64, continuar con el valor original
    }
  }

  // 4. Validar formato básico de la clave
  if (!processedKey.includes('BEGIN PRIVATE KEY') || !processedKey.includes('END PRIVATE KEY')) {
    throw new Error('❌ Private key format is invalid. Must contain BEGIN and END markers.');
  }

  // 5. Asegurar que la clave tenga el formato correcto con saltos de línea
  // Limpiar espacios extras y normalizar
  processedKey = processedKey.trim();

  return processedKey;
}

// Función para cargar credenciales desde JSON o variables individuales
function getFirebaseCredentials(): ServiceAccount {
  // Opción 1: Usar JSON completo de service account
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      // Validar que tenga los campos necesarios
      if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error('❌ Service account JSON incompleto');
      }

      console.log('✅ Usando FIREBASE_SERVICE_ACCOUNT_KEY (JSON completo)');
      
      return {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: processPrivateKey(serviceAccount.private_key),
      } as ServiceAccount;
    } catch (error: any) {
      console.error('❌ Error parseando FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
      throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_KEY tiene formato JSON inválido');
    }
  }

  // Opción 2: Usar variables individuales (método tradicional)
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
    throw new Error('❌ FIREBASE_ADMIN_PROJECT_ID no está configurada (o usa FIREBASE_SERVICE_ACCOUNT_KEY)');
  }
  if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    throw new Error('❌ FIREBASE_ADMIN_CLIENT_EMAIL no está configurada (o usa FIREBASE_SERVICE_ACCOUNT_KEY)');
  }
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    throw new Error('❌ FIREBASE_ADMIN_PRIVATE_KEY no está configurada (o usa FIREBASE_SERVICE_ACCOUNT_KEY)');
  }

  console.log('✅ Usando variables individuales de Firebase Admin');

  // Procesar la clave privada
  let privateKey: string;
  try {
    privateKey = processPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  } catch (error: any) {
    console.error('❌ Error procesando FIREBASE_ADMIN_PRIVATE_KEY:', error.message);
    throw error;
  }

  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
  } as ServiceAccount;
}

const firebaseAdminConfig = {
  credential: cert(getFirebaseCredentials()),
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
