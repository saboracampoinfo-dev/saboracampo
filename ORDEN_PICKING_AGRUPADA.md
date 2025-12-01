# Orden de Picking Agrupada - Transferencias de Stock

## 📋 Descripción

Nueva funcionalidad que permite seleccionar múltiples transferencias completadas del historial y generar una única orden de picking en PDF, organizada por sucursales para facilitar el trabajo del personal de almacén.

## ✨ Características

### 1. Selección de Transferencias
- ✅ Checkboxes en cada transferencia completada del historial
- ✅ Botón "Seleccionar Todas (Completadas)" - selecciona solo las transferencias completadas
- ✅ Botón "Deseleccionar Todas" - limpia la selección
- ✅ Contador de transferencias seleccionadas visible en el botón de impresión

### 2. Agrupación Inteligente
Las transferencias seleccionadas se agrupan automáticamente por pares de sucursales:
- **Sucursal Origen → Sucursal Destino**
- Todas las transferencias con el mismo origen y destino se consolidan en una sola sección
- Se combinan todos los productos de las transferencias agrupadas

### 3. PDF de Picking Profesional

#### Estructura del PDF:
```
ORDEN DE PICKING - TRANSFERENCIAS
==================================

INFORMACIÓN GENERAL
- Fecha de generación
- Generado por (usuario)
- Total de productos
- Total de unidades
- Número de rutas
- Transferencias agrupadas

SUCURSAL ORIGEN → SUCURSAL DESTINO
-----------------------------------
ORIGEN: [Nombre sucursal]
   [Dirección]

DESTINO: [Nombre sucursal]
   [Dirección]

✓ | Producto              | Cant. | Verificación
--|------------------------|-------|-------------
☐ | Producto 1            |   15  | ☐ ☐ ☐
☐ | Producto 2            |    8  | ☐ ☐ ☐
☐ | Producto 3            |   25  | ☐ ☐ ☐

Total productos: 3
Total unidades: 48

FIRMAS Y VERIFICACIÓN
---------------------
Preparado por:    Transportista:    Recibido por:
____________      ____________      ____________
   (Origen)         (Conductor)       (Destino)
```

## 🎯 Casos de Uso

### Ejemplo 1: Múltiples Transferencias a la Misma Sucursal
**Escenario:**
- Transferencia #1: Central → Chupito (5 productos)
- Transferencia #2: Central → Chupito (3 productos)
- Transferencia #3: Central → Heladería (4 productos)

**Resultado en PDF:**
```
RUTA 1: Central → Chupito
- Producto A (de transferencia #1)
- Producto B (de transferencia #1)
- Producto C (de transferencia #1)
- Producto D (de transferencia #1)
- Producto E (de transferencia #1)
- Producto F (de transferencia #2)
- Producto G (de transferencia #2)
- Producto H (de transferencia #2)

RUTA 2: Central → Heladería
- Producto I (de transferencia #3)
- Producto J (de transferencia #3)
- Producto K (de transferencia #3)
- Producto L (de transferencia #3)
```

### Ejemplo 2: Consolidación de Rutas
**Ventajas:**
- El personal de almacén recibe UNA sola orden en lugar de múltiples documentos
- Se reduce el tiempo de preparación
- Se evita confusión con documentos separados
- Optimización de rutas de entrega

## 🔧 Implementación Técnica

### Frontend (GestorTransferencias.tsx)

#### Estados:
```typescript
const [transferenciasSeleccionadas, setTransferenciasSeleccionadas] = useState<Set<string>>(new Set());
```

#### Funciones principales:
- `toggleSeleccionTransferencia(id)` - Alterna la selección de una transferencia
- `seleccionarTodas()` - Selecciona todas las completadas
- `deseleccionarTodas()` - Limpia la selección
- `generarPDFAgrupado()` - Genera el PDF con las transferencias agrupadas

#### Lógica de Agrupación:
```typescript
// Agrupar por sucursal origen -> destino
const key = `${sucursalOrigenId}-${sucursalDestinoId}`;
```

### Backend (API)

#### Endpoint: `/api/transferencias/pdf`
```typescript
POST /api/transferencias/pdf
Body: {
  transferencia: {
    notas: string,
    esAgrupada: true
  },
  grupos: [{
    sucursalOrigen: {...},
    sucursalDestino: {...},
    items: [...],
    transferenciasIds: [...]
  }],
  totalProductos: number,
  totalUnidades: number
}
```

#### PDFGenerator
Nuevo método: `generateTransferenciaAgrupada()`
- Genera encabezado con información general
- Itera por cada grupo de sucursales
- Crea tabla con checkboxes para picking
- Incluye sección de firmas por cada ruta

## 📱 Interfaz de Usuario

### Botones en el Historial:
1. **"✓ Seleccionar Todas (Completadas)"** (azul)
   - Solo selecciona transferencias completadas
   - Deshabilitado si no hay transferencias completadas

2. **"✗ Deseleccionar Todas"** (gris)
   - Limpia todas las selecciones
   - Deshabilitado si no hay selecciones

