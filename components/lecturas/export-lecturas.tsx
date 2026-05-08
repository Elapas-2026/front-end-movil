'use client'

import { useState } from 'react'
import { Download, FileJson, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Lectura } from '@/lib/store'
import { exportAsJSON, exportAsCSV, generateReport, exportForOfflineBackup } from '@/lib/export-data'

interface ExportLecturasProps {
  lecturas: Lectura[]
  isOpen: boolean
  onClose: () => void
}

export function ExportLecturas({ lecturas, isOpen, onClose }: ExportLecturasProps) {
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExportJSON = async () => {
    try {
      setExporting(true)
      exportAsJSON(
        lecturas,
        `lecturas-${new Date().toISOString().split('T')[0]}.json`
      )
      setMessage({ type: 'success', text: 'JSON exportado exitosamente' })
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar JSON' })
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      exportAsCSV(lecturas, `lecturas-${new Date().toISOString().split('T')[0]}.csv`)
      setMessage({ type: 'success', text: 'CSV exportado exitosamente' })
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar CSV' })
    } finally {
      setExporting(false)
    }
  }

  const handleExportBackup = async () => {
    try {
      setExporting(true)
      exportForOfflineBackup(lecturas)
      setMessage({ type: 'success', text: 'Backup descargado exitosamente' })
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al crear backup' })
    } finally {
      setExporting(false)
    }
  }

  const handleExportReport = async () => {
    try {
      setExporting(true)
      const report = generateReport(lecturas)
      const blob = new Blob([report], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `reporte-lecturas-${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      URL.revokeObjectURL(link.href)
      setMessage({ type: 'success', text: 'Reporte exportado exitosamente' })
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar reporte' })
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-full sm:max-w-md rounded-t-2xl sm:rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Download size={24} className="text-primary" />
            Exportar Lecturas
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Mensaje de estado */}
          {message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <AlertCircle size={16} />
              {message.text}
            </div>
          )}

          {/* Info de lecturas */}
          <div className="bg-secondary p-3 rounded-lg text-sm">
            <p className="font-semibold">Total de lecturas: {lecturas.length}</p>
            <p className="text-muted-foreground">
              Pendientes: {lecturas.filter((l) => l.estado === 'pendiente').length}
            </p>
            <p className="text-muted-foreground">
              Sincronizadas: {lecturas.filter((l) => l.estado === 'sincronizada').length}
            </p>
          </div>

          {/* Opciones de exportación */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-semibold">Selecciona formato:</h3>

            <Button
              onClick={handleExportJSON}
              disabled={exporting || lecturas.length === 0}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <FileJson size={20} />
              <span>Exportar JSON</span>
              {exporting && <div className="ml-auto animate-spin">⏳</div>}
            </Button>

            <Button
              onClick={handleExportCSV}
              disabled={exporting || lecturas.length === 0}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <FileText size={20} />
              <span>Exportar CSV</span>
              {exporting && <div className="ml-auto animate-spin">⏳</div>}
            </Button>

            <Button
              onClick={handleExportBackup}
              disabled={exporting || lecturas.length === 0}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Download size={20} />
              <span>Backup Completo</span>
              {exporting && <div className="ml-auto animate-spin">⏳</div>}
            </Button>

            <Button
              onClick={handleExportReport}
              disabled={exporting || lecturas.length === 0}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <FileText size={20} />
              <span>Generar Reporte</span>
              {exporting && <div className="ml-auto animate-spin">⏳</div>}
            </Button>
          </div>

          {lecturas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay lecturas para exportar
            </p>
          )}

          {/* Botón cerrar */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
