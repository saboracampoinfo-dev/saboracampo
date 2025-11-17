# Sistema de Liquidación de Pagos por Horas

## Descripción General

Sistema completo para gestionar las liquidaciones de pago a vendedores y cajeros basado en horas trabajadas, con soporte para períodos de 1, 7 o 28 días.

## Modelo de Datos

### User Model (actualizado)

```typescript
interface IUser {
  // ... campos existentes ...
  precioHora?: number;           // Precio por hora en AR$
  horasAcumuladas?: number;      // Horas totales acumuladas
  ultimaLiquidacion?: Date;      // Fecha de última liquidación
  historialPagos?: IPaymentRecord[];  // Historial de pagos
}

interface IPaymentRecord {
  amount: number;                // Monto pagado
  hoursWorked: number;           // Horas trabajadas
  period: {
    start: Date;                 // Inicio del período
    end: Date;                   // Fin del período
  };
  createdAt: Date;               // Fecha del pago
  notes?: string;                // Notas adicionales
}
```

## API Endpoints

### `/api/liquidaciones`

#### GET - Obtener información de liquidaciones
**Query Parameters:**
- `userId` (requerido): ID del usuario
- `action`: 
  - `"history"`: Obtener historial de pagos
  - `"calculate"`: Calcular liquidación pendiente
- `period`: `"1"`, `"7"`, o `"28"` días

**Respuesta (history):**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "historialPagos": [...],
    "horasAcumuladas": 40,
    "precioHora": 1500,
    "ultimaLiquidacion": "2024-01-15"
  }
}
```

**Respuesta (calculate):**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "userName": "Juan Pérez",
    "horasAcumuladas": 40,
    "precioHora": 1500,
    "diasPeriodo": 7,
    "montoTotal": 60000,
    "fechaInicio": "2024-01-08",
    "fechaFin": "2024-01-15"
  }
}
```

#### POST - Registrar horas trabajadas
**Body:**
```json
{
  "userId": "64abc...",
  "horas": 8,
  "fecha": "2024-01-15",
  "notas": "Turno completo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "horasAcumuladas": 48,
    "horasAgregadas": 8
  }
}
```

#### PUT - Procesar liquidación (pagar)
**Body:**
```json
{
  "userId": "64abc...",
  "periodo": "7",  // "1", "7", o "28"
  "notas": "Liquidación semanal del 8/01 al 15/01"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "userName": "Juan Pérez",
    "montoPagado": 60000,
    "horasTrabajadas": 40,
    "precioHora": 1500,
    "periodo": {
      "dias": 7,
      "inicio": "2024-01-08",
      "fin": "2024-01-15"
    },
    "ultimaLiquidacion": "2024-01-15"
  }
}
```

## Componentes

### `UsersManager` (actualizado)
- Agregado campo `precioHora` en el formulario
- Visible solo para roles: vendedor, cajero, seller, cashier
- Muestra horas acumuladas y precio por hora en la tabla

### `LiquidacionesManager` (nuevo)
Componente completo para gestionar liquidaciones con 3 funcionalidades principales:

#### 1. Visualización de Liquidaciones Pendientes
- Tabla con todos los vendedores y cajeros
- Columnas:
  - Nombre
  - Rol
  - Horas Acumuladas
  - Precio/Hora
  - Total a Pagar (calculado automáticamente)
  - Última Liquidación
  - Acciones

#### 2. Registrar Horas Trabajadas
Modal con formulario para registrar horas:
- Campo de horas (decimal, ej: 8.5)
- Fecha del trabajo
- Notas opcionales

#### 3. Procesar Liquidación
Modal con resumen y confirmación:
- Muestra horas acumuladas
- Muestra precio por hora
- Calcula y muestra total a pagar
- Selector de período (1, 7, o 28 días)
- Campo de notas
- Confirmación con SweetAlert2

#### 4. Historial de Pagos
Modal que muestra todos los pagos históricos:
- Monto pagado
- Horas trabajadas
- Período (fechas inicio-fin)
- Fecha del pago
- Notas

## Flujo de Trabajo

### 1. Configuración Inicial
1. Crear/editar usuario con rol `vendedor` o `cajero`
2. Establecer el `precioHora` (ej: AR$ 1500)

### 2. Registro Diario
1. Ir a pestaña **Liquidaciones**
2. Seleccionar vendedor/cajero
3. Hacer clic en **"+ Horas"**
4. Ingresar horas trabajadas y fecha
5. Las horas se acumulan automáticamente

### 3. Liquidación
1. Cuando sea momento de pagar (diario, semanal, mensual)
2. Hacer clic en **"Liquidar"** del empleado
3. Verificar el monto calculado
4. Seleccionar el período
5. Agregar notas si es necesario
6. Confirmar la liquidación
7. El sistema:
   - Registra el pago en el historial
   - Reinicia el contador de horas a 0
   - Actualiza la fecha de última liquidación

### 4. Consulta de Historial
- Hacer clic en **"Historial"** para ver todos los pagos pasados
- Útil para auditorías y reportes

## Dashboard Admin

Nueva pestaña **💵 Liquidaciones** agregada al dashboard con:
- Acceso rápido desde el panel principal
- Integración completa con el sistema de usuarios
- Filtrado automático de vendedores y cajeros

## Validaciones

- Solo usuarios con rol `seller`, `cashier`, `vendedor` o `cajero` pueden tener liquidaciones
- No se puede liquidar si no hay horas acumuladas
- Todos los cálculos usan 2 decimales para montos
- Las horas se pueden registrar con decimales (ej: 4.5 horas)

## Ejemplo de Uso

```typescript
// Registrar 8 horas de trabajo
POST /api/liquidaciones
{
  "userId": "64abc123",
  "horas": 8,
  "fecha": "2024-01-15"
}

// Liquidar semanal (7 días)
PUT /api/liquidaciones
{
  "userId": "64abc123",
  "periodo": "7",
  "notas": "Liquidación semanal"
}

// Ver historial
GET /api/liquidaciones?userId=64abc123&action=history
```

## Notas Técnicas

- Las fechas se almacenan en formato ISO
- Los montos se calculan: `horasAcumuladas × precioHora`
- El historial se almacena en el documento del usuario
- Se usa `confirmDelete` de SweetAlert2 para confirmaciones importantes
- Toasts de `react-toastify` para feedback inmediato
