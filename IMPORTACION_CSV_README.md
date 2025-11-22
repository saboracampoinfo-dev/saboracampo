# Importación Masiva de Productos desde CSV

## 📋 Descripción

Este sistema permite importar miles de productos desde archivos CSV con formato específico. El importador convierte automáticamente los datos al formato de la base de datos de productos de Sabor a Campo.

## 🎯 Características

- **Importación masiva**: Procesa miles de productos en una sola operación
- **Tres modos de importación**:
  - **Crear nuevos**: Solo crea productos que no existen
  - **Actualizar**: Solo actualiza productos existentes
  - **Inteligente (Upsert)**: Crea o actualiza según corresponda
- **Asignación a sucursales**: Opcionalmente asigna stock por sucursal
- **Vista previa**: Muestra los primeros 10 productos antes de importar
- **Mapeo automático**: Convierte categorías y unidades de medida automáticamente
- **Manejo de promociones**: Detecta y aplica precios promocionales

## 📝 Formato del Archivo CSV

### Separador
El archivo debe usar **|** (pipe) como separador de columnas.

### Columnas Requeridas

```
id_comercio|id_bandera|id_sucursal|id_producto|productos_ean|productos_descripcion|productos_cantidad_presentacion|productos_unidad_medida_presentacion|productos_marca|productos_precio_lista|productos_precio_referencia|productos_cantidad_referencia|productos_unidad_medida_referencia|productos_precio_unitario_promo1|productos_leyenda_promo1|productos_precio_unitario_promo2|productos_leyenda_promo2
```

### Descripción de Columnas

| Columna | Descripción | Uso en el Sistema |
|---------|-------------|-------------------|
| `id_comercio` | ID del comercio | No se usa (informativo) |
| `id_bandera` | ID de la bandera/cadena | No se usa (informativo) |
| `id_sucursal` | ID de la sucursal | No se usa (se selecciona manualmente) |
| `id_producto` | **ID único del producto** | Se mapea a `sku` y `codigoBarras` |
| `productos_ean` | Código de barras EAN | Se usa si está disponible, sino se usa `id_producto` |
| `productos_descripcion` | **Nombre del producto** | Se mapea a `nombre` |
| `productos_cantidad_presentacion` | Cantidad en stock | Se mapea a `stock` |
| `productos_unidad_medida_presentacion` | Unidad de medida | Se convierte a `unidadMedida` |
| `productos_marca` | Marca del producto | Se mapea a `proveedor` |
| `productos_precio_lista` | **Precio normal** | Se mapea a `precio` |
| `productos_precio_referencia` | Precio de referencia | No se usa actualmente |
| `productos_cantidad_referencia` | Cantidad de referencia | No se usa actualmente |
| `productos_unidad_medida_referencia` | Unidad de referencia | No se usa actualmente |
| `productos_precio_unitario_promo1` | Precio promoción 1 | Se usa para `precioPromocion` |
| `productos_leyenda_promo1` | Descripción promo 1 | No se usa actualmente |
| `productos_precio_unitario_promo2` | Precio promoción 2 | Se usa para `precioPromocion` |
| `productos_leyenda_promo2` | Descripción promo 2 | No se usa actualmente |

## 🔄 Mapeo Automático

### Unidades de Medida

El sistema convierte automáticamente las unidades al formato estándar:

- `kg`, `kilo`, `kilogramo` → `kg`
- `lt`, `litro` → `litro`
- `paq`, `paquete` → `paquete`
- `caj`, `caja` → `caja`
- Cualquier otro valor → `unidad`

### Categorías

El sistema detecta automáticamente la categoría basándose en palabras clave en la descripción:

- **Lácteos**: leche, yogur, queso, manteca
- **Carnes**: carne, pollo, pescado, cerdo
- **Frutas y Verduras**: fruta, verdura, lechuga, tomate
- **Panadería**: pan, galleta, torta
- **Bebidas**: agua, gaseosa, jugo, vino, cerveza
- **Conservas**: conserva, enlatado, lata
- **Granos y Cereales**: arroz, fideos, pasta, harina
- **Especias**: sal, pimienta, condimento
- **Otros**: resto de productos

### Precios Promocionales

El sistema selecciona automáticamente el menor precio entre:
- `productos_precio_unitario_promo1`
- `productos_precio_unitario_promo2`

Si alguno es mayor a 0 y menor que el precio normal, se asigna como `precioPromocion`.

### Stock Mínimo

Se calcula automáticamente como el **20% del stock inicial**, con un mínimo de 1 unidad.

## 📦 Ejemplo de Archivo CSV

```csv
id_comercio|id_bandera|id_sucursal|id_producto|productos_ean|productos_descripcion|productos_cantidad_presentacion|productos_unidad_medida_presentacion|productos_marca|productos_precio_lista|productos_precio_referencia|productos_cantidad_referencia|productos_unidad_medida_referencia|productos_precio_unitario_promo1|productos_leyenda_promo1|productos_precio_unitario_promo2|productos_leyenda_promo2
1|1|101|PROD001|7790001234567|Leche Entera La Serenisima 1L|50|litro|La Serenisima|350.50|350.50|1|litro|320.00|Promo especial|0||
1|1|101|PROD002|7790002345678|Pan Lactal Bimbo 500g|30|paquete|Bimbo|280.00|280.00|1|paquete|250.00|Oferta|240.00|Super oferta
1|1|101|PROD003|7790003456789|Carne Picada Premium|25|kg|Frigorífico San Jorge|1850.00|1850.00|1|kg|0||0||
1|1|101|PROD004|7790004567890|Manzanas Rojas|100|kg|Del Campo|420.00|420.00|1|kg|380.00|Promo fin de semana|0||
```

