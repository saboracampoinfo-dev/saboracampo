# Órdenes de Transferencia en PDF

## 📋 Descripción

Sistema de generación automática de órdenes de transferencia en formato PDF para documentar y controlar el traslado de productos entre sucursales.

## ✨ Características

### Generación Automática
- Se genera automáticamente al confirmar transferencias masivas
- También disponible desde el historial de transferencias
- Un PDF por cada par de sucursales (origen-destino)

### Contenido del PDF

#### 1. Encabezado
- **Título**: "ORDEN DE TRANSFERENCIA DE STOCK"
- **Fecha de generación**: Fecha y hora actual
- **Información del generador**: Usuario que creó la orden

#### 2. Información de Sucursales
**Sucursal Origen:**
- Nombre
- Dirección (calle y ciudad)
- Teléfono

**Sucursal Destino:**
- Nombre
- Dirección (calle y ciudad)
- Teléfono

#### 3. Resumen de Transferencia
- Total de productos
- Total de unidades
- Notas adicionales (si existen)

#### 4. Tabla de Productos
Columnas:
- **N°**: Número correlativo
- **Producto**: Nombre del producto
- **Cantidad**: Unidades a transferir
- **Stock Origen**: Stock resultante en origen después de la transferencia
- **Stock Destino**: Stock resultante en destino después de la transferencia

#### 5. Controles de Proceso (Página 2)

Tres checkboxes con descripciones:

**✅ 1. VERIFICACIÓN DE STOCK EN ORIGEN**
- Se verificó que todos los productos y cantidades están disponibles en la sucursal de origen

**✅ 2. CARGA EN TRANSPORTE**
- Todos los productos fueron cargados correctamente en el vehículo de transporte

**✅ 3. DESCARGA EN DESTINO**
- Los productos fueron descargados y verificados en la sucursal de destino

#### 6. Firmas y Autorizaciones

**Tres espacios de firma:**
1. **Preparado por** (Sucursal Origen)
   - Línea de firma
   - Campos de fecha y hora

2. **Transportista** (Conductor)
   - Línea de firma
   - Campos de fecha y hora

3. **Recibido por** (Sucursal Destino)
   - Línea de firma
   - Campos de fecha y hora

## 🚀 Uso

### Desde Transferencias Masivas

1. Ir a **Transferencias de Stock** > **Transferencias Masivas**
2. Seleccionar productos y configurar transferencias
3. Hacer clic en **💾 Guardar Todas las Transferencias**
4. Confirmar la operación
5. El PDF se descargará automáticamente

### Desde Historial

1. Ir a **Transferencias de Stock** > **Historial**
2. Buscar la transferencia deseada
3. Hacer clic en el botón **📄 PDF** de la transferencia
4. El PDF se descargará

## 📄 Formato del Archivo

- **Formato**: PDF (A4)
- **Nombre**: `orden_transferencia_[origen]_[destino]_[timestamp].pdf`
- **Nombre (historial)**: `orden_transferencia_[id].pdf`
- **Páginas**: 2 páginas
  - Página 1: Información y tabla de productos
  - Página 2: Checkboxes de control y firmas

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos
- `src/app/api/transferencias/pdf/route.ts` - API endpoint para generar PDFs

### Archivos Modificados
- `src/utils/pdfGenerator.ts` - Agregado método `generateTransferenciaOrden()`
- `src/components/admin/GestorTransferencias.tsx` - Integración de generación de PDFs

## 🎯 Flujo de Proceso

```
┌─────────────────────────────────────┐
│   Usuario configura transferencias  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Confirma y guarda transferencias │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Se ejecutan las transferencias    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Se agrupan por par de sucursales   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Se genera un PDF por cada grupo   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      PDF se descarga al usuario     │
└─────────────────────────────────────┘
```

## ✅ Beneficios

1. **Trazabilidad**: Documento físico del movimiento de stock
2. **Control**: Tres puntos de verificación durante el proceso
3. **Responsabilidad**: Firmas de las personas involucradas
4. **Legal**: Documento oficial de transferencia
5. **Auditoría**: Registro permanente del traslado
6. **Gestión**: Facilita el seguimiento del transporte

## 📝 Ejemplo de Uso

### Escenario: Transferencia de productos de "Sucursal Centro" a "Sucursal Norte"

1. **Preparación** (Sucursal Centro):
   - El encargado imprime la orden de transferencia
   - Verifica físicamente cada producto y marca el checkbox 1
   - Firma en "Preparado por"

2. **Transporte**:
   - Los productos se cargan en el vehículo
   - El transportista verifica y marca el checkbox 2
   - Firma en "Transportista"

3. **Recepción** (Sucursal Norte):
   - Se descargan los productos
   - El encargado verifica cantidades y marca el checkbox 3
   - Firma en "Recibido por"

4. **Archivo**:
   - El documento firmado se archiva para auditorías futuras

## 🔐 Seguridad

- Requiere autenticación para generar PDFs
- Solo usuarios con rol `admin` o `vendedor` pueden generar órdenes
- Los datos se validan antes de generar el PDF

## 🐛 Solución de Problemas

### El PDF no se descarga
- Verificar que el navegador permite descargas automáticas
- Revisar la consola del navegador para errores
- Verificar que la sesión no haya expirado

### Faltan datos en el PDF
- Verificar que las sucursales tienen direcciones completas
- Asegurarse de que los productos tienen nombres válidos

### Error al generar
- Revisar logs del servidor
- Verificar que PDFKit está instalado correctamente
- Confirmar que hay datos válidos para generar

## 📦 Dependencias

- `pdfkit`: Generación de PDFs
- `@types/pdfkit`: Tipos TypeScript para PDFKit

## 🔄 Futuras Mejoras

- [ ] Agregar código QR con ID de transferencia
- [ ] Incluir fotos de los productos
- [ ] Opción de enviar por email automáticamente
- [ ] Integración con sistema de transporte
- [ ] Notificaciones automáticas al completar cada paso
- [ ] Firma digital electrónica
