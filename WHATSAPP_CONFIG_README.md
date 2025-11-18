# Configuración de WhatsApp - Documentación

## 📱 Sistema de WhatsApp Centralizado

Se ha implementado un sistema completo para gestionar la configuración de WhatsApp desde el panel de administración, eliminando la dependencia de archivos estáticos.

---

## ✅ Cambios Implementados

### 1. **Modelo de Configuración** (`src/models/Configuracion.ts`)

Se agregó una nueva sección `whatsapp` con la siguiente estructura:

```typescript
whatsapp: {
  administracion: {
    numero: string;          // Ej: "2235032141"
    codigoPais: string;      // Ej: "54" (Argentina)
    textoPredefinido: string;
    activo: boolean;
  },
  ventas: {
    numero: string;
    codigoPais: string;
    textoPredefinido: string;
    activo: boolean;
  }
}
```

**Valores por defecto:**
- Código de país: `54` (Argentina)
- Números de ejemplo incluidos
- Ambos contactos activos por defecto

---

### 2. **Panel de Administración** (`src/components/admin/ConfiguracionManager.tsx`)

Se agregó una nueva pestaña **"WhatsApp"** con:

#### Configuración para Administración:
- ✅ Checkbox de activación
- 📞 Código de país
- 📱 Número de WhatsApp
- 💬 Texto predefinido personalizable

#### Configuración para Ventas:
- ✅ Checkbox de activación
- 📞 Código de país
- 📱 Número de WhatsApp
- 💬 Texto predefinido personalizable

**Características:**
- Activación/desactivación individual de cada botón
- Validación de números antes de mostrar
- Interfaz intuitiva con iconos

---

### 3. **Botón Flotante de WhatsApp** (`src/components/BotonWSP/BotonWsp.jsx`)

**Antes:** Dependía de un archivo estático `userData.js`

**Ahora:** 
- Obtiene la configuración dinámicamente de la API
- Se actualiza automáticamente al cambiar la configuración
- Solo muestra botones activos con números válidos
- Manejo de estados de carga

**Comportamiento:**
- Si ambos contactos están desactivados → No se muestra el botón
- Si solo uno está activo → Solo muestra ese botón
- Si ambos están activos → Muestra ambos botones al hacer hover

---

## 🚀 Cómo Usar

### Para Administradores:

1. **Acceder al Panel:**
   - Ir a Dashboard Admin
   - Seleccionar "Configuración"
   - Click en la pestaña "WhatsApp"

2. **Configurar Administración:**
   - Activar/desactivar el checkbox
   - Ingresar código de país (sin el +)
   - Ingresar número (sin espacios ni guiones)
   - Personalizar mensaje predefinido

3. **Configurar Ventas:**
   - Mismo proceso que Administración

4. **Guardar:**
   - Click en "Guardar Cambios"
   - Los cambios se aplican inmediatamente en el sitio

---

## 📋 Ejemplos de Configuración

### Argentina:
```
Código de País: 54
Número: 2235032141
URL generada: https://wa.me/542235032141
```

### México:
```
Código de País: 52
Número: 5512345678
URL generada: https://wa.me/525512345678
```

### España:
```
Código de País: 34
Número: 612345678
URL generada: https://wa.me/34612345678
```

---

## 🔧 Estructura Técnica

### API Endpoint:
- **GET** `/api/configuracion` - Obtiene la configuración completa
- **PUT** `/api/configuracion` - Actualiza la configuración

### Flujo de Datos:
```
MongoDB → API → ConfiguracionManager (Admin)
                    ↓
                  Guardar
                    ↓
MongoDB → API → BotonWsp (Frontend)
```

---

## 🎨 Características del Botón

### Diseño:
- Botón flotante verde en esquina inferior derecha
- Al hacer hover, muestra opciones disponibles
- Iconos: 📋 Administración, 💰 Ventas
- Animación suave de aparición

### Responsivo:
- Se adapta a dispositivos móviles
- Touch-friendly en tablets y móviles

---

## ⚙️ Valores por Defecto

Al crear una nueva configuración, se establecen automáticamente:

```javascript
whatsapp: {
  administracion: {
    numero: '2235032141',
    codigoPais: '54',
    textoPredefinido: 'Hola, me gustaría contactar con administración.',
    activo: true
  },
  ventas: {
    numero: '2231234567',
    codigoPais: '54',
    textoPredefinido: 'Hola, me interesa saber más sobre productos o servicios.',
    activo: true
  }
}
```

---

## 🔒 Validaciones

- ✅ Al menos un número debe estar activo para mostrar el botón
- ✅ Los números se validan antes de generar el link
- ✅ El código de país es requerido
- ✅ Si no hay configuración, el botón no se muestra

---

## 🐛 Solución de Problemas

### El botón no aparece:
1. Verificar que al menos un contacto esté activo
2. Revisar que los números estén completos
3. Comprobar que hay configuración guardada

### El link no funciona:
1. Verificar formato del número (sin espacios, guiones o paréntesis)
2. Confirmar código de país correcto
3. Probar el número manualmente en WhatsApp

---

## 📝 Migración desde userData.js

Si tenías un archivo `userData.js` estático:

1. Los datos ya no se leen desde ese archivo
2. Puedes eliminarlo de forma segura
3. Configurar los números en el panel de administración
4. El sistema funcionará automáticamente

---

## 🔄 Actualizaciones Futuras Sugeridas

- [ ] Agregar más contactos (Soporte, etc.)
- [ ] Selector de país con banderas
- [ ] Validación de formato de número en tiempo real
- [ ] Preview del mensaje antes de guardar
- [ ] Estadísticas de clicks por contacto
- [ ] Horarios de disponibilidad por contacto

---

## 👨‍💻 Desarrollador

Sistema implementado para centralizar y facilitar la gestión de contactos de WhatsApp desde el panel de administración.

**Beneficios:**
- ✅ Sin código hardcodeado
- ✅ Actualización en tiempo real
- ✅ Fácil de mantener
- ✅ Escalable para más contactos
