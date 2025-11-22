# Actualización: Selector de Sucursal en Órdenes

## 📋 Cambios Realizados

### 1. **Reorganización del Dashboard de Vendedor**

Se ha mejorado la navegación del dashboard moviendo el botón "Nueva Orden" dentro de la sección "Mis Órdenes":

**Antes:**
```
📊 Mis Datos | 📦 Productos | ➕ Nueva Orden | 📋 Mis Órdenes
```

**Ahora:**
```
📊 Mis Datos | 📦 Productos | 📋 Mis Órdenes
                                    └─ Selector de Sucursal
                                    └─ ➕ Nueva Orden (botón)
                                    └─ Filtros de estado
                                    └─ Lista de órdenes
```

### 2. **Selector de Sucursal Persistente**

Se agregó un selector de sucursal en la parte superior de "Mis Órdenes" que:

- **Muestra todas las sucursales activas** del sistema
- **Persiste la selección** usando `localStorage`
- **Actualiza automáticamente** la sucursal del usuario en la base de datos
- **Valida** que se haya seleccionado una sucursal antes de crear una orden

#### Persistencia

La sucursal seleccionada se guarda en el navegador usando:
```javascript
localStorage.setItem('sucursalActiva', sucursalId)
```

Y se carga automáticamente al recargar la página:
```javascript
const sucursalGuardada = localStorage.getItem('sucursalActiva');
```

#### Actualización en Base de Datos

Cada vez que el vendedor cambia de sucursal, se actualiza en el modelo `User`:
- Campo `sucursalId`: ID de la sucursal
- Campo `sucursalNombre`: Nombre de la sucursal

### 3. **Validación al Crear Orden**

El botón "Nueva Orden" solo funciona si hay una sucursal seleccionada:

```typescript
if (!sucursalSeleccionada) {
  showInfoToast('Por favor, selecciona una sucursal antes de crear una orden');
  return;
}
```

El botón está **deshabilitado visualmente** si no hay sucursal:
- Botón activo: Verde con hover
- Botón inactivo: Gris sin hover, cursor no permitido

### 4. **Navegación Mejorada**

Se agregaron botones "Volver a Mis Órdenes" en:
- **CrearOrden.tsx**: Al inicio del componente
- **EditarOrden.tsx**: Al inicio del componente

Esto mejora la experiencia de usuario permitiendo regresar fácilmente a la lista de órdenes.

### 5. **Nuevo Endpoint API**

Se creó el endpoint `/api/users/update-sucursal` para actualizar la sucursal del usuario:

**Request:**
```json
POST /api/users/update-sucursal
{
  "sucursalId": "123abc",
  "sucursalNombre": "Sucursal Centro"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sucursal actualizada correctamente",
  "user": {
    "id": "user123",
    "sucursalId": "123abc",
    "sucursalNombre": "Sucursal Centro"
  }
}
```

## 🎨 Interfaz de Usuario

### Selector de Sucursal

```
┌─────────────────────────────────────────────┐
│  📍 Sucursal Activa                         │
│  [Seleccionar sucursal... ▼]  [➕ Nueva Orden] │
└─────────────────────────────────────────────┘
```

### Estados Visuales

1. **Sin sucursal seleccionada:**
   - Select: "Seleccionar sucursal..."
   - Botón: Gris, deshabilitado

2. **Con sucursal seleccionada:**
   - Select: Muestra nombre de sucursal
   - Botón: Verde, habilitado

3. **Al cambiar sucursal:**
   - Toast de éxito: "Sucursal cambiada a: [Nombre]"
   - Se actualiza en BD
   - Se guarda en localStorage

## 🔄 Flujo de Trabajo

### Caso 1: Primera Vez (Sin sucursal guardada)

```
1. Vendedor abre "Mis Órdenes"
2. Ve selector con "Seleccionar sucursal..."
3. Botón "Nueva Orden" está deshabilitado
4. Vendedor selecciona una sucursal
5. Se guarda en localStorage y BD
6. Toast: "Sucursal cambiada a: [Nombre]"
7. Botón "Nueva Orden" se habilita
8. Vendedor puede crear órdenes
```

### Caso 2: Con Sucursal Ya Guardada

```
1. Vendedor abre "Mis Órdenes"
2. Selector carga automáticamente la sucursal guardada
3. Botón "Nueva Orden" está habilitado
4. Vendedor puede crear órdenes inmediatamente
```

### Caso 3: Cambio de Sucursal

```
1. Vendedor está trabajando en Sucursal A
2. Cambia selector a Sucursal B
3. Sistema actualiza localStorage
4. Sistema actualiza BD (User.sucursalId y User.sucursalNombre)
5. Toast confirma el cambio
6. Nuevas órdenes se crean con Sucursal B
```

## 🛠️ Archivos Modificados

1. **src/components/vendedor/OrdenesVendedor.tsx**
   - Agregado selector de sucursal
   - Agregado botón "Nueva Orden"
   - Agregada persistencia con localStorage
   - Agregada integración con API de actualización

2. **src/components/vendedor/CrearOrden.tsx**
   - Agregado botón "Volver a Mis Órdenes"

3. **src/components/vendedor/EditarOrden.tsx**
   - Agregado botón "Volver a Mis Órdenes"
   - Mejorada estructura del header

4. **src/app/dashboardVendedor/page.tsx**
   - Eliminado tab "Nueva Orden" de navegación principal
   - Tab "Mis Órdenes" ahora se activa también para crear/editar
   - Mejorado manejo de parámetros de URL

5. **src/app/api/users/update-sucursal/route.ts** (Nuevo archivo)
   - Endpoint para actualizar sucursal del usuario
   - Validación de autenticación
   - Actualización en BD

## 📱 Responsive Design

El componente está optimizado para:

- **Desktop**: Selector y botón lado a lado
- **Mobile**: Selector y botón apilados verticalmente
- **Tablets**: Diseño adaptable según tamaño

## 🔐 Seguridad

- Solo usuarios autenticados pueden actualizar su sucursal
- Validación de datos en el backend
- Solo sucursales activas son mostradas en el selector

## 💡 Beneficios

1. **UX Mejorada**: Todo relacionado con órdenes en un solo lugar
2. **Persistencia**: No hay que seleccionar sucursal cada vez
3. **Control**: Vendedor puede cambiar fácilmente de sucursal
4. **Trazabilidad**: Cada orden queda vinculada a una sucursal
5. **Validación**: No se pueden crear órdenes sin sucursal asignada

---

**Fecha de actualización**: Noviembre 2025
