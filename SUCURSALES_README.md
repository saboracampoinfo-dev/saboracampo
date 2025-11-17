# Modelo de Sucursales - Sabor a Campo

## Descripción
Modelo completo para gestionar las sucursales de Sabor a Campo, incluyendo ubicación, horarios, contacto, imágenes y más.

## Estructura del Modelo

### Campos Principales

#### 1. **Información Básica**
- `nombre` (String, requerido): Nombre de la sucursal
- `descripcion` (String, opcional): Descripción de la sucursal
- `estado` (Enum): Estado operativo
  - `activa`: Sucursal operando normalmente
  - `inactiva`: Sucursal cerrada temporalmente
  - `mantenimiento`: Sucursal en mantenimiento

#### 2. **Dirección**
```typescript
direccion: {
  calle: String (requerido)
  numero: String (requerido)
  ciudad: String (requerido)
  provincia: String (requerido)
  codigoPostal: String (requerido)
  coordenadas?: {
    latitud: Number (-90 a 90)
    longitud: Number (-180 a 180)
  }
}
```

#### 3. **Contacto**
```typescript
contacto: {
  telefono: String (requerido)
  telefonoAlternativo?: String
  email: String (requerido, validado)
  whatsapp?: String
}
```

#### 4. **Horarios**
```typescript
horarios: {
  semanal: {
    lunes: { apertura: String, cierre: String, cerrado?: Boolean }
    martes: { apertura: String, cierre: String, cerrado?: Boolean }
    miercoles: { apertura: String, cierre: String, cerrado?: Boolean }
    jueves: { apertura: String, cierre: String, cerrado?: Boolean }
    viernes: { apertura: String, cierre: String, cerrado?: Boolean }
  }
  finDeSemana: {
    sabado: { apertura: String, cierre: String, cerrado?: Boolean }
    domingo: { apertura: String, cierre: String, cerrado?: Boolean }
  }
  observaciones?: String
}
```
- Formato de hora: "HH:MM" (24 horas)
- Ejemplo: "08:00", "20:30"

#### 5. **Imágenes**
```typescript
imagenes: {
  principal: String (requerido, URL de Cloudinary)
  galeria: String[] (máximo 10 imágenes)
}
```

#### 6. **Información Adicional**
- `capacidad` (Number, opcional): Capacidad de personas
- `servicios` (Array, opcional): Lista de servicios disponibles
  - Ejemplos: "estacionamiento", "wifi", "delivery", "pago con tarjeta", etc.

#### 7. **Encargado**
```typescript
encargado?: {
  nombre: String
  telefono: String
  email: String
}
```

#### 8. **Timestamps**
- `createdAt`: Fecha de creación (automático)
- `updatedAt`: Fecha de última actualización (automático)

## API Endpoints

### GET /api/sucursales
Obtener todas las sucursales con filtros opcionales

**Query Parameters:**
- `estado`: Filtrar por estado (activa, inactiva, mantenimiento)
- `ciudad`: Filtrar por ciudad (búsqueda insensible a mayúsculas)

**Ejemplo:**
```bash
GET /api/sucursales?estado=activa&ciudad=Buenos Aires
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "total": 3
}
```

### POST /api/sucursales
Crear una nueva sucursal

**Body:** Ver ejemplo en `sucursalesEjemplo.ts`

**Respuesta:**
```json
{
  "success": true,
  "message": "Sucursal creada exitosamente",
  "data": {...}
}
```

### GET /api/sucursales/[id]
Obtener una sucursal específica

**Respuesta:**
```json
{
  "success": true,
  "data": {...}
}
```

### PUT /api/sucursales/[id]
Actualizar una sucursal

**Body:** Campos a actualizar (puede ser parcial)

**Ejemplo:**
```json
{
  "estado": "mantenimiento",
  "horarios.observaciones": "Cerrado por remodelación hasta el 30/11"
}
```

### DELETE /api/sucursales/[id]
Eliminar una sucursal

**Respuesta:**
```json
{
  "success": true,
  "message": "Sucursal eliminada exitosamente",
  "data": {...}
}
```

## Métodos del Modelo

### `estaAbierta()`
Verifica si la sucursal está abierta en el momento actual

**Uso:**
```typescript
const sucursal = await Sucursal.findById(id);
const abierta = sucursal.estaAbierta(); // true o false
```

### `obtenerHorarioHoy()`
Obtiene el horario de apertura del día actual

**Uso:**
```typescript
const sucursal = await Sucursal.findById(id);
const horario = sucursal.obtenerHorarioHoy();
// { dia: 'Lunes', apertura: '08:00', cierre: '20:00', cerrado: false }
```

### Virtual: `direccionCompleta`
Retorna la dirección completa formateada

**Uso:**
```typescript
const sucursal = await Sucursal.findById(id);
console.log(sucursal.direccionCompleta);
// "Av. Principal 1234, Buenos Aires, Buenos Aires (C1000)"
```

## Índices
El modelo incluye índices para optimizar búsquedas:
- `nombre`: Búsqueda por nombre
- `direccion.ciudad`: Búsqueda por ciudad
- `estado`: Filtrado por estado
- `coordenadas`: Búsqueda geoespacial

## Validaciones

### Automáticas
- Email válido (formato)
- Coordenadas dentro de rangos válidos
- Máximo 10 imágenes en galería
- Longitud de texto (nombre, descripción, observaciones)
- Estado solo puede ser: activa, inactiva, mantenimiento

### Recomendadas
- Verificar URLs de Cloudinary antes de guardar
- Validar formato de teléfono según región
- Validar horarios (apertura < cierre)

## Ejemplo de Uso Completo

```typescript
import Sucursal from '@/models/Sucursal';
import connectDB from '@/lib/mongodb';

// Crear una sucursal
await connectDB();
const nuevaSucursal = await Sucursal.create({
  nombre: "Sabor a Campo Centro",
  direccion: {
    calle: "Av. Principal",
    numero: "1234",
    ciudad: "Buenos Aires",
    provincia: "Buenos Aires",
    codigoPostal: "C1000"
  },
  contacto: {
    telefono: "+54 11 1234-5678",
    email: "centro@saboracampo.com"
  },
  horarios: {
    semanal: {
      lunes: { apertura: "08:00", cierre: "20:00" },
      // ... resto de días
    },
    finDeSemana: {
      sabado: { apertura: "09:00", cierre: "20:00" },
      domingo: { apertura: "09:00", cierre: "14:00" }
    }
  },
  imagenes: {
    principal: "https://cloudinary.com/...",
    galeria: []
  }
});

// Verificar si está abierta
if (nuevaSucursal.estaAbierta()) {
  console.log("¡La sucursal está abierta!");
}

// Buscar sucursales activas en una ciudad
const sucursales = await Sucursal.find({
  estado: "activa",
  "direccion.ciudad": /Buenos Aires/i
});
```

## Integración con Componentes

Para integrar con la landing page, actualiza el componente `Locales.tsx` para obtener datos desde la API:

```typescript
'use client';
import { useEffect, useState } from 'react';

export default function Locales() {
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    fetch('/api/sucursales?estado=activa')
      .then(res => res.json())
      .then(data => setSucursales(data.data));
  }, []);

  // Renderizar sucursales...
}
```

## Archivos Relacionados

- `src/models/Sucursal.ts` - Modelo de Mongoose
- `src/app/api/sucursales/route.ts` - Endpoints GET y POST
- `src/app/api/sucursales/[id]/route.ts` - Endpoints GET, PUT, DELETE por ID
- `src/models/sucursalesEjemplo.ts` - Datos de ejemplo para testing
