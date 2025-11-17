# 🔧 Checklist de Configuración Post-Instalación

## 📋 Configuración Obligatoria

### ☑️ MongoDB
- [ ] MongoDB está instalado y ejecutándose
- [ ] `MONGODB_URI` está configurado en `.env.local`
- [ ] Conexión a MongoDB probada

**Verificar conexión:**
```bash
# Si tienes mongo shell instalado
mongosh "mongodb://localhost:27017/saboracampo"
```

### ☑️ Firebase
- [ ] Proyecto creado en [Firebase Console](https://console.firebase.google.com)
- [ ] Authentication habilitada (Email/Password)
- [ ] Credenciales copiadas a `.env.local`:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Firebase Admin configurado:
  - [ ] Clave privada generada (Service Account)
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`

**Obtener credenciales Firebase:**
1. Firebase Console > Project Settings > General
2. Scroll a "Your apps" > SDK setup and configuration
3. Para Admin: Service Accounts > Generate new private key

### ☑️ Cloudinary
- [ ] Cuenta creada en [Cloudinary](https://cloudinary.com)
- [ ] Credenciales copiadas a `.env.local`:
  - [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Upload Preset configurado (opcional)

**Encontrar credenciales:**
Dashboard de Cloudinary > Muestra Cloud Name, API Key, API Secret

### ☑️ JWT Secret
- [ ] `JWT_SECRET` generado y configurado

**Generar clave segura:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### ☑️ Verificación Final
- [ ] Servidor de desarrollo inicia sin errores: `npm run dev`
- [ ] No hay errores en la consola del navegador
- [ ] API de usuarios responde: `http://localhost:3000/api/users`

## 🧪 Pruebas Rápidas

### Probar API de Usuarios
```bash
# Listar usuarios
curl http://localhost:3000/api/users

# Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Test",
    "email": "test@example.com",
    "role": "user"
  }'
```

### Probar Generación de PDF
```bash
curl -X POST http://localhost:3000/api/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Documento de Prueba",
    "content": "Este es un contenido de prueba para el PDF"
  }' \
  --output test.pdf
```

### Verificar MongoDB
```bash
# Ver conexión activa en los logs del servidor
# Debería ver: "MongoDB connected" al iniciar la app
```

## 🔍 Solución de Problemas Comunes

### Error: Cannot connect to MongoDB
```bash
# Verificar que MongoDB esté corriendo
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl start mongod

# O revisar MONGODB_URI en .env.local
```

### Error: Firebase configuration invalid
```bash
# Verificar que todas las variables FIREBASE tengan valores
# Las comillas en FIREBASE_ADMIN_PRIVATE_KEY deben incluir \n como \\n
```

### Error: Cloudinary upload failed
```bash
# Verificar credenciales en .env.local
# Asegurarse que NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME sea correcto
```

### Puerto 3000 ocupado
```bash
# Cambiar puerto
npm run dev -- -p 3001

# O matar proceso
# Windows:
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

## 📦 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Puerto 3000
npm run dev -- -p 3001   # Puerto personalizado

# Producción
npm run build            # Compilar
npm run start            # Ejecutar compilado

# Calidad
npm run lint             # ESLint
npm run lint -- --fix    # Arreglar automáticamente

# Dependencias
npm install              # Instalar todas
npm install <package>    # Instalar nueva
npm update               # Actualizar todas
npm audit fix            # Arreglar vulnerabilidades
```

## 🗃️ Comandos MongoDB Útiles

```bash
# Conectar a MongoDB
mongosh "mongodb://localhost:27017/saboracampo"

# Dentro de mongo shell:
show dbs                 # Ver bases de datos
use saboracampo          # Usar base de datos
show collections         # Ver colecciones
db.users.find()          # Ver usuarios
db.users.countDocuments() # Contar documentos
db.dropDatabase()        # Eliminar BD (¡cuidado!)
```

## 🔥 Comandos Firebase CLI (opcional)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (si necesitas hosting, functions, etc)
firebase init

# Deploy
firebase deploy
```

## 📊 Monitoreo y Logs

```bash
# Ver logs en tiempo real
npm run dev

# Logs de MongoDB (si está instalado localmente)
# Windows:
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

# Mac/Linux:
tail -f /var/log/mongodb/mongod.log
```

## ✅ Checklist Pre-Deploy

Antes de desplegar a producción:

- [ ] Todas las variables de entorno están configuradas
- [ ] `NODE_ENV=production` en entorno de producción
- [ ] `JWT_SECRET` es diferente al de desarrollo
- [ ] MongoDB está en Atlas o servidor dedicado
- [ ] Firebase está en modo producción
- [ ] `.env.local` NO está en el repositorio
- [ ] `npm run build` compila sin errores
- [ ] Todas las rutas API funcionan correctamente
- [ ] CORS configurado si es necesario
- [ ] Rate limiting implementado (si aplica)
- [ ] Backups de MongoDB configurados

## 🎯 Próximos Pasos de Desarrollo

1. [ ] Implementar páginas de autenticación
2. [ ] Crear dashboard de usuario
3. [ ] Agregar más modelos de datos
4. [ ] Implementar CRUD completo
5. [ ] Agregar middleware de autenticación
6. [ ] Configurar roles y permisos
7. [ ] Implementar subida de imágenes
8. [ ] Crear templates de PDFs
9. [ ] Agregar tests (Jest/React Testing Library)
10. [ ] Configurar CI/CD

---

**💡 Tip**: Marca cada item conforme lo completes. Esto te ayudará a llevar control del progreso.