## 🚀 Cómo Usar el Importador

### 1. Preparar el Archivo CSV

- Asegúrate de que el archivo use **|** como separador
- Verifica que tenga la línea de encabezados
- Los precios pueden tener comas o puntos como separador decimal
- **El sistema procesa archivos grandes** en lotes de 100 productos automáticamente

### 2. Acceder al Importador

1. Inicia sesión como **Administrador**
2. Ve a **Dashboard Admin** → **Gestión de Productos**
3. Haz clic en el botón **📊 Importar CSV**

### 3. Configurar la Importación

1. **Seleccionar Modo de Importación**:
   - **Crear Nuevos**: Recomendado para primera importación
   - **Actualizar**: Para actualizar precios/stock de productos existentes
   - **Inteligente**: Crea o actualiza según sea necesario

2. **Seleccionar Sucursal** (Opcional):
   - Si seleccionas una sucursal, el stock se asignará a esa sucursal específica
   - Si no seleccionas sucursal, los productos se crearán con stock global

3. **Cargar Archivo CSV**:
   - Haz clic en "Seleccionar Archivo CSV"
   - Selecciona tu archivo .csv
   - El sistema mostrará una vista previa de los primeros 10 productos

4. **Revisar Vista Previa**:
   - Verifica que los datos se vean correctos
   - Revisa que los precios y cantidades sean los esperados

5. **Importar**:
   - Haz clic en "Importar X Productos"
   - **Para archivos grandes**: El sistema procesa automáticamente en lotes de 100 productos
   - Verás una barra de progreso mostrando el avance
   - Espera a que termine el proceso (puede tomar varios minutos para miles de productos)
   - Al finalizar verás un resumen de productos creados/actualizados/errores

## ⚙️ Modos de Importación Detallados

### Modo "Crear Nuevos"
- **Comportamiento**: Solo crea productos que no existen
- **Identificación**: Por SKU, código de barras o nombre
- **Ideal para**: Primera carga de productos

### Modo "Actualizar"
- **Comportamiento**: Solo actualiza productos existentes
- **Identificación**: Por SKU, código de barras o nombre
- **Actualiza**: Precio, precio promoción, descripción, stock
- **Ideal para**: Actualización de precios o stock

### Modo "Inteligente (Upsert)"
- **Comportamiento**: Crea si no existe, actualiza si existe
- **Identificación**: Por SKU → código de barras → nombre
- **Ideal para**: Importaciones periódicas

## 📊 Resultado de la Importación

Al finalizar verás un mensaje con:
- ✅ Cantidad de productos creados
- 🔄 Cantidad de productos actualizados
- ❌ Cantidad de errores

Si hay errores, revisa:
- Formato del CSV
- Precios (deben ser números válidos)
- Cantidades (deben ser números enteros positivos)

## 🔍 Consejos y Mejores Prácticas

1. **Prueba con Archivo Pequeño**: Primero importa 10-20 productos para verificar el formato
2. **Usa SKU Únicos**: Facilita las actualizaciones futuras
3. **Código de Barras**: Usa el código EAN completo si está disponible, sino se usará el `id_producto`
4. **Precios**: Asegúrate de que sean números válidos (con punto o coma decimal)
5. **Encoding**: El archivo debe estar en UTF-8 para caracteres especiales
6. **Archivos Grandes**: No hay límite de tamaño, el sistema procesa en lotes automáticamente
7. **Paciencia**: Miles de productos pueden tomar varios minutos en procesarse

## 🛠️ Solución de Problemas

### Error: "El archivo CSV está vacío"
- Verifica que el archivo tenga la línea de encabezados y al menos una línea de datos

### Error: "Faltan columnas requeridas"
- Asegúrate de que el archivo tenga todas las columnas del formato
- Verifica que uses **|** como separador

### Algunos productos no se importan
- Revisa que los precios sean números válidos
- Verifica que las cantidades sean números enteros
- Algunos productos pueden tener SKU duplicados

### Los precios se importan mal
- El sistema acepta tanto punto (.) como coma (,) como separador decimal
- Los caracteres no numéricos se eliminan automáticamente

## 📁 Archivos Relacionados

- **API Endpoint**: `/api/products/import/route.ts`
- **Componente**: `/components/admin/ImportadorCSV.tsx`
- **Modelo**: `/models/Product.ts`

## 🔐 Permisos

Solo usuarios con rol **admin** pueden acceder al importador de productos.

## 📞 Soporte

Si tienes problemas con la importación:
1. Revisa que el formato del CSV sea correcto
2. Verifica la consola del navegador para errores específicos
3. Contacta al equipo de desarrollo con un ejemplo del CSV que causa problemas
