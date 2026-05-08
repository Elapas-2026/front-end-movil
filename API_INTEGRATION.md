# Integración API ELAPAS

## Estado Actual

La app móvil ELAPAS ahora está conectada con la API real en `https://elapas-backend.onrender.com/api/v1`

## Cambios Realizados

### 1. Archivos Nuevos

#### `lib/elapas-api.ts`
Cliente HTTP para consumir la API ELAPAS con métodos:
- `login(email, password)` - Autenticación y obtención de token JWT
- `obtenerUsuarios()` - Lista de usuarios disponibles
- `obtenerMedidores(usuarioId)` - Medidores de un usuario
- `crearLectura(data)` - Registrar lectura con GPS y foto
- `obtenerLecturas(filtros)` - Historial de lecturas
- `sincronizarLecturas(lecturas)` - Envío en lote de lecturas
- `obtenerCortes()` - Cortes activos asignados
- `obtenerDeudas(ci)` - Deudas del usuario

#### `lib/auth-elapas.ts`
Servicio de autenticación:
- `saveAuth(token, usuario)` - Guardar sesión
- `getToken()` - Obtener token guardado
- `getUser()` - Obtener usuario guardado
- `isAuthenticated()` - Verificar sesión activa
- `logout()` - Cerrar sesión
- `initialize()` - Inicializar con token guardado

#### `.env.local`
Variables de entorno:
```
NEXT_PUBLIC_API_URL=https://elapas-backend.onrender.com
NEXT_PUBLIC_API_VERSION=v1
```

### 2. Archivos Actualizados

#### `components/auth/login-form.tsx`
- Usa `elapasApi.login()` para autenticar con API real
- Fallback a credenciales simuladas si API no responde
- Guarda token JWT en localStorage y Zustand
- Mensajes de error mejorados

#### `lib/store.ts`
- Nuevo campo `token` para JWT
- Nuevo campo `medidores[]` para almacenar medidores cargados
- Método `setToken()` para guardar token
- Método `cargarMedidores()` para agregar medidores

#### `app/dashboard/page.tsx`
- Carga usuarios y medidores al montar la página
- Auto-sincronización con API real
- Convierte lecturas locales al formato esperado por la API
- Manejo de errores de conexión

#### `components/lecturas/form-lectura.tsx`
- Carga usuarios disponibles al montar
- Selector de usuario y medidor
- Envia lecturas a API cuando hay conexión
- Guarda localmente si está offline

## Flujo de Uso

### 1. Login
```
Usuario ingresa email y contraseña
↓
elapasApi.login() → POST /api/v1/auth/login
↓
Recibe token JWT y datos de usuario
↓
Guarda en localStorage + Zustand
↓
Redirige a /dashboard
```

### 2. Cargar Datos
```
Dashboard monta
↓
Carga usuarios: elapasApi.obtenerUsuarios()
↓
Carga medidores de cada usuario
↓
Carga lecturas del usuario actual
↓
Muestra en la UI
```

### 3. Registrar Lectura
```
Usuario selecciona medidor y valor
↓
Si online: POST /api/v1/lecturas → estado "sincronizada"
Si offline: Guardar en localStorage → estado "pendiente"
↓
Se muestra en el historial
```

### 4. Sincronización Automática
```
App detecta conexión restaurada
↓
Obtiene lecturas pendientes del localStorage
↓
elapasApi.sincronizarLecturas() → Envía en lote
↓
Marca como "sincronizada" en la UI
↓
Limpia localStorage
```

## Endpoints Consumidos

| Método | Endpoint | Función |
|--------|----------|---------|
| POST | `/api/v1/auth/login` | Autenticar |
| GET | `/api/v1/usuarios` | Listar usuarios |
| GET | `/api/v1/usuarios/{id}/medidores` | Medidores de usuario |
| POST | `/api/v1/lecturas` | Crear lectura |
| GET | `/api/v1/lecturas` | Listar lecturas |
| POST | `/api/v1/lecturas/sync` | Sincronizar múltiples |
| GET | `/api/v1/dashboard/cortes` | Cortes activos |
| GET | `/api/v1/facturas/usuario/{ci}/deudas` | Deudas |

## Manejo de Errores

### Si API Falla en Login
- Intenta con credenciales simuladas como fallback
- Muestra mensaje: "API offline, usando credenciales de prueba"
- La app sigue funcionando 100% (modo offline)

### Si API Falla en Lectura
- Si online: intenta enviar a API, si falla guarda local
- Si offline: guarda automáticamente en localStorage
- Al reconectar: auto-sincroniza

### Reintentos
- Los errores de red tienen reintentos automáticos (ver sync-manager.ts)
- Max 3 reintentos con backoff exponencial
- Si sigue fallando: guarda local y muestra notificación

## Testing

### Test 1: Login con API
```bash
1. Abre http://localhost:3000
2. Ingresa credenciales reales de la API
3. Verifica que carga el token JWT
4. Verifica que redirige a /dashboard
```

### Test 2: Cargar Medidores
```bash
1. En dashboard, abre DevTools (F12)
2. Ve a Console
3. Busca "[v0] Usuarios cargados:"
4. Verifica que cargó usuarios y medidores
```

### Test 3: Crear Lectura
```bash
1. Selecciona un medidor
2. Ingresa valor
3. Presiona "Guardar Lectura"
4. Verifica que aparece en el historial
5. En Console: "[v0] Creating lectura:"
```

### Test 4: Sincronización Manual
```bash
1. Presiona botón de sincronizar
2. En Console: "[v0] Sincronizing..."
3. Verifica que cambia de "pendiente" a "sincronizada"
```

### Test 5: Offline Mode
```bash
1. DevTools → Network → Offline
2. Registra una lectura
3. Aparece como "PENDIENTE" 🟡
4. Desactiva Offline
5. Auto-sincroniza → "SINCRONIZADA" 🟢
```

## Seguridad

- Token JWT guardado en localStorage (considerar usar secure storage)
- Token enviado en header `Authorization: Bearer {token}`
- Validación de token expirado (TODO: implementar refresh)
- Logout limpia token y datos de usuario

## Performance

- Carga lazy de usuarios/medidores
- Sincronización en lote (no una por una)
- Caché local de datos
- Retry automático con backoff

## TODO - Mejoras Futuras

1. Refresh token automático cuando expira
2. Compresión de fotos antes de enviar
3. Progreso de sincronización visible
4. Notificaciones de estado
5. Validación de datos antes de enviar
6. Logging más detallado

## Debugging

Ver console de navegador para logs:
```
[v0] Attempting login with API for: usuario@email.com
[v0] API Login successful: Nombre Usuario
[v0] Cargando medidores y lecturas...
[v0] Usuarios cargados: 15
[v0] Iniciando sincronización automática... 3 lecturas pendientes
[v0] Sincronization completada: 3 lecturas
```

Desactiva logs en producción editando `elapas-api.ts`:
```typescript
// Comentar los console.log en producción
```
