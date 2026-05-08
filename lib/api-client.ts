// Configuración base para conectar con la API
// Las carpetas están preparadas pero sin implementación

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const apiClient = {
  // AUTH
  async login(email: string, password: string) {
    // TODO: Conectar con /api/auth/login
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  async register(nombre: string, email: string, password: string) {
    // TODO: Conectar con /api/auth/register
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    })
    return response.json()
  },

  // LECTURAS
  async crearLectura(data: any) {
    // TODO: Conectar con /api/lecturas/crear
    const response = await fetch(`${API_BASE_URL}/lecturas/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async obtenerLecturas(token: string) {
    // TODO: Conectar con /api/lecturas/listar
    const response = await fetch(`${API_BASE_URL}/lecturas/listar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.json()
  },

  // SINCRONIZACIÓN
  async sincronizarLecturas(lecturas: any[], token: string) {
    // TODO: Conectar con /api/sync/lecturas
    const response = await fetch(`${API_BASE_URL}/sync/lecturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ lecturas }),
    })
    return response.json()
  },
}
