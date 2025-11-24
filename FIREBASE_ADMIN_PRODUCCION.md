# 🔥 Configuración de Firebase Admin en Producción

## ❌ Error Común
```
error:1E08010C:DECODER routines::unsupported
Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token
```

Este error ocurre cuando la clave privada de Firebase Admin no está correctamente formateada en las variables de entorno de producción.

---

## 📋 Paso a Paso para Configurar en Vercel

### 1. **Obtener las credenciales de Firebase**

Ve a Firebase Console → Project Settings → Service Accounts → Generate new private key

Esto descargará un archivo JSON similar a:
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### 2. **Configurar Variables de Entorno en Vercel**

#### Opción A: Variables Separadas (Recomendado)

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

**FIREBASE_ADMIN_PROJECT_ID**
```
tu-proyecto-id
```

**FIREBASE_ADMIN_CLIENT_EMAIL**
```
firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
```

**FIREBASE_ADMIN_PRIVATE_KEY** ⚠️ **IMPORTANTE**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD+ORgOZMYT9owz
WvFddMj0xS1O0RUdEQ+kgNCerrte3FRKiGkdBvpy7cVIuspAI+CY9muN4rndmKn4
... (resto de la clave) ...
GQLUeKQjymh9szrYboR1zGMP
-----END PRIVATE KEY-----
```

**🔴 CRÍTICO: En Vercel, pega la clave privada CON saltos de línea reales**

NO uses `\n` literales. Copia y pega directamente desde el JSON de Firebase, incluyendo los saltos de línea.

#### Opción B: Variable JSON Completa (Alternativa) ⭐ **MÁS FÁCIL**

Si prefieres una configuración más simple, usa el JSON completo del service account:

**FIREBASE_SERVICE_ACCOUNT_KEY**
```json
{"type":"service_account","project_id":"tu-proyecto","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----\n","client_email":"..."}
```

✅ **Ventajas:**
- Una sola variable de entorno
- No hay problemas con el formato de la clave privada
- Más fácil de configurar
- Funciona automáticamente (el código ya está preparado)

---

## 🖥️ Configuración en `.env.local` (Desarrollo)

Para desarrollo local, las variables deben estar en UNA línea con `\n` literales:

```bash
FIREBASE_ADMIN_PROJECT_ID=tu-proyecto
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----\n"
```

**Nota:** Las comillas dobles son obligatorias y los `\n` deben ser literales (no saltos de línea reales).

---

## 🔍 Comparación de Formatos

| Entorno | Formato de PRIVATE_KEY | Ejemplo |
|---------|------------------------|---------|
| **Vercel/Producción** | Con saltos de línea REALES | `-----BEGIN PRIVATE KEY-----`<br>`MIIEvgIB...`<br>`-----END PRIVATE KEY-----` |
| **Local (.env.local)** | Con `\n` literales en UNA línea | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----\n"` |

---

## ✅ Verificación

Después de configurar las variables:

1. **En Vercel:** Redeploy tu proyecto
2. **Localmente:** Reinicia el servidor (`npm run dev`)
3. **Prueba:** Intenta registrar un nuevo usuario

### Logs para verificar:
```bash
# En Vercel → Deployment → Functions → Ver logs
✅ Firebase Admin inicializado correctamente

# Si ves esto, está mal configurado:
❌ Error procesando FIREBASE_ADMIN_PRIVATE_KEY
❌ Private key format is invalid
```

---

## 🛠️ Solución de Problemas

### Error: "DECODER routines::unsupported"
**Causa:** La clave privada tiene formato incorrecto
**Solución:** 
- En Vercel, pega la clave CON saltos de línea reales
- No uses `\n` literales en Vercel
- Asegúrate de copiar TODA la clave, incluyendo BEGIN y END

### Error: "Private key format is invalid"
**Causa:** Falta el header/footer o está truncada
**Solución:** 
- Verifica que la clave incluya `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Regenera la clave desde Firebase Console si es necesario

### Error: "invalid_grant" o "Invalid JWT"
**Causa:** Las credenciales están vencidas o son inválidas
**Solución:**
1. Ve a Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Actualiza las variables en Vercel

---

## 📚 Recursos

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🔐 Seguridad

⚠️ **NUNCA** commitees el archivo JSON de service account a Git

✅ **SÍ** usa variables de entorno
✅ **SÍ** agrega `*.json` al `.gitignore` para service accounts
✅ **SÍ** rota las claves periódicamente
✅ **SÍ** usa diferentes service accounts para dev/prod si es posible

---

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica que las 3 variables estén configuradas
2. Revisa los logs de Vercel
3. Prueba regenerar las credenciales desde Firebase
4. Contacta al equipo de desarrollo
