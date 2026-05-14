// Endpoint para marcar una lectura como verificada por el técnico
// Permite que el siguiente técnico sepa que fue revisada

import { NextRequest, NextResponse } from 'next/server'

interface MarkLecturaRequest {
  lecturaId: number
  verificado: boolean
  observacion?: string
}

export async function PUT(request: NextRequest) {
  try {
    const body: MarkLecturaRequest = await request.json()
    const { lecturaId, verificado, observacion } = body

    // TODO: Validar token JWT del header Authorization
    if (!request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    // TODO: Validar que lecturaId sea válido
    if (!lecturaId || typeof verificado !== 'boolean') {
      return NextResponse.json(
        { error: 'Datos inválidos: lecturaId y verificado son requeridos' },
        { status: 400 }
      )
    }

    // TODO: Conectar con la base de datos para actualizar lectura
    // Campos a actualizar:
    // - verificado: boolean
    // - fechaVerificacion: fecha actual si verificado = true
    // - observacion: string opcional
    // - updatedAt: fecha actual

    // Respuesta simulada exitosa
    return NextResponse.json({
      success: true,
      mensaje: `Lectura ${verificado ? 'marcada como verificada' : 'desmarcada'}`,
      lectura: {
        id: lecturaId,
        verificado,
        fechaVerificacion: verificado ? new Date().toISOString() : null,
        observacion: observacion || null,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[ERROR] Al marcar lectura:', error)
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    )
  }
}