3. **"📄 Imprimir Seleccionadas (N)"** (morado)
   - Aparece solo cuando hay transferencias seleccionadas
   - Muestra el número de transferencias seleccionadas
   - Genera el PDF agrupado

### Checkboxes:
- Aparecen solo en transferencias completadas
- Color morado (accent-purple-600)
- Tooltip: "Seleccionar para impresión agrupada"
- Tamaño: 20x20px

## 🎨 Características del PDF

### Elementos Visuales:
- ✅ **Checkbox principal** por cada producto (para marcar cuando se prepara)
- ✅ **Tres checkboxes de verificación** (para triple control de calidad)
- ✅ **Separadores visuales** entre grupos de sucursales
- ✅ **Sección de firmas** por cada ruta
- ✅ **Totales** por grupo y general

### Ventajas del Diseño:
1. **Fácil de seguir**: Organización clara por rutas
2. **Control de calidad**: Triple verificación por producto
3. **Trazabilidad**: Firmas de todas las partes involucradas
4. **Profesional**: Formato limpio y estructurado

## 🚀 Flujo de Trabajo

### Para el Administrador:
1. Ir a **Transferencias de Stock** → **Historial**
2. Aplicar filtros si es necesario (fecha, sucursal, etc.)
3. Seleccionar las transferencias deseadas usando los checkboxes
4. Clic en **"📄 Imprimir Seleccionadas (N)"**
5. Se descarga automáticamente el PDF agrupado

### Para el Personal de Almacén:
1. Recibe la orden de picking impresa
2. Sigue cada ruta en orden
3. Marca cada producto preparado ☑
4. Usa los tres checkboxes para verificación
5. Firma al completar la preparación

### Para el Transportista:
1. Recibe los productos preparados
2. Verifica contra la orden
3. Firma y registra fecha/hora
4. Entrega en las sucursales destino

### Para el Receptor:
1. Recibe los productos
2. Verifica contra la orden
3. Firma y registra fecha/hora
4. Guarda la orden como comprobante

## 📊 Ventajas del Sistema

### Operativas:
- ✅ Reducción de tiempo de preparación
- ✅ Menos errores de picking
- ✅ Optimización de rutas
- ✅ Consolidación de documentos
- ✅ Control de calidad mejorado

### Administrativas:
- ✅ Mejor trazabilidad
- ✅ Documentación clara
- ✅ Facilita auditorías
- ✅ Ahorro de papel
- ✅ Proceso más profesional

## 🔍 Filtros Disponibles

La funcionalidad respeta todos los filtros del historial:
- Estado (solo completadas son seleccionables)
- Sucursal origen
- Sucursal destino
- Rango de fechas
- Búsqueda de producto

## 📝 Notas Importantes

1. **Solo transferencias completadas** pueden ser seleccionadas para impresión agrupada
2. Las transferencias **pendientes y canceladas** no tienen checkbox
3. El agrupamiento es **automático** por pares origen-destino
4. El PDF incluye **información de todas las transferencias** involucradas
5. Cada grupo tiene su **propia sección de firmas**

## 🆕 Diferencias con Otros Modos

| Característica | Individual | Masiva | Agrupada |
|----------------|-----------|--------|----------|
| Origen | Una transferencia existente | Múltiples productos nuevos | Múltiples transferencias existentes |
| Momento | Después de crear/aprobar | Al crear | Desde el historial |
| Agrupación | No aplica | Por sucursales | Por sucursales |
| Propósito | Comprobante individual | Orden única de creación | Orden consolidada de picking |
| Checkboxes | No | Sí | Sí (mejorados) |

## 🎯 Mejoras Futuras Sugeridas

- [ ] Agregar código de barras por ruta
- [ ] Incluir fotos de referencia de productos
- [ ] Generar QR para tracking
- [ ] Versión móvil para escaneo
- [ ] Integración con app de transportistas
- [ ] Estadísticas de tiempo de picking
- [ ] Alertas de productos faltantes

## 📚 Archivos Modificados

1. **`src/components/admin/GestorTransferencias.tsx`**
   - Agregado estado `transferenciasSeleccionadas`
   - Funciones de selección y agrupación
   - UI con checkboxes y botones
   - Función `generarPDFAgrupado()`

2. **`src/app/api/transferencias/pdf/route.ts`**
   - Soporte para modo `esAgrupada`
   - Detección y manejo de grupos
   - Llamada a `generateTransferenciaAgrupada()`

3. **`src/utils/pdfGenerator.ts`**
   - Nuevo método `generateTransferenciaAgrupada()`
   - Diseño optimizado para picking
   - Checkboxes de verificación
   - Secciones de firmas por ruta

## ✅ Testing Recomendado

1. Seleccionar 2-3 transferencias a la misma sucursal
2. Verificar que se agrupen correctamente en el PDF
3. Seleccionar transferencias a diferentes sucursales
4. Verificar que cada grupo tenga su sección
5. Probar con muchos productos (scroll y paginación)
6. Verificar que los checkboxes sean visibles e imprimibles

---

**Creado**: Diciembre 2025  
**Versión**: 1.0  
**Autor**: Sistema Sabor a Campo
