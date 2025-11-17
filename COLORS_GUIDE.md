# Guía de Colores - Sabor a Campo

## 🎨 Paleta de Colores Principal

### Colores Base
- **Primary (Naranja Cálido)**: `#D06428`
- **Secondary (Verde Oscuro)**: `#1A371F`
- **Dark (Negro)**: `#111111`
- **Light (Blanco Azulado)**: `#F8FAFD`

---

## 📋 Uso en Tailwind CSS

### 1. Color Primary (Naranja) - `#D06428`
```tsx
// Fondo
<div className="bg-primary">
<div className="bg-primary-500">
<div className="bg-primary-600"> {/* Más oscuro */}

// Texto
<p className="text-primary">
<p className="text-primary-700">

// Borde
<div className="border-primary">

// Hover
<button className="hover:bg-primary-700">
```

**Escala completa:**
- `primary-50` → `#FDF5F0` (muy claro)
- `primary-100` → `#FBEBE1`
- `primary-200` → `#F7D7C3`
- `primary-300` → `#F3C3A5`
- `primary-400` → `#EFAF87`
- `primary-500` → `#D06428` (base)
- `primary-600` → `#B85420`
- `primary-700` → `#8F4119`
- `primary-800` → `#662E12`
- `primary-900` → `#3D1B0B`
- `primary-950` → `#1F0E06` (muy oscuro)

### 2. Color Secondary (Verde) - `#1A371F`
```tsx
// Fondo
<div className="bg-secondary">
<div className="bg-secondary-500">

// Texto
<p className="text-secondary">

// Para destacar
<button className="bg-secondary-400"> {/* Verde más claro */}
```

**Escala completa:**
- `secondary-50` → `#E8F5EA`
- `secondary-100` → `#D1EBD5`
- `secondary-200` → `#A3D7AB`
- `secondary-300` → `#75C381`
- `secondary-400` → `#47AF57`
- `secondary-500` → `#1A371F` (base)
- `secondary-600` → `#152C19`
- `secondary-700` → `#102113`
- `secondary-800` → `#0B160D`
- `secondary-900` → `#060B07`
- `secondary-950` → `#030503`

### 3. Color Dark (Negro) - `#111111`
```tsx
// Fondo oscuro
<div className="bg-dark">
<div className="bg-dark-900">

// Texto oscuro
<p className="text-dark">

// Grises
<div className="bg-dark-100"> {/* Gris muy claro */}
<div className="bg-dark-500"> {/* Gris medio */}
```

**Escala completa:**
- `dark-50` → `#F5F5F5`
- `dark-100` → `#E8E8E8`
- `dark-200` → `#D1D1D1`
- `dark-300` → `#BABABA`
- `dark-400` → `#A3A3A3`
- `dark-500` → `#6B6B6B`
- `dark-600` → `#555555`
- `dark-700` → `#3D3D3D`
- `dark-800` → `#262626`
- `dark-900` → `#111111` (base)
- `dark-950` → `#080808`

### 4. Color Light (Blanco Azulado) - `#F8FAFD`
```tsx
// Fondo claro
<div className="bg-light">
<div className="bg-light-500">

// Para crear contraste suave
<div className="bg-light-600">
```

**Escala completa:**
- `light-50` a `light-400` → `#FFFFFF`
- `light-500` → `#F8FAFD` (base)
- `light-600` → `#D9E4F5`
- `light-700` → `#BACFED`
- `light-800` → `#9BB9E5`
- `light-900` → `#7CA4DD`
- `light-950` → `#6896D8`

---

## 🌓 Modo Claro/Oscuro

### Variables CSS Adaptativas

Las siguientes clases cambian automáticamente según el tema:

```tsx
// Fondo base (se adapta automáticamente)
<div className="bg-base"> 
  {/* Claro: #F8FAFD, Oscuro: #111111 */}

// Fondo de superficie
<div className="bg-surface">
  {/* Claro: #FFFFFF, Oscuro: #1F1F1F */}

// Fondo elevado
<div className="bg-elevated">
  {/* Claro: #FFFFFF, Oscuro: #2A2A2A */}

// Texto principal
<p className="text-primary">
  {/* Claro: #111111, Oscuro: #F8FAFD */}

// Texto secundario
<p className="text-secondary">
  {/* Claro: #555555, Oscuro: #D1D1D1 */}

// Texto terciario
<p className="text-tertiary">
  {/* Claro: #6B6B6B, Oscuro: #A3A3A3 */}
```

