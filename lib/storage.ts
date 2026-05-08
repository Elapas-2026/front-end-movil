// Servicio de almacenamiento local para trabajar offline
// Usa localStorage para sincronización y caché

export const storageService = {
  // USUARIO
  guardarUsuario: (usuario: any) => {
    localStorage.setItem('usuario', JSON.stringify(usuario))
  },

  obtenerUsuario: () => {
    const datos = localStorage.getItem('usuario')
    return datos ? JSON.parse(datos) : null
  },

  limpiarUsuario: () => {
    localStorage.removeItem('usuario')
  },

  // LECTURAS
  guardarLecturas: (lecturas: any[]) => {
    localStorage.setItem('lecturas', JSON.stringify(lecturas))
  },

  obtenerLecturas: () => {
    const datos = localStorage.getItem('lecturas')
    return datos ? JSON.parse(datos) : []
  },

  guardarLectura: (lectura: any) => {
    const lecturas = storageService.obtenerLecturas()
    const index = lecturas.findIndex((l: any) => l.id === lectura.id)
    if (index >= 0) {
      lecturas[index] = lectura
    } else {
      lecturas.push(lectura)
    }
    storageService.guardarLecturas(lecturas)
  },

  // HISTORIAL
  guardarHistorial: (evento: any) => {
    const historial = storageService.obtenerHistorial()
    historial.unshift({
      ...evento,
      timestamp: new Date().toISOString(),
    })
    // Mantener solo los últimos 100 eventos
    if (historial.length > 100) {
      historial.pop()
    }
    localStorage.setItem('historial', JSON.stringify(historial))
  },

  obtenerHistorial: () => {
    const datos = localStorage.getItem('historial')
    return datos ? JSON.parse(datos) : []
  },

  // CONFIGURACIÓN
  guardarConfiguracion: (config: any) => {
    localStorage.setItem('configuracion', JSON.stringify(config))
  },

  obtenerConfiguracion: () => {
    const datos = localStorage.getItem('configuracion')
    return datos ? JSON.parse(datos) : {}
  },
}
