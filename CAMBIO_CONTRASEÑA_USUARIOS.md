# 🔐 Solución: Cambio de Contraseña de Usuarios

## 📋 Problema Identificado

Cuando intentas cambiar la contraseña de un usuario desde el panel de administración:
- ✅ La actualización en MongoDB funciona correctamente
- ❌ La actualización en Firebase Authentication falla o no se ejecuta
- ❌ El usuario no puede iniciar sesión con la nueva contraseña

## 🔍 Causas Posibles

1. **Firebase Admin no configurado correctamente** en el servidor
2. **Usuario sin `firebaseUid`** en MongoDB (usuarios antiguos)
3. **Contraseña muy corta** (Firebase requiere mínimo 6 caracteres)
4. **Error de sincronización** entre MongoDB y Firebase

## ✅ Soluciones Implementadas

### 1. Mejoras en el Endpoint `/api/users` (PUT)

Se agregaron:
- ✅ Logs detallados para debugging
- ✅ Validación de `firebaseUid`
- ✅ Mensajes de error más descriptivos
- ✅ Manejo de errores específicos de Firebase

### 2. Mejoras en el Componente `UsersManager`

Se agregaron:
- ✅ Advertencia visual al cambiar contraseña
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Placeholder descriptivo
- ✅ Mensajes de éxito más claros
- ✅ Logs en consola para debugging

### 3. Scripts de Diagnóstico

Se crearon 2 scripts para ayudar en el diagnóstico:

#### Script 1: `test-update-password.js`
Prueba directa de actualización de contraseña en Firebase.

**Uso:**
```bash
node scripts/test-update-password.js
```

Este script te permite:
- Verificar que Firebase Admin está configurado
- Probar actualizar contraseña de un usuario específico
- Ver los errores exactos si algo falla

#### Script 2: `verify-user-sync.js`
Verifica la sincronización entre MongoDB y Firebase.

**Uso:**
```bash
node scripts/verify-user-sync.js
```

Este script te permite:
- Ver si un usuario existe en MongoDB y Firebase
- Verificar si tienen el `firebaseUid` correcto
- Actualizar contraseña si está todo sincronizado

## 🚀 Pasos para Resolver el Problema

### Paso 1: Verificar Configuración de Firebase Admin

Asegúrate de que `.env.local` tenga:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={
  "type": "service_account",
  "project_id": "tu-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@....iam.gserviceaccount.com",
  ...
}
```

### Paso 2: Ejecutar Script de Diagnóstico

```bash
node scripts/verify-user-sync.js
```

Ingresa el email del usuario y verifica:
- ✅ ¿Existe en MongoDB?
- ✅ ¿Tiene `firebaseUid`?
- ✅ ¿Existe en Firebase?
- ✅ ¿Están sincronizados?

### Paso 3: Actualizar Contraseña

**Opción A: Desde el Panel de Admin**

1. Ve a Gestión de Usuarios
2. Click en "Editar" del usuario
3. Escribe la nueva contraseña (mínimo 6 caracteres)
4. Click en "Actualizar"
5. Verifica en la consola del navegador los logs

**Opción B: Usando el Script**

```bash
node scripts/verify-user-sync.js
```

Cuando el script te pregunte, ingresa:
- Email del usuario
- Di "s" (sí) para cambiar contraseña
- Ingresa la nueva contraseña

### Paso 4: Probar el Login

1. Ve a `/login`
2. Ingresa email y la nueva contraseña
3. Debería funcionar ✅

## 🔧 Debugging

Si sigues teniendo problemas, revisa:

### En el servidor (consola de terminal donde corre Next.js):

```
🔑 Intentando actualizar contraseña en Firebase para: usuario@ejemplo.com
✅ Contraseña actualizada en Firebase para: usuario@ejemplo.com
```

O si hay error:

```
❌ Error actualizando contraseña en Firebase: {
  email: 'usuario@ejemplo.com',
  firebaseUid: 'abc123...',
  error: 'Error message',
  code: 'auth/error-code'
}
```

### En el navegador (Consola de DevTools - F12):

```javascript
=== INICIO handleSubmit ===
editingUser: { _id: "...", name: "...", ... }
formData completo: { name: "...", password: "nueva123", ... }
...
✅ Usuario guardado exitosamente
```

## 🆘 Problemas Comunes

### Error: "Este usuario no tiene cuenta en Firebase"

**Causa:** Usuario antiguo sin `firebaseUid`

**Solución:**
1. Crear manualmente el usuario en Firebase Console
2. Actualizar el `firebaseUid` en MongoDB
3. O eliminar y recrear el usuario desde el panel

### Error: "WEAK_PASSWORD"

**Causa:** Contraseña muy corta

**Solución:** Usar al menos 6 caracteres

### Error: "Firebase Admin no está inicializado"

**Causa:** `FIREBASE_SERVICE_ACCOUNT_KEY` no está configurado o tiene formato incorrecto

**Solución:**
1. Verificar que la variable esté en `.env.local`
2. Verificar que sea JSON válido
3. Verificar que tenga la `private_key` completa
4. Reiniciar el servidor (`npm run dev`)

### Error: "USER_NOT_FOUND"

**Causa:** Usuario no existe en Firebase

**Solución:**
1. Verificar con el script `verify-user-sync.js`
2. Crear el usuario en Firebase Console
3. Actualizar el `firebaseUid` en MongoDB

## 📚 Archivos Modificados

- ✅ `src/app/api/users/route.ts` - Mejor manejo de errores
- ✅ `src/components/admin/UsersManager.tsx` - Validaciones y advertencias
- ✅ `scripts/test-update-password.js` - Script de prueba
- ✅ `scripts/verify-user-sync.js` - Script de verificación

## 🎯 Próximos Pasos

Si el problema persiste después de seguir estos pasos:

1. Ejecuta `node scripts/verify-user-sync.js` y comparte el output
2. Revisa los logs del servidor cuando intentas cambiar la contraseña
3. Revisa los logs de la consola del navegador
4. Verifica que Firebase Admin esté inicializado correctamente

## 📞 Necesitas más ayuda?

Si sigues teniendo problemas, proporciona:
- ✅ Output del script `verify-user-sync.js`
- ✅ Logs del servidor (terminal)
- ✅ Logs del navegador (DevTools Console)
- ✅ Mensaje de error exacto

---

**Última actualización:** 25 de noviembre de 2025
