// Cliente para consumir la API de ELAPAS
// https://elapas-backend.onrender.com/api/docs

import {
  MOCK_USUARIOS,
  MOCK_MEDIDORES,
  MOCK_LECTURAS,
  MOCK_AUTH_USER,
  MOCK_LECTURAS_USUARIOS,
} from './mock-data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://elapas-backend-v1.onrender.com'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || ''
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Simular delay de red
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export interface LoginResponse {
  token?: string
  access_token?: string
  usuario?: {
    id: string
    nombre: string
    apellido?: string
    ci: string
    email: string
    telefono?: string
    rol?: string
    categoria?: string
  }
}

export interface Usuario {
  id: string
  nombre: string
  ci: string
  email: string
  categoria: string
  direccion: string
  distrito: number
}

export interface Medidor {
  id: string
  numero: string
  usuarioId: string
  activo: boolean
}

export interface LecturaRequest {
  medidorId: string
  valor: number
  fecha: string
  latitud?: number
  longitud?: number
  fotoEvidencia?: string
}

export interface LecturaResponse {
  id: string
  medidorId: string
  valor: number
  fecha: string
  estado: string
}

class ElapasAPI {
  private baseUrl = API_VERSION ? `${API_BASE_URL}/api/${API_VERSION}` : `${API_BASE_URL}/api`
  private token: string | null = null

  constructor() {
    // Cargar token del localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('elapas_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('elapas_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elapas_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>)
    }

    // Intentar recargar token guardado si todavía no está en memoria
    if (!this.token && typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('elapas_token')
      if (savedToken) {
        this.token = savedToken
      }
    }

