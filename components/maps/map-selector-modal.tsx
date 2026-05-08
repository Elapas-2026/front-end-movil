'use client'

import { useState, useEffect } from 'react'
import { MapPin, X, Loader2, AlertCircle, CheckCircle2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapaLecturas } from './mapa-lecturas'
import { getReverseGeocode } from '@/lib/geocoding'
import { medidorService, MedidorInfo } from '@/lib/medidor-service'
import { elapasApi } from '@/lib/elapas-api'
import { useStore, Lectura } from '@/lib/store'

interface MapSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (location: { lat: number; lng: number }) => void
  lecturas?: Lectura[]
  currentLocation?: { lat: number; lng: number }
  medidorInfo?: MedidorInfo | null
}

export function MapSelectorModal({
  isOpen,
  onClose,
  onSelectLocation,
  lecturas = [],
  currentLocation,
  medidorInfo,
}: MapSelectorModalProps) {
  const { medidoresLeidos } = useStore()
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    currentLocation || null
  )
  const [direccion, setDireccion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchMedidorInput, setSearchMedidorInput] = useState('')
  const [searchingMedidor, setSearchingMedidor] = useState(false)
  const [medidorEnBusqueda, setMedidorEnBusqueda] = useState<MedidorInfo | null>(medidorInfo || null)

  // Buscar medidor en modal
  const handleBuscarMedidor = async () => {
    if (!searchMedidorInput.trim()) {
      return
    }

    setSearchingMedidor(true)
    try {
      console.log('[v0] Buscando medidor en modal:', searchMedidorInput)
      const medidor = await medidorService.buscarMedidor(searchMedidorInput)
      setMedidorEnBusqueda(medidor)
      setSearchMedidorInput('')
    } catch (error: any) {
      alert(error.message || 'Medidor no encontrado')
      setMedidorEnBusqueda(null)
    } finally {
      setSearchingMedidor(false)
    }
  }

  // Obtener dirección cuando se selecciona una ubicación
  useEffect(() => {
    if (selectedLocation) {
      setLoading(true)
      setError('')
      getReverseGeocode(selectedLocation.lat, selectedLocation.lng)
        .then((result) => {
          setDireccion(result.address)
          setLoading(false)
        })
        .catch((err) => {
          console.error('[v0] Error al obtener dirección:', err)
          setError('No se pudo obtener la dirección automáticamente')
          setDireccion('Dirección desconocida')
          setLoading(false)
        })
    }
  }, [selectedLocation])

  const handleConfirm = () => {
    if (!selectedLocation) {
      setError('Por favor selecciona una ubicación en el mapa')
      return
    }

    onSelectLocation({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    })
    onClose()
  }

  // Verificar si el medidor ya fue leído
  const medidorYaLeido = medidorEnBusqueda ? medidoresLeidos.find((m) => m.idMedidor === medidorEnBusqueda.id.toString()) : null
  const medidorActual = medidorEnBusqueda || medidorInfo

  if (!isOpen) return null

  const colorCategoria = medidorActual ? medidorService.getColorCategoria(medidorActual.ciudadano.categoria.nombre) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-full sm:max-w-2xl rounded-t-2xl sm:rounded-lg shadow-lg max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header con búsqueda */}
        <div className="border-b border-border sticky top-0 bg-white">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin size={24} className="text-primary" />
              Marcar en Mapa
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X size={24} />
            </button>
          </div>

          {/* Búsqueda de medidor en el modal */}
          <div className="px-4 pb-3 flex gap-2">
            <Input
              type="text"
              placeholder="Buscar medidor..."
              value={searchMedidorInput}
              onChange={(e) => setSearchMedidorInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscarMedidor()}
              disabled={searchingMedidor}
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              onClick={handleBuscarMedidor}
              disabled={searchingMedidor || !searchMedidorInput.trim()}
              size="sm"
              className="bg-primary hover:bg-primary-dark text-white"
            >
              {searchingMedidor ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </Button>
          </div>
        </div>

        {/* Info del medidor */}
        {medidorActual && colorCategoria && (
          <div className="p-3 border-b border-border space-y-2" style={{ backgroundColor: colorCategoria.bg }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: colorCategoria.color }}>
                  {colorCategoria.label}
                </p>
                <p className="text-base font-bold text-foreground">{medidorActual.ciudadano.usuario.nombre} {medidorActual.ciudadano.usuario.apellido}</p>
                <p className="text-sm text-muted-foreground">Medidor: {medidorActual.numeroSerie} ({medidorActual.estado})</p>
                <p className="text-xs text-muted-foreground mt-1">{medidorActual.ciudadano.direccion}</p>
                <p className="text-xs text-muted-foreground">CI: {medidorActual.ciudadano.usuario.ci} | Cliente: {medidorActual.ciudadano.codigoCliente}</p>
                <p className="text-xs text-muted-foreground">Distrito: {medidorActual.ciudadano.distrito.nombre}</p>
                {medidorActual.lecturas.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Última lectura: {medidorActual.lecturas[medidorActual.lecturas.length - 1].lecturaActual} m³ ({new Date(medidorActual.lecturas[medidorActual.lecturas.length - 1].fechaLectura).toLocaleDateString()})
                  </p>
                )}
              </div>
              {medidorYaLeido ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-xs font-semibold text-green-600">Leído</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded">
                  <MapPin size={16} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">Marcando</span>
                </div>
              )}
            </div>

            {/* Advertencia si ya fue leído */}
            {medidorYaLeido && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-700">
                  <p className="font-semibold">Este medidor ya fue leído</p>
                  <p className="text-xs text-yellow-600 mt-0.5">
                    Leído por: {medidorYaLeido.nombrePersona}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mapa */}
        <div className="relative h-96">
          <MapaLecturas
            lecturas={lecturas}
            ubicacionActual={selectedLocation || currentLocation}
            onSelectLocation={(location) => {
              console.log('[v0] Ubicación seleccionada en mapa:', location)
              setSelectedLocation(location)
            }}
          />
        </div>

        {/* Información de ubicación seleccionada */}
        {selectedLocation && (
          <div className="p-4 border-b border-border space-y-3 bg-secondary">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Coordenadas</label>
              <p className="text-sm font-mono text-muted-foreground">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Dirección</label>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Obteniendo dirección...
                </div>
              ) : (
                <>
                  <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Puedes editar la dirección si es necesario
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 p-4 border-t border-border bg-gray-50">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedLocation || loading}
            className="flex-1 bg-primary hover:bg-primary-dark text-white"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} className="mr-2" />
                Confirmar Ubicación
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
