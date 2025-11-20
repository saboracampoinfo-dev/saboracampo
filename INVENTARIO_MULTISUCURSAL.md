# Sistema de Inventario Multi-Sucursal y Alertas de Stock

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de gestión de inventario multi-sucursal con:

1. **Stock por Sucursal**: Los productos ahora manejan stock distribuido por sucursal
2. **Transferencias de Stock**: Movimiento de inventario entre sucursales
3. **Alertas Automáticas**: Notificaciones cuando el stock está bajo en cualquier sucursal
4. **Subida de Imágenes**: Integración del componente UploadImage para productos

## 🚀 Nuevas Funcionalidades

### 1. Stock por Sucursal

Cada producto ahora tiene un campo `stockPorSucursal` que contiene:
- `sucursalId`: ID de la sucursal
- `sucursalNombre`: Nombre de la sucursal
- `cantidad`: Stock disponible en esa sucursal
- `stockMinimo`: Stock mínimo para esa sucursal

El campo `stock` del producto es la suma total de todas las sucursales.

### 2. Transferencias de Stock

**Endpoint**: `POST /api/products/transfer`

**Body**:
```json
{
  "productoId": "string",
  "origenSucursalId": "string",
  "destinoSucursalId": "string",
  "destinoSucursalNombre": "string",
  "cantidad": number
}
```

**Funcionalidad**:
- Resta stock de la sucursal origen
- Suma stock a la sucursal destino
- Crea alertas automáticas si alguna sucursal queda bajo el stock mínimo
- Valida que haya stock suficiente antes de transferir

### 3. Alertas de Stock

**Modelo**: `StockAlert`

**Tipos de Alertas**:
- **Agotado**: Stock = 0
- **Crítico**: Stock <= 50% del stock mínimo
- **Bajo**: Stock <= stock mínimo

**Endpoints**:
- `GET /api/stock-alerts`: Obtener alertas (con filtros por estado, tipo, sucursal)
- `PUT /api/stock-alerts`: Actualizar estado de alerta
- `DELETE /api/stock-alerts`: Eliminar alerta (solo admin)

**Estados de Alertas**:
- `pendiente`: Nueva alerta, requiere atención
- `revisado`: Alerta revisada, en proceso
- `resuelto`: Alerta resuelta, stock reabastecido

### 4. Componente de Alertas

**Ubicación**: `src/components/admin/StockAlerts.tsx`

**Uso en Dashboard**:
```tsx
import StockAlerts from '@/components/admin/StockAlerts';

// En tu dashboard
<StockAlerts />
```

**Características**:
- Filtro por estado (pendiente, revisado, resuelto)
- Indicadores visuales según severidad
- Acciones rápidas (revisar, resolver, eliminar)
- Información detallada de cada alerta

## 📱 Interfaz de Usuario

### ProductsManager

**Nuevas funcionalidades**:
1. **Subida de Imágenes**: Botón para subir fotos usando Cloudinary
2. **Vista de Stock por Sucursal**: En la tabla se muestra el desglose de stock
3. **Botón de Transferencia** (🔄): Abre modal para transferir stock
4. **Alertas Visuales**: Stock en rojo cuando está bajo el mínimo

### Modal de Transferencia

Permite:
- Ver stock actual por sucursal
- Seleccionar sucursal origen y destino
- Ingresar cantidad a transferir
- Validación de stock disponible

## 🔧 Configuración Inicial

### Paso 1: Migrar Productos Existentes

Para productos existentes, necesitas inicializar el campo `stockPorSucursal`. Puedes hacerlo de dos formas:

**Opción A - Asignar todo el stock a Sucursal Central**:

```javascript
// Ejecutar en MongoDB o crear un script
db.products.updateMany(
  { stockPorSucursal: { $exists: false } },
  {
    $set: {
      stockPorSucursal: [{
        sucursalId: "ID_SUCURSAL_CENTRAL",
        sucursalNombre: "Sucursal Central",
        cantidad: "$stock",
        stockMinimo: "$stockMinimo"
      }]
    }
  }
);
```

**Opción B - Script de Migración Automático**:

Crear archivo `scripts/migrate-products-stock.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function migrateProducts() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const Product = require('../src/models/Product').default;
  const Sucursal = require('../src/models/Sucursal').default;
  
  // Obtener sucursal central
  const sucursalCentral = await Sucursal.findOne({ nombre: /central/i });
  
  if (!sucursalCentral) {
    console.error('No se encontró sucursal central');
    process.exit(1);
  }
  
  // Actualizar productos
  const productos = await Product.find({ 
    $or: [
      { stockPorSucursal: { $exists: false } },
      { stockPorSucursal: { $size: 0 } }
    ]
  });
  
  console.log(`Encontrados ${productos.length} productos para migrar`);
  
  for (const producto of productos) {
    producto.stockPorSucursal = [{
      sucursalId: sucursalCentral._id.toString(),
      sucursalNombre: sucursalCentral.nombre,
      cantidad: producto.stock,
      stockMinimo: producto.stockMinimo
    }];
    
    await producto.save();
    console.log(`✓ Producto ${producto.nombre} migrado`);
  }
  
  console.log('Migración completada');
  process.exit(0);
}

migrateProducts().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
```

