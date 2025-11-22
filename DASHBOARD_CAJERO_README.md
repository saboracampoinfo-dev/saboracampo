# Dashboard del Cajero - Documentación

## Descripción General

El Dashboard del Cajero es una interfaz completa que permite a los cajeros gestionar el cobro de las órdenes de venta creadas por los vendedores. Es similar al dashboard del vendedor pero enfocado en la gestión de cobros.

## Características Principales

### 1. **Gestión de Órdenes de Cobro**
- Visualización de todas las órdenes pendientes de cobro
- Filtrado por estado (Pendiente Cobro, Completadas, Todas)
- Búsqueda por número de orden, vendedor o email
- Detalle completo de cada orden

### 2. **Completar Cobros**
- Interfaz intuitiva para procesar pagos
- Selección de método de pago:
  - 💵 Efectivo
  - 💳 Tarjeta de Débito
  - 💳 Tarjeta de Crédito
  - 🏦 Transferencia
  - 📱 Mercado Pago
  - 🔄 Otro
- Registro automático del cajero que procesa el pago
- Actualización de fecha de completado

### 3. **Mis Datos**
- Visualización y edición de información personal
- Campos disponibles:
  - Nombre completo
  - Email (solo lectura)
  - Teléfono
  - Fecha de nacimiento
  - Dirección
  - Ciudad
  - Código postal

## Estructura de Componentes

```
src/
├── app/
│   └── dashboardCajero/
│       └── page.tsx          # Página principal con navegación por tabs
└── components/
    └── cajero/
        ├── MisDatosCajero.tsx     # Gestión de datos personales
        └── OrdenesCajero.tsx      # Gestión de órdenes de cobro
```

## Flujo de Trabajo

### Proceso de Cobro de una Orden

1. **Vendedor crea la orden**
   - El vendedor agrega productos a una orden
   - Estado inicial: `en_proceso`

2. **Vendedor envía a caja**
   - El vendedor finaliza la orden y la envía a caja
   - Estado cambia a: `pendiente_cobro`
   - Se descuenta automáticamente el stock

3. **Cajero visualiza la orden**
   - La orden aparece en el dashboard del cajero
   - Puede ver todos los detalles: productos, cantidades, precios, vendedor

4. **Cajero procesa el cobro**
   - Hace clic en "💰 Cobrar Orden"
   - Selecciona el método de pago
   - Confirma el cobro

5. **Orden completada**
   - Estado final: `completada`
   - Se registra:
     - Cajero que procesó el pago
     - Método de pago utilizado
     - Fecha y hora de completado

## Estados de las Órdenes

| Estado | Descripción | Quién puede modificar |
|--------|-------------|----------------------|
| `en_proceso` | Orden en construcción | Vendedor |
| `pendiente_cobro` | Esperando cobro | Cajero |
| `completada` | Cobrada | - |
| `cancelada` | Cancelada | Admin/Vendedor |

## Permisos y Restricciones

### Cajeros pueden:
- ✅ Ver órdenes en estado `pendiente_cobro` y `completada`
- ✅ Completar órdenes pendientes de cobro
- ✅ Ver detalles completos de las órdenes
- ✅ Editar sus datos personales

### Cajeros NO pueden:
- ❌ Crear nuevas órdenes
- ❌ Modificar órdenes en proceso
- ❌ Cancelar órdenes completadas
- ❌ Modificar productos de órdenes existentes

## API Endpoints Utilizados

### GET `/api/ordenes`
Obtiene la lista de órdenes. El componente filtra solo las relevantes para el cajero.

**Respuesta:**
```json
{
  "success": true,
  "ordenes": [...]
}
```

### POST `/api/ordenes` (action: completar_orden)
Completa el cobro de una orden.

**Body:**
```json
{
  "action": "completar_orden",
  "ordenId": "...",
  "metodoPago": "efectivo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "orden": {...},
  "message": "Orden completada exitosamente"
}
```

### GET `/api/auth/me`
Obtiene información del usuario actual.

### PUT `/api/users/:id`
Actualiza datos del usuario.

## Interfaz de Usuario

### Tabs de Navegación
```
💰 Órdenes de Cobro    |    📊 Mis Datos
```

### Filtros de Órdenes
- **⏳ Pendiente Cobro**: Órdenes listas para cobrar
- **✅ Completadas**: Órdenes ya cobradas
- **📋 Todas**: Todas las órdenes visibles

