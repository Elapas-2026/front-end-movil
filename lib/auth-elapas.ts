// Servicio de autenticación para ELAPAS
import { elapasApi } from './elapas-api'

export interface AuthToken {
  token: string
  expiresAt?: number
  usuario?: {
    id: string
    nombre: string
    ci: string
    email: string
    categoria: string
  }
}

class AuthService {
  private tokenKey = 'elapas_token'
  private userKey = 'elapas_user'

  // Guardar token y usuario
  saveAuth(token: string, usuario: any) {
    console.log('[v0] Saving auth token for:', usuario.email)
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token)
      localStorage.setItem(this.userKey, JSON.stringify(usuario))
    }
    elapasApi.setToken(token)
  }

  // Obtener token guardado
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey)
    }
    return null
  }

  // Obtener usuario guardado
  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.userKey)
      return user ? JSON.parse(user) : null
    }
    return null
  }

  // Verificar si hay sesión activa
  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  // Logout
  logout() {
    console.log('[v0] Logging out')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.userKey)
    }
    elapasApi.clearToken()
  }

  // Inicializar autenticación (se llama al cargar la app)
  initialize() {
    const token = this.getToken()
    if (token) {
      console.log('[v0] Initializing with stored token')
      elapasApi.setToken(token)
    }
  }
}

export const authService = new AuthService()
