import { Lectura } from './store'

export interface SyncStatus {
  isOnline: boolean
  lastSync?: Date
  pendingSyncCount: number
}

class SyncManager {
  private isOnline = navigator.onLine
  private listeners: ((status: SyncStatus) => void)[] = []

  constructor() {
    this.setupNetworkListeners()
  }

  /**
   * Configura los listeners de conexión de red
   */
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[v0] Conexión recuperada')
      this.isOnline = true
      this.notifyListeners()
    })

    window.addEventListener('offline', () => {
      console.log('[v0] Se perdió la conexión')
      this.isOnline = false
      this.notifyListeners()
    })
  }

  /**
   * Obtiene el estado actual de sincronización
   */
  getStatus(lecturas: Lectura[]): SyncStatus {
    const pendingSyncCount = lecturas.filter((l) => l.estado === 'pendiente').length
    const lastSyncStr = localStorage.getItem('lastSync')
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : undefined

    return {
      isOnline: this.isOnline,
      lastSync,
      pendingSyncCount,
    }
  }

  /**
   * Suscribirse a cambios de estado de sincronización
   */
  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  /**
   * Notifica a todos los listeners del cambio de estado
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener({
        isOnline: this.isOnline,
        pendingSyncCount: 0,
      })
    })
  }

  /**
   * Marca una lectura como sincronizada
   */
  markAsSynced(lectura: Lectura): Lectura {
    return {
      ...lectura,
      estado: 'sincronizada',
      fechaSync: new Date().toISOString(),
    }
  }

  /**
   * Sincroniza lecturas pendientes con el servidor
   * TODO: Conectar con API real en /api/sync/lecturas
   */
  async syncPendingLecturas(lecturas: Lectura[]): Promise<Lectura[]> {
    const pendingLecturas = lecturas.filter((l) => l.estado === 'pendiente')

    if (pendingLecturas.length === 0) {
      console.log('[v0] No hay lecturas pendientes para sincronizar')
      return lecturas
    }

    try {
      console.log(`[v0] Sincronizando ${pendingLecturas.length} lecturas...`)

      // TODO: Descomentar cuando API esté lista
      // const response = await fetch('/api/sync/lecturas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ lecturas: pendingLecturas }),
      // })
      // const result = await response.json()

      // Por ahora, simulamos sincronización exitosa
      const syncedLecturas = pendingLecturas.map((l) => this.markAsSynced(l))

      // Actualizar lecturas sincronizadas
      const updatedLecturas = lecturas.map((lectura) => {
        const synced = syncedLecturas.find((s) => s.id === lectura.id)
        return synced || lectura
      })

      // Guardar timestamp de última sincronización
      localStorage.setItem('lastSync', new Date().toISOString())

      console.log('[v0] Sincronización exitosa')
      return updatedLecturas
    } catch (error) {
      console.error('[v0] Error en sincronización:', error)
      throw error
    }
  }

  /**
   * Verifica si hay cambios pendientes de sincronizar
   */
  hasPendingChanges(lecturas: Lectura[]): boolean {
    return lecturas.some((l) => l.estado === 'pendiente')
  }
}

export const syncManager = new SyncManager()
