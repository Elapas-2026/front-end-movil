# Checklist de Testing - Mapa y Sincronización

Usa esta lista para verificar que todas las características funcionan correctamente.

---

## 🔐 Login & Autenticación

- [ ] Inicia sesión con credenciales válidas
  - Email: `tecnico1@elapas.com`
  - Password: `password123`
- [ ] Redirige a dashboard automáticamente
- [ ] Header muestra nombre del usuario
- [ ] Botón de logout funciona

---

## 📍 Mapa Interactivo

### Abrir Mapa:
- [ ] En formulario de lectura, presiona botón "Mapa"
- [ ] Modal se abre a pantalla completa (móvil) o centrado (desktop)
- [ ] Mapa carga correctamente
- [ ] Se ve la ubicación actual como círculo azul

### Usar Mapa:
- [ ] Puedo hacer zoom (pinch en móvil, scroll en desktop)
- [ ] Puedo arrastrar el mapa
- [ ] Puedo hacer clic para seleccionar ubicación
- [ ] Cuando clic, se muestra coordenadas en tarjeta inferior

### Geocoding Automático:
- [ ] Después de hacer clic, la dirección se obtiene automáticamente
- [ ] La dirección aparece en el campo "Dirección"
- [ ] Puedo editar la dirección si es incorrecta
- [ ] Presiono "Confirmar Ubicación" y se guarda

### Marcadores Previos:
- [ ] Al abrir mapa, veo marcadores de lecturas anteriores
- [ ] Marcadores verde = sincronizadas
- [ ] Marcadores amarillo = pendientes
- [ ] Al hacer clic en marcador, muestra popup con info
- [ ] Popup contiene: ID Medidor, dirección, estado, fecha

---

## 🔄 Sincronización Online

### Test 1: Guardar con Conexión
1. [ ] Asegúrate que estés conectado (WiFi o datos)
2. [ ] El indicador en dashboard muestra **verde "Conectado"**
3. [ ] Registra una nueva lectura
4. [ ] En historial, aparece con badge **"✓ Sincronizado"**
5. [ ] Contador de sincronizadas aumenta en 1

### Test 2: Ver Sincronizados
- [ ] En dashboard aparecen en contador verde
- [ ] En lista, tienen fondo verde y banda verde izquierda
- [ ] Icono es CheckCircle ✓

---

## ⏱️ Sincronización Offline

### Test 1: Simular Sin Conexión
**Firefox:**
1. [ ] Presiona F12 (DevTools)
2. [ ] Tab "Red"
3. [ ] Checkbox "Modo sin conexión"
4. [ ] Dashboard muestra **amarillo "Sin conexión"**

**Chrome:**
1. [ ] Presiona F12 (DevTools)
2. [ ] Tab "Network"
3. [ ] Dropdown "Throttling" → "Offline"
4. [ ] Dashboard muestra **amarillo "Sin conexión"**

### Test 2: Guardar Sin Conexión
1. [ ] Con modo offline activado
2. [ ] Registra una lectura
3. [ ] En historial, aparece con badge **"⏱ Pendiente"**
4. [ ] Fondo amarillo y banda amarilla izquierda
5. [ ] Contador de pendientes aumenta

### Test 3: Auto-Sincronización
1. [ ] Registra 2-3 lecturas sin conexión
2. [ ] Contador de pendientes muestra cantidad correcta
3. [ ] Desactiva modo offline (reconecta)
4. [ ] Dashboard detecta conexión automáticamente
5. [ ] **Auto-sincroniza automáticamente** (sin tocar nada)
6. [ ] Lecturas cambian de amarillo a verde
7. [ ] Aparece notificación (verificar en consola: `[v0] Sincronización exitosa`)

### Test 4: Sincronización Manual
1. [ ] Registra lecturas sin conexión
2. [ ] Reconecta manualmente (quita modo offline)
3. [ ] En dashboard aparece botón **"Sincronizar (X)"**
4. [ ] Presiona el botón
5. [ ] Botón muestra "Sincronizando..." y gira
6. [ ] Al terminar, cambian a sincronizados

### Test 5: Alerta de Pendientes
1. [ ] Registra lecturas sin conexión
2. [ ] Sin reconectar, regresa al dashboard
3. [ ] Aparece alerta amarilla: "X lectura(s) pendiente(s)"
4. [ ] Alerta dice "Se sincronizarán automáticamente"
5. [ ] Reconecta y verifica auto-sync

---

## 💾 Exportación de Datos

### Test 1: Abrir Exportación
1. [ ] En dashboard, presiona icono ⬇️ (header derecha)
2. [ ] Modal "Exportar Lecturas" se abre
3. [ ] Muestra contador de lecturas totales, pendientes, sincronizadas

### Test 2: Exportar como JSON
1. [ ] Presiona botón "Exportar JSON"
2. [ ] Archivo se descarga automáticamente
3. [ ] Nombre incluye fecha actual
4. [ ] Abre el archivo en editor de texto
5. [ ] Contiene array de lecturas con toda la info

### Test 3: Exportar como CSV
1. [ ] Presiona botón "Exportar CSV"
2. [ ] Archivo se descarga
3. [ ] Abre en Excel o Google Sheets
4. [ ] Verifica que tenga columnas: ID, Medidor, Dirección, Lecturas, etc.

### Test 4: Backup Completo
1. [ ] Presiona "Backup Completo"
2. [ ] Descarga JSON con metadata
3. [ ] Abre el archivo
4. [ ] Contiene: version, exportedAt, totalLecturas, pendientes, sincronizadas

### Test 5: Generar Reporte
1. [ ] Presiona "Generar Reporte"
2. [ ] Descarga archivo .txt
3. [ ] Abre en notepad/editor de texto
4. [ ] Verificas que sea legible y contenga toda la info

