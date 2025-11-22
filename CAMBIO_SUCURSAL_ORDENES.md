# Cambio de Sucursal en Órdenes

## 📋 Descripción General

Funcionalidad que permite a cajeros y administradores cambiar la sucursal asignada a una orden, con ajuste automático de inventario cuando es necesario.

---

## 🎯 Características Principales

### ✅ Estados Soportados
- **En Proceso**: Cambio simple sin ajuste de stock
- **Pendiente de Cobro**: Cambio con ajuste automático de stock entre sucursales

### 🚫 Estados NO Soportados
- **Completada**: No se puede cambiar (orden finalizada)
- **Cancelada**: No se puede cambiar (orden cancelada)

---

## 🔐 Permisos

### Roles Autorizados
- ✅ **Admin**: Acceso completo
- ✅ **Cajero/Cashier**: Acceso completo
- ❌ **Vendedor**: Sin acceso (solo admin y cajeros)

---

## 🔄 Flujo de Operación

### Caso 1: Orden en Proceso
```
1. Usuario selecciona "Cambiar Sucursal" en la orden
2. Elige nueva sucursal del selector
3. Sistema actualiza sucursal sin tocar stock
4. Confirmación exitosa
```

**Razón**: El stock aún no se ha descontado (solo se descuenta al enviar a caja).

### Caso 2: Orden Pendiente de Cobro
```
1. Usuario selecciona "Cambiar Sucursal" en la orden
2. Sistema muestra advertencia de ajuste de stock
3. Usuario elige nueva sucursal
4. Sistema ejecuta:
   a. Devuelve stock a sucursal actual (reintegra unidades)
   b. Verifica disponibilidad en nueva sucursal
   c. Descuenta stock de nueva sucursal
   d. Actualiza stock total
   e. Actualiza sucursal de la orden
5. Confirmación exitosa
```

**Razón**: El stock ya fue descontado al cerrar la orden, debe ajustarse entre sucursales.

---

## 🛠️ Implementación Técnica

### API Endpoint
**POST** `/api/ordenes`

#### Acción: `cambiar_sucursal`

**Request Body:**
```json
{
  "action": "cambiar_sucursal",
  "ordenId": "507f1f77bcf86cd799439011",
  "sucursalId": "507f1f77bcf86cd799439012",
  "sucursalNombre": "Sucursal Centro"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "orden": { /* orden actualizada */ },
  "message": "Sucursal actualizada exitosamente"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Stock insuficiente para \"Producto X\" en la nueva sucursal. Disponible: 5"
}
```

### Validaciones

#### 1. Datos Requeridos
- `ordenId` (ID de la orden)
- `sucursalId` (ID de la nueva sucursal)
- `sucursalNombre` (Nombre de la nueva sucursal)

#### 2. Estado de la Orden
```typescript
if (orden.estado === 'completada' || orden.estado === 'cancelada') {
  return error('No se puede cambiar la sucursal de órdenes completadas o canceladas');
}
```

#### 3. Permisos de Usuario
```typescript
if (user.role !== 'admin' && user.role !== 'cajero' && user.role !== 'cashier') {
  return error('Solo administradores y cajeros pueden cambiar sucursal');
}
```

#### 4. Stock Disponible (solo para pendiente_cobro)
```typescript
if (stockDisponible < prod.cantidad) {
  return error(`Stock insuficiente para "${prod.nombre}" en la nueva sucursal. Disponible: ${stockDisponible}`);
}
```

---

## 💾 Gestión de Inventario

### Ajuste de Stock en Pendiente de Cobro

#### Paso 1: Devolución a Sucursal Actual
```typescript
// Para cada producto en la orden
for (const prod of orden.productos) {
  // Encontrar stock de sucursal actual
  const stockSucursalIndex = producto.stockPorSucursal.findIndex(
    (s) => s.sucursalId === orden.sucursal.id.toString()
  );
  
  // Devolver unidades
  producto.stockPorSucursal[stockSucursalIndex].cantidad += prod.cantidad;
}
```

#### Paso 2: Descuento de Nueva Sucursal
```typescript
// Para cada producto en la orden
for (const prod of orden.productos) {
  // Encontrar stock de nueva sucursal
  const stockSucursalIndex = producto.stockPorSucursal.findIndex(
    (s) => s.sucursalId === nuevaSucursalId
  );
  
  // Validar disponibilidad
  if (stockDisponible < prod.cantidad) {
    throw new Error('Stock insuficiente');
  }
  
  // Descontar unidades
  producto.stockPorSucursal[stockSucursalIndex].cantidad -= prod.cantidad;
  
  // Actualizar stock total
  producto.stock = producto.stockPorSucursal.reduce(
    (total, s) => total + s.cantidad, 
    0
  );
  
  await producto.save();
}
```

### Tabla de Estados y Stock

