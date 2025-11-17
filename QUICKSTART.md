# 🚀 Guía Rápida de Inicio - Sabor a Campo

## 📋 Pasos Inmediatos

### 1. Configurar Variables de Entorno

Edita el archivo `.env.local` y completa todas las credenciales necesarias:

- **MongoDB**: Conexión a tu base de datos
- **Firebase**: Credenciales del proyecto Firebase
- **Cloudinary**: Credenciales de tu cuenta
- **JWT**: Genera una clave secreta segura

### 2. Iniciar MongoDB

Si usas MongoDB localmente:
```bash
mongod
```

O actualiza `MONGODB_URI` para usar MongoDB Atlas.

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🔑 Configuración de Servicios

### Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Habilita Authentication > Sign-in method > Email/Password
4. Ve a Project Settings > General > Your apps
5. Copia las credenciales al `.env.local`
6. Ve a Project Settings > Service Accounts
7. Genera una nueva clave privada (JSON)
8. Copia los valores al `.env.local`

### Cloudinary
1. Regístrate en [Cloudinary](https://cloudinary.com)
2. Ve al Dashboard
3. Copia Cloud Name, API Key y API Secret
4. (Opcional) Configura un Upload Preset en Settings > Upload

### JWT Secret
Genera una clave segura:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📁 Estructura de Archivos Importantes

```
src/
├── app/api/          # API Routes
│   ├── users/        # CRUD de usuarios
│   ├── pdf/          # Generación de PDFs
│   └── cloudinary/   # Gestión de imágenes
├── lib/              # Configuraciones
│   ├── mongodb.ts    # Conexión a MongoDB
│   ├── firebase.ts   # Firebase cliente
│   ├── firebase-admin.ts
│   ├── cloudinary.ts
│   ├── jwt.ts
│   └── auth.ts
├── models/           # Modelos Mongoose
├── components/       # Componentes React
└── utils/            # Utilidades
```

## 🧪 Probar la API

### Crear un Usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"user"}'
```

### Listar Usuarios
```bash
curl http://localhost:3000/api/users
```

### Generar PDF
```bash
curl -X POST http://localhost:3000/api/pdf \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi Documento","content":"Contenido de prueba"}' \
  --output test.pdf
```

## 📚 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Iniciar servidor de desarrollo
3. 🔲 Crear modelos adicionales en `src/models/`
4. 🔲 Implementar páginas en `src/app/`
5. 🔲 Crear componentes reutilizables
6. 🔲 Configurar autenticación completa
7. 🔲 Implementar lógica de negocio

## 🛠️ Comandos Útiles

```bash
npm run dev      # Desarrollo
npm run build    # Compilar producción
npm run start    # Ejecutar producción
npm run lint     # Verificar código
```

## 💡 Ejemplos de Código

Ver archivos de ejemplo en:
- `src/components/ExampleForm.tsx` - Formulario con React Hook Form
- `src/utils/firebaseAuth.ts` - Autenticación Firebase
- `src/utils/cloudinaryHelpers.ts` - Subir imágenes
- `src/utils/alerts.ts` - Alertas SweetAlert2

## 📖 Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/docs/)
- [Firebase](https://firebase.google.com/docs)
- [React Hook Form](https://react-hook-form.com/)

## 🆘 Solución de Problemas

### Error: Cannot connect to MongoDB
- Verifica que MongoDB esté ejecutándose
- Revisa la cadena de conexión en `.env.local`

### Error: Firebase configuration
- Verifica todas las variables FIREBASE en `.env.local`
- Asegúrate de que el proyecto Firebase esté activo

### Error: Module not found
```bash
npm install
```

## 🎯 Listo para Desarrollar

¡El proyecto está completamente configurado! Comienza a desarrollar tus funcionalidades.