---

## 📍 Geolocalización GPS

### Test 1: Obtener GPS Automático
1. [ ] En formulario, presiona botón **"GPS"**
2. [ ] Navegador pide permiso de ubicación
3. [ ] Permite el acceso
4. [ ] Aparece tarjeta azul con coordenadas
5. [ ] Coordenadas cambian a tu ubicación actual

### Test 2: GPS en Mapa
1. [ ] Usa el mapa para seleccionar ubicación
2. [ ] Coordenadas en tarjeta coinciden
3. [ ] Guarda la lectura
4. [ ] En historial, se ven coordenadas GPS

### Test 3: Sin GPS
1. [ ] Rechaza permiso de geolocalización
2. [ ] Intenta presionar GPS
3. [ ] Aparece alerta: "Geolocalización no disponible"
4. [ ] Puedes seguir usando el mapa

---

## 📷 Captura de Foto

### Test 1: Capturar Foto
1. [ ] En formulario, presiona **"Foto"**
2. [ ] Abre selector de archivo
3. [ ] Selecciona una foto (o toma una con cámara si está disponible)
4. [ ] Aparece miniatura en el formulario

### Test 2: Foto en Historial
1. [ ] Guarda lectura con foto
2. [ ] En historial, aparece miniatura de foto
3. [ ] Puedes ver claramente la imagen

### Test 3: Foto en Exportación
1. [ ] Exporta datos
2. [ ] En CSV/JSON verifica que foto esté como base64

---

## 📱 Responsividad Móvil

### Test 1: En Móvil Real
1. [ ] Abre app en navegador móvil
2. [ ] El layout es vertical y cómodo
3. [ ] Botones son fáciles de presionar
4. [ ] Mapa es fullscreen cuando abres modal
5. [ ] Formulario es legible sin scroll horizontal

### Test 2: En Tablet
1. [ ] Abre en navegador tablet
2. [ ] Layout se adapta a pantalla más grande
3. [ ] Mapa se centra en modal
4. [ ] Todo se ve bien sin bugs

### Test 3: En Desktop
1. [ ] Abre en navegador desktop (Chrome/Firefox)
2. [ ] Layout es responsivo
3. [ ] Mapa modal no es fullscreen
4. [ ] Todo funciona correctamente

---

## 🎨 Interfaz Visual

### Colores Correctos:
- [ ] Sincronizados: Verde (#10b981)
- [ ] Pendientes: Amarillo (#f59e0b)
- [ ] Botones primarios: Azul (#1F3A93)
- [ ] Fondo: Gris claro (#f8f9fa)

### Iconografía:
- [ ] MapPin para ubicación
- [ ] CheckCircle para sincronizado
- [ ] Clock para pendiente
- [ ] Download para exportar
- [ ] Trash2 para eliminar

### Badges y Labels:
- [ ] "✓ Sincronizado" en verde
- [ ] "⏱ Pendiente" en amarillo
- [ ] Contadores numéricos precisos
- [ ] Nombres de usuario correctos

---

## 🧮 Cálculos Correctos

### Test: Diferencia de Lecturas
1. [ ] Lectura Anterior: 100
2. [ ] Lectura Actual: 125
3. [ ] Diferencia mostrada: 25 ✓
4. [ ] Se calcula correctamente en todas las lecturas

---

## 📊 Dashboard Completo

### Test: Estadísticas
1. [ ] Total de lecturas: número correcto
2. [ ] Sincronizadas: coincide con cantidad de verdes
3. [ ] Pendientes: coincide con cantidad de amarillos
4. [ ] Los 3 números suman al total

### Test: Tabs
- [ ] "Nueva Lectura" muestra formulario
- [ ] "Historial" muestra lista de lecturas
- [ ] Puedo cambiar entre tabs

### Test: Estado de Conexión
- [ ] Tarjeta superior refleja estado real
- [ ] Cambia en tiempo real al conectar/desconectar
- [ ] Botón "Sincronizar" solo aparece con conexión + pendientes

---

## 🔒 Seguridad Básica

- [ ] Las contraseñas no se ven en el código
- [ ] Los datos se guardan en localStorage (encriptarían en producción)
- [ ] No hay información sensible en el mapa

---

## ⚡ Performance

- [ ] Formulario responde rápido
- [ ] Mapa carga en <3 segundos
- [ ] Historial con 20+ lecturas se scrollea fluido
- [ ] Exportación es instantánea
- [ ] Sincronización completa en <2 segundos

---

## 📋 Resumen Final

| Feature | ✓ Funcional | Notas |
|---|---|---|
| Mapa Interactivo | [ ] | |
| Geocoding Automático | [ ] | |
| Selección Ubicación | [ ] | |
| GPS Nativo | [ ] | |
| Fotos | [ ] | |
| Estado Online/Offline | [ ] | |
| Auto-Sincronización | [ ] | |
| Sincronización Manual | [ ] | |
| Exportar JSON | [ ] | |
| Exportar CSV | [ ] | |
| Exportar Backup | [ ] | |
| Exportar Reporte | [ ] | |
| Historial Completo | [ ] | |
| Cálculos Correctos | [ ] | |
| Responsividad Móvil | [ ] | |
| Colores Correctos | [ ] | |
| Datos Persistentes | [ ] | |

---

## 🚀 Lista para Producción

Una vez todos los puntos estén marcados ✓, la app está lista para:
- [ ] Subir a Vercel
- [ ] Desplegar en servidor propio
- [ ] Publicar en app stores
- [ ] Usar con clientes reales

---

**¡Completaste el testing cuando todos los checkboxes estén marcados!** ✅

