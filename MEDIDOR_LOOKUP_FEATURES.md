# Características de Búsqueda de Medidores y Consumo m³

## Descripción General

La app ahora permite a los técnicos de ELAPAS buscar medidores por número y registrar lecturas con cálculo automático de consumo en m³ (metros cúbicos).

---

## 1. Búsqueda de Medidor por ID

### Cómo Funciona

1. En el formulario de "Nueva Lectura"
2. Ingresa el número de medidor
3. Presiona el botón "Buscar" (icono de lupa)
4. La app busca en la API:
   - Datos del medidor
   - Usuario asociado (nombre, CI, categoría)
   - Última lectura registrada (valor y fecha)

### Información Mostrada

Cuando encuentras un medidor, ves:
- **Nombre de la persona**: Juan Pérez
- **CI**: 1234567
- **Categoría**: DOMESTICA, COMERCIAL, SOLIDARIA, EDIFICIO
- **Dirección**: Calle Principal 123
- **Última Lectura**: 150 m³ - hace X tiempo

### Colores por Categoría

- **DOMESTICA**: Azul (#3b82f6)
- **COMERCIAL**: Naranja (#f97316)
- **SOLIDARIA**: Verde (#10b981)
- **EDIFICIO**: Púrpura (#8b5cf6)

---

## 2. Cálculo Automático de Consumo m³

### Lectura Anterior
- Se carga automáticamente de la última lectura registrada
- Muestra la fecha de esa lectura anterior
- No es editable (para evitar errores)

### Lectura Actual
- Ingresa el valor que ves en el medidor HOY
- Se usa la fecha de HOY automáticamente
- Puede ser decimal (Ej: 156.25)

### Consumo Calculado
- Se calcula automáticamente: **Lectura Actual - Lectura Anterior**
- Se muestra en **m³ (metros cúbicos)**
- Se actualiza en tiempo real al escribir

### Ejemplo
```
Lectura Anterior: 150 m³ (hace 30 días)
Lectura Actual:   156 m³ (hoy)
Consumo:          6 m³
```

---

## 3. Marcado en Mapa

### Marcar la Ubicación Exacta

1. Presiona el botón "Marcar en mapa"
2. Se abre modal con mapa interactivo
3. Haz clic exactamente donde está el medidor
4. Se obtiene la dirección automáticamente (Nominatim)
5. Puedes editar la dirección si es necesario
6. Presiona "Confirmar Ubicación"

### Vista de Medidor Leído

Si el medidor ya fue leído:
- Aparece icono ✓ verde
- Muestra quién lo leyó
- Advertencia en amarillo

### Información en Mapa

Cada marcador en el mapa muestra:
- Nombre de la persona
- Dirección
- Categoría
- Fecha de lectura
- Estado (Sincronizada/Pendiente)

---

## 4. Diferenciación por Colores

### En Mapa

Cada marcador tiene el color de su categoría:
- 🔵 Doméstica (Azul)
- 🟠 Comercial (Naranja)
- 🟢 Solidaria (Verde)
- 🟣 Edificio (Púrpura)

### Leyenda de Colores

En la esquina superior derecha del mapa hay una leyenda que muestra todos los colores y sus categorías.

### Información del Marcador

Al hacer clic en un marcador, ves:
- Nombre de la persona
- Dirección
- Categoría (con color)
- Fecha de lectura
- Estado (Sincronizada/Pendiente)

---

## 5. Flujo Completo de Lectura

```
┌─────────────────────────────────┐
│ 1. BUSCAR MEDIDOR               │
│    Ingresa número + Presiona    │
│    botón Buscar                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 2. VER INFORMACIÓN              │
│    - Nombre y CI del usuario    │
│    - Categoría con color        │
│    - Última lectura             │
│    - Dirección                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 3. INGRESAR LECTURA ACTUAL      │
│    Ej: 156.25                   │
│    Consumo calcula automático   │
│    Ej: 6.25 m³                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 4. MARCAR EN MAPA               │
│    Presiona "Marcar en mapa"    │
│    Haz clic en ubicación exacta │
│    Confirma dirección           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 5. OPCIONALES                   │
│    - Capturar GPS               │
│    - Tomar foto                 │
│    - Agregar observaciones      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 6. REGISTRAR LECTURA            │
│    Presiona "Registrar lectura" │
│    Se guarda y sincroniza       │
│    automáticamente (si online)  │
└─────────────────────────────────┘
```

---

## 6. Marcado de Medidores Leídos

### Prevenir Duplicados

Cuando un medidor es leído:
1. Se guarda en la lista de "medidores leídos"
2. Aparece con un checkmark ✓ en el mapa
3. Otros técnicos ven que ya fue leído
4. Muestra quién lo leyó y cuándo

### En el Mapa Modal

Si intentas marcar un medidor que ya fue leído:
- Muestra icono ✓ verde
- Dice "Leído"
- Muestra nombre de quién lo leyó
- Advierte con tarjeta amarilla

---

## 7. Estados de la Lectura

### Pendiente (🟡 Amarillo)
- Registrada pero sin conexión
- Se sincronizará cuando conecte
- Almacenada en localStorage

### Sincronizada (🟢 Verde)
- Registrada y enviada a la API
- Confirmada en el servidor
- Data segura

---

## 8. Información Técnica

### Archivos Nuevos
- `lib/medidor-service.ts` - Servicios de medidor (búsqueda, cálculo, colores)
- `MEDIDOR_LOOKUP_FEATURES.md` - Documentación (este archivo)

### Archivos Modificados
- `lib/elapas-api.ts` - Métodos de búsqueda de medidor y última lectura
- `lib/store.ts` - Estado de medidores leídos
- `components/lecturas/form-lectura.tsx` - Búsqueda e ingreso de lecturas
- `components/maps/mapa-lecturas.tsx` - Colores por categoría
- `components/maps/map-selector-modal.tsx` - Información de medidor leído

### API Endpoints Consumidos
- `GET /medidores/{numero}` - Buscar medidor por número
- `GET /usuarios/{ci}` - Obtener datos del usuario
- `GET /lecturas?medidorId={id}` - Obtener lecturas del medidor

---

## 9. Validaciones

### Búsqueda de Medidor
- Requiere número de medidor (no puede estar vacío)
- Busca en la API
- Muestra error si no encuentra

### Lectura Actual
- Requiere número (no puede estar vacío)
- Acepta decimales
- Calcula consumo en tiempo real

### Marcar en Mapa
- Requiere ubicación seleccionada
- Obtiene dirección automática
- Permite editar dirección

---

## 10. Ejemplos de Uso

### Ejemplo 1: Lectura Doméstica
```
1. Buscar: 1001234
2. Sistema muestra:
   - Juan Pérez
   - CI: 7654321
   - Categoría: DOMESTICA (Azul)
   - Última lectura: 100 m³ (hace 1 mes)
3. Ingresar lectura: 105.5
4. Sistema calcula: Consumo = 5.5 m³
5. Marcar en mapa exactamente donde está
6. Registrar
```

### Ejemplo 2: Lectura Comercial
```
1. Buscar: 2001234
2. Sistema muestra:
   - Restaurante "El Buen Sabor"
   - CI: 8765432
   - Categoría: COMERCIAL (Naranja)
   - Última lectura: 500 m³ (hace 1 mes)
3. Ingresar lectura: 625
4. Sistema calcula: Consumo = 125 m³
5. Marcar en mapa
6. Registrar
```

---

## 11. Preguntas Frecuentes

### ¿Qué pasa si el medidor no existe?
- La app muestra error
- Puedes intentar con otro número
- Verifica que el número sea correcto

### ¿Puedo editar la lectura anterior?
- No, viene de la API
- Es automática para evitar errores
- Si está mal, contacta a administrador

### ¿El consumo puede ser negativo?
- No, la app lo valida
- Si sale negativo, verifica las lecturas
- Lectura actual debe ser >= lectura anterior

### ¿Qué pasa si no hay lectura anterior?
- Se asume lectura anterior = 0
- Se calcula consumo normalmente
- Es normal para medidores nuevos

### ¿Puedo marcar sin ir al mapa?
- Sí, es opcional
- Pero recomendamos marcar para evitar duplicados
- Los técnicos pueden coordinarse mejor

### ¿Se sincronizan automáticamente?
- Sí, si estás online
- Si estás offline, se guardan localmente
- Se sincronizan cuando conectes

---

## 12. Troubleshooting

### "Medidor no encontrado"
- Verifica el número
- Asegúrate de escribir sin espacios
- Intenta nuevamente

### "Error al obtener dirección"
- Problema de internet
- Intenta de nuevo
- Puedes escribir la dirección manualmente

### "No se puede obtener GPS"
- Verifica permisos de geolocalización
- Intenta el mapa manual
- GPS es opcional

### "Lectura no se registra"
- Verifica que hayas buscado un medidor
- Verifica que ingreses lectura actual
- Si está offline, verifica conexión

---

**Documentación actualizada**: Mayo 2026
**Versión**: 2.0 (Con búsqueda de medidor y consumo m³)
