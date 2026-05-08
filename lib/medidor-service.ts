import { elapasApi } from './elapas-api'

export interface MedidorInfo {
  id: number
  codigoMedidor: string
  numeroSerie: string
  ciudadanoId: number
  marca?: string
  modelo?: string
  fechaInstalacion?: string
  lecturaInicial: number
  estado: 'ACTIVO' | 'DANADO' | 'RETIRADO' | 'REEMPLAZADO'
  createdAt: string
  updatedAt: string
  ciudadano: {
    usuarioId: number
    codigoCliente: string
    categoriaId: number
    distritoId: number
    direccion: string
    referencia?: string
    estadoServicio: 'ACTIVO' | 'CON_DEUDA' | 'CORTADO' | 'SUSPENDIDO'
    createdAt: string
    updatedAt: string
    usuario: {
      id: number
      nombre: string
      apellido?: string
      ci: string
      email?: string
      telefono?: string
      activo: boolean
    }
    categoria: {
      id: number
      nombre: string
      descripcion?: string
      activo: boolean
      createdAt: string
      updatedAt: string
    }
    distrito: {
      id: number
      nombre: string
      descripcion?: string
      activo: boolean
      createdAt: string
      updatedAt: string
    }
  }
  lecturas: Array<{
    id: number
    medidorId: number
    tecnicoId: number
    periodo: string
    lecturaAnterior: number
    lecturaActual: number
    consumoM3: number
    fechaLectura: string
    latitud?: number
    longitud?: number
    fotoEvidenciaUrl?: string
    observacion?: string
    estado: 'REGISTRADA' | 'CONFIRMADA' | 'ANULADA'
    createdAt: string
    updatedAt: string
  }>
  _count: {
    lecturas: number
  }
}

// Mapeo de categorías a colores
export const CATEGORIA_COLORES = {
  DOMESTICA: { color: '#3b82f6', label: 'Doméstica', bg: '#dbeafe' },
  COMERCIAL: { color: '#f97316', label: 'Comercial', bg: '#fed7aa' },
  SOLIDARIA: { color: '#10b981', label: 'Solidaria', bg: '#d1fae5' },
  EDIFICIO: { color: '#8b5cf6', label: 'Edificio', bg: '#ede9fe' },
}

export class MedidorServiceClass {
  async buscarMedidor(numerMedidor: string): Promise<MedidorInfo> {
    console.log('[v0] Buscando medidor por serie:', numerMedidor)

    try {
      const medidorData = await elapasApi.buscarMedidorPorSerie(numerMedidor)
      return medidorData
    } catch (error) {
      console.error('[v0] Error buscando medidor:', error)
      throw error
    }
  }

  getColorCategoria(categoria: string): { color: string; label: string; bg: string } {
    const cat = categoria.toUpperCase()
    return CATEGORIA_COLORES[cat as keyof typeof CATEGORIA_COLORES] || CATEGORIA_COLORES.DOMESTICA
  }

  calcularConsumo(lecturaAnterior: number, lecturaActual: number): number {
    const consumo = lecturaActual - lecturaAnterior
    return Math.max(0, consumo) // No permitir valores negativos
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  obtenerFechaHoy(): string {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  }
}

export const medidorService = new MedidorServiceClass()
