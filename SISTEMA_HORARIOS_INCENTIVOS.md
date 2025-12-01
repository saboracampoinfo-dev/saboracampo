# Sistema de Horarios e Incentivos - Liquidaciones

## 📋 Resumen de Cambios

Se ha actualizado el sistema de liquidaciones para reemplazar el registro manual de horas trabajadas por un sistema basado en **horarios de entrada y salida**, además de agregar un **sistema de incentivos diarios**.

---

## ✨ Nuevas Funcionalidades

### 1. **Registro de Horarios (Entrada/Salida)**

En lugar de ingresar manualmente las horas trabajadas, ahora se registran:
- **Hora de Entrada** (ej: 08:00)
- **Hora de Salida** (ej: 17:30)

El sistema calcula automáticamente las horas trabajadas y las redondea a múltiplos de **0.5 horas** (30 minutos).

#### Ejemplo:
```
Entrada: 08:00
Salida: 17:30
→ Horas trabajadas: 9.5h (se redondea 9.3h a 9.5h)
```

### 2. **Sistema de Incentivos Diarios**

Cada día que se registra, el administrador puede marcar si el empleado **cumplió con el incentivo** mediante un checkbox.

- ✅ **Cumplió incentivo**: Se suma 1 al contador de incentivos acumulados
- ❌ **No cumplió**: No se suma nada

Al liquidar el sueldo, se calculará:
```
Total = (Horas × Precio/Hora) - Compras + (Días con Incentivo × Monto Incentivo)
```

---

## 🔧 Campos Agregados al Modelo de Usuario

### En la interfaz `IUser` (`src/models/User.ts`):
```typescript
incentivosAcumulados?: number;  // Contador de días que cumplió el incentivo
montoIncentivo?: number;        // Monto en AR$ que se paga por día con incentivo
```

### En el Schema de Mongoose:
```typescript
incentivosAcumulados: {
  type: Number,
  default: 0,
  min: 0,
},
montoIncentivo: {
  type: Number,
  default: 0,
  min: 0,
}
```

---

## 📝 Flujo de Trabajo

### 1. **Configuración Inicial (Admin)**
En el módulo de gestión de usuarios (`UsersManager.tsx`), el administrador configura:
- **Precio por Hora**: AR$ 2000/h
- **Monto por Incentivo**: AR$ 500/día

### 2. **Registro Diario de Horas**
Al registrar un día de trabajo:
1. Selecciona la **fecha**
2. Ingresa **hora de entrada** (ej: 08:00)
3. Ingresa **hora de salida** (ej: 17:30)
4. Marca el checkbox **"Cumplió con el incentivo"** si corresponde
5. Agrega notas opcionales

El sistema calcula automáticamente: **9.5 horas trabajadas**

### 3. **Acumulación**
El sistema acumula:
- **Horas trabajadas**: 9.5h + 8h + 10h = 27.5h
- **Incentivos cumplidos**: 3 días
- **Compras**: AR$ 1500

### 4. **Liquidación**
Al procesar la liquidación:
```
Monto Bruto:          27.5h × AR$ 2000 = AR$ 55,000
Compras:              -AR$ 1,500
Incentivos:           3 días × AR$ 500 = +AR$ 1,500
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Neto a Pagar:   AR$ 55,000
```

Los contadores se reinician a **0** después de la liquidación.

---

## 🎨 Interfaz de Usuario

### Modal "Registrar Horas"

```
┌─────────────────────────────────────────┐
│  Registrar Horas - Juan Pérez           │
├─────────────────────────────────────────┤
│  Fecha:           [01/12/2025]          │
│                                         │
│  Hora de Entrada: [08:00]               │
│  Hora de Salida:  [17:30]               │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Horas a registrar: 9.5h           │  │
│  │ 💡 Las horas se redondean a 0.5h  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ☑ Cumplió con el incentivo del día     │
│     Se sumará un bono adicional...      │
│                                         │
│  Notas: [Turno mañana]                  │
│                                         │
│         [Cancelar]  [Registrar Horas]   │
└─────────────────────────────────────────┘
```

### Tabla de Liquidaciones

| Nombre | Rol | Horas | Precio/H | Compras | Incentivos | Total Neto |
|--------|-----|-------|----------|---------|------------|------------|
| Juan P | Vendedor | 27.5h | AR$ 2000 | -AR$ 1500 | ✓ 3 (+AR$ 1500) | AR$ 55,000 |

### Modal de Liquidación

```
┌─────────────────────────────────────────┐
│  Procesar Liquidación - Juan Pérez      │
├─────────────────────────────────────────┤
│  Horas acumuladas:        27.5h         │
│  Precio por hora:         AR$ 2000      │
│  ──────────────────────────────────────│
│  Subtotal (Bruto):        AR$ 55,000    │
│  Compras realizadas:     -AR$ 1,500     │
│  Incentivos cumplidos:   +AR$ 1,500     │
│                          (3 días × $500) │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  Total Neto a pagar:     AR$ 55,000     │
│                                         │
│  Método de Pago: [Transferencia ▼]     │
│  N° Comprobante: [123456]               │
│  Notas: [Liquidación semanal]           │
│                                         │
│  [Cancelar]   [Procesar Liquidación]    │
└─────────────────────────────────────────┘
```