### Activar Modo Oscuro Manualmente

```tsx
// En el HTML
<html className="dark">
  <body>...</body>
</html>

// Con JavaScript/React
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('dark');

// Componente de ejemplo
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Claro' : '🌙 Oscuro'}
    </button>
  );
}
```

---

## 🎯 Colores Semánticos

### Success (Éxito)
```tsx
// Modo claro: verde oscuro (#1A371F)
// Modo oscuro: verde claro (#47AF57)
<div className="bg-success-light dark:bg-success-dark">
```

### Warning (Advertencia)
```tsx
// Modo claro: naranja (#D06428)
// Modo oscuro: naranja claro (#F3C3A5)
<div className="bg-warning-light dark:bg-warning-dark">
```

### Error
```tsx
// Modo claro: rojo (#DC2626)
// Modo oscuro: rojo claro (#FCA5A5)
<div className="bg-error-light dark:bg-error-dark">
```

### Info
```tsx
// Modo claro: azul (#2563EB)
// Modo oscuro: azul claro (#93C5FD)
<div className="bg-info-light dark:bg-info-dark">
```

---

## 💡 Ejemplos Prácticos

### Botón Principal
```tsx
<button className="
  bg-primary hover:bg-primary-700 
  text-white font-semibold 
  px-6 py-3 rounded-lg 
  transition-colors duration-300
">
  Acción Principal
</button>
```

### Botón Secundario
```tsx
<button className="
  bg-secondary hover:bg-secondary-400 
  text-white font-semibold 
  px-6 py-3 rounded-lg 
  transition-colors duration-300
">
  Acción Secundaria
</button>
```

### Card con Tema Adaptativo
```tsx
<div className="
  bg-surface 
  border border-border 
  rounded-lg p-6 
  shadow-lg
">
  <h3 className="text-primary mb-2">Título</h3>
  <p className="text-secondary">Descripción</p>
</div>
```

### Navbar
```tsx
<nav className="
  bg-base 
  border-b border-border 
  shadow-sm
">
  <div className="text-primary font-bold">
    Sabor a Campo
  </div>
</nav>
```

### Gradientes
```tsx
// Gradiente con colores principales
<div className="bg-linear-to-r from-primary to-secondary">

// Gradiente suave
<div className="bg-linear-to-br from-primary-100 to-secondary-100">

// Gradiente oscuro
<div className="bg-linear-to-br from-dark-800 to-dark-900">
```

---

## 🔧 Variables CSS Directas

Si necesitas usar los colores en CSS puro:

```css
.mi-elemento {
  /* Colores base */
  background: var(--color-primary);
  color: var(--color-secondary);
  
  /* Colores adaptativos */
  background: var(--bg-base);
  color: var(--text-primary);
  border-color: var(--border-color);
  
  /* Colores semánticos */
  color: var(--color-success);
  background: var(--color-warning);
}
```

---

## 📱 Recomendaciones de Uso

1. **Primary (#D06428)**: Botones principales, links importantes, elementos destacados
2. **Secondary (#1A371F)**: Botones secundarios, headers, elementos de navegación
3. **Dark (#111111)**: Texto principal, fondos en modo oscuro
4. **Light (#F8FAFD)**: Fondos en modo claro, texto sobre fondos oscuros

### Combinaciones Recomendadas

- ✅ Texto `dark-900` sobre fondo `light-500`
- ✅ Texto `light-500` sobre fondo `primary-500`
- ✅ Texto `light-500` sobre fondo `secondary-500`
- ✅ Texto `primary-700` sobre fondo `light-500`
- ✅ Botón `primary-500` con texto `light-50`
- ✅ Botón `secondary-500` con texto `light-50`

---

## 🎨 Testing de Colores

Puedes probar los colores con este componente:

```tsx
export default function ColorPalette() {
  const colors = [
    { name: 'Primary', class: 'bg-primary' },
    { name: 'Secondary', class: 'bg-secondary' },
    { name: 'Dark', class: 'bg-dark' },
    { name: 'Light', class: 'bg-light' },
  ];
  
  return (
    <div className="p-8 grid grid-cols-4 gap-4">
      {colors.map(color => (
        <div key={color.name}>
          <div className={`${color.class} h-24 rounded-lg`} />
          <p className="text-center mt-2">{color.name}</p>
        </div>
      ))}
    </div>
  );
}
```
