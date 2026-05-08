# Credenciales de Acceso - ELAPAS Mobile

## Usuarios de Prueba Disponibles

Usa cualquiera de estas credenciales para iniciar sesión en la app:

---

### 👨‍🔧 Técnico 1
```
Correo:      tecnico1@elapas.com
Contraseña:  password123
Rol:         Técnico de Lectura
```

---

### 👨‍🔧 Técnico 2
```
Correo:      tecnico2@elapas.com
Contraseña:  password123
Rol:         Técnico de Lectura
```

---

### 👨‍💼 Administrador
```
Correo:      admin@elapas.com
Contraseña:  admin123
Rol:         Administrador del Sistema
```

---

### 📋 Supervisor
```
Correo:      supervisor@elapas.com
Contraseña:  supervisor123
Rol:         Supervisor de Técnicos
```

---

## Cómo Usar

### Método 1: Copiar y Pegar (Rápido)
1. Copia el correo y contraseña de arriba
2. Pega en los campos del formulario
3. Presiona "Iniciar Sesión"

### Método 2: Auto-fill (Más Rápido) ⭐ RECOMENDADO
1. En la página de login, desplázate hacia abajo
2. Verás todas las credenciales en tarjetas
3. Haz clic en cualquiera
4. El formulario se rellenará automáticamente
5. Presiona "Iniciar Sesión"

---

## Características por Usuario

### Técnico 1 y Técnico 2
- ✅ Registrar nuevas lecturas
- ✅ Ver su historial de lecturas
- ✅ Editar/eliminar sus propias lecturas
- ✅ Capturar GPS y fotos
- ❌ Ver lecturas de otros técnicos
- ❌ Acceder a reportes globales

### Administrador
- ✅ Registrar lecturas
- ✅ Ver todas las lecturas de todos los técnicos
- ✅ Editar/eliminar cualquier lectura
- ✅ Generar reportes
- ✅ Gestionar usuarios
- ✅ Configuración del sistema

### Supervisor
- ✅ Registrar lecturas
- ✅ Ver lecturas de técnicos asignados
- ✅ Editar/eliminar lecturas de su equipo
- ✅ Generar reportes de equipo
- ✅ Asignar nuevas zonas de lectura
- ❌ Gestionar usuarios

---

## Testing por Rol

### Test como Técnico
1. Ingresa con `tecnico1@elapas.com` / `password123`
2. Registra 5-10 lecturas de prueba
3. Verifica que aparecen en el historial
4. Intenta eliminar una lectura
5. Haz logout

### Test como Administrador
1. Ingresa con `admin@elapas.com` / `admin123`
2. Verifica que ves todas las lecturas registradas
3. Intenta editar una lectura de un técnico
4. Haz logout

### Test como Supervisor
1. Ingresa con `supervisor@elapas.com` / `supervisor123`
2. Verifica que ves solo lecturas de su equipo
3. Intenta asignar nuevas zonas
4. Haz logout

---

## Cambiar Credenciales

Si quieres agregar, modificar o eliminar credenciales:

### Editar el Archivo
Abre `/components/auth/login-form.tsx` y busca:

```typescript
const VALID_CREDENTIALS = [
  { email: 'tecnico1@elapas.com', password: 'password123', nombre: 'Técnico 1' },
  { email: 'tecnico2@elapas.com', password: 'password123', nombre: 'Técnico 2' },
  { email: 'admin@elapas.com', password: 'admin123', nombre: 'Administrador' },
  { email: 'supervisor@elapas.com', password: 'supervisor123', nombre: 'Supervisor' },
]
```

### Agregar Nueva Credencial
```typescript
{ email: 'nuevo@elapas.com', password: 'password123', nombre: 'Nuevo Usuario' },
```

### Cambiar Contraseña
```typescript
{ email: 'tecnico1@elapas.com', password: 'nueva_contraseña_aqui', nombre: 'Técnico 1' },
```

---

## Seguridad Importante

⚠️ **NOTA IMPORTANTE PARA PRODUCCIÓN:**

Estas credenciales están **hardcodeadas en el frontend**, lo cual es SOLO para desarrollo/testing.

Para producción, DEBES:

1. ✅ Implementar autenticación real con JWT
2. ✅ Usar una base de datos segura
3. ✅ Hashear todas las contraseñas con bcrypt
4. ✅ Usar variables de entorno (nunca hardcodear)
5. ✅ Implementar rate limiting en login
6. ✅ Usar HTTPS obligatoriamente
7. ✅ Implementar 2FA (autenticación de 2 factores)

Lee `DEPLOYMENT.md` para instrucciones de seguridad en producción.

---

## Troubleshooting de Login

### "Credencial inválida"
- Verifica que escribiste correctamente el correo y contraseña
- Ten cuidado con mayúsculas/minúsculas
- Usa las credenciales exactas de arriba
- Prueba con auto-fill en lugar de escribir a mano

### "Las credenciales no funcionan"
- Recarga la página (Ctrl+R o Cmd+R)
- Borra el cache del navegador
- Intenta en una pestaña de incógnito
- Verifica que el servidor está corriendo con `pnpm dev`

### "No veo las credenciales debajo del formulario"
- Desplázate hacia abajo en la página de login
- Las credenciales aparecen al final del formulario
- Busca tarjetas con fondo gris

---

## Próximos Pasos

Cuando el backend esté listo:

1. Reemplaza `VALID_CREDENTIALS` con una llamada a la API
2. Implementa `/api/auth/login` que valide en la base de datos
3. Genera y devuelve un JWT
4. Usa el JWT en las siguientes peticiones

```typescript
// Cambiar de esto:
const usuarioValido = VALID_CREDENTIALS.find(...)

// A esto:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const { usuario, token } = await response.json()
```

---

## Dudas Frecuentes

**P: ¿Puedo cambiar las contraseñas?**  
R: Sí, edita `/components/auth/login-form.tsx` y modifica el array `VALID_CREDENTIALS`.

**P: ¿Puedo agregar más usuarios?**  
R: Sí, agrega nuevos objetos al array `VALID_CREDENTIALS`.

**P: ¿Es seguro tener las credenciales en el código?**  
R: No, es solo para desarrollo. En producción implementa autenticación real con API.

**P: ¿Qué pasa si olvido la contraseña?**  
R: En desarrollo, édítala en el código. En producción, implementa "Olvidé mi contraseña".

**P: ¿Puedo usar estas credenciales en móvil?**  
R: Sí, todas funcionan igual en cualquier dispositivo.

---

## Resumen Rápido

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Técnico 1 | `tecnico1@elapas.com` | `password123` | Técnico |
| Técnico 2 | `tecnico2@elapas.com` | `password123` | Técnico |
| Admin | `admin@elapas.com` | `admin123` | Administrador |
| Supervisor | `supervisor@elapas.com` | `supervisor123` | Supervisor |

**Tip:** Usa auto-fill para entrar más rápido!

---

Archivo: `/components/auth/login-form.tsx`  
Última actualización: Abril 2026  
Versión: 1.0
