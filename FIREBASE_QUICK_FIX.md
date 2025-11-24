# 🚀 SOLUCIÓN RÁPIDA: Firebase Admin en Producción

## ❌ El Error
```
error:1E08010C:DECODER routines::unsupported
Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token
```

---

## ✅ SOLUCIÓN RECOMENDADA (La más fácil)

### En Vercel → Settings → Environment Variables

Agrega **UNA SOLA** variable de entorno:

**Variable:** `FIREBASE_SERVICE_ACCOUNT_KEY`

**Valor:** Copia el JSON completo del service account de Firebase

```json
{"type":"service_account","project_id":"saboracampo","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@saboracampo.iam.gserviceaccount.com",...}
```

### ¿Dónde obtener el JSON?

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. ⚙️ Project Settings → Service Accounts
4. Click en "Generate new private key"
5. Se descargará un archivo `.json`
6. Copia TODO el contenido del archivo
7. Pégalo en Vercel como valor de `FIREBASE_SERVICE_ACCOUNT_KEY`

### ✅ Ventajas de este método:
- ✨ Una sola variable de entorno
- 🎯 No hay problemas con saltos de línea
- 🔒 Más seguro y fácil de rotar
- 🚀 El código ya está preparado para usarlo

---

## 🔄 Alternativa: Variables Separadas

Si prefieres usar variables individuales en Vercel:

### 1. `FIREBASE_ADMIN_PROJECT_ID`
```
saboracampo
```

### 2. `FIREBASE_ADMIN_CLIENT_EMAIL`
```
firebase-adminsdk-fbsvc@saboracampo.iam.gserviceaccount.com
```

### 3. `FIREBASE_ADMIN_PRIVATE_KEY`

⚠️ **CRÍTICO:** En Vercel, pega la clave CON saltos de línea REALES (no `\n` literales)

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD+ORgOZMYT9owz
WvFddMj0xS1O0RUdEQ+kgNCerrte3FRKiGkdBvpy7cVIuspAI+CY9muN4rndmKn4
... (cada línea en su propia línea) ...
GQLUeKQjymh9szrYboR1zGMP
-----END PRIVATE KEY-----
```

**Cómo copiar correctamente:**
1. Abre el JSON del service account
2. Busca el campo `"private_key"`
3. Copia el valor (verás `\n` en el JSON)
4. Al pegar en Vercel, reemplaza `\n` con saltos de línea REALES (Enter)

---

## 🧪 Verificar que funcione

### Localmente:
```bash
node scripts/verify-firebase-admin.js
```

Deberías ver:
```
🎉 ¡TODO ESTÁ CORRECTO!
   Firebase Admin está listo para usarse en producción.
```

### En Vercel:
Después de configurar las variables y hacer redeploy, revisa los logs de Functions. Deberías ver:

```
✅ Firebase Admin inicializado correctamente
✅ Usando FIREBASE_SERVICE_ACCOUNT_KEY (JSON completo)
```

o

```
✅ Usando variables individuales de Firebase Admin
```

---

## 📋 Checklist Final

- [ ] Obtener JSON de service account desde Firebase Console
- [ ] Agregar `FIREBASE_SERVICE_ACCOUNT_KEY` en Vercel (método recomendado)
  - O agregar las 3 variables individuales con formato correcto
- [ ] Hacer redeploy en Vercel
- [ ] Verificar logs de Functions
- [ ] Probar registro de usuario desde la app

---

## 🆘 Si sigue sin funcionar

1. **Regenera las credenciales** en Firebase Console
2. **Verifica que el proyecto sea el correcto** (saboracampo)
3. **Revisa los permisos** del service account en Firebase IAM
4. **Contacta al equipo** con los logs completos

---

## 📖 Documentación Completa

Ver: `FIREBASE_ADMIN_PRODUCCION.md` para detalles adicionales

## 🔐 Seguridad

⚠️ **NUNCA** commitees el archivo JSON a Git  
⚠️ **NUNCA** compartas las credenciales públicamente  
✅ **USA** variables de entorno en todos los ambientes  
✅ **ROTA** las claves periódicamente
