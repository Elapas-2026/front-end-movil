'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { elapasApi } from '@/lib/elapas-api'
import { Header } from '@/components/layout/header'
import { FormLectura } from '@/components/lecturas/form-lectura'
import { ListaLecturas } from '@/components/lecturas/lista-lecturas'
import { ExportLecturas } from '@/components/lecturas/export-lecturas'
import { MapaLecturas } from '@/components/maps/mapa-lecturas'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncManager } from '@/lib/sync-manager'

export default function DashboardPage() {
  const router = useRouter()
  const { usuario, lecturas, marcarSincronizado, setLoading, loading } = useStore()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Detectar cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log('[v0] Conexión restaurada')
      setIsOnline(true)
      // Auto-sincronizar cuando hay conexión
      handleAutoSync()
    }
    const handleOffline = () => {
      console.log('[v0] Se perdió la conexión')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const pendientes = lecturas.filter((l) => l.estado === 'pendiente')
  const sincronizadas = lecturas.filter((l) => l.estado === 'sincronizada')

  const handleAutoSync = async () => {
    if (!isOnline || pendientes.length === 0 || syncing) return

    console.log('[v0] Iniciando sincronización automática...', pendientes.length, 'lecturas pendientes')
    setSyncing(true)
    setLoading(true)

    try {
      // Convertir lecturas pendientes al formato de la API
      const lecturasParaSincronizar = pendientes.map((l) => ({
        medidorId: l.idMedidor,
        valor: l.lecturaActual,
        fecha: l.fechaLectura,
        latitud: l.gps?.lat,
        longitud: l.gps?.lng,
        fotoEvidencia: l.foto,
      }))

      // Sincronizar con API
      const resultados = await elapasApi.sincronizarLecturas(lecturasParaSincronizar)
      console.log('[v0] Sincronización completada:', resultados.length, 'lecturas')

      // Marcar como sincronizadas
      pendientes.forEach((lectura) => {
        marcarSincronizado(lectura.id)
      })
    } catch (error) {
      console.error('[v0] Error en sincronización:', error)
    } finally {
      setSyncing(false)
      setLoading(false)
    }
  }

  const handleManualSync = async () => {
    await handleAutoSync()
  }

  if (!usuario) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Dashboard ELAPAS"
        showExport={true}
        onExportClick={() => setExportModalOpen(true)}
      />

      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        {/* Estado de conexión */}
        <Card className={`mb-6 p-4 flex items-center justify-between border ${
          isOnline
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi size={20} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff size={20} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Sin conexión</span>
              </>
            )}
          </div>
          {pendientes.length > 0 && isOnline && (
            <Button
              onClick={handleManualSync}
              disabled={syncing || loading}
              size="sm"
              className="gap-1"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              Sincronizar ({pendientes.length})
            </Button>
          )}
        </Card>

        {/* Alerta de pendientes sin conexión */}
        {pendientes.length > 0 && !isOnline && (
          <Card className="mb-6 p-4 bg-yellow-50 border border-yellow-200 flex items-start gap-2">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {pendientes.length} lectura{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Se sincronizarán automáticamente cuando tengas conexión
              </p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="nueva" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="nueva">Nueva Lectura</TabsTrigger>
            <TabsTrigger value="historial">
              Historial {lecturas.length > 0 && <span className="ml-1">({lecturas.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="nueva" className="space-y-4">
            <FormLectura
              onSuccess={() => {
                console.log('[v0] Lectura registrada exitosamente')
              }}
            />
          </TabsContent>
          
          <TabsContent value="historial" className="space-y-4">
            <ListaLecturas />
          </TabsContent>

          <TabsContent value="mapa" className="space-y-4">
            <MapaLecturas lecturas={lecturas} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de exportación */}
      <ExportLecturas
        lecturas={lecturas}
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  )
}
