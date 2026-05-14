'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { elapasApi } from '@/lib/elapas-api'
import { authService } from '@/lib/auth-elapas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { setUsuario, setToken, setLoading, setError, loading, error } = useStore()
  const [ci, setCi] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ciError, setCiError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let hasError = false
      setCiError('')
      setPasswordError('')

      if (!ci) {
        setCiError('El CI es obligatorio')
        hasError = true
      } else if (!/^[0-9]+$/.test(ci)) {
        setCiError('El CI debe ser numérico')
        hasError = true
      }

      if (!password) {
        setPasswordError('La contraseña es obligatoria')
        hasError = true
      }

      if (hasError) {
        setError('Corrige los campos marcados')
        setLoading(false)
        return
      }

      console.log('[v0] Attempting login with CI:', ci)

      try {
        const response = await elapasApi.login(ci, password)
        console.log('[v0] API Login successful:', response.usuario.nombre)

        const userRole =
          (response.usuario as any).rol ||
          (response.usuario as any).categoria ||
          ''

        const isTechnician = typeof userRole === 'string' &&
          userRole.toLowerCase().includes('tec')

        if (!isTechnician) {
          setError('Acceso permitido solo para técnicos')
          setLoading(false)
          return
        }

        // Guardar datos en store
        const usuario = {
          id: response.usuario.id,
          nombre: response.usuario.nombre,
          email: response.usuario.email,
          ci: response.usuario.ci,
          categoria: response.usuario.categoria || userRole,
          token: response.token || response.access_token,
        }

        setUsuario(usuario)
        setToken(usuario.token)
        authService.saveAuth(usuario.token, usuario)

        router.push('/dashboard')
      } catch (apiError: any) {
        console.error('[v0] API login failed:', apiError)
        setError(apiError.message || 'Credenciales inválidas o API no disponible')
        setLoading(false)
        return
      }
    } catch (err: any) {
      console.error('[v0] Login error:', err)
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="ci" className="block text-sm font-medium text-foreground mb-2">
          CI
        </label>
        <Input
          id="ci"
          type="text"
          value={ci}
          onChange={(e) => {
            setCi(e.target.value)
            setCiError('')
            setError(null)
          }}
          disabled={loading}
          required
          className="w-full"
          aria-invalid={!!ciError}
        />
        {ciError && <p className="mt-1 text-xs text-red-600">{ciError}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError('')
              setError(null)
            }}
            disabled={loading}
            required
            className="w-full pr-10"
            aria-invalid={!!passwordError}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-2xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition duration-200"
      >
        <LogIn size={18} />
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

    </form>
  )
}
