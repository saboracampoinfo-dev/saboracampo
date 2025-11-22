# 📷 Sistema de Escaneo de Códigos de Barras

## 🎯 Descripción General

Se ha implementado un sistema completo de escaneo de códigos de barras que permite **tres métodos diferentes** para agregar productos a las órdenes:

1. **Lector físico de códigos de barras** (USB o Bluetooth)
2. **Entrada manual** (teclado)
3. **Cámara web** (nuevo!)

## 🆕 Componente BarcodeScanner

Se creó un componente reutilizable en `src/components/BarcodeScanner.tsx` que:

- ✅ Detecta automáticamente las cámaras disponibles en el dispositivo
- ✅ Permite seleccionar entre múltiples cámaras (frontal/trasera)
- ✅ Escanea códigos de barras usando la cámara web
- ✅ Proporciona feedback visual y sonoro al escanear
- ✅ Incluye vibración en dispositivos móviles (si está disponible)
- ✅ Se integra perfectamente con el flujo existente

## 📦 Librerías Instaladas

```bash
npm install html5-qrcode
```

La librería `html5-qrcode` es muy potente y soporta:
- Códigos de barras (EAN-13, UPC-A, Code 128, etc.)
- Códigos QR
- Lectura desde cámara web
- Compatible con móviles y escritorio

## 🔧 Integración

### Componentes Actualizados

1. **CrearOrden.tsx** (vendedor)
   - Reemplazado input manual por componente BarcodeScanner
   - Mantiene toda la funcionalidad existente
   - Agrega botón "📷 Cámara" para activar el escaneo web

2. **EditarOrden.tsx** (vendedor)
   - Misma integración que CrearOrden
   - Permite escanear códigos durante la edición

## 💡 Cómo Usar

### Para Vendedores/Cajeros

#### Método 1: Lector Físico (Tradicional)
1. Conecta tu lector de códigos USB o Bluetooth
2. El cursor debe estar en el campo de entrada
3. Escanea el código de barras
4. El producto se agregará automáticamente

#### Método 2: Entrada Manual
1. Escribe el código de barras en el campo
2. Presiona "➕ Agregar" o Enter
3. El producto se agregará a la orden

#### Método 3: Cámara Web (Nuevo!)
1. Haz clic en el botón "📷 Cámara"
2. Acepta los permisos de la cámara cuando lo solicite el navegador
3. Apunta la cámara al código de barras
4. El producto se agregará automáticamente al detectarlo
5. Haz clic en "✕ Cerrar" para desactivar la cámara

## 🎨 Características del Scanner de Cámara

### Detección Automática de Cámaras
- Detecta todas las cámaras disponibles
- Prioriza cámara trasera en móviles (mejor para escanear)
- Permite cambiar de cámara si hay múltiples disponibles

### Experiencia de Usuario
- **Visual**: Muestra vista previa de la cámara en tiempo real
- **Sonido**: Reproduce un "beep" al escanear exitosamente
- **Vibración**: Vibra en dispositivos móviles compatibles
- **Indicadores**: Muestra mensaje "Apunta la cámara al código de barras"

### Configuración de Escaneo
```javascript
{
  fps: 10,                              // 10 fotogramas por segundo
  qrbox: { width: 250, height: 150 },  // Área de escaneo optimizada
  aspectRatio: 1.777778                // Ratio 16:9
}
```

## 🔒 Permisos Necesarios

### Navegador
El usuario debe **permitir el acceso a la cámara** cuando el navegador lo solicite. Esto es un requisito de seguridad estándar.

### HTTPS Requerido (Producción)
⚠️ **Importante**: En producción, el sitio debe usar HTTPS para que la cámara funcione. En desarrollo (localhost) funciona sin problemas.

## 📱 Compatibilidad

### Navegadores
- ✅ Chrome/Edge (Desktop y móvil)
- ✅ Firefox (Desktop y móvil)
- ✅ Safari (iOS 11+)
- ✅ Opera
- ⚠️ Internet Explorer (no soportado)

### Dispositivos
- ✅ PC/Laptop con webcam
- ✅ Smartphones (Android/iOS)
- ✅ Tablets
- ✅ Lectores USB/Bluetooth (funcionan como antes)

## 🐛 Solución de Problemas

### La cámara no se activa
1. Verifica que el navegador tenga permisos de cámara
2. Asegúrate de que no haya otra aplicación usando la cámara
3. Recarga la página e intenta de nuevo
4. En Chrome: ve a `chrome://settings/content/camera` y verifica permisos

### El escaneo es lento
1. Mejora la iluminación del código de barras
2. Mantén el código a 15-20cm de la cámara
3. Asegúrate de que el código esté enfocado y completo en el cuadro

### Error "Camera not found"
- Tu dispositivo no tiene cámara disponible
- Usa el método tradicional (lector físico o manual)

## 🚀 Ventajas del Nuevo Sistema

1. **Flexibilidad**: 3 métodos para escanear
2. **Movilidad**: No necesitas hardware adicional
3. **Costo**: No requiere comprar lectores físicos
4. **Facilidad**: Funciona en cualquier dispositivo con cámara
5. **Backup**: Si el lector se daña, aún puedes trabajar con la cámara

## 📊 Flujo de Trabajo Actualizado

```
VENDEDOR CREA ORDEN
    ↓
SELECCIONA MÉTODO DE ESCANEO
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│ Lector Físico   │ Entrada Manual   │ Cámara Web      │
├─────────────────┼──────────────────┼─────────────────┤
│ Escanea con     │ Escribe código   │ Click "📷"      │
│ lector USB/BT   │ y presiona ➕    │ Apunta cámara   │
│                 │                  │ Escanea auto    │
└─────────────────┴──────────────────┴─────────────────┘
    ↓
PRODUCTO SE AGREGA A LA ORDEN
    ↓
CONTINÚA AGREGANDO PRODUCTOS
    ↓
CIERRA ORDEN Y ENVÍA A CAJA
```

## 🎓 Capacitación de Personal

### Para Vendedores
1. Muéstrales el nuevo botón "📷 Cámara"
2. Explica que funciona igual que el lector tradicional
3. Enfatiza que es un método alternativo, no reemplaza el lector físico

### Tips para Mejor Escaneo
- Buena iluminación
- Código de barras limpio y sin arrugas
- Mantener distancia adecuada (15-20cm)
- Código completo dentro del área de escaneo

## 🔄 Compatibilidad con Sistema Existente

✅ **Totalmente compatible** - El nuevo sistema:
- No rompe ninguna funcionalidad existente
- Los lectores físicos siguen funcionando igual
- La entrada manual sigue disponible
- Todo el flujo de órdenes permanece igual
- Se puede usar cualquier combinación de métodos en la misma orden

## 📝 Código Técnico

### Uso del Componente

```tsx
import BarcodeScanner from '@/components/BarcodeScanner';

<BarcodeScanner 
  onScan={(codigo) => agregarProducto(codigo)} 
  disabled={procesando}
  placeholder="Escanea o escribe código de barras"
/>
```

### Props del Componente
- `onScan`: Función callback que recibe el código escaneado
- `disabled`: Deshabilita el scanner (opcional)
- `placeholder`: Texto placeholder del input (opcional)

## 🎉 Resultado Final

Ahora los vendedores y cajeros tienen **máxima flexibilidad** para agregar productos:
- En el mostrador → Lector físico
- De pie/moviéndose → Cámara del móvil/tablet
- Sin equipo → Entrada manual
- Backup → Siempre hay alternativas disponibles

---

**Implementado por**: GitHub Copilot  
**Fecha**: Noviembre 2025  
**Estado**: ✅ Completado y funcional
