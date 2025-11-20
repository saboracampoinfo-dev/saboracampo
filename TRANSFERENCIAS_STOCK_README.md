# Gestor de Transferencias de Stock

Sistema completo para gestionar movimientos masivos de stock entre sucursales en Sabor a Campo.

## 📋 Características

### ✅ Funcionalidades Implementadas

1. **Modelo de Datos (`TransferenciaStock`)**
   - Registro completo de transferencias con historial
   - Estados: pendiente, completada, cancelada
   - Tracking de stock antes/después por producto
   - Información de usuario creador y aprobador
   - Índices optimizados para consultas rápidas

2. **API Endpoints**
   - `GET /api/transferencias` - Listar transferencias con filtros
   - `POST /api/transferencias` - Crear nueva transferencia
   - `GET /api/transferencias/[id]` - Obtener detalles
   - `PUT /api/transferencias/[id]` - Aprobar o cancelar
   - `DELETE /api/transferencias/[id]` - Eliminar (solo pendientes/canceladas)

3. **Interfaz de Usuario**
   - Componente `GestorTransferencias` integrado en dashboard admin
   - Dos vistas: Nueva Transferencia y Historial
   - Búsqueda inteligente de productos
   - Validación de stock en tiempo real
   - Gestión masiva de productos
   - Filtros por estado y sucursal

## 🚀 Uso

### Acceso

1. Iniciar sesión como administrador
2. Ir a Dashboard Admin
3. Click en pestaña **🔄 Transferencias**

### Crear Transferencia

1. **Seleccionar Sucursales**
   - Elegir sucursal origen (donde está el stock)
   - Elegir sucursal destino (donde va el stock)

2. **Agregar Productos**
   - Buscar producto por nombre
   - Click en producto para agregar
   - Ajustar cantidad (máximo = stock disponible)
   - Repetir para agregar más productos

3. **Ejecutar**
   - **Crear Pendiente**: Guarda la transferencia para aprobar después
   - **Ejecutar Ahora**: Transfiere el stock inmediatamente

### Aprobar/Cancelar Transferencias

1. Ir a vista **Historial**
2. Filtrar por estado "Pendientes"
3. Click en **Aprobar** o **Cancelar**
4. Si cancela, debe ingresar motivo

## 🔧 Estructura Técnica

### Modelo de Datos

```typescript
interface TransferenciaStock {
  sucursalOrigenId: string;
  sucursalOrigenNombre: string;
  sucursalDestinoId: string;
  sucursalDestinoNombre: string;
  items: {
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    stockOrigenAntes: number;
    stockOrigenDespues: number;
    stockDestinoAntes: number;
    stockDestinoDespues: number;
  }[];
  totalItems: number;
  totalCantidad: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  creadoPor: string;
  creadoPorNombre: string;
  aprobadoPor?: string;
  aprobadoPorNombre?: string;
  fechaCreacion: Date;
  fechaAprobacion?: Date;
  notas?: string;
  motivoCancelacion?: string;
}
```

### Validaciones

- ✅ Sucursal origen ≠ sucursal destino
- ✅ Stock suficiente en origen
- ✅ Cantidad > 0
- ✅ Productos existen y están activos
- ✅ Re-validación antes de aprobar

### Actualización de Stock

Al aprobar/ejecutar una transferencia:

1. **Sucursal Origen**: Resta cantidad del stock
2. **Sucursal Destino**: Suma cantidad al stock (crea entrada si no existe)
3. **Stock Total**: Recalcula sumando todas las sucursales
4. **Registro**: Guarda estados antes/después

## 📊 Ejemplos de Uso

### Caso 1: Reabastecimiento de Sucursal

```
Origen: Depósito Central (100 unidades de Tomate)
Destino: Sucursal Belgrano (20 unidades)
Acción: Transferir 30 unidades
Resultado: 
  - Central: 70 unidades
  - Belgrano: 50 unidades
```

### Caso 2: Redistribución por Demanda

```
Productos: 
  - Lechuga: 20 unidades
  - Zanahoria: 15 unidades
  - Cebolla: 30 unidades
Origen: Sucursal con exceso de stock
Destino: Sucursal con mayor demanda
```

### Caso 3: Transferencia Masiva

```
20 productos diferentes en una sola operación
Sistema valida stock de todos antes de ejecutar
Historial completo para auditoría
```

## 🔐 Seguridad

- ✅ Solo administradores pueden crear/aprobar
- ✅ Validación de autenticación en API
- ✅ No se pueden eliminar transferencias completadas
- ✅ Registro de quién creó y quién aprobó

## 📱 Responsive

- ✅ Diseño adaptable a móviles
- ✅ Scroll horizontal en tablas
- ✅ Menú colapsable en dispositivos pequeños

## 🎨 UI/UX

- Estados visuales con colores:
  - 🟢 Completada: Verde
  - 🟡 Pendiente: Amarillo
  - 🔴 Cancelada: Rojo
- Confirmaciones con SweetAlert2
- Toasts para feedback inmediato
- Detalles colapsables de productos

## 🔄 Flujo de Trabajo

```
1. Crear → [Pendiente] → Aprobar → [Completada] ✅
                      ↓
                  Cancelar → [Cancelada] ❌

2. Ejecutar Inmediatamente → [Completada] ✅
```

## 📈 Beneficios

1. **Eficiencia**: Transferencias masivas en una operación
2. **Control**: Aprobación en dos pasos para seguridad
3. **Trazabilidad**: Historial completo con antes/después
4. **Auditoría**: Registro de usuarios y fechas
5. **Validación**: Previene errores de stock

## 🛠️ Archivos Creados

- `src/models/TransferenciaStock.ts` - Modelo MongoDB
- `src/app/api/transferencias/route.ts` - API principal
- `src/app/api/transferencias/[id]/route.ts` - API por ID
- `src/components/admin/GestorTransferencias.tsx` - Componente UI
- Dashboard integrado con nueva pestaña

## 🚦 Estados del Sistema

- **Pendiente**: Creada, esperando aprobación
- **Completada**: Ejecutada, stock actualizado
- **Cancelada**: Rechazada con motivo

---

¡Sistema de transferencias listo para uso en producción! 🎉
