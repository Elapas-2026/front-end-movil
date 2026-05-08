# ELAPAS Mobile - Guía Rápida de Inicio

## ¿Qué Es?

Una **app móvil moderna** para que técnicos de ELAPAS registren lecturas de medidores con:
- Login/logout
- Formulario de lectura con GPS y foto
- Almacenamiento offline
- Historial sincronizable

---

## Instalación (2 minutos)

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Iniciar servidor
```bash
pnpm dev
```

### 3. Abrir en navegador
```
http://localhost:3000
```

---

## Usando la App

### 1. Login

**Credenciales Válidas:**

| Usuario | Correo | Contraseña |
|---------|--------|-----------|
| Técnico 1 | `tecnico1@elapas.com` | `password123` |
| Técnico 2 | `tecnico2@elapas.com` | `password123` |
| Administrador | `admin@elapas.com` | `admin123` |
| Supervisor | `supervisor@elapas.com` | `supervisor123` |

**Cómo entrar:**
1. Usa cualquiera de las credenciales arriba
2. Presiona "Iniciar Sesión"
3. **Tip:** Haz clic en una credencial debajo del formulario para autorellenar

### 2. Dashboard
Verás:
- Estado de conexión (Online/Offline)
- Estadísticas (Total, Sincronizadas, Pendientes)
- Tab "Nueva Lectura" y "Historial"

