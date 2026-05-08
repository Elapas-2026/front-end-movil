'use client'

import { useStore } from '@/lib/store'
import { Trash2, CheckCircle, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ListaLecturas() {
  const { lecturas, eliminarLectura } = useStore()

  if (lecturas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">No hay lecturas registradas</p>
        <p className="text-sm">Comienza registrando una nueva lectura</p>
      </div>
    )
  }

  // Ordenar por fecha más reciente primero
  const sortedLecturas = [...lecturas].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  return (
    <div className="space-y-3">
      {sortedLecturas.map((lectura) => {
        const isSynced = lectura.estado === 'sincronizada'
        const lecturaDiferencia = lectura.lecturaActual - lectura.lecturaAnterior
        const fecha = new Date(lectura.fecha)
        const fechaFormato = fecha.toLocaleDateString('es-ES')
        const horaFormato = fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <div
            key={lectura.id}
            className={`p-4 rounded-lg border-l-4 ${
              isSynced
                ? 'bg-green-50 border-l-success'
                : 'bg-yellow-50 border-l-yellow-500'
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Header: ID Medidor + Estado */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-foreground truncate">
                    {lectura.idMedidor}
                  </p>
                  {isSynced ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium">
                      <CheckCircle size={12} />
                      Sincronizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">
                      <Clock size={12} />
                      Pendiente
                    </span>
                  )}
                </div>

                {/* Dirección */}
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {lectura.direccion}
                </p>

                {/* Lecturas */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="bg-white/60 px-2 py-1 rounded border border-gray-200">
                    <p className="text-muted-foreground">Anterior</p>
                    <p className="font-semibold text-foreground">
                      {lectura.lecturaAnterior}
                    </p>
                  </div>
                  <div className="bg-white/60 px-2 py-1 rounded border border-gray-200">
                    <p className="text-muted-foreground">Actual</p>
                    <p className="font-semibold text-foreground">
                      {lectura.lecturaActual}
                    </p>
                  </div>
                </div>

                {/* Diferencia */}
                <div className="bg-primary/10 px-2 py-1 rounded mb-2 inline-block">
                  <p className="text-xs font-semibold text-primary">
                    Diferencia: {lecturaDiferencia} m³
                  </p>
                </div>

                {/* Fecha y Hora */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock size={12} />
                  <span>{fechaFormato} {horaFormato}</span>
                </div>

                {/* GPS */}
                {lectura.gps && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin size={12} />
                    <span>{lectura.gps.lat.toFixed(4)}, {lectura.gps.lng.toFixed(4)}</span>
                  </div>
                )}

                {/* Foto */}
                {lectura.foto && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={lectura.foto}
                      alt="Lectura"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Observaciones */}
                {lectura.observaciones && (
                  <p className="mt-2 text-xs bg-white/80 px-2 py-1 rounded text-foreground italic">
                    📝 {lectura.observaciones}
                  </p>
                )}
              </div>

              {/* Botón eliminar */}
              <Button
                onClick={() => eliminarLectura(lectura.id)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-red-100 flex-shrink-0"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
