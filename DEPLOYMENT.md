# Guía de Despliegue - ELAPAS Mobile

## Opción 1: Desplegar en Vercel (Recomendado)

### Paso 1: Conectar GitHub
```bash
# Si aún no tienes repositorio, inicia uno
git init
git add .
git commit -m "Initial commit: ELAPAS Mobile app"
git branch -M main
git remote add origin https://github.com/tu-usuario/elapas-mobile.git
git push -u origin main
```

### Paso 2: Desplegar en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Haz login/signup
3. Click "New Project"
4. Selecciona tu repositorio de GitHub
5. Vercel detectará automáticamente que es Next.js
6. Click "Deploy"

### Paso 3: Configurar Variables de Entorno
En dashboard de Vercel:
1. Project Settings → Environment Variables
2. Agrega:
```
NEXT_PUBLIC_API_URL=tu_url_api
DATABASE_URL=tu_database_url
JWT_SECRET=tu_secret_jwt
```
3. Redeploy

**¡Listo!** Tu app estará en vivo en `tuproyecto.vercel.app`

---

## Opción 2: Desplegar Localmente (Desarrollo)

### Paso 1: Instalar Dependencias
```bash
pnpm install
```

### Paso 2: Variables de Entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://localhost/elapas
JWT_SECRET=dev_secret_no_usar_en_produccion
```

### Paso 3: Iniciar Servidor
```bash
# Desarrollo (con hot reload)
pnpm dev

# Producción
pnpm build
pnpm start
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Opción 3: Desplegar en Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

# Build
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando inicio
CMD ["npm", "start"]
```

### Construir y ejecutar
```bash
# Build imagen
docker build -t elapas-mobile .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=tu_secret \
  elapas-mobile
```

---

## Opción 4: Desplegar en Railway

### Paso 1: Conectar Repositorio
1. Ve a [railway.app](https://railway.app)
2. New Project → GitHub Repo
3. Selecciona tu repositorio

### Paso 2: Configurar BD
1. Add → PostgreSQL
2. Railway la conectará automáticamente

### Paso 3: Variables de Entorno
En Railway Dashboard:
```
DATABASE_URL=tu_pg_url_automatico
JWT_SECRET=tu_secret
NEXT_PUBLIC_API_URL=tu_dominio_railway
```

### Paso 4: Deploy
Railway detectará Next.js y desplegará automáticamente.

---

## Opciones de Base de Datos

### 1. PostgreSQL (Recomendado)

#### Supabase (con UI incluida)
```bash
# 1. Crea cuenta en supabase.com
# 2. Nuevo proyecto
# 3. Copia DATABASE_URL
# 4. Ejecuta migraciones:
psql $DATABASE_URL < schema.sql
```

#### Neon (Serverless)
```bash
# 1. Crea cuenta en neon.tech
# 2. Nuevo proyecto
# 3. Copia connection string
# 4. Agrega a .env.local
```

### 2. MongoDB
```javascript
// Instala driver
npm install mongodb

// Connection
const client = new MongoClient(process.env.MONGODB_URI)
```

### 3. Firebase
```javascript
// Instala Firebase
npm install firebase-admin

// Ya tiene autenticación integrada
```

---

## Implementar Base de Datos

### Con PostgreSQL + Supabase

```bash
# 1. Instala cliente
pnpm add @supabase/supabase-js

# 2. Crea archivo lib/supabase.ts
```

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default supabase
```

```typescript
// En app/api/auth/login/route.ts
import supabase from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  
  return NextResponse.json({
    usuario: {
      id: data.user.id,
      email: data.user.email,
      nombre: data.user.user_metadata?.nombre,
    },
    token: data.session?.access_token,
  })
}
```

---

## Configurar CORS (Si usas API externa)

### next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## Checklist Pre-Producción

### Seguridad
- [ ] JWT tokens en HttpOnly cookies
- [ ] Contraseñas hasheadas con bcrypt
- [ ] HTTPS habilitado
- [ ] CORS restringido a dominios permitidos
- [ ] Rate limiting en endpoints
- [ ] Validación de entrada en backend
- [ ] SQL prepared statements (sin concatenación)
- [ ] Secrets en variables de entorno

### Performance
- [ ] Next.js build optimizado
- [ ] Imágenes comprimidas
- [ ] Lazy loading de componentes
- [ ] Cache headers configurados
- [ ] CDN para assets estáticos

### Testing
- [ ] Tests unitarios completos
- [ ] E2E tests del flujo login → lectura
- [ ] Tests de sincronización offline
- [ ] Tests de formulario con GPS/cámara

### Monitoring
- [ ] Logs centralizados (Sentry, etc)
- [ ] Uptime monitoring
- [ ] Analytics de errores
- [ ] Performance monitoring

---

## Comandos Útiles

```bash
# Desarrollo
pnpm dev              # Inicia servidor en hot-reload
pnpm lint             # Ejecuta linter

# Build
pnpm build            # Construye para producción
pnpm start            # Inicia servidor build

# Base de datos
pnpm db:migrate       # Ejecuta migraciones
pnpm db:seed          # Siembra datos de prueba

# Testing
pnpm test             # Ejecuta tests
pnpm test:e2e         # Tests end-to-end

# Deployment
pnpm deploy           # Deploy a Vercel
```

---

## Troubleshooting

### App muestra 404 en rutas
```bash
# Verifica que app/ existe y tiene pages
# Next.js usa app router, no pages router
ls -la app/
```

### Errores de CORS
```bash
# En desarrollo, usa NEXT_PUBLIC_API_URL=http://localhost:3000
# En producción, usa tu dominio real
```

### Fotos no se guardan
```typescript
// Verifica que localStorage tiene espacio
// base64 ocupa más memoria
// Considera usar Vercel Blob para producción
```

### Zustand no persiste
```typescript
// Verifica localStorage está habilitado
// En navegadores privados puede no funcionar
console.log(localStorage.getItem('elapas-store'))
```

---

## Mejoras Posteriores

Después del deployment inicial:

1. **Agregar Stripe** para pagos
2. **Sentry** para error tracking
3. **PostHog** para analytics
4. **Cloudinary** para gestión de fotos
5. **SendGrid** para emails
6. **Twilio** para SMS

---

## Soporte

- Documentación: Leer `APP_STRUCTURE.md` e `IMPLEMENTACION.md`
- Issues: GitHub issues
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

**¡Tu app está lista para producción!**