    // Agregar token de autenticación si existe
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken()
          throw new Error('Sesión expirada, por favor inicie sesión nuevamente')
        }
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `API Error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`[v0] API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Autenticación
  async login(ci: string, password: string): Promise<LoginResponse> {
    console.log('[v0] Attempting login with API')
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ci, password }),
    })

    const token =
      response.token ||
      response.accessToken ||
      response.access_token ||
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.access_token

    if (!token) {
      console.error('[v0] Login response missing token:', response)
      throw new Error('No se recibió token de autenticación desde el backend')
    }

    this.setToken(token)

    let usuario = response.usuario || response.data?.usuario || response.user || null

    if (!usuario) {
      console.log('[v0] No user object in login response, fetching profile')
      usuario = await this.request<any>('/auth/profile')
    }

    return {
      token,
      usuario,
    }
  }

  async profile(): Promise<any> {
    return this.request('/auth/profile')
  }


  // Usuarios
  async obtenerUsuarios(): Promise<Usuario[]> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for obtenerUsuarios')
      await simulateDelay(600)
      return MOCK_USUARIOS
    }

    console.log('[v0] Fetching usuarios from API')
    return this.request<Usuario[]>('/usuarios')
  }

  async obtenerUsuario(ci: string): Promise<Usuario> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for obtenerUsuario:', ci)
      await simulateDelay(400)
      const usuario = MOCK_USUARIOS.find((u) => u.ci === ci || u.id === ci)
      if (!usuario) {
        throw new Error('Usuario no encontrado')
      }
      return usuario
    }

    console.log('[v0] Fetching usuario:', ci)
    return this.request<Usuario>(`/usuarios/${ci}`)
  }

  // Medidores
  async obtenerMedidores(usuarioId: string): Promise<Medidor[]> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for obtenerMedidores')
      await simulateDelay(500)
      return MOCK_MEDIDORES.filter((m) => m.usuarioId === usuarioId)
    }

    console.log('[v0] Fetching medidores for usuario:', usuarioId)
    return this.request<Medidor[]>(`/usuarios/${usuarioId}/medidores`)
  }

  async buscarMedidorPorNumero(numero: string): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for buscarMedidorPorNumero:', numero)
      await simulateDelay(500)
      const medidor = MOCK_MEDIDORES.find((m) => m.numero === numero)
      if (!medidor) {
        throw new Error('Medidor no encontrado: ' + numero)
      }
      return medidor
    }

    console.log('[v0] Searching medidor by numero:', numero)
    try {
      const response = await this.request<any>(`/medidores/${numero}`)
      return response
    } catch (error) {
      console.log('[v0] Medidor no encontrado:', numero)
      throw new Error('Medidor no encontrado')
    }
  }

  async obtenerMedidorConUsuario(numero: string): Promise<any> {
    console.log('[v0] Fetching medidor with usuario info:', numero)
    try {
      const medidor = await this.buscarMedidorPorNumero(numero)
      if (medidor.usuarioId) {
        const usuario = await this.obtenerUsuario(medidor.usuarioId)
        return {
          medidor,
          usuario,
        }
      }
      return { medidor }
    } catch (error) {
      throw error
    }
  }

  // Lecturas
  async crearLectura(data: LecturaRequest): Promise<LecturaResponse> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for crearLectura')
      await simulateDelay(700)
      const newLectura: LecturaResponse = {
        id: 'mock-' + Date.now(),
        medidorId: data.medidorId,
        valor: data.valor,
        fecha: data.fecha,
        estado: 'sincronizada',
      }
      return newLectura
    }

    console.log('[v0] Creating lectura:', data)
    return this.request<LecturaResponse>('/lecturas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async obtenerLecturas(filtros?: { usuarioId?: string; medidorId?: string }): Promise<LecturaResponse[]> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for obtenerLecturas')
      await simulateDelay(600)
      let lecturas = MOCK_LECTURAS as any[]

      if (filtros?.medidorId) {
        lecturas = lecturas.filter((l) => l.medidorId === filtros.medidorId)
      }
      if (filtros?.usuarioId) {
        lecturas = lecturas.filter((l) => l.usuarioId === filtros.usuarioId)
      }

      return lecturas
    }

    console.log('[v0] Fetching lecturas')
    const params = new URLSearchParams()
    if (filtros?.usuarioId) params.append('usuarioId', filtros.usuarioId)
    if (filtros?.medidorId) params.append('medidorId', filtros.medidorId)

    const queryString = params.toString()
    const endpoint = queryString ? `/lecturas?${queryString}` : '/lecturas'

    return this.request<LecturaResponse[]>(endpoint)
  }

  async obtenerUltimaLectura(medidorId: string): Promise<any> {
    console.log('[v0] Fetching última lectura for medidor:', medidorId)
    try {
      const lecturas = await this.obtenerLecturas({ medidorId })
      if (lecturas && lecturas.length > 0) {
        // Ordenar por fecha descendente y devolver la más reciente
        return lecturas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
      }
      return null
    } catch (error) {
      console.log('[v0] No previous reading found for medidor:', medidorId)
      return null
    }
  }

  // Ciudadanos
  async obtenerCiudadanos(): Promise<any[]> {
    console.log('[v0] Fetching ciudadanos')
    return this.request('/ciudadanos')
  }

  async obtenerCiudadanoResumen(): Promise<any> {
    console.log('[v0] Fetching ciudadanos resumen')
    return this.request('/ciudadanos/resumen')
  }

  // Medidores
  async buscarMedidorPorSerie(numeroSerie: string): Promise<any> {
    if (!this.token) {
      throw new Error('Debe iniciar sesión primero')
    }
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for buscarMedidorPorSerie:', numeroSerie)
      await simulateDelay(800)
      // Mock data for the new structure
      return {
        id: 1,
        codigoMedidor: "MED-0001",
        numeroSerie: numeroSerie,
        ciudadanoId: 4,
        marca: "ELSTER",
        modelo: "A100",
        fechaInstalacion: "2025-01-10T00:00:00.000Z",
        lecturaInicial: 0,
        estado: "ACTIVO",
        createdAt: "2026-05-03T05:01:37.930Z",
        updatedAt: "2026-05-08T16:02:47.449Z",
        ciudadano: {
          usuarioId: 4,
          codigoCliente: "CLI-0001",
          categoriaId: 1,
          distritoId: 2,
          direccion: "Zona Villa Armonía Calle 5",
          referencia: "Cerca de la plaza principal de la zona",
          estadoServicio: "ACTIVO",
          createdAt: "2026-05-03T05:01:37.547Z",
          updatedAt: "2026-05-03T23:20:03.172Z",
          usuario: {
            id: 4,
            nombre: "María Luisa",
            apellido: "Quispe Mamani",
            ci: "7458392",
            email: "maria@elapas.test",
            telefono: "70000002",
            activo: true
          },
          categoria: {
            id: 1,
            nombre: "DOMESTICA",
            descripcion: "Categoría para uso doméstico.",
            activo: true,
            createdAt: "2026-05-03T05:01:34.251Z",
            updatedAt: "2026-05-08T02:03:22.910Z"
          },
          distrito: {
            id: 2,
            nombre: "Distrito 2",
            descripcion: "Zona urbana residencial de Sucre.",
            activo: true,
            createdAt: "2026-05-03T05:01:33.877Z",
            updatedAt: "2026-05-03T05:04:11.535Z"
          }
        },
        lecturas: [
          {
            id: 1,
            medidorId: 1,
            tecnicoId: 1,
            periodo: "2026-05",
            lecturaAnterior: 120.5,
            lecturaActual: 135.8,
            consumoM3: 15.3,
            fechaLectura: "2026-05-03T10:30:00.000Z",
            latitud: -19.047,
            longitud: -65.259,
            fotoEvidenciaUrl: "https://storage.app/foto-lectura-1.jpg",
            observacion: "Lectura registrada sin observaciones.",
            estado: "CONFIRMADA",
            createdAt: "2026-05-03T23:14:44.448Z",
            updatedAt: "2026-05-03T23:19:29.923Z"
          }
        ],
        _count: {
          lecturas: 1
        }
      }
    }
    console.log('[v0] Fetching medidor by serie:', numeroSerie)
    return this.request(`/medidores/serie/${numeroSerie}`)
  }

  async obtenerMedidoresResumen(): Promise<any> {
    console.log('[v0] Fetching medidores resumen')
    return this.request('/medidores/resumen')
  }

  // Lecturas
  async obtenerLecturasResumen(): Promise<any> {
    console.log('[v0] Fetching lecturas resumen')
    return this.request('/lecturas/resumen')
  }

  // Facturas
  async obtenerFacturas(): Promise<any[]> {
    console.log('[v0] Fetching facturas')
    return this.request('/facturas')
  }

  async obtenerFacturasResumen(): Promise<any> {
    console.log('[v0] Fetching facturas resumen')
    return this.request('/facturas/resumen')
  }

  // Pagos
  async obtenerPagosResumen(): Promise<any> {
    console.log('[v0] Fetching pagos resumen')
    return this.request('/pagos/resumen')
  }

  // Cortes
  async obtenerCortes(): Promise<any[]> {
    console.log('[v0] Fetching cortes')
    return this.request('/cortes')
  }

  async obtenerCortesResumen(): Promise<any> {
    console.log('[v0] Fetching cortes resumen')
    return this.request('/cortes/resumen')
  }

  // Reconexiones
  async obtenerReconexionesResumen(): Promise<any> {
    console.log('[v0] Fetching reconexiones resumen')
    return this.request('/reconexiones/resumen')
  }

  // Sincronización
  async sincronizarLecturas(lecturas: LecturaRequest[]): Promise<LecturaResponse[]> {
    if (USE_MOCK_DATA) {
      console.log('[v0] Using MOCK DATA for sincronizarLecturas')
      await simulateDelay(1000)
      const results: LecturaResponse[] = lecturas.map((lectura) => ({
        id: 'mock-sync-' + Date.now() + Math.random(),
        medidorId: lectura.medidorId,
        valor: lectura.valor,
        fecha: lectura.fecha,
        estado: 'sincronizada',
      }))
      return results
    }

    console.log('[v0] Sincronizing', lecturas.length, 'lecturas')
    const results: LecturaResponse[] = []

    for (const lectura of lecturas) {
      try {
        const result = await this.crearLectura(lectura)
        results.push(result)
      } catch (error) {
        console.error('[v0] Error al sincronizar lectura:', error)
        // Continuar con las siguientes
      }
    }

    return results
  }
}

// Exportar instancia única
export const elapasApi = new ElapasAPI()
