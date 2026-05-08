# 🔐 CREDENCIALES DE ACCESO - ELAPAS Mobile v1.0

## ⚡ Acceso Rápido

Selecciona cualquiera de estos usuarios para ingresar a la app:

### Option 1: Auto-fill (Recomendado) ⭐
1. Abre http://localhost:3000
2. **Desplázate hacia abajo** en el formulario de login
3. Verás las credenciales en tarjetas interactivas
4. **Haz clic en cualquiera** para rellenar automáticamente
5. Presiona "Iniciar Sesión"

### Option 2: Copiar y Pegar
Copia cualquiera de las credenciales de abajo y pégalas en el formulario.

---

## 👥 Usuarios Disponibles

### 1️⃣ Técnico 1
```
📧 Email:     tecnico1@elapas.com
🔑 Password:  password123
👤 Rol:       Técnico de Lectura
```
**Permisos:** Registrar y ver sus propias lecturas

---

### 2️⃣ Técnico 2
```
📧 Email:     tecnico2@elapas.com
🔑 Password:  password123
👤 Rol:       Técnico de Lectura
```
**Permisos:** Registrar y ver sus propias lecturas

---

### 3️⃣ Administrador
```
📧 Email:     admin@elapas.com
🔑 Password:  admin123
👤 Rol:       Administrador del Sistema
```
**Permisos:** Acceso total, gestionar usuarios y datos

---

### 4️⃣ Supervisor
```
📧 Email:     supervisor@elapas.com
🔑 Password:  supervisor123
👤 Rol:       Supervisor de Técnicos
```
**Permisos:** Ver y supervisar equipo de trabajo

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias (primera vez)
pnpm install

# 2. Iniciar servidor de desarrollo
pnpm dev

