'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { LoginForm } from '@/components/auth/login-form'

export default function Home() {
  const router = useRouter()
  const { usuario } = useStore()

  useEffect(() => {
    if (usuario) {
      router.push('/dashboard')
    }
  }, [usuario, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary mb-2">⚙️</div>
            <h1 className="text-2xl font-bold text-gray-900">ELAPAS Mobile</h1>
            <p className="text-gray-600 text-sm">
              Sistema de lectura de medidores
            </p>
          </div>

          <LoginForm />

          <div className="text-center text-xs text-gray-500 space-y-2 pt-4 border-t border-gray-200">
            <p>App móvil para técnicos de lectura</p>
            <p>Versión 1.0</p>
          </div>
        </div>
      </div>
    </main>
  )
}