| Estado Orden | ¿Stock Descontado? | ¿Ajusta Stock? | Operación |
|--------------|-------------------|----------------|-----------|
| `en_proceso` | ❌ No | ❌ No | Solo cambia sucursal |
| `pendiente_cobro` | ✅ Sí | ✅ Sí | Devuelve → Descuenta |
| `completada` | ✅ Sí | 🚫 Bloqueado | No se permite |
| `cancelada` | ❌/✅ Depende | 🚫 Bloqueado | No se permite |

---

## 🎨 Interfaz de Usuario

### Ubicación del Botón
El botón "🔄 Cambiar Sucursal" aparece en:
- Lista de órdenes del cajero
- Órdenes en estado `en_proceso` o `pendiente_cobro`

### Componente: `OrdenesCajero.tsx`

#### Estados Agregados
```typescript
const [showCambiarSucursalModal, setShowCambiarSucursalModal] = useState(false);
const [ordenACambiarSucursal, setOrdenACambiarSucursal] = useState<Orden | null>(null);
const [nuevaSucursalId, setNuevaSucursalId] = useState<string>('');
```

#### Función Principal
```typescript
const handleCambiarSucursal = async () => {
  if (!ordenACambiarSucursal || !nuevaSucursalId) return;

  const sucursal = sucursales.find(s => s._id === nuevaSucursalId);
  if (!sucursal) return;

  try {
    const response = await fetch('/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cambiar_sucursal',
        ordenId: ordenACambiarSucursal._id,
        sucursalId: nuevaSucursalId,
        sucursalNombre: sucursal.nombre
      })
    });

    const data = await response.json();

    if (data.success) {
      showSuccessToast(`Sucursal cambiada a: ${sucursal.nombre}`);
      setShowCambiarSucursalModal(false);
      setOrdenACambiarSucursal(null);
      setNuevaSucursalId('');
      fetchOrdenes();
    } else {
      showErrorToast(data.error || 'Error al cambiar sucursal');
    }
  } catch (error) {
    showErrorToast('Error al cambiar sucursal');
  }
};
```

### Modal de Cambio

#### Elementos del Modal
1. **Header**: Título "Cambiar Sucursal" con color warning (amarillo)
2. **Información de Orden**:
   - Número de orden
   - Sucursal actual
   - Estado actual
3. **Advertencia** (solo para pendiente_cobro):
   - ⚠️ Mensaje sobre ajuste automático de stock
4. **Selector de Sucursal**:
   - Dropdown con sucursales activas
   - Sucursal actual deshabilitada
5. **Mensaje Informativo**:
   - ℹ️ Verificación de stock en nueva sucursal
6. **Botones de Acción**:
   - Cancelar (gris)
   - Cambiar Sucursal (amarillo, deshabilitado si no hay cambio)

---

## ⚠️ Casos de Error

### Error 400: Faltan Datos
```json
{
  "error": "Faltan datos requeridos"
}
```
**Causa**: No se envió `ordenId`, `sucursalId` o `sucursalNombre`.

### Error 404: Orden No Encontrada
```json
{
  "error": "Orden no encontrada"
}
```
**Causa**: El `ordenId` no existe en la base de datos.

### Error 400: Estado Inválido
```json
{
  "error": "No se puede cambiar la sucursal de órdenes completadas o canceladas"
}
```
**Causa**: Intentando cambiar sucursal en orden finalizada.

### Error 403: Sin Permisos
```json
{
  "error": "Solo administradores y cajeros pueden cambiar sucursal"
}
```
**Causa**: Usuario sin rol de admin o cajero.

### Error 400: Stock Insuficiente
```json
{
  "error": "Stock insuficiente para \"Producto X\" en la nueva sucursal. Disponible: 3"
}
```
**Causa**: La nueva sucursal no tiene suficientes unidades del producto.

### Error 400: Producto Sin Stock en Sucursal
```json
{
  "error": "Producto \"Producto Y\" no tiene stock en la nueva sucursal"
}
```
**Causa**: El producto no está configurado en la nueva sucursal.

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Orden en Proceso (Sin Ajuste de Stock)

#### Escenario
- Orden #ORD-241122-0001 creada en Sucursal A
- Estado: `en_proceso`
- Productos: 2x Producto X, 3x Producto Y
- Stock NO descontado aún

#### Operación
```javascript
POST /api/ordenes
{
  "action": "cambiar_sucursal",
  "ordenId": "67890abcdef123456",
  "sucursalId": "sucursal_b_id",
  "sucursalNombre": "Sucursal B"
}
```

#### Resultado
- ✅ Sucursal de orden actualizada a Sucursal B
- ✅ Stock sin cambios (no se toca)
- ✅ Orden lista para seguir agregando productos

---

### Ejemplo 2: Orden Pendiente de Cobro (Con Ajuste de Stock)

#### Escenario
- Orden #ORD-241122-0002 en Sucursal Centro
- Estado: `pendiente_cobro` (cerrada por vendedor)
- Productos: 5x Producto A (precio $10)
- Stock descontado:
  - Sucursal Centro: 50 → 45 unidades
  - Sucursal Norte: 30 unidades

