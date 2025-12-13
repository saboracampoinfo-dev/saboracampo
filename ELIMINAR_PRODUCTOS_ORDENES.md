# Eliminar Productos de Órdenes

## 📋 Resumen de Cambios

Se implementó la funcionalidad completa para **eliminar productos individuales** de las órdenes, tanto productos regulares como productos vendidos por kg. Esta funcionalidad está disponible para vendedores, cajeros y administradores.

---

## 🎯 Problema Resuelto

### Problemas Originales:
1. **Productos por kg** no tenían botones +/- por lo que no se podían eliminar
2. **Cajeros** no podían editar órdenes en estado `pendiente_cobro`
3. No había forma directa de eliminar un producto sin tener que cancelar toda la orden
4. Al editar órdenes, los productos no se mostraban correctamente

### Solución Implementada:
✅ Botón de eliminar (🗑️) en cada producto  
✅ Nueva acción en API: `eliminar_producto`  
✅ Manejo automático de devolución de stock  
✅ Funciona tanto en `en_proceso` como `pendiente_cobro`  
✅ Disponible en todos los componentes de creación/edición de órdenes

---

## 🔧 Cambios Técnicos

### 1. API de Órdenes (`src/app/api/ordenes/route.ts`)

#### Nueva Acción: `eliminar_producto`

```typescript
if (action === 'eliminar_producto') {
  // Validaciones de permisos y estado
  // Devolución de stock si la orden está en pendiente_cobro
  // Eliminación del producto del array
  // Recalculo del total
}
```

**Características:**
- ✅ Elimina producto individual de la orden
- ✅ Devuelve stock automáticamente si la orden está en `pendiente_cobro`
- ✅ Maneja stock por sucursal correctamente
- ✅ Recalcula el total de la orden
- ✅ Permite eliminar en estados: `en_proceso` y `pendiente_cobro`

**Permisos:**
- Vendedores: Solo sus propias órdenes
- Cajeros: Cualquier orden en `pendiente_cobro`
- Administradores: Cualquier orden

---

### 2. Componente CrearOrdenCajero (`src/components/cajero/CrearOrdenCajero.tsx`)

#### Función Agregada:
```typescript
const eliminarProducto = async (productoId: string) => {
  // Confirmación
  // Llamada a API con action: 'eliminar_producto'
  // Actualización del estado local
}
```

#### Cambios en UI:
- ✅ Botón 🗑️ en cada producto
- ✅ Muestra cantidad para productos por kg
- ✅ Funciona tanto al crear como al editar órdenes

**Cómo Editar Órdenes (Cajero):**
1. Ir a pestaña "Órdenes de Cobro"
2. Ver detalle de orden en `pendiente_cobro`
3. Click en "✏️ Editar Orden"
4. Se abre en modo edición con todos los productos visibles
5. Agregar/eliminar productos
6. Guardar cambios

---

### 3. Componente CrearOrden (`src/components/vendedor/CrearOrden.tsx`)

#### Función Agregada:
```typescript
const eliminarProducto = async (productoId: string) => {
  // Confirmación
  // Llamada a API
  // Actualización del estado
}
```

#### Cambios en UI:
- ✅ Botón 🗑️ en cada producto
- ✅ Muestra cantidad para productos por kg
- ✅ Diseño responsive y consistente

---

### 4. Componente EditarOrden (`src/components/vendedor/EditarOrden.tsx`)

#### Función Agregada:
```typescript
const eliminarProducto = async (productoId: string) => {
  // Confirmación
  // Llamada a API
  // Actualización del estado
}
```

#### Cambios en UI:
- ✅ Botón 🗑️ en cada producto
- ✅ Los botones +/- siguen funcionando para productos regulares
- ✅ Productos por kg ahora muestran su cantidad

---

## 🎨 Interfaz de Usuario

### Productos Regulares:
```
[Imagen] Nombre Producto
         Código: 123456
         $10.00 c/u
         
         [-] [2] [+]  $20.00 [🗑️]
```

### Productos por Kg:
```
[Imagen] Nombre Producto [250gr]
         Código: 123456
         $5.00 por 250gr
         
         Cant: 1      $5.00 [🗑️]
```

---

## 📊 Flujos de Trabajo

