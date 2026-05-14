'use client'

import dynamic from 'next/dynamic'
import { useMemo, useRef, useEffect, useState } from 'react'
import { useStore, Lectura } from '@/lib/store'
import { medidorService, CATEGORIA_COLORES } from '@/lib/medidor-service'

// Carga dinámica de Leaflet para evitar issues de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
})
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false })
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
)

interface MapaLecturasProps {
  lecturas: Lectura[]
  ubicacionActual?: { lat: number; lng: number }
  onSelectLocation?: (location: { lat: number; lng: number }) => void
  onMarcarVerificado?: (lecturaId: number, verificado: boolean) => void
}

// Componente para manejar click en el mapa
function MapClickHandler({ onSelectLocation }: { onSelectLocation?: (location: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => {
      if (onSelectLocation) {
        onSelectLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        })
        console.log('[v0] Click en mapa:', e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// Componente de botón para marcar verificado
function BotonMarcar({
  lecturaId,
  verificado,
  onMarcar,
  isLoading,
}: {
  lecturaId: string | number
  verificado?: boolean
  onMarcar: (lecturaId: string | number, estado: boolean) => void
  isLoading: boolean
}) {
  return (
    <button
      onClick={() => onMarcar(lecturaId, !verificado)}
      disabled={isLoading}
      className={`mt-2 w-full px-3 py-2 rounded text-xs font-semibold text-white transition-all ${
        verificado
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-600 hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? '⏳ Procesando...' : verificado ? '✓ Verificado' : '👆 Marcar Verificado'}
    </button>
  )
}

export function MapaLecturas({
  lecturas,
  ubicacionActual,
  onSelectLocation,
  onMarcarVerificado,
}: MapaLecturasProps) {
  const { medidoresLeidos, medidores } = useStore()
  const mapRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [marcados, setMarcados] = useState<Set<string | number>>(new Set())
  const [cargando, setCargando] = useState<Set<string | number>>(new Set())

  // Centro del mapa - Sucre, Bolivia
  const defaultCenter = ubicacionActual || { lat: -19.0432, lng: -65.2592 }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Centrar mapa cuando cambia ubicacionActual
  useEffect(() => {
    if (isClient && mapRef.current && ubicacionActual) {
      console.log('[v0] Centrando mapa en:', ubicacionActual)
      mapRef.current.setView([ubicacionActual.lat, ubicacionActual.lng], 18)
    }
  }, [ubicacionActual, isClient])

  // Mapear medidores leídos por ID para búsqueda rápida
  const medidoresLeidosMap = useMemo(() => {
    const map = new Map()
    if (medidoresLeidos) {
      medidoresLeidos.forEach((m) => {
        map.set(m.idMedidor, m)
      })
    }
    return map
  }, [medidoresLeidos])

  // Cargar estado de verificación inicial
  useEffect(() => {
    const verificados = new Set<number>()
    lecturas.forEach((l) => {
      if (l.verificado) {
        verificados.add(l.id)
      }
    })
    setMarcados(verificados)
  }, [lecturas])

  // Manejar marcar lectura como verificada
  const handleMarcar = async (lecturaId: string | number, estado: boolean) => {
    try {
      setCargando((prev) => new Set([...prev, lecturaId]))

      await medidorService.marcarLecturaVerificada(lecturaId, estado)

      // Actualizar estado local
      setMarcados((prev) => {
        const nuevo = new Set(prev)
        if (estado) {
          nuevo.add(lecturaId)
        } else {
          nuevo.delete(lecturaId)
        }
        return nuevo
      })

      // Callback opcional
      if (onMarcarVerificado) {
        onMarcarVerificado(lecturaId, estado)
      }

      console.log('[v0] Lectura marcada:', lecturaId, estado)
    } catch (error) {
      console.error('[v0] Error al marcar lectura:', error)
      alert('Error al marcar la lectura. Intenta de nuevo.')
    } finally {
      setCargando((prev) => {
        const nuevo = new Set(prev)
        nuevo.delete(lecturaId)
        return nuevo
      })
    }
  }

  const markers = useMemo(() => {
    // Crear marcadores de todas las mediciones registradas
    const lecturaMarkers = lecturas
      .filter((l) => l.gps)
      .map((lectura) => {
        const medidorLeido = medidoresLeidosMap.get(lectura.medidorId)
        const categoria = medidorLeido?.categoria || 'DOMESTICA'
        const color = medidorService.getColorCategoria(categoria)

        return {
          id: lectura.id,
          lat: lectura.latitud || lectura.gps?.lat || 0,
          lng: lectura.longitud || lectura.gps?.lng || 0,
          estado: lectura.estado,
          idMedidor: lectura.medidorId,
          direccion: medidorLeido?.nombrePersona || lectura.direccion || 'Desconocido',
          fecha: new Date(lectura.fechaLectura).toLocaleString(),
          nombrePersona: medidorLeido?.nombrePersona || lectura.direccion || 'Desconocido',
          categoria,
          color: color.color,
          tipo: 'lectura' as const,
          verificado: lectura.verificado || false,
          lectura: lectura,
          tecnicoNombre: lectura.tecnicoNombre,
          tecnicoId: lectura.tecnicoId,
        }
      })

    // NUEVO: Agregar todos los medidores registrados con GPS
    const medidoresMap = new Map()
    if (medidores) {
      medidores.forEach((med: any) => {
        if (med.gps && med.usuarioId) {
          medidoresMap.set(med.id, med)
        }
      })
    }

    // Obtener información de usuarios de las lecturas
    const usuariosMapa = new Map()
    lecturas.forEach((l) => {
      if (l.medidorId && !usuariosMapa.has(l.medidorId)) {
        const medidorLeido = medidoresLeidosMap.get(l.medidorId)
        if (medidorLeido) {
          usuariosMapa.set(l.medidorId, medidorLeido)
        }
      }
    })

    // Agregar marcadores de medidores que aún no tienen lecturas
    const medidoresMarkers = Array.from(medidoresMap.values()).map((med: any) => {
      const medidorInfo = usuariosMapa.get(med.id) || medidoresLeidosMap.get(med.id)
      const categoria = medidorInfo?.categoria || 'DOMESTICA'
      const color = medidorService.getColorCategoria(categoria)

      return {
        id: 'medidor-' + med.id,
        lat: med.gps.lat,
        lng: med.gps.lng,
        estado: 'no-leida' as const,
        idMedidor: med.id,
        direccion: medidorInfo?.nombrePersona ? `${medidorInfo.nombrePersona}` : 'Medidor sin lectura',
        fecha: '',
        nombrePersona: medidorInfo?.nombrePersona || 'Medidor Registrado',
        categoria,
        color: color.color,
        tipo: 'medidor' as const,
        verificado: false,
        lectura: null,
      }
    })

    // Combinar y eliminar duplicados (las lecturas tienen prioridad)
    const allMarkers = [...lecturaMarkers]
    const idsYaAgregados = new Set(lecturaMarkers.map((m) => m.idMedidor))

    medidoresMarkers.forEach((m) => {
      if (!idsYaAgregados.has(m.idMedidor)) {
        allMarkers.push(m)
      }
    })

    return allMarkers
  }, [lecturas, medidores, medidoresLeidosMap])

  // Crear elementos dinámicos para los marcadores con colores
  const createColorIcon = (color: string, verificado: boolean = false) => {
    if (typeof window === 'undefined') return undefined
    const L = require('leaflet')

    return L.divIcon({
      html: `<div style="
        background-color: ${verificado ? '#22c55e' : color};
        border: 3px solid ${verificado ? '#22c55e' : 'white'};
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        transform: ${verificado ? 'scale(1.2)' : 'scale(1)'};
      ">${verificado ? '✓' : '📍'}</div>`,
      className: 'marker-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    })
  }

  if (!isClient) return null

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-border">
      <MapContainer
        ref={mapRef}
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={ubicacionActual ? 18 : 15}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Handler para clicks en el mapa */}
        <MapClickHandler onSelectLocation={onSelectLocation} />

        {/* Ubicación actual - Mostrar con círculo azul y marcador */}
        {ubicacionActual && (
          <>
            <Circle
              center={[ubicacionActual.lat, ubicacionActual.lng]}
              radius={15}
              pathOptions={{ color: '#3b82f6', fill: true, fillColor: '#93c5fd', fillOpacity: 0.3, weight: 2 }}
            />
            <Marker
              position={[ubicacionActual.lat, ubicacionActual.lng]}
              icon={
                typeof window !== 'undefined'
                  ? require('leaflet').icon({
                      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                      popupAnchor: [0, -16],
                    })
                  : undefined
              }
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Ubicación capturada</p>
                  <p className="text-xs text-muted-foreground">
                    {ubicacionActual.lat.toFixed(6)}, {ubicacionActual.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Marcadores de medidores y lecturas */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createColorIcon(marker.color, marker.verificado)}
            eventHandlers={{
              click: () => {
                if (onSelectLocation) {
                  onSelectLocation({ lat: marker.lat, lng: marker.lng })
                }
              },
            }}
          >
            <Popup>
              <div className="text-sm space-y-2 min-w-56">
                <p className="font-semibold text-foreground">{marker.nombrePersona}</p>
                <p className="text-xs text-muted-foreground">{marker.direccion}</p>

                {/* Badge de categoría */}
                <div
                  className="inline-block px-2 py-1 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: marker.color }}
                >
                  {CATEGORIA_COLORES[marker.categoria as keyof typeof CATEGORIA_COLORES]?.label || marker.categoria}
                </div>

                {marker.fecha && <p className="text-xs text-muted-foreground">📅 {marker.fecha}</p>}

                {marker.tecnicoNombre || marker.tecnicoId ? (
                  <p className="text-xs text-muted-foreground">👷 Técnico: {marker.tecnicoNombre || `ID ${marker.tecnicoId}`}</p>
                ) : null}

                {/* Indicador de estado */}
                <div className="flex items-center gap-1">
                  {marker.verificado ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-700 font-semibold">✓ Verificado</span>
                    </>
                  ) : marker.estado === 'CONFIRMADA' ? (
                    <>
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs text-blue-700 font-semibold">📝 Registrado</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-xs text-yellow-700 font-semibold">⏳ Sin lectura</span>
                    </>
                  )}
                </div>

                {/* Botón de marcar (solo si hay una lectura) */}
                {marker.lectura && marker.tipo === 'lectura' && (
                  <BotonMarcar
                    lecturaId={marker.lectura.id}
                    verificado={marker.verificado}
                    onMarcar={handleMarcar}
                    isLoading={cargando.has(marker.lectura.id)}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Leyenda de colores */}
      <div className="absolute top-4 right-4 bg-white border border-border rounded-lg p-3 shadow-lg z-40 max-w-48">
        <p className="text-xs font-semibold text-foreground mb-2">📊 Categorías</p>
        <div className="space-y-2">
          {Object.entries(CATEGORIA_COLORES).map(([key, { color, label }]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        
        <hr className="my-2" />
        
        <p className="text-xs font-semibold text-foreground mb-2">📌 Estados</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span className="text-muted-foreground">Verificado</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="text-muted-foreground">Registrado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
