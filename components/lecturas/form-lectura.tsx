'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore, Lectura } from '@/lib/store'
import { medidorService, CATEGORIA_COLORES, MedidorInfo } from '@/lib/medidor-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Camera, Send, AlertCircle, Loader2, Search, CheckCircle, AlertTriangle, Phone, MapPinOff, AlertCircleIcon } from 'lucide-react'
import { MapSelectorModal } from '@/components/maps/map-selector-modal'

const generateId = () => Math.random().toString(36).substr(2, 9)

interface FormLecturaProps {
  onSuccess?: () => void
}

export function FormLectura({ onSuccess }: FormLecturaProps) {
  const { agregarLectura, agregarMedidorLeido, setLoading, loading, usuario } = useStore()
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
      
      // Obtener lecturas locales del store para este medidor
      const { lecturas } = useStore.getState()
      const lecturasLocalesParaMedidor = lecturas.filter(l => l.idMedidor === medidor.id.toString())
      
      // Combinar lecturas del API con lecturas locales
      const todasLasLecturas = [
        ...medidor.lecturas.map(l => ({ ...l, fechaLectura: l.fechaLectura || l.createdAt })),
        ...lecturasLocalesParaMedidor
      ].sort((a, b) => new Date(b.fechaLectura || b.createdAt).getTime() - new Date(a.fechaLectura || a.createdAt).getTime())

      // Actualizar el medidor con todas las lecturas
      const medidorConLecturasCompletas = {
        ...medidor,
        lecturas: todasLasLecturas
      }

      setMedidorBuscado(medidorConLecturasCompletas)
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

    // Validaciones según estado del medidor
    if (medidorBuscado.estado === 'DANADO') {
      if (!foto) {
        setFormError('MEDIDOR DAÑADO: Debes capturar una foto de evidencia')
        return
      }
      if (!formData.observaciones.trim()) {
        setFormError('MEDIDOR DAÑADO: Debes proporcionar un contexto/descripción del daño')
        return
      }
    }

    if (medidorBuscado.estado === 'REEMPLAZADO') {
      if (!gpsData) {
        setFormError('MEDIDOR REEMPLAZADO: Debes marcar la nueva ubicación en el mapa')
        return
      }
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

      // Obtener la lectura anterior
      const ultimaLectura = medidorBuscado.lecturas.length > 0 ? medidorBuscado.lecturas[0] : null
      const lecturaAnterior = ultimaLectura ? ultimaLectura.lecturaActual : medidorBuscado.lecturaInicial

      if (lecturaActual < lecturaAnterior) {
        setFormError('La lectura actual no puede ser menor que la lectura anterior')
        return
      }

      const consumo = medidorService.calcularConsumo(lecturaAnterior, lecturaActual)

      const lectura: Lectura = {
        id: generateId(),
        idMedidor: medidorBuscado.id.toString(),
        tecnicoId: usuario?.id,
        tecnicoNombre: usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : undefined,
        lecturaAnterior,
        lecturaActual,
        consumoM3: consumo,
        fechaLectura: new Date().toISOString(),
        gps: gpsData || undefined,
        latitud: gpsData?.lat,
        longitud: gpsData?.lng,
        foto: foto || undefined,
        observaciones: formData.observaciones || undefined,
        direccion: medidorBuscado.ciudadano.direccion,
        estado: isOnline ? 'sincronizada' : 'pendiente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        medidorEstado: medidorBuscado.estado,
      }

      agregarLectura(lectura)

      agregarMedidorLeido({
        idMedidor: medidorBuscado.id.toString(),
        nombrePersona: `${medidorBuscado.ciudadano.usuario.nombre} ${medidorBuscado.ciudadano.usuario.apellido || ''}`.trim(),
        categoria: medidorBuscado.ciudadano.categoria.nombre,
        tiempoLectura: new Date().toISOString(),
      })

      let tipoMsg = ''
      if (medidorBuscado.estado === 'DANADO') {
        tipoMsg = '\n⚠️ Registrado como MEDIDOR DAÑADO con evidencia fotográfica'
      } else if (medidorBuscado.estado === 'REEMPLAZADO') {
        tipoMsg = '\n🔄 Registrado como MEDIDOR REEMPLAZADO con nueva ubicación'
      }

      const estadoMsg = isOnline ? 'Sincronizada ✓' : 'Guardada localmente - Se sincronizará después'
      alert(`Lectura registrada: ${consumo} m³\n${estadoMsg}${tipoMsg}`)

      setMedidorBuscado(null)
      setMedidorInput('')
      setFormData({ lecturaActual: '', observaciones: '' })
      setGpsData(null)
      setFoto('')
      onSuccess?.()

      if (isOnline) {
        setLoading(true)
        setTimeout(() => setLoading(false), 1000)
      }
    } catch (error) {
      console.error('[v0] Error al registrar lectura:', error)
      alert('Error al registrar la lectura: ' + (error instanceof Error ? error.message : 'Desconocido'))
    }
  }

  const colorCategoria = medidorBuscado ? medidorService.getColorCategoria(medidorBuscado.ciudadano.categoria.nombre) : null
  const { lecturas } = useStore()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Búsqueda de Medidor */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Número de Medidor</label>
        <div className="flex gap-2">
          <Input
            type="text"
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
        <div className="space-y-3">
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
                      {medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].lecturaActual} m³ - {medidorService.formatearFecha(medidorBuscado.lecturas[medidorBuscado.lecturas.length - 1].fechaLectura)}
                    </p>
                  </div>
                )}
              </div>
              <CheckCircle size={24} style={{ color: colorCategoria.color }} className="flex-shrink-0" />
            </div>
          </div>

          {/* ALERTAS POR ESTADO */}
          {medidorBuscado.estado === 'RETIRADO' && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700">Medidor Retirado</p>
                  <p className="text-sm text-red-600 mt-1">Este medidor ha sido retirado del servicio.</p>
                  <p className="text-sm text-red-600 font-semibold mt-2">⚠️ DEBE COMUNICARSE A LAS OFICINAS ANTES DE PROCEDER</p>
                </div>
              </div>
            </div>
          )}

          {medidorBuscado.estado === 'DANADO' && (
            <div className="p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircleIcon size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-700">Medidor Dañado</p>
                  <p className="text-sm text-orange-600 mt-1">Se requiere capturar una foto de evidencia y describir el daño.</p>
                </div>
              </div>
            </div>
          )}

          {medidorBuscado.estado === 'REEMPLAZADO' && (
            <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPinOff size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-700">Medidor Reemplazado</p>
                  <p className="text-sm text-blue-600 mt-1">Se requiere marcar la nueva ubicación en el mapa.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {medidorBuscado && medidorBuscado.estado !== 'RETIRADO' && (
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

          {/* CAMPOS CONDICIONALES */}
          {medidorBuscado.estado === 'REEMPLAZADO' && (
            <Button
              type="button"
              onClick={() => setMapModalOpen(true)}
              className={`w-full flex items-center justify-center gap-2 ${gpsData ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold`}
            >
              <MapPin size={18} />
              {gpsData ? `✓ Nueva ubicación marcada: ${gpsData.lat.toFixed(4)}, ${gpsData.lng.toFixed(4)}` : '⚠️ MARCAR NUEVA UBICACIÓN EN MAPA (Obligatorio)'}
            </Button>
          )}

          {medidorBuscado.estado !== 'REEMPLAZADO' && (
            <Button
              type="button"
              onClick={() => setMapModalOpen(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              {gpsData ? 'Ubicación marcada' : 'Marcar en mapa'}
            </Button>
          )}

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

          {/* Foto - Requerida si está DAÑADO */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Foto de evidencia
              {medidorBuscado.estado === 'DANADO' && <span className="text-red-600"> *</span>}
            </label>
            <Button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 ${
                medidorBuscado.estado === 'DANADO' && !foto ? 'bg-red-600 hover:bg-red-700 text-white' : ''
              }`}
              variant={medidorBuscado.estado === 'DANADO' && !foto ? undefined : 'outline'}
            >
              {foto ? (
                <>
                  <CheckCircle size={18} className="text-green-600" />
                  Foto capturada ✓
                </>
              ) : medidorBuscado.estado === 'DANADO' ? (
                <>
                  <AlertTriangle size={18} />
                  CAPTURAR FOTO (Obligatorio)
                </>
              ) : (
                <>
                  <Camera size={18} />
                  Capturar foto
                </>
              )}
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

          {/* Observaciones - Requeridas si está DAÑADO */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              {medidorBuscado.estado === 'DANADO' ? 'Contexto/Descripción del Daño' : 'Observaciones'}
              {medidorBuscado.estado === 'DANADO' && <span className="text-red-600"> *</span>}
            </label>
            <textarea
              name="observaciones"
              placeholder={
                medidorBuscado.estado === 'DANADO'
                  ? 'Ej: Medidor roto, vidrio roto, herrumbre, etc.'
                  : 'Ej: Casa cerrada, medidor inaccesible, etc.'
              }
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg resize-none ${
                medidorBuscado.estado === 'DANADO' && !formData.observaciones.trim()
                  ? 'border-red-500 bg-red-50'
                  : 'border-border'
              }`}
            />
            {medidorBuscado.estado === 'DANADO' && !formData.observaciones.trim() && (
              <p className="text-xs text-red-600 mt-1">⚠️ Requerido para medidores dañados</p>
            )}
          </div>

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

          <Button
            type="submit"
            disabled={
              loading || 
              !medidorBuscado || 
              !formData.lecturaActual ||
              (medidorBuscado.estado === 'DANADO' && (!foto || !formData.observaciones.trim())) ||
              (medidorBuscado.estado === 'REEMPLAZADO' && !gpsData)
            }
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {loading ? 'Registrando lectura...' : 'Registrar lectura'}
          </Button>
        </>
      )}

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