# 3. Abrir navegador
open http://localhost:3000
```

---

## 📋 ¿Cuál Usuario Usar?

### Para Testing General
👉 Usa **Técnico 1** (`tecnico1@elapas.com` / `password123`)

### Para Testing de Permisos
👉 Usa **Admin** (`admin@elapas.com` / `admin123`)

### Para Testing de Supervisión
👉 Usa **Supervisor** (`supervisor@elapas.com` / `supervisor123`)

### Para Testing Multi-usuario
👉 Usa **Técnico 1** Y **Técnico 2** (ábrelos en diferentes pestañas)

---

## 📖 Documentación

| Archivo | Contenido |
|---------|----------|
| **QUICK_START.md** | Guía de inicio rápido (5 min) |
| **CREDENTIALS.md** | Detalles de credenciales |
| **APP_STRUCTURE.md** | Arquitectura de la app |
| **IMPLEMENTACION.md** | Features implementadas |
| **DEPLOYMENT.md** | Cómo desplegar en producción |

---

## ✅ Checklist de Login

- [ ] Abre http://localhost:3000
- [ ] Desplázate hacia abajo en el formulario
- [ ] Haz clic en una credencial (auto-fill)
- [ ] Presiona "Iniciar Sesión"
- [ ] Deberías ver el Dashboard
- [ ] Intenta registrar una lectura
- [ ] Ve al historial
- [ ] Prueba con otro usuario

---

## 🎯 Próximas Acciones Después del Login

1. **Registra una Lectura**
   - Rellena ID Medidor y Dirección
   - Captura GPS (opcional)
   - Toma una foto (opcional)
   - Presiona "Guardar"

2. **Ve el Historial**
   - Cambia al tab "Historial"
   - Verás todas tus lecturas
   - Intenta eliminar una

3. **Prueba Offline**
   - Desactiva WiFi
   - Intenta registrar otra lectura
   - Debe funcionar sin conexión

4. **Sincroniza (cuando esté implementado)**
   - Reconecta a internet
   - Presiona "Sincronizar"
   - Los datos se enviarán al servidor

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- Estas credenciales son solo para **DESARROLLO**
- En **PRODUCCIÓN**, debes:
  - Implementar autenticación real con JWT
  - Usar base de datos segura
  - Hashear contraseñas con bcrypt
  - Usar HTTPS obligatorio
  - Implementar 2FA

Ver `DEPLOYMENT.md` para detalles de seguridad.

---

## 🐛 Troubleshooting

### "Credencial inválida"
```
❌ Verifica que escribiste exactamente como aparece arriba
✅ Prueba con auto-fill en lugar de escribir a mano
✅ Ten cuidado con mayúsculas/minúsculas
```

### "El servidor no está corriendo"
```
❌ Verifica que ejecutaste: pnpm dev
❌ Revisa que está en http://localhost:3000
✅ Abre una nueva terminal si es necesario
```

### "Las credenciales no aparecen abajo del formulario"
```
❌ Desplázate hacia abajo en la página
✅ Las tarjetas gris aparecen bajo el botón "Iniciar Sesión"
```

---

## 📱 Funcionalidades por Usuario

| Feature | Técnico | Admin | Supervisor |
|---------|---------|-------|-----------|
| Registrar lecturas | ✅ | ✅ | ✅ |
| Ver propias lecturas | ✅ | ✅ | ✅ |
| Ver todas las lecturas | ❌ | ✅ | ✅ (equipo) |
| Editar lecturas | ❌ | ✅ | ✅ (equipo) |
| Eliminar lecturas | ❌ | ✅ | ✅ (equipo) |
| Gestionar usuarios | ❌ | ✅ | ❌ |
| Ver reportes | ❌ | ✅ | ✅ |

---

## 💡 Tips

### Tip 1: Múltiples Usuarios
```bash
# En la misma ventana puedes cambiar de usuario
1. Presiona tu avatar (esquina superior derecha)
2. Selecciona "Cerrar sesión"
3. Ingresa con otro usuario
```

### Tip 2: DevTools para Debugging
```
Presiona F12 para abrir DevTools
→ Application → Storage → localStorage
Busca "elapas-store" para ver datos guardados
```

### Tip 3: Limpiar Datos
```javascript
// En console (F12)
localStorage.removeItem('elapas-store')
location.reload()
```

---

## 🎓 Casos de Uso

### Caso 1: Testing Básico
```
1. Login como Técnico 1
2. Registra 3 lecturas
3. Verifica que aparecen en historial
4. Elimina una
5. Recarga la página (deben persistir)
```

### Caso 2: Testing Multi-usuario
```
1. Abre pestañas diferentes
2. En pestañaA: Login como Técnico 1
3. En pestañaB: Login como Técnico 2
4. Ambos registran lecturas
5. Verifica que cada uno ve sus propias
```

### Caso 3: Testing Offline
```
1. Login como Admin
2. Registra algunas lecturas
3. Abre DevTools → Network
4. Selecciona "Offline"
5. Intenta registrar otra lectura
6. Debe funcionar (guardado local)
7. Vuelve a "Online"
8. Intenta sincronizar
```

---

## 📞 ¿Necesitas Ayuda?

1. **Lee QUICK_START.md** - Responde 90% de dudas
2. **Mira CREDENTIALS.md** - Detalles de usuarios
3. **Revisa IMPLEMENTACION.md** - Cómo funciona internamente
4. **Abre DevTools (F12)** - Ver errores en console

---

## 🚀 Listo para Empezar

```bash
# Ejecuta estos comandos:
pnpm install     # Una sola vez
pnpm dev         # Cada que quieras desarrollar

# Luego abre:
http://localhost:3000

# Y usa cualquiera de las credenciales de arriba ⬆️
```

---

## Resumen

| Campo | Valor |
|-------|-------|
| **URL** | http://localhost:3000 |
| **Usuarios** | 4 disponibles (ver arriba) |
| **Método Rápido** | Auto-fill con tarjetas |
| **Documentación** | Varios archivos .md en raíz |
| **Desarrollo** | `pnpm dev` |
| **Base de Datos** | LocalStorage (para testing) |
| **Producción** | Implementar API real |

---

**¡Que disfrutes usando ELAPAS Mobile! 🚀**

Creado: Abril 2026  
Versión: 1.0 Beta  
Última actualización: Hoy
