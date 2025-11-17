# Sabor a Campo - Next.js Application

![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

Aplicación web completa construida con Next.js, TypeScript, y un stack moderno de tecnologías.

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **React Hook Form** - Manejo de formularios
- **SweetAlert2** - Alertas personalizadas
- **React-Toastify** - Notificaciones toast

### Backend & Base de Datos
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Firebase Auth** - Autenticación
- **Firebase Admin** - Operaciones del lado del servidor
- **JWT** - JSON Web Tokens para autenticación
- **Cookies** - Manejo de cookies seguras

### Servicios Externos
- **Cloudinary** - Almacenamiento y gestión de imágenes
- **Firebase Storage** - Almacenamiento de archivos

### Generación de Documentos
- **PDFKit** - Generación de PDFs

## 📦 Instalación

### Prerequisitos
- Node.js 18.x o superior
- npm o yarn
- MongoDB (local o remoto)
- Cuenta de Firebase
- Cuenta de Cloudinary

### Pasos de Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**

Edita `.env.local` con tus credenciales:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/saboracampo
MONGODB_DB=saboracampo

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=tu_proyecto_id
FIREBASE_ADMIN_PRIVATE_KEY="tu_private_key"
FIREBASE_ADMIN_CLIENT_EMAIL=tu_email@tu_proyecto.iam.gserviceaccount.com

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=7d

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

3. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
saboracampo/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── users/        # Endpoints de usuarios
│   │   │   └── pdf/          # Generación de PDFs
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página principal
│   ├── components/            # Componentes reutilizables
│   │   └── ToastProvider.tsx # Provider de notificaciones
│   ├── lib/                   # Configuraciones y utilidades
│   │   ├── mongodb.ts        # Conexión a MongoDB
│   │   ├── firebase.ts       # Firebase client
│   │   ├── firebase-admin.ts # Firebase admin
│   │   ├── cloudinary.ts     # Configuración Cloudinary
│   │   ├── jwt.ts            # Utilidades JWT
│   │   └── auth.ts           # Autenticación
│   ├── models/                # Modelos de Mongoose
│   │   └── User.ts           # Modelo de Usuario
│   └── utils/                 # Utilidades generales
│       ├── alerts.ts         # Funciones de SweetAlert2
│       └── pdfGenerator.ts   # Generador de PDFs
├── .env.local                 # Variables de entorno (no versionar)
├── .env.local.example         # Ejemplo de variables de entorno
└── package.json               # Dependencias del proyecto
```

## 🔧 Configuración de Servicios

### MongoDB
1. Instala MongoDB localmente o usa MongoDB Atlas
2. Actualiza `MONGODB_URI` en `.env.local`

### Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Authentication
3. Obtén las credenciales del cliente (Project Settings > General)
4. Para Firebase Admin, genera una clave privada (Project Settings > Service Accounts)
5. Actualiza las variables de Firebase en `.env.local`

### Cloudinary
1. Crea una cuenta en [Cloudinary](https://cloudinary.com)
2. Obtén tus credenciales del dashboard
3. Actualiza las variables de Cloudinary en `.env.local`

## 🎯 Uso de las Librerías

### React Hook Form
```tsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit } = useForm();
```

### SweetAlert2
```tsx
import { showSuccessAlert, showErrorAlert } from '@/utils/alerts';

showSuccessAlert('¡Operación exitosa!');
```

### React-Toastify
```tsx
import { toast } from 'react-toastify';

toast.success('¡Éxito!');
toast.error('Error');
```

### MongoDB con Mongoose
```tsx
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

await dbConnect();
const users = await User.find();
```

### Generación de PDF
```tsx
import { PDFGenerator } from '@/utils/pdfGenerator';

const pdf = new PDFGenerator({ title: 'Mi PDF' });
pdf.addTitle('Título').addText('Contenido');
const buffer = await pdf.generate();
```

## 🚀 Scripts Disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run build        # Compilar para producción
npm run start        # Ejecutar en producción
npm run lint         # Ejecutar ESLint
```

## 📝 API Routes

### Usuarios
- `GET /api/users` - Obtener lista de usuarios
- `POST /api/users` - Crear nuevo usuario

### PDF
- `POST /api/pdf` - Generar PDF
  ```json
  {
    "title": "Mi Documento",
    "content": "Contenido del documento"
  }
  ```

## 🔐 Autenticación

El proyecto incluye un sistema de autenticación con JWT y cookies:

```tsx
import { authenticateRequest } from '@/lib/auth';

// En API Route
const { authenticated, user } = await authenticateRequest(req);
```

## 🎨 Personalización

### Tailwind CSS
Personaliza los estilos en `tailwind.config.ts`

### Tema de SweetAlert2
Los colores se pueden personalizar en `src/utils/alerts.ts`

### Configuración de Toast
Ajusta las opciones en `src/components/ToastProvider.tsx`

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autor

Sabor a Campo Team
