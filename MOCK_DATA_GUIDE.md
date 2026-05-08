# Guía de Datos Mock - ELAPAS Mobile App

## Resumen

La app ahora funciona completamente con **datos mock locales** sin necesidad de backend/API real. Los datos se cargan desde `/lib/mock-data.ts` y simulan un retraso de red para parecer reales.

## Cómo Funciona

### Flag de Configuración

El archivo `.env.local` contiene:
```
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Cuando este flag está en `true`, la app usa datos mock en lugar de llamar a la API real.

### Flujo de Datos

```
Usuario hace acción
    ↓
elapasApi.method()
    ↓
¿NEXT_PUBLIC_USE_MOCK_DATA = true?
    ├─ Sí  → Usa datos de mock-data.ts + simula delay 500-1000ms
    └─ No  → Llama a API real en onrender.com
```

### Sin Cambios en la Interfaz

La app funciona **exactamente igual** ya sea con mock data o API real. El cambio es completamente transparente para el usuario.

## Datos Incluidos

### Usuarios (10 disponibles)

```javascript
{
  id: "1",
  nombre: "Juan Pérez García",
  email: "juan.perez@email.com",
  ci: "1234567",
  categoria: "DOMESTICA",
  direccion: "Calle Principal 123, La Paz",
  distrito: 1
}
```

Todos los usuarios tienen:
- Nombre realista
- CI único
- Categoría: DOMESTICA, COMERCIAL, SOLIDARIA, EDIFICIO
- Dirección en La Paz
- Email

**Lista completa:**
1. Juan Pérez García (DOMESTICA)
2. María López Martínez (DOMESTICA)
3. Carlos Rodríguez (COMERCIAL)
4. Ana Flores Quispe (DOMESTICA)
5. Empresa Comercial ABC (COMERCIAL)
6. Cooperativa Solidaria ELAPAS (SOLIDARIA)
7. Edificio Residencial Los Andes (EDIFICIO)
8. Roberto Silva Mendez (DOMESTICA)
9. Tienda Don Lucho (COMERCIAL)
10. Sra. Patricia Gutierrez (DOMESTICA)

### Medidores (15 disponibles)

```javascript
{
  id: "1001001",
  numero: "1001001",
  usuarioId: "1",
  activo: true
}
```

- Números secuenciales: 1001001 a 1001015
- Asociados a usuarios (algunos usuarios tienen 2 medidores)
- Todos activos

### Lecturas (20 históricas)

```javascript
{
  id: "1",
  medidorId: "1001001",
  usuarioId: "1",
  valor: 150.5,
  fecha: "2024-04-15T10:30:00Z",
  latitud: -16.4897,
  longitud: -68.1193
}
```

- Fechas variadas: febrero, marzo, abril 2024
- Valores realistas de consumo m³
- Incluyen GPS coordinates en La Paz
- Ordenadas por fecha

## Cómo Probar

### Test 1: Login

```
1. Abre http://localhost:3000
2. Cualquier email/password
3. Presiona "Iniciar Sesión"
4. Console: "[v0] Using MOCK DATA for login"
5. ✓ Entra al dashboard
```

### Test 2: Búsqueda de Medidor

```
1. En "Nueva Lectura" 
2. Ingresa: 1001001
3. Presiona "Buscar"
4. Console: "[v0] Using MOCK DATA for buscarMedidorPorNumero: 1001001"
5. Ves: Juan Pérez García, CI 1234567, DOMESTICA
6. Última lectura: 150.5 m³
```

### Test 3: Cálculo de Consumo

```
1. Lectura anterior: 150.5 (automático)
2. Lectura actual: 156.25 (ingresa)
3. Consumo: 6.25 m³ (automático)
4. ✓ Se calcula en tiempo real
```

### Test 4: Marcar en Mapa

```
1. En Nueva Lectura
2. Presiona "Marcar en mapa"
3. Haz clic en el mapa
4. Obtienes dirección: "Calle Principal 123, La Paz"
5. ✓ Mapa funciona
```

### Test 5: Registro de Lectura

```
1. Completa formulario
2. Presiona "Registrar lectura"
3. Si offline (DevTools > Network > Offline):
   - Aparece como 🟡 PENDIENTE
4. Si online:
   - Aparece como 🟢 SINCRONIZADA
5. ✓ Estados funcionan
```

## Modificar Datos Mock

Si quieres agregar más usuarios, medidores o lecturas:

### Archivo: `/lib/mock-data.ts`

```typescript
// Agregar usuario
export const MOCK_USUARIOS = [
  // ... usuarios existentes
  {
    id: '11',
    nombre: 'Tu nombre aqui',
    email: 'tu@email.com',
    ci: '9999999',
    categoria: 'DOMESTICA',
    direccion: 'Tu direccion',
    distrito: 1,
  },
]

// Agregar medidor
export const MOCK_MEDIDORES = [
  // ... medidores existentes
  {
    id: '1001016',
    numero: '1001016',
    usuarioId: '11',
    activo: true,
  },
]

// Agregar lectura
export const MOCK_LECTURAS = [
  // ... lecturas existentes
  {
    id: '21',
    medidorId: '1001016',
    usuarioId: '11',
    valor: 100.5,
    fecha: '2024-04-20T10:30:00Z',
    latitud: -16.4897,
    longitud: -68.1193,
  },
]
```

Luego recarga la app (F5).

## Cambiar a API Real

Para usar la API real cuando esté disponible:

### Opción 1: Archivo .env.local

```
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://tu-api.com/api
```

### Opción 2: Durante desarrollo

En console del navegador:
```javascript
localStorage.setItem('use_real_api', 'true')
location.reload()
```

## Delay Simulado

Cada llamada mock data tiene un delay simulado:

```javascript
// Simular delay de red realista
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms))
```

Delays por operación:
- Login: 800ms
- Obtener usuarios: 600ms
- Buscar medidor: 500ms
- Obtener lecturas: 600ms
- Crear lectura: 700ms
- Sincronizar: 1000ms

Esto hace que parezca que hay conexión real.

## Ventajas del Mock Data

✓ **Desarrollo sin backend**: Puedes trabajar sin API
✓ **Datos realistas**: Nombres, direcciones, categorías reales
✓ **Funcionalidad completa**: Todo funciona como con API real
✓ **Sin cambios en código**: UI es idéntica
✓ **Fácil de extender**: Agrega más datos cuando quieras
✓ **Simula delays**: Parece una conexión real
✓ **Fallback automático**: Si API falla, usa mock data

## Console Logs

Para ver qué está pasando, abre DevTools (F12) y busca:

```javascript
// Login mock
[v0] Using MOCK DATA for login

// Búsqueda de medidor
[v0] Using MOCK DATA for buscarMedidorPorNumero: 1001001

// Obtener lecturas
[v0] Using MOCK DATA for obtenerLecturas

// Sincronizar
[v0] Using MOCK DATA for sincronizarLecturas
```

## Resumen Rápido

| Acción | Datos | Delay |
|--------|-------|-------|
| Login | MOCK_AUTH_USER | 800ms |
| Listar usuarios | MOCK_USUARIOS (10) | 600ms |
| Buscar medidor | MOCK_MEDIDORES (15) | 500ms |
| Obtener lecturas | MOCK_LECTURAS (20) | 600ms |
| Crear lectura | Generado | 700ms |
| Sincronizar | Generado | 1000ms |

---

**La app está lista para demostración y testing sin backend.** Cuando tengas API real, cambia `NEXT_PUBLIC_USE_MOCK_DATA=false` y listo.