### Vendedor Creando Orden:
1. Agregar productos
2. Ver todos con botón eliminar
3. Puede eliminar cualquier producto (kg o regular)
4. Cerrar orden → envía a caja

### Cajero Recibiendo Orden:
1. Ve orden en `pendiente_cobro`
2. Click "Editar Orden"
3. **Puede agregar más productos**
4. **Puede eliminar productos**
5. Guardar cambios
6. Cobrar orden

### Devolución de Stock:
- Si eliminas un producto de orden en `pendiente_cobro`
- El stock se devuelve automáticamente
- Si la orden tiene sucursal, se devuelve a esa sucursal
- Si no, se devuelve al stock general

---

## ⚠️ Validaciones y Permisos

### Validaciones API:
```typescript
// ✅ Orden debe existir
// ✅ Producto debe estar en la orden
// ✅ Usuario debe tener permisos
// ✅ Orden en estado correcto (en_proceso o pendiente_cobro)
// ✅ Confirmación del usuario en UI
```

### Permisos por Rol:
| Rol | Puede Eliminar |
|-----|----------------|
| Vendedor | Sus propias órdenes en `en_proceso` |
| Cajero | Cualquier orden en `pendiente_cobro` |
| Admin | Cualquier orden en `en_proceso` o `pendiente_cobro` |

---

## 🔍 Testing

### Escenarios a Probar:

1. **Vendedor - Crear Orden:**
   - Agregar producto regular → eliminar
   - Agregar producto por kg → eliminar
   - Agregar múltiples → eliminar uno
   - Eliminar todos → orden vacía

2. **Cajero - Editar Orden:**
   - Abrir orden pendiente_cobro
   - Eliminar producto
   - Verificar que stock se devuelve
   - Agregar nuevo producto
   - Guardar cambios

3. **Productos por Kg:**
   - Agregar con diferentes gramos (100, 250, 500, 750)
   - Verificar que muestra cantidad
   - Eliminar correctamente
   - Verificar subtotal

4. **Manejo de Stock:**
   - Orden con sucursal → eliminar → stock vuelve a sucursal
   - Orden sin sucursal → eliminar → stock vuelve a general
   - Verificar en MongoDB

---

## 🐛 Solución de Problemas

### "No puedo ver los productos al editar"
✅ **Solucionado:** Ahora el modo edición carga y muestra todos los productos

### "No puedo eliminar productos por kg"
✅ **Solucionado:** Botón 🗑️ disponible para todos los tipos de productos

### "Como cajero no puedo modificar la orden"
✅ **Solucionado:** Cajeros pueden editar órdenes en `pendiente_cobro`

### "El stock no se devuelve"
✅ **Solucionado:** API devuelve automáticamente el stock al eliminar de `pendiente_cobro`

---

## 📝 Notas Técnicas

### Estructura de Producto en Orden:
```typescript
{
  productoId: string,
  nombre: string,
  codigoBarras?: string,
  cantidad: number,
  precio: number,
  subtotal: number,
  imagen?: string,
  unidadMedida?: string,  // 'kg' para productos por peso
  gramos?: number          // 100, 250, 500, 750, etc.
}
```

### Cálculo de Total:
- Se recalcula automáticamente al eliminar
- Usa el método `calcularTotal()` del modelo
- Se actualiza el estado local inmediatamente

---

## ✅ Checklist de Implementación

- [x] Crear acción `eliminar_producto` en API
- [x] Agregar función en CrearOrdenCajero
- [x] Agregar función en CrearOrden (vendedor)
- [x] Agregar función en EditarOrden (vendedor)
- [x] Agregar botón UI en todos los componentes
- [x] Manejar productos por kg correctamente
- [x] Implementar devolución de stock
- [x] Agregar confirmaciones
- [x] Probar con diferentes roles
- [x] Documentar cambios

---

## 🚀 Próximos Pasos (Opcional)

### Mejoras Futuras:
- [ ] Historial de cambios en la orden
- [ ] Notificación al vendedor cuando cajero edita
- [ ] Límite de tiempo para editar (ej: 24 horas)
- [ ] Razón obligatoria al eliminar producto

---

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que la orden esté en estado correcto
2. Confirma permisos del usuario
3. Revisa consola del navegador
4. Verifica logs del servidor

**Fecha de Implementación:** 9 de Diciembre, 2025  
**Versión:** 1.0
