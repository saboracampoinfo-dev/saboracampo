# Modelo de Configuración - Sabor a Campo

## Descripción
El modelo `Configuracion` permite gestionar toda la información de contacto, redes sociales, horarios y configuraciones generales de la empresa desde el panel de administración.

## Características Principales

### 1. Información General
- **Nombre de la empresa**
- **Descripción corta** (máx. 200 caracteres)
- **Descripción larga** (máx. 1000 caracteres)
- **Colores de la marca** (primario y secundario)

### 2. Información de Contacto
#### Correos Electrónicos
- `correoAdministracion` (requerido)
- `correoVentas` (requerido)
- `correoSoporte` (opcional)
- `correoContacto` (opcional)

#### Teléfonos
- `telefonoAdministracion` (requerido)
- `telefonoVentas` (requerido)
- `telefonoSoporte` (opcional)
- `telefonoWhatsApp` (opcional)

#### Dirección Física
- Calle
- Ciudad
- Estado
- Código Postal
- País (default: México)

### 3. Redes Sociales
- Facebook
- Instagram
- Twitter / X
- LinkedIn
- YouTube
- TikTok

### 4. Horarios de Atención
Horarios configurables para cada día de la semana:
- Lunes a Viernes: 9:00 AM - 6:00 PM (default)
- Sábado: 10:00 AM - 2:00 PM (default)
- Domingo: Cerrado (default)

### 5. Configuración del Sitio
- URL del logo
- URL del favicon
- Color primario (default: #10b981)
- Color secundario (default: #059669)

### 6. Políticas y Documentos
- Términos y Condiciones (URL)
- Política de Privacidad (URL)
- Política de Devolución (URL)

### 7. Configuración de Notificaciones
- Email activado (default: true)
- SMS activado (default: false)
- WhatsApp activado (default: false)

## API Endpoints

### `GET /api/configuracion`
Obtiene la configuración activa (acceso público).

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "nombreEmpresa": "Sabor a Campo",
    "correoAdministracion": "admin@saboracampo.com",
    "correoVentas": "ventas@saboracampo.com",
    "telefonoAdministracion": "+52 123 456 7890",
    "telefonoVentas": "+52 123 456 7891",
    "redesSociales": {
      "facebook": "https://facebook.com/saboracampo",
      "instagram": "https://instagram.com/saboracampo"
    },
    "horarioAtencion": {
      "lunes": "9:00 AM - 6:00 PM",
      "martes": "9:00 AM - 6:00 PM"
    },
    "activo": true
  }
}
```

### `PUT /api/configuracion`
Actualiza la configuración activa (solo administradores).

**Headers requeridos:**
```
Cookie: token=<jwt-token>
```

**Body:**
```json
{
  "nombreEmpresa": "Sabor a Campo",
  "correoAdministracion": "admin@saboracampo.com",
  "correoVentas": "ventas@saboracampo.com",
  "telefonoAdministracion": "+52 123 456 7890",
  "telefonoVentas": "+52 123 456 7891",
  "redesSociales": {
    "facebook": "https://facebook.com/saboracampo",
    "instagram": "https://instagram.com/saboracampo"
  }
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Configuración actualizada correctamente",
  "data": { /* configuración actualizada */ }
}
```

### `POST /api/configuracion`
Crea una nueva configuración (solo administradores). Al crear una nueva configuración, automáticamente se desactivan las demás.

## Uso del Componente

### En el Dashboard de Administración
```tsx
import ConfiguracionManager from '@/components/admin/ConfiguracionManager';

export default function AdminDashboard() {
  return (
    <div>
      <ConfiguracionManager />
    </div>
  );
}
```

### Obtener Configuración en Cualquier Componente
```tsx
'use client';

import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/configuracion')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
        }
      });
  }, []);

  if (!config) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{config.nombreEmpresa}</h1>
      <p>{config.descripcionCorta}</p>
      <a href={`mailto:${config.correoVentas}`}>Contacto</a>
      <a href={config.redesSociales.facebook}>Facebook</a>
    </div>
  );
}
```

### Uso en Server Components (Next.js)
```tsx
async function getConfiguracion() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/configuracion`, {
    cache: 'no-store' // o 'force-cache' según necesites
  });
  const data = await res.json();
  return data.data;
}

export default async function Page() {
  const config = await getConfiguracion();

  return (
    <div>
      <h1>{config.nombreEmpresa}</h1>
      <p>Email: {config.correoVentas}</p>
    </div>
  );
}
```

## Validaciones

### Campos Requeridos
- `nombreEmpresa`
- `correoAdministracion` (formato email válido)
- `correoVentas` (formato email válido)
- `telefonoAdministracion`
- `telefonoVentas`