### Tarjeta de Orden
Muestra:
- Número de orden
- Estado visual con colores
- Vendedor responsable
- Fechas importantes
- Lista de productos
- Total a cobrar
- Botones de acción

### Modal de Cobro
Formulario simple para:
- Confirmar número de orden
- Ver total a cobrar
- Seleccionar método de pago
- Botones: Cancelar | Confirmar Cobro

## Estilos y Colores

### Colores de Estado
- **Pendiente Cobro**: `bg-warning/10 text-warning` (Amarillo)
- **Completada**: `bg-success-dark/10 text-success-light` (Verde)

### Colores del Dashboard
- **Color principal**: `secondary` (Azul del sistema de cajero)
- **Botón cobrar**: `success-light` (Verde)
- **Botón detalle**: `secondary` (Azul)

## Responsive Design

El dashboard es completamente responsive:

### Mobile (< 768px)
- Tabs horizontales con scroll
- Tarjetas apiladas verticalmente
- Botones de ancho completo
- Modal de pantalla completa

### Tablet/Desktop (≥ 768px)
- Navegación en línea
- Tarjetas con layout horizontal
- Botones de ancho automático
- Modal centrado

## Notificaciones

El sistema utiliza `react-toastify` para feedback:

- **Éxito**: Verde ✅
  - "Orden completada exitosamente"
  - "Datos actualizados correctamente"

- **Error**: Rojo ❌
  - "Error al cargar órdenes"
  - "Solo cajeros pueden completar órdenes"

- **Info**: Azul ℹ️
  - "No hay órdenes para mostrar"

## Mejores Prácticas

### Para Cajeros:
1. **Verificar productos**: Antes de cobrar, revisar que los productos coincidan
2. **Confirmar total**: Asegurar que el monto sea correcto
3. **Método de pago**: Seleccionar el correcto para informes precisos
4. **Doble verificación**: Usar el botón "Ver Detalle" para confirmar antes de cobrar

### Para Desarrolladores:
1. **Validación de permisos**: Siempre verificar rol en el backend
2. **Manejo de errores**: Usar try-catch y mostrar mensajes claros
3. **Estado consistente**: Mantener sincronización entre frontend y backend
4. **Loading states**: Mostrar indicadores de carga

## Seguridad

- ✅ Autenticación requerida para todas las operaciones
- ✅ Verificación de rol en el backend
- ✅ Validación de estados de órdenes
- ✅ Registro de quién procesa cada pago
- ✅ Timestamps automáticos para auditoría

## Diferencias con el Dashboard del Vendedor

| Característica | Vendedor | Cajero |
|---------------|----------|--------|
| Crear órdenes | ✅ | ❌ |
| Agregar productos | ✅ | ❌ |
| Ver órdenes en proceso | ✅ | ❌ |
| Ver órdenes pendientes | ✅ | ✅ |
| Completar cobros | ❌ | ✅ |
| Cancelar órdenes | ✅ | ❌ |
| Selector de sucursal | ✅ | ❌ |
| Color principal | Verde (Primary) | Azul (Secondary) |

## Troubleshooting

### Problema: No aparecen órdenes
**Solución**: 
- Verificar que haya órdenes en estado `pendiente_cobro`
- Revisar conexión a la base de datos
- Verificar permisos del usuario

### Problema: Error al completar orden
**Solución**:
- Verificar que la orden esté en estado `pendiente_cobro`
- Confirmar que el usuario tenga rol de cajero
- Revisar logs del servidor para más detalles

### Problema: No se actualiza el stock
**Solución**:
- El stock se descuenta cuando el vendedor envía a caja
- El cajero solo registra el pago, no modifica stock

## Próximas Mejoras Sugeridas

1. **Historial de cobros**: Ver órdenes completadas por día/mes
2. **Resumen de caja**: Total cobrado por método de pago
3. **Impresión de tickets**: Generar comprobantes de pago
4. **Devoluciones**: Permitir reversar órdenes completadas
5. **Notificaciones push**: Alertar cuando hay órdenes pendientes
6. **Escaneo de QR**: Procesar pagos con QR de órdenes

## Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Toastify](https://fkhadra.github.io/react-toastify)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/data-modeling/)

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0  
**Autor**: Sistema Sabor a Campo