### 3. Registrar Lectura
1. Completa los campos requeridos:
   - ID Medidor (ej: MED-12345)
   - Dirección (ej: Calle 5 #123)
   - Lectura Anterior (número)
   - Lectura Actual (número)

2. Opcional:
   - Presiona 📍 para capturar GPS
   - Presiona 📷 para tomar foto

3. Presiona "Guardar Lectura"

### 4. Ver Historial
- Ve al tab "Historial"
- Verás todas tus lecturas registradas
- Puedes eliminar con el botón 🗑️
- ✓ = Sincronizado | ⏱️ = Pendiente

### 5. Logout
- Presiona tu inicial en la esquina superior derecha
- Selecciona "Cerrar sesión"

---

## Estructura de Archivos

```
📁 ELAPAS Mobile
├── 📄 QUICK_START.md          ← TÚ ESTÁS AQUÍ
├── 📄 APP_STRUCTURE.md         Arquitectura completa
├── 📄 IMPLEMENTACION.md        Funcionalidades detalladas
├── 📄 DEPLOYMENT.md            Cómo desplegar en producción
│
├── 📁 app
│   ├── page.tsx               Página login
│   ├── layout.tsx             Config global
│   ├── globals.css            Estilos
│   ├── dashboard/
│   │   └── page.tsx           Página principal
│   └── api/                   Endpoints (vacíos, listos para conectar)
│
├── 📁 components
│   ├── auth/login-form.tsx    Formulario login
│   ├── lecturas/
│   │   ├── form-lectura.tsx   Formulario de lectura
│   │   └── lista-lecturas.tsx Lista con historial
│   ├── layout/
│   │   └── header.tsx         Header navigation
│   └── ui/                    Componentes reutilizables
│
└── 📁 lib
    ├── store.ts               Estado global (Zustand)
    ├── api-client.ts          Cliente HTTP
    └── storage.ts             Almacenamiento local
```

---

## Características Principales

### ✅ Login
- Simula autenticación
- Guarda usuario en localStorage
- Protege rutas

### ✅ Dashboard
- Indicador online/offline
- Estadísticas en tiempo real
- Botón sincronizar (cuando hay datos pendientes)

### ✅ Formulario Inteligente
```
┌─────────────────────┐
│  ID Medidor *       │ Requerido
├─────────────────────┤
│  Dirección *        │ Requerido
├─────────────────────┤
│  Anterior | Actual  │ Números
├─────────────────────┤
│  Observaciones      │ Texto libre
├─────────────────────┤
│  [📍 GPS][📷 FOTO]  │ Opcionales
├─────────────────────┤
│  [Guardar Lectura]  │ Guarda local
└─────────────────────┘
```

### ✅ Historial
- Muestra todas las lecturas
- Indica estado (✓ sincronizado / ⏱️ pendiente)
- Permite eliminar
- Persiste en localStorage

### ✅ Almacenamiento Offline
- Zustand para estado global
- localStorage para persistencia
- Funciona sin conexión
- Sync cuando hay conexión

---

## Keyboard Shortcuts

- **Enter** en formulario = Enviar
- **Esc** en modal = Cerrar
- **Tab** = Navegar entre campos

---

## DevTools

### Ver datos guardados
```javascript
// Abre DevTools (F12)
// Application → Storage → localStorage
// Busca "elapas-store"
console.log(JSON.parse(localStorage.getItem('elapas-store')))
```

### Ver estado Zustand
```javascript
// En consola
import { useStore } from '@/lib/store'
useStore.getState()
```

---

## Troubleshooting

### "La página no carga"
```bash
# Reinicia el servidor
pnpm dev
# Abre http://localhost:3000
```

### "Las fotos no se guardan"
- Verifica que tienes cámara en tu dispositivo
- Chrome en desktop puede usar tu webcam
- En mobile, usa dispositivo real

### "GPS no funciona"
- Requiere HTTPS en producción
- En desarrollo, puede no funcionar
- El simulador muestra coordenadas 0,0

### "Datos no persisten"
```bash
# Comprueba localStorage está habilitado
# Abre DevTools → Application → Storage
# No funciona en navegación privada
```

---

## Próximos Pasos

### Para Desarrolladores
1. Lee `APP_STRUCTURE.md` para entender la arquitectura
2. Lee `IMPLEMENTACION.md` para ver todas las features
3. Conecta un backend real en `/app/api/`
4. Implementa autenticación real con JWT

### Para Desplegar
1. Lee `DEPLOYMENT.md`
2. Elige Vercel, Railway, Docker, etc
3. Configura variables de entorno
4. Deploy!

### Para Personalizar
1. Cambia colores en `app/globals.css`
2. Edita textos en componentes
3. Agrega tu logo en lugar del ⚙️
4. Personaliza el header en `components/layout/header.tsx`

---

## Teclas y Atajos Importantes

| Tecla | Acción |
|-------|--------|
| F12 | Abrir DevTools |
| Ctrl+Shift+I | DevTools (Firefox) |
| Cmd+Option+I | DevTools (Mac) |
| Ctrl+R | Recargar página |
| Ctrl+Shift+Delete | Limpiar cache/cookies |

---

## Dependencias Principales

- **Next.js 16** - Framework
- **React 19** - UI
- **Zustand** - Estado
- **Tailwind CSS** - Estilos
- **Lucide Icons** - Iconos
- **shadcn/ui** - Componentes

---

## Base de Datos

### Actualmente
✅ Almacenamiento local (localStorage + Zustand)
✅ Funciona offline completamente
✅ Perfecto para testing

### Para Producción
❌ Se necesita backend real
❌ Configura PostgreSQL/MongoDB/etc
❌ Implementa endpoints en `/app/api/`

Lee `IMPLEMENTACION.md` para instrucciones.

---

## Soporte

**¿Tienes problemas?**

1. Revisa el console de DevTools (F12)
2. Comprueba que pnpm dev está corriendo
3. Intenta `pnpm dev --reset` para limpiar cache
4. Lee `APP_STRUCTURE.md` para más detalles

---

## Tips

### Desarrollar Más Rápido
```bash
# Usa npm scripts en package.json
pnpm add -D my-package      # Agregar dependencia
pnpm dev --port 3001        # Puerto diferente
pnpm build                  # Verificar build
```

### Debugging
```javascript
// Usa console.log (se ve en terminal)
console.log('[v0] Data:', myVar)

// O DevTools (F12)
// Verifica Network, Application, Console
```

### Mejorar Performance
```bash
# Analiza build
pnpm build
pnpm start

# O usa Next.js Analytics en Vercel
```

---

## ¡Listo!

Ahora puedes:
1. ✅ Usar la app en desarrollo
2. ✅ Entender cómo funciona
3. ✅ Agregar features
4. ✅ Conectar un backend
5. ✅ Desplegar en producción

**¡Que disfrutes creando!** 🚀

---

Más documentación en:
- `APP_STRUCTURE.md` - Arquitectura
- `IMPLEMENTACION.md` - Features detalladas
- `DEPLOYMENT.md` - Producción