### Formato de Emails
Todos los campos de email son validados con regex:
```regex
/^\S+@\S+\.\S+$/
```

### Longitud Máxima
- `descripcionCorta`: 200 caracteres
- `descripcionLarga`: 1000 caracteres

## Comportamiento Especial

### Configuración Única Activa
Solo puede existir una configuración activa a la vez. Al crear o activar una configuración, todas las demás se desactivan automáticamente mediante un hook `pre-save`.

### Configuración por Defecto
Si no existe ninguna configuración en la base de datos, se crea automáticamente una configuración por defecto con valores iniciales al hacer la primera petición GET.

## Modelo de Datos

```typescript
interface IConfiguracion {
  nombreEmpresa: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  correoAdministracion: string;
  correoVentas: string;
  correoSoporte?: string;
  correoContacto?: string;
  telefonoAdministracion: string;
  telefonoVentas: string;
  telefonoSoporte?: string;
  telefonoWhatsApp?: string;
  redesSociales: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  direccion?: {
    calle?: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    pais?: string;
  };
  horarioAtencion?: {
    lunes?: string;
    martes?: string;
    miercoles?: string;
    jueves?: string;
    viernes?: string;
    sabado?: string;
    domingo?: string;
  };
  logoUrl?: string;
  faviconUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  terminosCondiciones?: string;
  politicaPrivacidad?: string;
  politicaDevolucion?: string;
  notificaciones: {
    emailActivo: boolean;
    smsActivo: boolean;
    whatsappActivo: boolean;
  };
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integración con Footer

Puedes usar la configuración para mostrar información de contacto en el footer:

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/configuracion')
      .then(res => res.json())
      .then(data => setConfig(data.data));
  }, []);

  if (!config) return null;

  return (
    <footer>
      <div>
        <h3>Contacto</h3>
        <p>Email: {config.correoContacto || config.correoVentas}</p>
        <p>Teléfono: {config.telefonoVentas}</p>
        <p>WhatsApp: {config.telefonoWhatsApp}</p>
      </div>
      
      <div>
        <h3>Síguenos</h3>
        {config.redesSociales.facebook && (
          <a href={config.redesSociales.facebook}>Facebook</a>
        )}
        {config.redesSociales.instagram && (
          <a href={config.redesSociales.instagram}>Instagram</a>
        )}
      </div>
      
      <div>
        <h3>Horarios</h3>
        <p>Lunes a Viernes: {config.horarioAtencion.lunes}</p>
        <p>Sábado: {config.horarioAtencion.sabado}</p>
        <p>Domingo: {config.horarioAtencion.domingo}</p>
      </div>
    </footer>
  );
}
```

## Seguridad

- Solo los administradores pueden actualizar o crear configuraciones
- La lectura de configuración es pública para mostrar información de contacto
- Los tokens JWT son verificados en las operaciones de escritura
- Las cookies httpOnly protegen el token de acceso

## Notas Importantes

1. **Solo una configuración activa**: El sistema garantiza que solo una configuración esté activa
2. **Creación automática**: Si no existe configuración, se crea una por defecto
3. **Validación de emails**: Todos los campos de email son validados automáticamente
4. **Timestamps automáticos**: `createdAt` y `updatedAt` se gestionan automáticamente por Mongoose
5. **Índice en campo activo**: Optimiza las búsquedas de configuración activa

## Casos de Uso

### 1. Mostrar Información de Contacto en el Sitio
```tsx
const config = await fetch('/api/configuracion').then(r => r.json());
// Mostrar config.correoVentas, config.telefonoVentas, etc.
```

### 2. Generar Enlaces a Redes Sociales
```tsx
const { redesSociales } = await fetch('/api/configuracion').then(r => r.json()).data;
// Crear enlaces dinámicos a cada red social configurada
```

### 3. Mostrar Horarios de Atención
```tsx
const { horarioAtencion } = await fetch('/api/configuracion').then(r => r.json()).data;
// Mostrar horarios por día
```

### 4. Personalizar Colores del Sitio
```tsx
const { colorPrimario, colorSecundario } = config;
// Aplicar colores dinámicamente al tema
```

## Próximas Mejoras

- [ ] Soporte para múltiples idiomas
- [ ] Integración con servicios de email (SendGrid, Mailgun)
- [ ] Integración con WhatsApp Business API
- [ ] Historial de cambios de configuración
- [ ] Caché de configuración en Redis
- [ ] Validación de URLs de redes sociales
- [ ] Preview de colores antes de guardar
- [ ] Subida de logo y favicon directamente
