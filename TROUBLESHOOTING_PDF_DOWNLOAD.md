# 🔧 Solución de Problemas - Descarga de PDFs

## 🐛 Problema: "El PDF no se descarga"

### Síntomas
- Aparece el toast de "Descargando PDF"
- No se descarga ningún archivo
- No hay errores visibles

### Causas Posibles

#### 1. Navegador Bloqueando Descargas
**Solución:**
1. Revisa si hay un ícono de "bloqueado" en la barra de direcciones
2. Permite las descargas para este sitio
3. En Chrome: `chrome://settings/content/automaticDownloads`
4. En Firefox: `about:preferences#privacy` → Permisos → Descargas

#### 2. Extensiones del Navegador
**Solución:**
1. Desactiva temporalmente bloqueadores de anuncios
2. Desactiva extensiones de privacidad
3. Prueba en modo incógnito

#### 3. Carpeta de Descargas Sin Permisos
**Solución:**
1. Verifica permisos de la carpeta de descargas
2. Cambia la carpeta de descargas predeterminada
3. En Windows: Verifica si hay restricciones del antivirus

---

## 🔍 Cómo Debuggear

### Paso 1: Abre la Consola del Navegador
- **Chrome/Edge:** `F12` o `Ctrl + Shift + I`
- **Firefox:** `F12` o `Ctrl + Shift + K`
- **Safari:** `Cmd + Option + I`

### Paso 2: Ve a la pestaña "Console"

### Paso 3: Busca estos logs

#### ✅ Logs Correctos (debe verse así):
```
📤 Enviando datos para generar PDF masivo...
📥 Response status: 200
📥 Response headers: application/pdf
📦 Blob recibido: 45621 bytes application/pdf
🔗 URL creada: blob:http://localhost:3000/...
🖱️ Iniciando descarga...
✅ Click ejecutado
✅ Descarga completada y limpieza realizada
```

#### ❌ Logs de Error - Caso 1: Blob vacío
```
📦 Blob recibido: 0 bytes application/pdf
❌ El blob está vacío
```
**Solución:** Error en el servidor al generar PDF

#### ❌ Logs de Error - Caso 2: Error 401/403
```
📥 Response status: 401
❌ Error del servidor: 401 No autorizado
```
**Solución:** Sesión expirada, volver a iniciar sesión

#### ❌ Logs de Error - Caso 3: Error 500
```
📥 Response status: 500
❌ Error del servidor: 500 ...
```
**Solución:** Error en el servidor, revisar logs del backend

---

## 🛠️ Soluciones por Caso

### Caso 1: Blob Vacío
```bash
# Revisa los logs del servidor (terminal donde corre npm run dev)
# Busca errores en la generación del PDF
```

**Posibles causas:**
- Error en PDFKit
- Datos faltantes
- Problema con fuentes o recursos

**Solución:**
1. Revisa la terminal del servidor
2. Busca errores de `pdfGenerator.ts`
3. Verifica que los datos se envían correctamente

### Caso 2: Error de Autenticación
```bash
# Borra las cookies y vuelve a iniciar sesión
```

**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Intenta descargar de nuevo

### Caso 3: Click No Funciona
Si ves el log "❌ Error en click", el navegador está bloqueando:

**Solución Automática:**
El sistema intentará abrir el PDF en una nueva pestaña

**Solución Manual:**
1. Permite popups para este sitio
2. Recarga la página
3. Intenta de nuevo

---

## 🧪 Pruebas de Diagnóstico

### Prueba 1: Verificar que el servidor genera el PDF
```javascript
// En la consola del navegador:
fetch('/api/transferencias/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    transferencia: { esMasiva: true, notas: 'Test' },
    grupos: [
      {
        sucursalOrigen: { nombre: 'Test Origen' },
        sucursalDestino: { nombre: 'Test Destino' },
        items: [{ nombreProducto: 'Test', cantidad: 1 }]
      }
    ],
    totalProductos: 1,
    totalUnidades: 1
  })
})
.then(r => r.blob())
.then(b => console.log('Blob:', b.size, 'bytes'))
```

### Prueba 2: Verificar permisos de descarga
```javascript
// En la consola del navegador:
const testBlob = new Blob(['Test'], { type: 'text/plain' });
const url = URL.createObjectURL(testBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'test.txt';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
// ¿Se descargó test.txt?
```

---

## 📱 Soluciones Específicas por Navegador

### Chrome/Edge
```
1. chrome://settings/content/automaticDownloads
2. Agregar el sitio a "Permitir"
3. chrome://settings/content/pdfDocuments
4. Desactivar "Descargar archivos PDF en lugar de abrirlos automáticamente en Chrome"
```

### Firefox
```
1. about:preferences#privacy
2. Permisos → Descargas
3. Quitar bloqueos
4. about:config → dom.allow_scripts_to_close_windows → true
```

### Safari
```
1. Safari → Preferencias → Sitios web → Descargas
2. Permitir descargas para el sitio
3. Desactivar "Preguntar antes de descargar"
```

---

## 🎯 Checklist de Verificación

- [ ] ¿Los logs muestran "Blob recibido" con tamaño > 0?
- [ ] ¿El Content-Type es "application/pdf"?
- [ ] ¿El status es 200?
- [ ] ¿Se ejecuta el "click"?
- [ ] ¿Hay errores en la consola?
- [ ] ¿Las descargas están permitidas en el navegador?
- [ ] ¿Hay espacio en disco?
- [ ] ¿La carpeta de descargas tiene permisos?

---

## 💡 Alternativa Manual

Si nada funciona, puedes abrir el PDF directamente:

1. Ejecuta la función de generar PDF
2. Copia la URL del blob de la consola: `blob:http://...`
3. Pega la URL en una nueva pestaña
4. El PDF se abrirá
5. Guárdalo manualmente con `Ctrl + S`

---

## 🆘 Última Opción: Backend Directo

Si el problema persiste, genera el PDF desde el backend:

```typescript
// Modifica el endpoint para guardar en servidor
import fs from 'fs';

const pdfBuffer = await pdfGenerator.generateTransferenciaMasiva({...});

// Guardar temporalmente
const fileName = `orden_${Date.now()}.pdf`;
fs.writeFileSync(`./public/temp/${fileName}`, pdfBuffer);

// Devolver URL pública
return NextResponse.json({ 
  success: true, 
  url: `/temp/${fileName}` 
});
```

Luego en el frontend:
```javascript
const { url } = await response.json();
window.open(url, '_blank');
```

---

## 📞 Contacto de Soporte

Si sigues teniendo problemas después de estas soluciones:

1. Copia los logs de la consola
2. Captura de pantalla del error
3. Versión del navegador
4. Sistema operativo
5. Reporta el problema con esta información
