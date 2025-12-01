# 📦 Órdenes de Transferencia - Funcionamiento

## 🎯 Concepto Principal

### Una Orden = Un Momento de Salida

Cuando realizas transferencias masivas, **todas salen al mismo tiempo**, por lo tanto se genera **UNA ÚNICA orden de transferencia** que documenta todo lo que sale en ese momento.

## 📋 Dos Tipos de PDF

### 1️⃣ Orden Masiva (Transferencias en Lote)

**¿Cuándo?** Al guardar múltiples transferencias juntas

**¿Qué genera?** 
- **1 PDF único** con todas las transferencias
- Agrupadas por "rutas" (pares de sucursales)
- Representa un solo momento de salida

**Ejemplo práctico:**
```
Haces transferencias de:
✓ 5 productos: Centro → Norte
✓ 3 productos: Centro → Sur  
✓ 2 productos: Norte → Este

Resultado: 1 PDF con 3 rutas (todo sale junto)
```

**Nombre del archivo:** `orden_transferencia_masiva_[timestamp].pdf`

---

### 2️⃣ Orden Individual (Historial)

**¿Cuándo?** Al descargar PDF desde el historial

**¿Qué genera?**
- **1 PDF** de esa transferencia específica
- Solo una ruta (origen → destino)
- Registro histórico individual

**Ejemplo práctico:**
```
Buscas una transferencia antigua del 15/11/2025
✓ Click en "📄 PDF"

Resultado: 1 PDF con esa transferencia
```

**Nombre del archivo:** `orden_transferencia_[timestamp].pdf`

---

## 🚛 Analogía del Camión

Piensa en la orden masiva como un camión que sale en un viaje:

```
🚛 CAMIÓN DE TRANSFERENCIAS
   ├─ PARADA 1: Centro → Norte (5 cajas)
   ├─ PARADA 2: Centro → Sur (3 cajas)
   └─ PARADA 3: Norte → Este (2 cajas)

   📄 = 1 sola orden de transferencia
```

El camión hace varias paradas, pero es **un solo viaje** = **una sola orden**.

---

## 📊 Estructura del PDF Masivo

```
╔══════════════════════════════════════════════╗
║   ORDEN DE TRANSFERENCIA MASIVA              ║
╠══════════════════════════════════════════════╣
║                                              ║
║ 📊 INFORMACIÓN GENERAL                       ║
║   • Total productos: 10                      ║
║   • Total unidades: 250                      ║
║   • Número de rutas: 3                       ║
║                                              ║
╠══════════════════════════════════════════════╣
║                                              ║
║ 🛣️ RUTA 1: Centro → Norte                   ║
║   ┌────────────────┬──────┐                 ║
║   │ Producto       │ Cant │                 ║
║   ├────────────────┼──────┤                 ║
║   │ Manzanas       │ 50   │                 ║
║   │ Peras          │ 30   │                 ║
║   └────────────────┴──────┘                 ║
║                                              ║
╠══════════════════════════════════════════════╣
║                                              ║
║ 🛣️ RUTA 2: Centro → Sur                     ║
║   ┌────────────────┬──────┐                 ║
║   │ Producto       │ Cant │                 ║
║   ├────────────────┼──────┤                 ║
║   │ Naranjas       │ 40   │                 ║
║   │ Bananas        │ 20   │                 ║
║   └────────────────┴──────┘                 ║
║                                              ║
╠══════════════════════════════════════════════╣
║                                              ║
║ 🛣️ RUTA 3: Norte → Este                     ║
║   ┌────────────────┬──────┐                 ║
║   │ Producto       │ Cant │                 ║
║   ├────────────────┼──────┤                 ║
║   │ Uvas           │ 10   │                 ║
║   └────────────────┴──────┘                 ║
║                                              ║
╠══════════════════════════════════════════════╣
║                                              ║
║ ✅ CHECKBOXES DE CONTROL                     ║
║   ☐ Verificación stock                      ║
║   ☐ Carga en transporte                     ║
║   ☐ Descarga en destino                     ║
║                                              ║
║ ✍️ FIRMAS                                    ║
║   _________  _________  _________           ║
║   Preparado  Transport  Recibido            ║
║                                              ║
╚══════════════════════════════════════════════╝
```

---

## ✨ Ventajas del Sistema

### Para Transferencias Masivas:
✅ **Un solo documento** para todo el proceso  
✅ **Trazabilidad completa** de un envío  
✅ **Fácil de seguir** para el transportista  
✅ **Control unificado** con checkboxes  
✅ **Firma única** para todo el lote  

### Para Historial:
✅ **Registro individual** de cada transferencia  
✅ **Reimpresión** cuando se necesite  
✅ **Auditoría específica** por operación  

---

## 🔄 Flujo de Uso

### Modo Masivo (Normal):
```
1. Seleccionas 10 productos
2. Configuras transferencias
3. Click en "Guardar Todas"
4. ✅ Se descarga 1 PDF con todo
```

### Modo Historial:
```
1. Vas a "Historial"
2. Encuentras una transferencia
3. Click en "📄 PDF"
4. ✅ Se descarga PDF de esa transferencia
```

---

## 🎯 Resumen Rápido

| Característica | Masivo | Historial |
|----------------|--------|-----------|
| **Cantidad de PDFs** | 1 | 1 |
| **Contenido** | Todas las rutas | Una transferencia |
| **Momento** | Al guardar | Al descargar |
| **Propósito** | Control de envío | Auditoría/Reimpresión |
| **Checkboxes** | Para todo el lote | Para transferencia específica |
| **Firmas** | Una vez para todo | Una vez para esa operación |

---

## 💡 Caso de Uso Real

**Escenario:** Lunes 8 AM - Reposición de sucursales

1. **Preparación:**
   - El gerente revisa stocks
   - Identifica necesidades de 3 sucursales
   - Carga 15 productos en el sistema

2. **Ejecución:**
   - Hace clic en "Guardar Todas"
   - Se genera 1 PDF con las 3 rutas
   - Imprime la orden

3. **Transporte:**
   - El chofer recibe la orden única
   - Verifica stock (✓ checkbox 1)
   - Carga todo en el camión (✓ checkbox 2)
   - Visita las 3 sucursales en orden
   - Cada sucursal recibe y verifica (✓ checkbox 3)
   - Firma final del proceso

4. **Archivo:**
   - La orden firmada se archiva
   - Queda como respaldo en historial
   - Se puede reimprimir si es necesario

---

## ✅ Conclusión

**Una salida = Una orden**

No importa cuántos destinos tenga, si todos los productos salen juntos en el mismo momento, se documenta en **una única orden de transferencia masiva** para mantener el control y la trazabilidad del proceso completo.
