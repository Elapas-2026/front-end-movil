import { Lectura } from './store'

/**
 * Exporta lecturas como JSON
 * @param lecturas Array de lecturas
 * @param filename Nombre del archivo
 */
export function exportAsJSON(lecturas: Lectura[], filename: string = 'lecturas.json') {
  const dataStr = JSON.stringify(lecturas, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, filename)
}

/**
 * Exporta lecturas como CSV
 * @param lecturas Array de lecturas
 * @param filename Nombre del archivo
 */
export function exportAsCSV(lecturas: Lectura[], filename: string = 'lecturas.csv') {
  const headers = [
    'ID',
    'ID Medidor',
    'Dirección',
    'Lectura Anterior',
    'Lectura Actual',
    'Diferencia',
    'Observaciones',
    'Latitud',
    'Longitud',
    'Foto',
    'Estado',
    'Fecha',
  ]

  const rows = lecturas.map((lectura) => [
    lectura.id,
    lectura.idMedidor,
    lectura.direccion,
    lectura.lecturaAnterior,
    lectura.lecturaActual,
    lectura.lecturaActual - lectura.lecturaAnterior,
    lectura.observaciones || '',
    lectura.gps?.lat || '',
    lectura.gps?.lng || '',
    lectura.foto ? 'SÍ' : 'NO',
    lectura.estado,
    new Date(lectura.fecha).toLocaleString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell)
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        })
        .join(',')
    ),
  ].join('\n')

  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(dataBlob, filename)
}

/**
 * Descarga un archivo en el navegador
 * @param blob Contenido del archivo
 * @param filename Nombre del archivo
 */
function downloadFile(blob: Blob, filename: string) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporta datos para backup offline
 * @param lecturas Array de lecturas
 * @param filename Nombre del archivo
 */
export function exportForOfflineBackup(
  lecturas: Lectura[],
  filename: string = `lecturas-backup-${new Date().toISOString().split('T')[0]}.json`
) {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalLecturas: lecturas.length,
    pendientes: lecturas.filter((l) => l.estado === 'pendiente').length,
    sincronizadas: lecturas.filter((l) => l.estado === 'sincronizada').length,
    lecturas,
  }

  exportAsJSON(lecturas, filename)
}

/**
 * Genera un reporte detallado en texto
 * @param lecturas Array de lecturas
 */
export function generateReport(lecturas: Lectura[]): string {
  const fechaHoy = new Date().toLocaleDateString('es-ES')
  const totalLecturas = lecturas.length
  const pendientes = lecturas.filter((l) => l.estado === 'pendiente')
  const sincronizadas = lecturas.filter((l) => l.estado === 'sincronizada')

  let report = `REPORTE DE LECTURAS ELAPAS
==============================
Fecha: ${fechaHoy}

RESUMEN:
- Total de lecturas: ${totalLecturas}
- Pendientes: ${pendientes.length}
- Sincronizadas: ${sincronizadas.length}

DETALLE DE LECTURAS:
${lecturas
  .map(
    (lectura) => `
ID: ${lectura.id}
  Medidor: ${lectura.idMedidor}
  Dirección: ${lectura.direccion}
  Lectura Anterior: ${lectura.lecturaAnterior}
  Lectura Actual: ${lectura.lecturaActual}
  Diferencia: ${lectura.lecturaActual - lectura.lecturaAnterior}
  Estado: ${lectura.estado}
  Fecha: ${new Date(lectura.fecha).toLocaleString()}
  GPS: ${lectura.gps ? `${lectura.gps.lat}, ${lectura.gps.lng}` : 'No registrado'}
  Foto: ${lectura.foto ? 'Sí' : 'No'}
  Observaciones: ${lectura.observaciones || 'N/A'}
`
  )
  .join('---\n')}
`
  return report
}
