# Sistema de Órdenes con Stock por Sucursal

## 📋 Descripción General

El sistema de órdenes ahora maneja el stock por sucursal de manera automática. Cada vendedor/cajero está asignado a una sucursal específica y las órdenes que crean solo pueden usar el stock disponible en esa sucursal.

## 🏢 Configuración de Sucursales en Usuarios

### Modelo User Actualizado

Se agregaron dos nuevos campos al modelo de usuario:

```typescript
sucursalId?: string;        // ID de la sucursal asignada
sucursalNombre?: string;    // Nombre de la sucursal
```

### Asignar Sucursal a un Usuario

Los administradores deben asignar una sucursal a cada vendedor/cajero desde el panel de administración.

## 📦 Gestión de Stock por Sucursal

### 1. **Creación de Orden**

Cuando un vendedor crea una orden:
- Se obtiene automáticamente su sucursal asignada
- La orden queda asociada a esa sucursal
- Solo puede agregar productos con stock disponible en esa sucursal

### 2. **Búsqueda de Productos**

Al buscar productos (por nombre o código de barras):
- **Se muestra el stock de la sucursal específica**
- Solo aparecen productos con stock > 0 en esa sucursal
- El stock mostrado es el disponible en la sucursal del vendedor

Ejemplo de búsqueda:
```
Producto: Leche Entera 1L
Precio: $150
Stock: 25  ← Stock disponible en esta sucursal
```

### 3. **Validaciones de Stock**

#### Al Agregar Producto
```typescript
// ✅ Validación automática
if (cantidad > stockDisponibleEnSucursal) {
  return error("Stock insuficiente. Solo hay X unidades disponibles");
}
```

#### Al Modificar Cantidad
- Se valida que la nueva cantidad no exceda el stock disponible
- Mensaje de error específico: "Stock insuficiente. Solo hay X unidades disponibles"

#### Stock = 0
- No se puede agregar el producto
- Mensaje: "Producto sin stock disponible en [Nombre Sucursal]"

### 4. **Descuento de Stock al Completar Orden**

Cuando un cajero completa una orden (estado: `pendiente_cobro` → `completada`):

```typescript
// Para cada producto en la orden:
1. Busca el stock de la sucursal específica
2. Descuenta la cantidad vendida del stock de esa sucursal
3. Recalcula el stock total sumando todas las sucursales
4. Guarda los cambios
```

**Estructura de Stock por Sucursal en Producto:**
```typescript
stockPorSucursal: [
  {
    sucursalId: "123",
    sucursalNombre: "Sucursal Centro",
    cantidad: 50,
    stockMinimo: 10
  },
  {
    sucursalId: "456",
    sucursalNombre: "Sucursal Norte",
    cantidad: 30,
    stockMinimo: 5
  }
]
```

## 🔄 Flujo Completo

```mermaid
1. Vendedor crea orden
   ↓
2. Sistema asigna sucursal del vendedor
   ↓
3. Vendedor busca productos
   ↓
4. Sistema muestra solo productos con stock en su sucursal
   ↓
5. Vendedor agrega productos (validación automática de stock)
   ↓
6. Vendedor cierra orden → Estado: "Pendiente Cobro"
   ↓
7. Cajero cobra orden → Estado: "Completada"
   ↓
8. Sistema descuenta stock de la sucursal específica
   ↓
9. Stock actualizado en tiempo real
```

## 🎯 Ventajas del Sistema

✅ **Control por Sucursal**: Cada sucursal maneja su inventario independientemente
✅ **Prevención de Sobreventa**: No se puede vender más de lo disponible
✅ **Stock en Tiempo Real**: Validación instantánea al agregar productos
✅ **Trazabilidad**: Cada orden sabe de qué sucursal proviene
✅ **Escalabilidad**: Soporta múltiples sucursales sin cambios

## 🔐 Seguridad y Validaciones

1. **Al Crear Orden**
   - Valida que el usuario tenga sucursal asignada
   - Asocia automáticamente la sucursal

2. **Al Buscar Productos**
   - Filtra por stock > 0 en la sucursal específica
   - Muestra stock real disponible

3. **Al Agregar Producto**
   - Valida stock disponible antes de agregar
   - Previene agregar más unidades de las disponibles
   - Mensaje claro si no hay stock

4. **Al Modificar Cantidad**
   - Re-valida stock al aumentar cantidad
   - Permite solo hasta el stock disponible

5. **Al Completar Orden**
   - Descuenta exactamente de la sucursal correcta
   - Actualiza stock total del producto
   - Transacción atómica para evitar inconsistencias

## 📱 Interfaz de Usuario

### Indicadores Visuales

**En Crear/Editar Orden:**
```
📍 Sucursal: Sucursal Centro
```

**En Búsqueda de Productos:**
```
🔍 Leche Entera 1L
   $150 | Stock: 25 unidades
   [➕ Agregar]
```

**Mensajes de Error:**
- ❌ "Producto sin stock disponible en Sucursal Centro"
- ❌ "Stock insuficiente. Solo hay 5 unidades disponibles"

## 🛠️ Configuración Inicial

### Para Administradores

1. **Crear Sucursales** (si no existen)
   - Ir a panel de Sucursales
   - Crear cada sucursal con su información

2. **Asignar Sucursales a Usuarios**
   - Editar cada vendedor/cajero
   - Seleccionar su sucursal de trabajo
   - Guardar cambios

3. **Configurar Stock por Sucursal en Productos**
   - Ir a cada producto
   - Distribuir el stock entre sucursales
   - El sistema mostrará el stock correcto automáticamente

## 📊 Reportes y Consultas

El sistema permite:
- Ver órdenes por sucursal
- Consultar stock disponible por sucursal
- Identificar productos sin stock en sucursales específicas
- Historial de ventas por sucursal

## 🔄 Sincronización

- **Tiempo Real**: Las validaciones ocurren en cada operación
- **Consistencia**: El stock se actualiza atómicamente
- **Integridad**: No se permiten ventas sin stock real

---

## 💡 Notas Importantes

1. **Usuarios sin Sucursal Asignada**: 
   - Pueden crear órdenes pero usarán stock general
   - Recomendado: Asignar sucursal a todos los vendedores/cajeros

2. **Productos sin Stock por Sucursal**:
   - Si un producto no tiene configurado `stockPorSucursal`, usa el stock general
   - Recomendado: Configurar stock por sucursal en todos los productos

3. **Transferencias entre Sucursales**:
   - Use el módulo de transferencias de stock existente
   - No modifique el stock directamente en las órdenes

---

**Última actualización**: Noviembre 2025
