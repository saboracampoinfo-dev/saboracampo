# 🔥 Solución: Error Firebase Admin - Invalid JWT Signature

## 🚨 Problema
```
Error: Credential implementation provided to initializeApp() via the "credential" property 
failed to fetch a valid Google OAuth2 access token with the following error: 
"invalid_grant: Invalid JWT Signature."
```

## ✅ Solución: Regenerar Credenciales de Firebase Admin

### Paso 1: Ir a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **saboracampo**

### Paso 2: Generar Nueva Clave de Cuenta de Servicio
1. En el menú lateral, haz clic en el **ícono de engranaje ⚙️** → **Configuración del proyecto**
2. Ve a la pestaña **"Cuentas de servicio"**
3. Desplázate hacia abajo hasta la sección **"Claves privadas de Firebase Admin SDK"**
4. Haz clic en **"Generar nueva clave privada"**
5. Se descargará un archivo JSON (ejemplo: `saboracampo-firebase-adminsdk-xxxxx.json`)

### Paso 3: Extraer Credenciales del Archivo JSON
Abre el archivo JSON descargado. Tendrá esta estructura:
```json
{
  "type": "service_account",
  "project_id": "saboracampo",
  "private_key_id": "xxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@saboracampo.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Paso 4: Actualizar .env.local
Abre tu archivo `.env.local` y actualiza estas 3 variables:

```bash
# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=saboracampo
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@saboracampo.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:** 
- Copia el `private_key` COMPLETO incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Mantén los `\n` tal como están en el JSON
- Asegúrate de usar comillas dobles `"` alrededor de la clave privada

### Paso 5: Reiniciar el Servidor
```bash
# Detener el servidor (Ctrl + C)
# Iniciar de nuevo
npm run dev
```

## 🔍 Verificar la Configuración

Puedes crear un archivo de prueba para verificar:

```typescript
// test-firebase-admin.ts
import { initAdmin, adminAuth } from '@/lib/firebase-admin';

async function testFirebaseAdmin() {
  try {
    initAdmin();
    const auth = adminAuth();
    console.log('✅ Firebase Admin inicializado correctamente');
    
    // Listar usuarios (prueba)
    const users = await auth.listUsers(1);
    console.log('✅ Conexión exitosa. Usuarios encontrados:', users.users.length);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFirebaseAdmin();
```

## 🛡️ Seguridad

### ❌ NO HACER:
- ❌ No subas el archivo JSON de credenciales a Git
- ❌ No compartas las credenciales en público
- ❌ No uses las credenciales en el cliente (solo servidor)

### ✅ HACER:
- ✅ Mantén `.env.local` en `.gitignore`
- ✅ Usa variables de entorno en producción
- ✅ Regenera claves si fueron comprometidas

## 🔧 Alternativa: Verificar Service Account Actual

Si prefieres verificar si tu Service Account actual es válida:

1. Ve a [IAM Service Accounts](https://console.firebase.google.com/project/saboracampo/settings/iam)
2. Busca: `firebase-adminsdk-fbsvc@saboracampo.iam.gserviceaccount.com`
3. Verifica que esté **activa** y tenga los permisos correctos
4. Si está deshabilitada o no existe, genera una nueva clave (Paso 2)

## 📝 Notas Adicionales

### Formato correcto de FIREBASE_ADMIN_PRIVATE_KEY:
```bash
# Opción 1: Con comillas y \n literales
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"

# Opción 2: En una línea (no recomendado pero funcional)
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n
```

El código en `firebase-admin.ts` ya maneja la conversión de `\\n` a saltos de línea reales:
```typescript
privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
```

## 🆘 Si el Problema Persiste

1. **Sincronizar el reloj del sistema** (Windows):
   ```powershell
   # PowerShell como Administrador
   w32tm /resync
   ```

2. **Verificar que el proyecto ID sea correcto**:
   - Debe ser: `saboracampo`
   - No: `saboracampo-xxxxx` u otra variación

3. **Crear una nueva Service Account**:
   - En Firebase Console → IAM
   - Crear nueva cuenta de servicio
   - Asignar rol: "Firebase Admin"
   - Generar clave

## ✅ Checklist Final

- [ ] Descargué nuevo archivo JSON de Firebase
- [ ] Copié `project_id` a `FIREBASE_ADMIN_PROJECT_ID`
- [ ] Copié `client_email` a `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] Copié `private_key` completa a `FIREBASE_ADMIN_PRIVATE_KEY`
- [ ] Incluí comillas dobles alrededor de `private_key`
- [ ] Reinicié el servidor de desarrollo
- [ ] Probé el registro de usuario

---

**Creado:** 2025-11-20  
**Proyecto:** Sabor a Campo
