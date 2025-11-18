# Sistema de Gestión de Perfiles de Usuario

## Descripción

Sistema completo de gestión de perfiles que permite:
- **Administradores**: Editar todos los datos de cualquier usuario (incluyendo rol, precio/hora, comisiones, etc.)
- **Usuarios**: Editar sus propios datos básicos (nombre, teléfono, domicilio, documento) desde su dashboard

## Componentes Creados

### 1. **ProfileEditor** (`src/components/ProfileEditor.tsx`)
Componente de edición de perfil para **clientes** (role: `user`).

**Características:**
- Edición de datos personales (nombre, teléfono, domicilio, documento)
- Email en solo lectura (no modificable)
- Diseño responsive con iconos de react-icons
- Información de cuenta (fecha de registro, ID)

### 2. **ProfileEditorVendedor** (`src/components/ProfileEditorVendedor.tsx`)
Componente de edición de perfil para **vendedores** (role: `seller`).

**Características:**
- Todo lo de ProfileEditor +
- **Estadísticas en solo lectura:**
  - Horas acumuladas
  - Salario pendiente (calculado)
  - Porcentaje de comisión
  - Compras acumuladas
  - Última liquidación

### 3. **ProfileEditorCajero** (`src/components/ProfileEditorCajero.tsx`)
Componente de edición de perfil para **cajeros** (role: `cashier`).

**Características:**
- Todo lo de ProfileEditor +
- **Estadísticas en solo lectura:**
  - Horas acumuladas
  - Salario pendiente
  - Compras acumuladas
  - Última liquidación

### 4. **UsersManager** (Actualizado)
Gestión completa de usuarios por parte del **administrador**.

**Campos nuevos agregados:**
- Teléfono
- Domicilio
- Tipo de documento (DNI, CUIT, CUIL, Pasaporte)
- Número de documento
- Porcentaje de comisión (para sellers y cashiers)
- Precio por hora (para sellers y cashiers)

## Estructura de la API

### GET `/api/auth/me`
Obtiene los datos del usuario autenticado.

**Respuesta actualizada:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    "telefono": "...",
    "domicilio": "...",
    "tipoDocumento": "...",
    "nroDocumento": "...",
    "precioHora": 0,
    "horasAcumuladas": 0,
    "porcentajeComision": 0,
    "comprasAcumuladas": 0,
    "ultimaLiquidacion": "...",
    "createdAt": "...",
    "activo": true
  }
}
```

### PUT `/api/users?id={userId}`
Actualiza los datos de un usuario.

**Body para actualización de perfil (usuario):**
```json
{
  "name": "Nuevo Nombre",
  "telefono": "+54 9 11 1234-5678",
  "domicilio": "Av. Corrientes 1234",
  "tipoDocumento": "DNI",
  "nroDocumento": "12345678"
}
```

**Body para actualización completa (admin):**
```json
{
  "name": "...",
  "role": "seller",
  "telefono": "...",
  "domicilio": "...",
  "tipoDocumento": "DNI",
  "nroDocumento": "...",
  "precioHora": 1500,
  "porcentajeComision": 10,
  "password": "nueva_password" // opcional
}
```

## Integración en Dashboards

Cada dashboard ahora tiene un sistema de **tabs** con dos secciones:

### Dashboard Cliente (`/dashboardCliente`)
- **Inicio**: Información de bienvenida
- **Mi Perfil**: Componente `ProfileEditor`

### Dashboard Vendedor (`/dashboardVendedor`)
- **Inicio**: Panel de vendedor con información básica
- **Mi Perfil**: Componente `ProfileEditorVendedor` con estadísticas

### Dashboard Cajero (`/dashboardCajero`)
- **Inicio**: Panel de cajero con información básica
- **Mi Perfil**: Componente `ProfileEditorCajero` con estadísticas

## Modelo de Usuario Actualizado

El modelo `User` incluye todos los campos necesarios:

```typescript
interface IUser {
  _id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  imgProfile?: string;
  role: 'user' | 'admin' | 'seller' | 'cashier';
  telefono?: string;
  domicilio?: string;
  tipoDocumento?: string;
  nroDocumento?: string;
  porcentajeComision?: number;
  precioHora?: number;
  horasAcumuladas?: number;
  comprasAcumuladas?: number;
  ultimaLiquidacion?: Date;
  historialPagos?: IPaymentRecord[];
  historialCompras?: ICompra[];
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Permisos y Seguridad

### Usuarios comunes (user, seller, cashier)
✅ Pueden editar:
- Nombre
- Teléfono
- Domicilio
- Tipo y número de documento

❌ **NO** pueden editar:
- Email (solo lectura)
- Rol
- Precio por hora
- Porcentaje de comisión
- Horas acumuladas
- Compras acumuladas

### Administradores (admin)
✅ Pueden editar **TODO** de cualquier usuario:
- Todos los campos personales
- Rol del usuario
- Precio por hora
- Porcentaje de comisión
- Contraseña (opcional)

## Uso

### Para usuarios comunes:
1. Iniciar sesión
2. Ir al dashboard correspondiente
3. Hacer clic en "Mi Perfil" en la navegación
4. Editar los datos deseados
5. Guardar cambios

### Para administradores:
1. Iniciar sesión como admin
2. Ir al Dashboard Admin
3. En la sección "Gestión de Usuarios"
4. Hacer clic en "Editar" en cualquier usuario
5. Modificar cualquier campo necesario
6. Guardar cambios

## Iconos Utilizados (react-icons/fi)

- `FiUser` - Usuario/Perfil
- `FiMail` - Email
- `FiPhone` - Teléfono
- `FiMapPin` - Domicilio
- `FiFileText` - Documentos
- `FiSave` - Guardar
- `FiClock` - Horas
- `FiDollarSign` - Dinero/Salario
- `FiTrendingUp` - Comisiones

## Estilos y Diseño

- Sistema de colores consistente con el proyecto
- Modo oscuro soportado
- Responsive (mobile-first)
- Animaciones y transiciones suaves
- Focus states accesibles

## Notificaciones

Se utilizan los helpers de toast para feedback:
- `showSuccessToast()` - Cuando se guarda correctamente
- `showErrorToast()` - Cuando hay un error

## Notas Técnicas

1. **Validación**: Los campos requeridos están validados en el frontend y backend
2. **Seguridad**: El email no se puede cambiar para mantener consistencia con Firebase Auth
3. **Sincronización**: Los cambios de contraseña se sincronizan con Firebase Authentication
4. **Eliminación**: Al eliminar un usuario, se elimina tanto de MongoDB como de Firebase

## Próximas Mejoras Sugeridas

- [ ] Subir/cambiar foto de perfil
- [ ] Cambiar contraseña desde el perfil de usuario
- [ ] Historial de cambios en el perfil
- [ ] Validación de formato de teléfono
- [ ] Validación de número de documento según tipo
- [ ] Preview de foto antes de subir
- [ ] Compresión de imágenes de perfil
