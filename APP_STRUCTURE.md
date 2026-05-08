# ELAPAS Mobile - Estructura de la Aplicación

## Descripción General
App móvil responsiva para técnicos de ELAPAS que necesitan registrar lecturas de medidores. Incluye funcionalidad offline, almacenamiento local y sincronización cuando hay conexión.

## Estructura de Carpetas

```
/app
  /api
    /auth
      /login          - TODO: Implementar login
      /register       - TODO: Implementar registro
    /lecturas
      /crear          - TODO: Crear lectura
      /listar         - TODO: Listar lecturas
    /sync
      /lecturas       - TODO: Sincronizar lecturas
  /dashboard          - Página principal tras login
  layout.tsx          - Layout root con configuración móvil
  page.tsx            - Página de login

/components
  /auth
    login-form.tsx    - Formulario de inicio de sesión
  /layout
    header.tsx        - Header sticky con usuario
  /lecturas
    form-lectura.tsx  - Formulario para registrar lectura
    lista-lecturas.tsx - Lista de lecturas guardadas

/lib
  store.ts            - Estado global con Zustand
  api-client.ts       - Cliente HTTP para API (preparado)
  storage.ts          - Servicio de almacenamiento local

/public
  - Assets estáticos
```

## Características Implementadas

### 1. Autenticación
- **Página de Login**: Formulario con email y contraseña
- **Validación**: Valida contra credenciales definidas
- **Almacenamiento de Usuario**: Datos del usuario en localStorage
- **Cierre de Sesión**: Botón para logout en el header
- **Credenciales de Prueba**: 4 usuarios diferentes disponibles
- **Auto-fill**: Haz clic en una credencial mostrada abajo del formulario

**Usuarios de prueba disponibles:**
- `tecnico1@elapas.com` / `password123` (Técnico 1)
- `tecnico2@elapas.com` / `password123` (Técnico 2)
- `admin@elapas.com` / `admin123` (Administrador)
- `supervisor@elapas.com` / `supervisor123` (Supervisor)

Ver archivo `CREDENTIALS.md` para más detalles.

### 2. Formulario de Lectura
- Campos: ID Medidor, Dirección, Lectura Anterior, Lectura Actual, Observaciones
- **GPS**: Captura coordenadas del dispositivo
- **Cámara**: Toma foto del medidor
- **Almacenamiento**: Guarda en store local (Zustand + localStorage)

### 3. Dashboard
- **Estadísticas**: Total, sincronizadas, pendientes
- **Estado de Conexión**: Indicador online/offline
- **Botón de Sincronización**: Prepara datos para enviar a API
- **Historial**: Lista de todas las lecturas con detalles

### 4. Almacenamiento Offline
- Usa Zustand para estado global
- localStorage para persistencia
- Las lecturas se marcan como "sincronizado: false" hasta confirmación API

## Cómo Conectar la API

### 1. Endpoints a Implementar

En `/app/api/` ya están los archivos listos:

```
POST   /api/auth/login              - Autenticar usuario
POST   /api/auth/register           - Registrar nuevo usuario
POST   /api/lecturas/crear          - Crear lectura
GET    /api/lecturas/listar         - Listar lecturas
POST   /api/sync/lecturas           - Sincronizar lecturas pendientes
```

### 2. Pasos para Implementar

1. **Instala dependencias** si necesitas:
   ```bash
   pnpm add bcryptjs jsonwebtoken
   ```

2. **Implementa la base de datos** (Supabase, Neon, etc.)

3. **Completa los endpoints** en `/app/api/`

4. **Conecta `apiClient`** en:
   - `/lib/api-client.ts` - Cliente HTTP (ya está esqueletizado)
   - Components que hacen llamadas: `components/auth/login-form.tsx`, `app/dashboard/page.tsx`

### 3. Variables de Entorno

En `.env.local` agrega:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=tu_database_url
JWT_SECRET=tu_secret_jwt
```

## Flujos Principales

### Login
1. Usuario ingresa email/contraseña
2. Valida con API (o simulado por ahora)
3. Guarda usuario en store
4. Redirige a `/dashboard`

### Registrar Lectura
1. Técnico completa formulario
2. Opcionalmente captura GPS y foto
3. Se guarda en localStorage
4. Se marca como `sincronizado: false`

### Sincronizar
1. Usuario presiona botón "Sincronizar"
2. Se envían todas las lecturas pendientes
3. API procesa y guarda en BD
4. Se marcan como `sincronizado: true`

## Tecnologías Usadas

- **Next.js 16** - Framework React con servidor
- **React 19** - UI Components
- **Zustand** - Gestión de estado
- **Tailwind CSS** - Estilos responsive
- **Lucide Icons** - Iconografía
- **TypeScript** - Type safety

## Notas Importantes

- ✅ App es **mobile-first** y responsive
- ✅ Funciona **offline** con localStorage
- ✅ **Estructura preparada** para API (sin implementar)
- ✅ **Estado persistente** entre sesiones
- ⚠️ Login actualmente es **simulado** (necesita backend)
- ⚠️ Sync necesita **implementación de API**
- ⚠️ Fotos se guardan como **base64** (considerar Blob storage para producción)

## Próximos Pasos

1. Implementar endpoints de API
2. Conectar base de datos
3. Agregar autenticación real con JWT
4. Mejorar captura de fotos (usar Vercel Blob o similar)
5. Agregar validaciones avanzadas
6. Implementar compresión de imágenes
7. Agregar indicador de progreso para sync

---

**Desarrollado para ELAPAS - Sistema de Lectura de Medidores**