#### Operación
```javascript
POST /api/ordenes
{
  "action": "cambiar_sucursal",
  "ordenId": "orden_id",
  "sucursalId": "sucursal_norte_id",
  "sucursalNombre": "Sucursal Norte"
}
```

#### Proceso Backend
```
1. Verificar estado: pendiente_cobro ✓
2. Devolver stock a Sucursal Centro:
   - Centro: 45 + 5 = 50 unidades
3. Verificar stock en Sucursal Norte:
   - Norte: 30 unidades (suficiente)
4. Descontar de Sucursal Norte:
   - Norte: 30 - 5 = 25 unidades
5. Actualizar stock total del producto
6. Actualizar sucursal de la orden
```

#### Resultado Final
- ✅ Sucursal de orden: Sucursal Norte
- ✅ Stock Sucursal Centro: 50 unidades (devuelto)
- ✅ Stock Sucursal Norte: 25 unidades (descontado)
- ✅ Orden lista para cobro en nueva sucursal

---

## 🔍 Logs y Debugging

### Mensajes de Consola

#### Orden en Proceso
```
ℹ️ Cambiando sucursal de orden en proceso (sin ajuste de stock)
✅ Sucursal actualizada
```

#### Orden Pendiente de Cobro
```
🔄 Ajustando stock al cambiar sucursal...
🔄 Devolviendo 5 unidades a Sucursal Centro
📦 Descontando 5 unidades de nueva sucursal
✅ Stock ajustado correctamente
✅ Sucursal actualizada
```

#### Error de Stock
```
❌ Stock insuficiente en nueva sucursal
❌ Producto "X" - Disponible: 2, Requerido: 5
```

---

## 🧪 Testing

### Casos de Prueba

#### Test 1: Cambio Simple (En Proceso)
```
✓ Crear orden en Sucursal A
✓ Agregar productos
✓ Cambiar a Sucursal B
✓ Verificar: sucursal actualizada
✓ Verificar: stock sin cambios
```

#### Test 2: Cambio con Ajuste (Pendiente Cobro)
```
✓ Crear orden en Sucursal A con 3x Producto X
✓ Cerrar orden (pasa a pendiente_cobro)
✓ Verificar: stock descontado en Sucursal A
✓ Cambiar a Sucursal B
✓ Verificar: stock devuelto a Sucursal A
✓ Verificar: stock descontado en Sucursal B
✓ Verificar: sucursal actualizada
```

#### Test 3: Validación de Stock Insuficiente
```
✓ Crear orden con 10x Producto Y
✓ Cerrar orden en Sucursal A
✓ Intentar cambiar a Sucursal C (solo tiene 5 unidades)
✓ Verificar: error de stock insuficiente
✓ Verificar: orden sin cambios
```

#### Test 4: Bloqueo de Estados Finales
```
✓ Crear y completar orden
✓ Intentar cambiar sucursal
✓ Verificar: error de estado inválido
```

#### Test 5: Validación de Permisos
```
✓ Login como vendedor
✓ Intentar cambiar sucursal de orden
✓ Verificar: error de permisos
```

---

## 📝 Notas Importantes

### ⚠️ Consideraciones
1. **Stock Real-Time**: El sistema verifica stock en tiempo real antes de cada cambio
2. **Transacción Atómica**: Si falla el ajuste de stock, no se actualiza la sucursal
3. **Auditoría**: Cada cambio queda registrado en `fechaActualizacion` de la orden
4. **No Afecta Total**: El cambio de sucursal NO modifica precios ni total de la orden

### 💡 Mejores Prácticas
- Cambiar sucursal preferentemente en estado `en_proceso`
- Verificar inventario antes de cambios en `pendiente_cobro`
- Comunicar al vendedor si se cambia su orden
- Usar para corrección de errores de asignación inicial

### 🔮 Futuras Mejoras
- [ ] Historial de cambios de sucursal en la orden
- [ ] Notificación automática al vendedor del cambio
- [ ] Validación de disponibilidad antes de abrir modal
- [ ] Opción de cambio masivo de órdenes
- [ ] Reporte de cambios de sucursal realizados

---

## 🔗 Archivos Relacionados

- `src/app/api/ordenes/route.ts` - API de órdenes (acción `cambiar_sucursal`)
- `src/components/cajero/OrdenesCajero.tsx` - Componente con modal y botón
- `src/models/Orden.ts` - Modelo de orden con campo `sucursal`
- `src/models/Product.ts` - Modelo de producto con `stockPorSucursal`

---

## 📞 Soporte

Para más información sobre:
- **Sistema de Órdenes**: Ver `DASHBOARD_CAJERO_README.md`
- **Gestión de Sucursales**: Ver `SUCURSALES_README.md`
- **Control de Stock**: Ver `INVENTARIO_MULTISUCURSAL.md`
