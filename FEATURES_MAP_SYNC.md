# Nuevas Características: Mapa Interactivo y Sincronización Offline

## 📍 Mapa Interactivo con Leaflet

### Características:
- **Visualización de todas las lecturas registradas** en un mapa interactivo
- **Marcadores de color diferenciado**:
  - Verde: Lecturas sincronizadas
  - Amarillo: Lecturas pendientes
- **Información en popup** al hacer clic en un marcador (ID medidor, dirección, estado, fecha)
- **Ubicación actual** mostrada como círculo azul
- **Búsqueda y selección de ubicación** en el mapa
- **Geocoding inverso automático** (obtiene dirección desde coordenadas)
- **Opción de ingresar dirección manualmente** si el auto-complete falla

### Archivos Creados:
- `components/maps/mapa-lecturas.tsx` - Componente del mapa
- `components/maps/map-selector-modal.tsx` - Modal para seleccionar ubicación
- `lib/geocoding.ts` - Servicios de geocoding (OpenStreetMap/Nominatim)

### Cómo Usar:
1. En el formulario de lectura, presiona el botón "Mapa"
2. El modal se abre mostrando un mapa interactivo
3. Haz clic en el mapa para seleccionar la ubicación exacta
4. La dirección se obtiene automáticamente (reverse geocoding)
5. Puedes editar la dirección manualmente si es necesario
6. Presiona "Confirmar Ubicación" para guardar

---

## 🔄 Sincronización Inteligente Offline/Online

### Estados de Lectura:
- **PENDIENTE**: Lectura guardada sin conexión internet
- **SINCRONIZADA**: Lectura guardada con conexión o sincronizada exitosamente

### Comportamiento Automático:
1. **Sin conexión**: Las lecturas se guardan como "PENDIENTE"
2. **Con conexión**: Las lecturas se guardan como "SINCRONIZADA"
3. **Reconexión automática**: Al volver la conexión, se sincroniza automáticamente
4. **Indicador de estado**: Verde (conectado) / Amarillo (sin conexión)

### Botón de Sincronización Manual:
- Aparece en el dashboard cuando hay lecturas pendientes y hay conexión
- Presiona para sincronizar todas las lecturas pendientes manualmente
- Muestra contador de pendientes

### Archivos Creados:
- `lib/sync-manager.ts` - Gestor de sincronización y detección de conexión
- `components/lecturas/export-lecturas.tsx` - Modal de exportación

---

## 💾 Exportación de Datos

### Formatos Disponibles:
1. **JSON** - Formato completo para backup
2. **CSV** - Para abrir en Excel o Google Sheets
3. **Backup Completo** - JSON con metadatos
4. **Reporte en Texto** - Resumen legible de todas las lecturas

### Cómo Exportar:
1. En el header del dashboard, presiona el icono de descarga (⬇️)
2. Se abre el modal de exportación
3. Elige el formato que prefieres
4. El archivo se descarga automáticamente

### Características:
- Los archivos se descargan automáticamente
- Incluye nombre y fecha en el archivo
- Disponible para todos los datos (sincronizados + pendientes)
- **Nota**: En navegadores móviles, te pide dónde guardar

---

## 📊 Indicadores Visuales

### Dashboard:
- **Estado de conexión** en tarjeta superior (verde/amarillo)
- **Contador de lecturas** totales
- **Contador de sincronizadas** ✓
- **Contador de pendientes** ⏱
- **Alerta** cuando hay pendientes sin conexión

### Lista de Lecturas:
- **Banda de color izquierdo** (verde = sincronizado, amarillo = pendiente)
- **Badge de estado** (Sincronizado / Pendiente)
- **Información completa**:
  - ID Medidor
  - Dirección
  - Lecturas anterior y actual
  - Diferencia calculada automáticamente
  - Fecha y hora exacta
  - Coordenadas GPS (si disponibles)
  - Miniatura de foto (si existe)
  - Observaciones

---

## 🔗 Integración con API

### Endpoints Preparados (TODO):
```
POST   /api/auth/login              ← Autenticar
POST   /api/auth/register           ← Registrar
POST   /api/lecturas/crear          ← Crear lectura
GET    /api/lecturas/listar         ← Listar lecturas
POST   /api/sync/lecturas           ← Sincronizar pendientes
```

### Cómo Conectar:
1. Abre `lib/sync-manager.ts`
2. Descomenta la sección de `fetch` en `syncPendingLecturas()`
3. Abre `components/maps/map-selector-modal.tsx`
4. El geocoding ya usa API pública (OpenStreetMap)

---

## 🛠️ Dependencias Nuevas Agregadas

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "axios": "^1.15.2"
  }
}
```

---

## 📱 Compatibilidad Móvil

- ✅ Carga dinámica de mapas (evita SSR issues)
- ✅ Geolocalización nativa del navegador
- ✅ Cámara para fotos
- ✅ Almacenamiento local persistente
- ✅ Detección automática de conexión
- ✅ Modal responsive (pantalla completa en móvil)

---

## 🔍 Consideraciones Técnicas

### Geocoding:
- Usa **Nominatim** de OpenStreetMap (gratis, sin apikey)
- Limit de ~1 request/segundo
- Requiere header `User-Agent`
- Cache no automático (considera agregar)

### Mapas:
- Carga dinámica con Next.js `dynamic()`
- Tile layer por defecto: OpenStreetMap
- Compatible con zoom 1-19
- Cluster markers si hay muchos (considera agregar)

### Sincronización:
- Evento `online/offline` del navegador
- Auto-sync inmediato al restaurar conexión
- Almacenamiento persistente con Zustand
- TODO: Implementar queue para fallos

---

## 💡 Mejoras Futuras Sugeridas

1. **Cluster de marcadores** para muchas lecturas
2. **Caché de geocoding** para direcciones frecuentes
3. **Queue de sincronización** para reintentos
4. **Sincronización en background** con Web Workers
5. **Importación de datos** (CSV/JSON)
6. **Filtros avanzados** en lista de lecturas
7. **Búsqueda por ID medidor** o dirección
8. **Estadísticas** por período
9. **Modo offline mejorado** con Service Workers
10. **Notificaciones** de sincronización

---

## 🧪 Testing

### Simular Sin Conexión:
```javascript
// En la consola del navegador:
// Para Firefox DevTools:
// Presiona F12 → Red → Offline

// Código manual:
navigator.onLine = false // (no funcionará, es read-only)
// Usa Chrome DevTools Network throttling en su lugar
```

### Pruebas Recomendadas:
1. Registra lectura SIN conexión → debe guardar como "PENDIENTE"
2. Activa conexión → debe sincronizar automáticamente
3. Usa el mapa → marca exactamente dónde
4. Exporta datos → descarga en diferentes formatos
5. Prueba GPS real en dispositivo móvil

---

## 🐛 Troubleshooting

### El mapa no carga:
- Verifica que Leaflet CSS esté importado en `globals.css`
- Comprueba la consola del navegador por errores
- En Next.js, asegúrate que está usando `dynamic()`

### Geocoding falla:
- Nominatim puede estar overloaded
- Intenta en 30 segundos
- Ingresa dirección manualmente como alternativa

### Sincronización no funciona:
- Verifica que `navigator.onLine` funciona
- Abre DevTools → Application → Storage
- Comprueba que localStorage tiene los datos

### Mapas no muestran marcadores:
- Asegúrate que las lecturas tienen GPS registrado
- Verifica coordenadas válidas en localStorage

---

## 📞 Contacto y Soporte

Para reportar bugs o sugerir mejoras, crea un issue en el repositorio.

