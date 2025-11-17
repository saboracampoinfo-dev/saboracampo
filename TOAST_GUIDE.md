# 🎉 Sistema de Notificaciones Toast

Este proyecto usa **React-Toastify** para mostrar notificaciones elegantes y personalizadas.

## 📚 Uso Básico

### Importar Helpers

```typescript
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  updateToast,
  getFirebaseErrorMessage,
  toastPromise,
} from '@/utils/toastHelpers';
```

## 🎨 Tipos de Toast

### 1. Toast de Éxito

```typescript
showSuccessToast('¡Operación exitosa!');
showSuccessToast('Usuario creado correctamente', { autoClose: 5000 });
```

### 2. Toast de Error

```typescript
showErrorToast('Ha ocurrido un error');
showErrorToast('No se pudo conectar al servidor', { autoClose: 6000 });
```

### 3. Toast de Advertencia

```typescript
showWarningToast('Esta acción no se puede deshacer');
```

### 4. Toast Informativo

```typescript
showInfoToast('Nueva actualización disponible');
```

## ⏳ Toast de Carga con Actualización

Perfecto para operaciones asíncronas como login, registro, o guardado de datos:

```typescript
const handleLogin = async () => {
  // Mostrar toast de carga
  const loadingToast = showLoadingToast('Iniciando sesión...');

  try {
    await loginUser(email, password);
    
    // Actualizar a éxito
    updateToast(
      loadingToast,
      '¡Inicio de sesión exitoso!',
      'success',
      { autoClose: 2000 }
    );
    
  } catch (error) {
    // Actualizar a error
    updateToast(
      loadingToast,
      'Error al iniciar sesión',
      'error',
      { autoClose: 4000 }
    );
  }
};
```

## 🔥 Errores de Firebase

El helper `getFirebaseErrorMessage` convierte códigos de error de Firebase en mensajes amigables:

```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error: any) {
  const errorMessage = getFirebaseErrorMessage(error.code);
  showErrorToast(errorMessage);
}
```

### Mensajes de Error Soportados:

- `auth/wrong-password` → "Contraseña incorrecta"
- `auth/user-not-found` → "Usuario no encontrado"
- `auth/email-already-in-use` → "Este email ya está registrado"
- `auth/weak-password` → "La contraseña es muy débil"
- `auth/invalid-email` → "Email inválido"
- `auth/too-many-requests` → "Demasiados intentos. Intenta más tarde"
- `auth/network-request-failed` → "Error de conexión. Verifica tu internet"

## 🎯 Toast con Promesas

Para operaciones que devuelven promesas:

```typescript
const saveData = async () => {
  await toastPromise(
    fetch('/api/save').then(res => res.json()),
    {
      pending: 'Guardando datos...',
      success: '¡Datos guardados exitosamente!',
      error: 'Error al guardar los datos',
    }
  );
};
```

## ⚙️ Opciones Personalizadas

Puedes personalizar cualquier toast con opciones adicionales:

```typescript
showSuccessToast('Operación exitosa', {
  position: 'top-center',    // Posición
  autoClose: 5000,           // Tiempo en ms (false para desactivar)
  hideProgressBar: false,    // Ocultar barra de progreso
  closeOnClick: true,        // Cerrar al hacer clic
  pauseOnHover: true,        // Pausar al pasar el mouse
  draggable: true,           // Permitir arrastrar
});
```

### Posiciones Disponibles:
- `top-left`
- `top-center`
- `top-right` (por defecto)
- `bottom-left`
- `bottom-center`
- `bottom-right`

## 🎨 Configuración Global

La configuración global está en `src/components/ToastProvider.tsx`:

```typescript
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="colored"
/>
```

## 📝 Ejemplos Completos

### Ejemplo 1: Formulario de Login

```typescript
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  showLoadingToast,
  updateToast,
  getFirebaseErrorMessage,
} from '@/utils/toastHelpers';

export default function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const loadingToast = showLoadingToast('Iniciando sesión...');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      updateToast(
        loadingToast,
        '¡Bienvenido de nuevo!',
        'success'
      );
      
      router.push('/dashboard');
      
    } catch (error: any) {
      const message = getFirebaseErrorMessage(error.code);
      updateToast(loadingToast, message, 'error');
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Ejemplo 2: Eliminar Producto

```typescript
const handleDelete = async (id: string) => {
  const loadingToast = showLoadingToast('Eliminando producto...');
  
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    
    updateToast(
      loadingToast,
      'Producto eliminado correctamente',
      'success'
    );
    
    refreshProducts();
    
  } catch (error) {
    updateToast(
      loadingToast,
      'No se pudo eliminar el producto',
      'error'
    );
  }
};
```

### Ejemplo 3: Validación de Formulario

```typescript
const validateForm = () => {
  if (!email) {
    showErrorToast('El email es requerido');
    return false;
  }
  
  if (password.length < 6) {
    showErrorToast('La contraseña debe tener al menos 6 caracteres');
    return false;
  }
  
  return true;
};
```

## 🎭 Tips y Mejores Prácticas

1. **Usa toast de carga para operaciones asíncronas** - Mejor UX
2. **No abuses de los toasts** - Solo para acciones importantes
3. **Usa mensajes claros y concisos** - El usuario debe entender rápido
4. **Ajusta el autoClose según importancia** - Errores: 4000ms, Éxito: 2000-3000ms
5. **Usa colores apropiados** - Success: verde, Error: rojo, etc.

## 🎬 Animaciones

Los toasts vienen con animaciones suaves por defecto:
- ✅ Entrada suave desde arriba
- ✅ Salida suave con fade out
- ✅ Arrastrar para cerrar
- ✅ Pausar al hover

## 🌙 Dark Mode

Los toasts se adaptan automáticamente al modo oscuro gracias al tema `"colored"`.

---

¡Disfruta de las notificaciones elegantes en tu aplicación! 🎉
