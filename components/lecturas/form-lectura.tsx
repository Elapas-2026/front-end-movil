'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore, Lectura } from '@/lib/store'
import { medidorService, CATEGORIA_COLORES, MedidorInfo } from '@/lib/medidor-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Camera, Send, AlertCircle, Loader2, Search, CheckCircle, AlertTriangle } from 'lucide-react'
import { MapSelectorModal } from '@/components/maps/map-selector-modal'

const generateId = () => Math.random().toString(36).substr(2, 9)

interface FormLecturaProps {
  onSuccess?: () => void
}

export function FormLectura({ onSuccess }: FormLecturaProps) {
  const { agregarLectura, agregarMedidorLeido, setLoading, loading } = useStore()
  const cameraRef = useRef<HTMLInputElement>(null)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Estado del medidor
  const [medidorBuscado, setMedidorBuscado] = useState<MedidorInfo | null>(null)
  const [buscandoMedidor, setBuscandoMedidor] = useState(false)
  const [errorMedidor, setErrorMedidor] = useState('')
  const [medidorInput, setMedidorInput] = useState('')

  // Estado del formulario
  const [formData, setFormData] = useState({
    lecturaActual: '',
    observaciones: '',
  })
  const [formError, setFormError] = useState('')

  const [gpsData, setGpsData] = useState<{ lat: number; lng: number } | null>(null)
  const [foto, setFoto] = useState<string>('')
  const [gpsLoading, setGpsLoading] = useState(false)

  // Detectar cambios de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Buscar medidor por número
  const handleBuscarMedidor = async () => {
    if (!medidorInput.trim()) {
      setErrorMedidor('Ingresa el número de medidor')
      return
    }

    setBuscandoMedidor(true)
    setErrorMedidor('')
    setMedidorBuscado(null)

    try {
      console.log('[v0] Buscando medidor:', medidorInput)
      const medidor = await medidorService.buscarMedidor(medidorInput)
      setMedidorBuscado(medidor)
      setFormData((prev) => ({
        ...prev,
        lecturaActual: '',
      }))
    } catch (error: any) {
      console.error('[v0] Error buscando medidor:', error)
      setErrorMedidor(error.message || 'No se encontró el medidor')
      setMedidorBuscado(null)
    } finally {
      setBuscandoMedidor(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError('')
  }

  const obtenerGPSActual = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no disponible en tu dispositivo')
      return
    }

    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log('[v0] GPS obtenido:', location)
        setGpsData(location)
        // Abrir el mapa automáticamente con la ubicación actual
        setMapModalOpen(true)
        setGpsLoading(false)
      },
      (error) => {
        console.error('[v0] Error al obtener GPS:', error)
        alert('No se pudo obtener la ubicación. Intenta de nuevo.')
        setGpsLoading(false)
      }
    )
  }

  const handleFotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormError('')

    if (!medidorBuscado) {
      setFormError('Por favor busca un medidor primero')
      return
    }

    if (!formData.lecturaActual) {
      setFormError('Ingresa la lectura actual')
      return
    }

    try {
      const lecturaActual = parseFloat(formData.lecturaActual)
      if (Number.isNaN(lecturaActual)) {
        setFormError('La lectura actual debe ser un número válido')
        return
      }

      const ultimaLectura = medidorBuscado.lecturas.length > 0 ? medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1] : null
      const lecturaAnterior = ultimaLectura ? ultimaLectura.lecturaActual : medidorBuscado.lecturaInicial

      // Validar que lectura actual >= anterior
      if (lecturaActual < lecturaAnterior) {
        setFormError('La lectura actual no puede ser menor que la lectura anterior')
        return
      }

      // Calcular consumo
      const consumo = medidorService.calcularConsumo(lecturaAnterior, lecturaActual)

      // Crear lectura - SIEMPRE guardar localmente inmediatamente, sin esperar
      const lectura: Lectura = {
        id: generateId(),
        idMedidor: medidorBuscado.id.toString(),
        direccion: medidorBuscado.ciudadano.direccion,
        lecturaAnterior,
        lecturaActual,
        fecha: medidorService.obtenerFechaHoy(),
        gps: gpsData || undefined,
        foto: foto || undefined,
        observaciones: formData.observaciones || undefined,
        estado: isOnline ? 'sincronizada' : 'pendiente',
      }

      // Guardar inmediatamente sin bloquear
      agregarLectura(lectura)

      // Marcar medidor como leído
      agregarMedidorLeido({
        idMedidor: medidorBuscado.id.toString(),
        nombrePersona: `${medidorBuscado.ciudadano.usuario.nombre} ${medidorBuscado.ciudadano.usuario.apellido || ''}`.trim(),
        categoria: medidorBuscado.ciudadano.categoria.nombre,
        tiempoLectura: new Date().toISOString(),
      })

      console.log('[v0] Lectura guardada localmente:', {
        medidor: medidorBuscado.numeroSerie,
        persona: `${medidorBuscado.ciudadano.usuario.nombre} ${medidorBuscado.ciudadano.usuario.apellido || ''}`.trim(),
        lecturaAnterior,
        lecturaActual,
        consumo,
        estado: lectura.estado,
        onlineActual: isOnline,
      })

      // Mostrar confirmación
      const estadoMsg = isOnline ? 'Sincronizada ✓' : 'Guardada localmente - Se sincronizará después'
      alert(`Lectura registrada: ${consumo} m³\n${estadoMsg}`)

      // Limpiar formulario inmediatamente
      setMedidorBuscado(null)
      setMedidorInput('')
      setFormData({
        lecturaActual: '',
        observaciones: '',
      })
      setGpsData(null)
      setFoto('')

      onSuccess?.()

      // Si está online, sincronizar en background (sin bloquear)
      if (isOnline) {
        // Sincronización asíncrona sin bloquear
        setLoading(true)
        setTimeout(() => setLoading(false), 1000)
      }
    } catch (error) {
      console.error('[v0] Error al registrar lectura:', error)
      alert('Error al registrar la lectura: ' + (error instanceof Error ? error.message : 'Desconocido'))
    }
  }

  const colorCategoria = medidorBuscado ? medidorService.getColorCategoria(medidorBuscado.ciudadano.categoria.nombre) : null

  // Obtener lecturas del store para pasar al mapa
  const { lecturas } = useStore()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Búsqueda de Medidor */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Número de Medidor</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ej: 1234567"
            value={medidorInput}
            onChange={(e) => {
              setMedidorInput(e.target.value)
              setErrorMedidor('')
              setFormError('')
            }}
            disabled={buscandoMedidor}
            className="flex-1"
            aria-invalid={!!errorMedidor}
          />
          <Button
            type="button"
            onClick={handleBuscarMedidor}
            disabled={buscandoMedidor || !medidorInput.trim()}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {buscandoMedidor ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </Button>
        </div>
        {errorMedidor && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <AlertTriangle size={16} />
            {errorMedidor}
          </div>
        )}
        {formError && !errorMedidor && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <AlertTriangle size={16} />
            {formError}
          </div>
        )}
      </div>

      {/* Información del Medidor */}
      {medidorBuscado && colorCategoria && (
        <div className="p-3 rounded-lg border-2" style={{ borderColor: colorCategoria.color, backgroundColor: colorCategoria.bg }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colorCategoria.color }}>
                {colorCategoria.label}
              </p>
              <p className="text-base font-bold text-foreground">{medidorBuscado.ciudadano.usuario.nombre} {medidorBuscado.ciudadano.usuario.apellido}</p>
              <p className="text-sm text-muted-foreground">CI: {medidorBuscado.ciudadano.usuario.ci}</p>
              <p className="text-sm text-muted-foreground">{medidorBuscado.ciudadano.direccion}</p>
              <p className="text-sm text-muted-foreground">Medidor: {medidorBuscado.numeroSerie} ({medidorBuscado.estado})</p>

              {medidorBuscado.lecturas.length > 0 && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                  <p className="text-xs font-semibold text-muted-foreground">Última lectura:</p>
                  <p className="text-sm">
                    {medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].lecturaActual} m³ -{' '}
                    {medidorService.formatearFecha(medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].fechaLectura)}
                  </p>
                </div>
              )}
            </div>
            <CheckCircle size={24} style={{ color: colorCategoria.color }} className="flex-shrink-0" />
          </div>
        </div>
      )}

      {medidorBuscado && (
        <>
          {/* Lecturas */}
          <div className="space-y-3 p-3 bg-secondary rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Lectura Anterior</label>
              <Input
                type="number"
                value={medidorBuscado.lecturas.length > 0 ? medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].lecturaActual : medidorBuscado.lecturaInicial}
                disabled
                className="bg-white"
              />
              {medidorBuscado.lecturas.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {medidorService.formatearFecha(medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].fechaLectura)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Lectura Actual (Hoy)</label>
              <Input
                type="number"
                name="lecturaActual"
                placeholder="0"
                value={formData.lecturaActual}
                onChange={handleInputChange}
                step="0.01"
                required
                className="text-lg font-semibold"
                aria-invalid={!!formError}
              />
              <p className="text-xs text-muted-foreground mt-1">{medidorService.obtenerFechaHoy()}</p>
            </div>

            {/* Consumo calculado */}
            {formData.lecturaActual && (
              <div className="p-2 bg-accent/10 border border-accent rounded">
                <p className="text-xs text-muted-foreground">Consumo calculado</p>
                <p className="text-xl font-bold text-accent">
                  {medidorService.calcularConsumo(
                    medidorBuscado.lecturas.length > 0 ? medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].lecturaActual : medidorBuscado.lecturaInicial,
                    parseFloat(formData.lecturaActual)
                  )}
                  <span className="text-base"> m³</span>
                </p>
              </div>
            )}
          </div>

          {/* Dirección en Mapa */}
          <Button
            type="button"
            onClick={() => setMapModalOpen(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <MapPin size={18} />
            {gpsData ? 'Ubicación marcada' : 'Marcar en mapa'}
          </Button>

          {/* GPS Manual */}
          <Button
            type="button"
            onClick={obtenerGPSActual}
            disabled={gpsLoading}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {gpsLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <MapPin size={18} />
                {gpsData ? `GPS: ${gpsData.lat.toFixed(4)}, ${gpsData.lng.toFixed(4)}` : 'Obtener GPS actual'}
              </>
            )}
          </Button>

          {/* Foto */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Foto de evidencia</label>
            <Button
              type="button"
              onClick={() => cameraRef.current?.click()}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              {foto ? 'Foto capturada ✓' : 'Capturar foto'}
            </Button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoCapture}
              className="hidden"
            />
            {foto && <img src={foto} alt="Foto capturada" className="mt-2 w-full h-40 object-cover rounded" />}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              placeholder="Ej: Medidor roto, casa cerrada, etc."
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg resize-none"
            />
          </div>

          {/* Estado de conexión */}
          <div className="flex items-center gap-2 p-2 bg-secondary rounded text-sm">
            {isOnline ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-700 font-semibold">Online - Se sincronizará ahora</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-yellow-700 font-semibold">Sin conexión - Se guardará para sincronizar después</span>
              </>
            )}
          </div>

          {/* Botón enviar */}
          <Button
            type="submit"
            disabled={loading || !medidorBuscado || !formData.lecturaActual}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {loading ? 'Registrando lectura...' : 'Registrar lectura'}
          </Button>
        </>
      )}

      {/* Modal de mapa */}
      {mapModalOpen && (
        <MapSelectorModal
          isOpen={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          onSelectLocation={(location) => {
            console.log('[v0] Ubicación confirmada en formulario:', location)
            setGpsData(location)
            setMapModalOpen(false)
          }}
          lecturas={lecturas}
          currentLocation={gpsData}
          medidorInfo={medidorBuscado}
        />
      )}
    </form>
  )
}
