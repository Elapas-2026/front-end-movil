'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, Download } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  showMenu?: boolean
  onMenuClick?: () => void
  onExportClick?: () => void
  showExport?: boolean
}

export function Header({ title, showMenu = false, onMenuClick, onExportClick, showExport = false }: HeaderProps) {
  const router = useRouter()
  const { usuario, logout } = useStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-primary-dark rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showExport && (
            <button
              onClick={onExportClick}
              className="p-2 hover:bg-primary-dark rounded-lg transition-colors"
              title="Exportar lecturas"
            >
              <Download size={20} />
            </button>
          )}

          <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              {usuario?.nombre?.[0]?.toUpperCase()}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="font-semibold text-sm">{usuario?.nombre}</p>
                <p className="text-xs text-gray-600">{usuario?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
