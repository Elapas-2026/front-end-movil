import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Usuario {
  id: number
  nombre: string
  apellido?: string
  ci: string
  email?: string
  telefono?: string
  rolId: number
  activo: boolean
  ultimoLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Rol {
  id: number
  nombre: string
  createdAt: string
  updatedAt: string
}

export interface Distrito {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoriaTarifa {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Ciudadano {
  usuarioId: number
  codigoCliente: string
  categoriaId: number
  distritoId: number
  direccion: string
  referencia?: string
  estadoServicio: 'ACTIVO' | 'CON_DEUDA' | 'CORTADO' | 'SUSPENDIDO'
  createdAt: string
  updatedAt: string
}

export interface Medidor {
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
}

export interface Lectura {
  id: string | number
  idMedidor: string
  tecnicoId?: number
  tecnicoNombre?: string
  periodo?: string
  lecturaAnterior: number
  lecturaActual: number
  consumoM3?: number
  fechaLectura: string
  gps?: { lat: number; lng: number }
  latitud?: number
  longitud?: number
  foto?: string
  observaciones?: string
  direccion?: string
  estado: 'REGISTRADA' | 'CONFIRMADA' | 'ANULADA' | 'pendiente' | 'sincronizada'
  verificado?: boolean
  fechaVerificacion?: string
  createdAt?: string
  updatedAt?: string
}

export interface Tarifa {
  id: number
  categoriaId: number
  rangoDesde: number
  rangoHasta?: number
  precioM3: number
  cargoFijo: number
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Factura {
  id: number
  numeroFactura: string
  ciudadanoId: number
  lecturaId: number
  periodo: string
  consumoM3: number
  montoAgua: number
  cargoFijo: number
  multa: number
  montoTotal: number
  estado: 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA'
  fechaEmision: string
  fechaVencimiento: string
  createdAt: string
  updatedAt: string
}

export interface DetalleFactura {
  id: number
  facturaId: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  createdAt: string
  updatedAt: string
}

export interface MetodoPago {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Pago {
  id: number
  facturaId: number
  usuarioId?: number
  metodoId: number
  codigoPago: string
  montoPagado: number
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'ANULADO'
  referenciaTransaccion?: string
  qrReferencia?: string
  observacion?: string
  fechaPago: string
  createdAt: string
  updatedAt: string
}

export interface Corte {
  id: number
  ciudadanoId: number
  tecnicoId?: number
  motivo: string
  deudaTotal: number
  facturasVencidas: number
  estado: 'PENDIENTE' | 'EJECUTADO' | 'CANCELADO'
  fechaProgramada?: string
  fechaEjecucion?: string
  fotoEvidenciaUrl?: string
  latitud?: number
  longitud?: number
  observacion?: string
  createdAt: string
  updatedAt: string
}

export interface Reconexion {
  id: number
  ciudadanoId: number
  corteId?: number
  tecnicoId?: number
  costoReconexion: number
  estado: 'PENDIENTE' | 'EJECUTADA' | 'CANCELADA'
  fechaProgramada?: string
  fechaEjecucion?: string
  fotoEvidenciaUrl?: string
  latitud?: number
  longitud?: number
  observacion?: string
  createdAt: string
  updatedAt: string
}

export interface Auditoria {
  id: number
  usuarioId?: number
  accion: string
  entidad: string
  entidadId?: number
  descripcion?: string
  ip?: string
  createdAt: string
}

export interface MedidorLeido {
  idMedidor: string
  nombrePersona: string
  categoria: string
  tiempoLectura: string
}

interface AppState {
  // Usuario
  usuario: Usuario | null
  setUsuario: (usuario: Usuario | null) => void
  logout: () => void
  token: string | null
  setToken: (token: string | null) => void

  // Roles
  roles: Rol[]
  setRoles: (roles: Rol[]) => void

  // Usuarios
  usuarios: Usuario[]
  setUsuarios: (usuarios: Usuario[]) => void

  // Distritos
  distritos: Distrito[]
  setDistritos: (distritos: Distrito[]) => void

  // Categorias Tarifarias
  categoriasTarifa: CategoriaTarifa[]
  setCategoriasTarifa: (categorias: CategoriaTarifa[]) => void

  // Ciudadanos
  ciudadanos: Ciudadano[]
  setCiudadanos: (ciudadanos: Ciudadano[]) => void

  // Medidores
  medidores: Medidor[]
  setMedidores: (medidores: Medidor[]) => void

  // Lecturas
  lecturas: Lectura[]
  agregarLectura: (lectura: Lectura) => void
  actualizarLectura: (id: string | number, lectura: Partial<Lectura>) => void
  eliminarLectura: (id: string | number) => void
  marcarSincronizado: (id: string | number) => void

  // Medidores Leídos (para rastreo de cuál técnico leyó qué)
  medidoresLeidos: MedidorLeido[]
  agregarMedidorLeido: (medidor: MedidorLeido) => void
  setMedidoresLeidos: (medidores: MedidorLeido[]) => void
  limpiarMedidoresLeidos: () => void

  // Tarifas
  tarifas: Tarifa[]
  setTarifas: (tarifas: Tarifa[]) => void

  // Facturas
  facturas: Factura[]
  setFacturas: (facturas: Factura[]) => void

  // Pagos
  pagos: Pago[]
  setPagos: (pagos: Pago[]) => void

  // Cortes
  cortes: Corte[]
  setCortes: (cortes: Corte[]) => void

  // Reconexiones
  reconexiones: Reconexion[]
  setReconexiones: (reconexiones: Reconexion[]) => void

  // Auditorias
  auditorias: Auditoria[]
  setAuditorias: (auditorias: Auditoria[]) => void

  // UI
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      usuario: null,
      setUsuario: (usuario) => set({ usuario }),
      logout: () => set({ usuario: null, token: null }),
      token: null,
      setToken: (token) => set({ token }),

      roles: [],
      setRoles: (roles) => set({ roles }),

      usuarios: [],
      setUsuarios: (usuarios) => set({ usuarios }),

      distritos: [],
      setDistritos: (distritos) => set({ distritos }),

      categoriasTarifa: [],
      setCategoriasTarifa: (categorias) => set({ categoriasTarifa: categorias }),

      ciudadanos: [],
      setCiudadanos: (ciudadanos) => set({ ciudadanos }),

      medidores: [],
      setMedidores: (medidores) => set({ medidores }),

      lecturas: [],
      agregarLectura: (lectura) =>
        set((state) => ({
          lecturas: [...state.lecturas, lectura],
        })),
      actualizarLectura: (id, updates) =>
        set((state) => ({
          lecturas: state.lecturas.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      eliminarLectura: (id) =>
        set((state) => ({
          lecturas: state.lecturas.filter((l) => l.id !== id),
        })),
      marcarSincronizado: (id) =>
        set((state) => ({
          lecturas: state.lecturas.map((l) =>
            l.id === id ? { ...l, estado: 'sincronizada' } : l
          ),
        })),

      medidoresLeidos: [],
      agregarMedidorLeido: (medidor) =>
        set((state) => ({
          medidoresLeidos: [...state.medidoresLeidos, medidor],
        })),
      setMedidoresLeidos: (medidores) => set({ medidoresLeidos: medidores }),
      limpiarMedidoresLeidos: () => set({ medidoresLeidos: [] }),

      tarifas: [],
      setTarifas: (tarifas) => set({ tarifas }),

      facturas: [],
      setFacturas: (facturas) => set({ facturas }),

      pagos: [],
      setPagos: (pagos) => set({ pagos }),

      cortes: [],
      setCortes: (cortes) => set({ cortes }),

      reconexiones: [],
      setReconexiones: (reconexiones) => set({ reconexiones }),

      auditorias: [],
      setAuditorias: (auditorias) => set({ auditorias }),

      loading: false,
      setLoading: (loading) => set({ loading }),

      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'elapas-store',
    }
  )
)