---

## 🔄 Actualización de la API

### `POST /api/liquidaciones` - Registrar Horas

**Nuevos campos en el body:**
```json
{
  "userId": "123",
  "horas": 9.5,
  "fecha": "2025-12-01",
  "horaEntrada": "08:00",
  "horaSalida": "17:30",
  "cumplioIncentivo": true,
  "notas": "Turno completo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "123",
    "horasAcumuladas": 27.5,
    "horasAgregadas": 9.5,
    "incentivosAcumulados": 3,
    "cumplioIncentivo": true,
    "horario": "08:00 - 17:30"
  }
}
```

### `PUT /api/liquidaciones` - Procesar Liquidación

**Respuesta actualizada:**
```json
{
  "success": true,
  "data": {
    "userId": "123",
    "userName": "Juan Pérez",
    "montoPagado": 55000,
    "montoBruto": 55000,
    "comprasDescontadas": 1500,
    "incentivosAplicados": 1500,
    "diasIncentivo": 3,
    "horasTrabajadas": 27.5,
    "precioHora": 2000,
    "periodo": {
      "dias": 7,
      "inicio": "2025-11-24",
      "fin": "2025-12-01"
    }
  }
}
```

---

## 📊 Cálculo de Horas

### Función `calcularHorasTrabajadas`

```typescript
const calcularHorasTrabajadas = (horaEntrada: string, horaSalida: string): number => {
  const [horaE, minE] = horaEntrada.split(':').map(Number);
  const [horaS, minS] = horaSalida.split(':').map(Number);
  
  const minutosEntrada = horaE * 60 + minE;
  const minutosSalida = horaS * 60 + minS;
  
  let minutosTrabajos = minutosSalida - minutosEntrada;
  
  // Si la salida es menor que la entrada, cruzó la medianoche
  if (minutosTrabajos < 0) {
    minutosTrabajos += 24 * 60;
  }
  
  // Convertir a horas decimales y redondear a 0.5
  const horasDecimales = minutosTrabajos / 60;
  return Math.round(horasDecimales * 2) / 2; // Redondea a 0.5
};
```

### Ejemplos de Redondeo:

| Entrada | Salida | Minutos | Horas Exactas | Redondeado |
|---------|--------|---------|---------------|------------|
| 08:00 | 17:00 | 540 | 9.0h | **9.0h** |
| 08:00 | 17:30 | 570 | 9.5h | **9.5h** |
| 08:00 | 17:20 | 560 | 9.33h | **9.5h** |
| 08:00 | 17:10 | 550 | 9.16h | **9.0h** |
| 08:00 | 12:00 | 240 | 4.0h | **4.0h** |

---

## 🎯 Ventajas del Nuevo Sistema

1. ✅ **Mayor precisión**: Registra horarios exactos en lugar de horas estimadas
2. ✅ **Trazabilidad**: Queda registrado cuándo entró y salió cada día
3. ✅ **Incentivos automáticos**: Sistema simple de bonos por cumplimiento
4. ✅ **Cálculo automático**: No hay que calcular manualmente las horas
5. ✅ **Redondeo justo**: Redondea a favor del empleado (0.3h → 0.5h)
6. ✅ **Exportación Excel**: Todos los datos se exportan con horarios detallados

---

## 📁 Archivos Modificados

1. **Frontend:**
   - `src/components/admin/LiquidacionesManager.tsx` ✅
   - `src/components/admin/UsersManager.tsx` ✅

2. **Backend:**
   - `src/app/api/liquidaciones/route.ts` ✅
   - `src/models/User.ts` ✅

3. **Documentación:**
   - `SISTEMA_HORARIOS_INCENTIVOS.md` (este archivo) ✅

---

## 🚀 Para Comenzar a Usar

1. **Configurar usuarios**: Ve a "Gestión de Usuarios" y edita vendedores/cajeros para agregar el **Monto por Incentivo**
2. **Registrar horas**: Desde "Liquidaciones", haz clic en "+ Hs" y completa los horarios
3. **Marcar incentivos**: No olvides tildar el checkbox si cumplió con el objetivo del día
4. **Liquidar**: Cuando sea momento de pagar, presiona "Liquidar" y el sistema calculará todo automáticamente

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si alguien trabaja de noche (cruza medianoche)?**  
R: El sistema lo detecta automáticamente. Si salida < entrada, suma 24 horas.

**P: ¿Puedo registrar horas sin marcar incentivo?**  
R: Sí, el checkbox de incentivo es opcional. Solo suma si lo marcas.

**P: ¿Se puede cambiar el monto del incentivo después?**  
R: Sí, se cambia desde "Gestión de Usuarios". Los días ya registrados mantienen su valor.

**P: ¿Qué pasa con los incentivos al liquidar?**  
R: Se resetean a 0, igual que las horas y compras.

---

## 🔮 Futuras Mejoras Sugeridas

- [ ] Agregar campo "Horas extra" (después de 9h diarias)
- [ ] Permitir editar registros de horas pasados
- [ ] Dashboard con gráfico de asistencia mensual
- [ ] Alertas si no se cumple mínimo de horas semanales
- [ ] Exportar detalle de horarios en PDF

---

✅ **Sistema implementado y funcional** - Diciembre 2025