Ejecutar:
```bash
node scripts/migrate-products-stock.js
```

### Paso 2: Crear Productos Nuevos

Cuando creas un producto nuevo, automáticamente se asigna a la sucursal central. Desde la interfaz de ProductsManager:

1. Click en "Nuevo Producto"
2. Llenar datos básicos
3. **Subir imágenes** con el botón de UploadImage
4. Ingresar stock inicial (se asignará a sucursal central automáticamente)
5. Guardar

### Paso 3: Transferir Stock

1. En la tabla de productos, click en el botón 🔄 (Transferir)
2. Seleccionar sucursal origen (donde está el stock)
3. Seleccionar sucursal destino
4. Ingresar cantidad
5. Confirmar transferencia

## 📊 Ejemplo de Flujo Completo

### Escenario: Ingreso de Dulce de Leche

1. **Recepción en Sucursal Central**:
   - 10 unidades de "Dulce de Leche Colonial"
   - Stock se asigna automáticamente a "Sucursal Central"

2. **Distribución**:
   - Transferir 5 unidades a "Sucursal Plaza"
   - Transferir 5 unidades a "Sucursal Norte"
   - Sucursal Central queda en 0

3. **Alertas Automáticas**:
   - Si stock mínimo es 2 en cada sucursal:
   - ✅ Plaza: 5 unidades (OK)
   - ✅ Norte: 5 unidades (OK)
   - 🚫 Central: 0 unidades (AGOTADO) → Se crea alerta automática

4. **Gestión de Alertas**:
   - Admin ve alerta en dashboard
   - Marca como "Revisado"
   - Ingresa más stock a Central
   - Marca como "Resuelto"

## 🎨 Integración en Dashboard Admin

```tsx
import ProductsManager from '@/components/admin/ProductsManager';
import StockAlerts from '@/components/admin/StockAlerts';

export default function DashboardAdmin() {
  return (
    <div className="space-y-8">
      {/* Alertas en la parte superior */}
      <StockAlerts />
      
      {/* Gestión de productos */}
      <ProductsManager />
    </div>
  );
}
```

## 🔐 Permisos

- **Admin**: Todas las operaciones (crear, editar, transferir, ver alertas)
- **Vendedor**: Puede transferir stock y ver alertas
- **Cajero**: Solo lectura
- **Cliente**: Sin acceso

## 📝 Validaciones Implementadas

1. **Transferencias**:
   - Stock suficiente en origen
   - Sucursal origen ≠ sucursal destino
   - Cantidad > 0
   - Sucursal destino debe existir

2. **Alertas**:
   - No duplicar alertas pendientes para el mismo producto/sucursal
   - Actualizar alerta existente si cambia el stock

3. **Productos**:
   - Stock total = suma de todas las sucursales
   - Stock por sucursal no puede ser negativo

## 🐛 Troubleshooting

### Error: "Sucursal origen no encontrada"
- Asegúrate de que los productos tienen `stockPorSucursal` inicializado
- Ejecuta el script de migración

### Error: "Stock insuficiente"
- Verifica que la sucursal origen tenga stock suficiente
- Revisa el campo `cantidad` en `stockPorSucursal`

### Las alertas no se crean
- Verifica que el endpoint `/api/stock-alerts` esté accesible
- Revisa los logs del servidor para errores
- Asegúrate de que el modelo `StockAlert` esté importado correctamente

## 📚 Archivos Modificados/Creados

### Modelos:
- ✅ `src/models/Product.ts` - Agregado `stockPorSucursal`
- ✅ `src/models/StockAlert.ts` - Nuevo modelo

### APIs:
- ✅ `src/app/api/products/transfer/route.ts` - Transferencias
- ✅ `src/app/api/stock-alerts/route.ts` - Gestión de alertas

### Componentes:
- ✅ `src/components/admin/ProductsManager.tsx` - Actualizado
- ✅ `src/components/admin/StockAlerts.tsx` - Nuevo componente

### Documentación:
- ✅ `INVENTARIO_MULTISUCURSAL.md` - Este archivo

## 🎯 Próximos Pasos Recomendados

1. Ejecutar script de migración para productos existentes
2. Crear sucursal "Central" si no existe
3. Integrar `StockAlerts` en el dashboard admin
4. Configurar notificaciones por email (opcional)
5. Crear reportes de movimientos de stock (opcional)

## 💡 Tips

- Mantén siempre una "Sucursal Central" como punto de entrada
- Revisa las alertas diariamente
- Configura stock mínimos realistas por sucursal
- Usa las etiquetas del producto para mejor organización
- Las imágenes se suben a Cloudinary automáticamente
