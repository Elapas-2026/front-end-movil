// TODO: Implementar endpoint de login
// Este archivo está preparado para conectar con la API

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Conectar con base de datos y validar credenciales
    // TODO: Generar JWT token
    
    return NextResponse.json(
      { error: 'Endpoint no implementado aún' },
      { status: 501 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    )
  }
}
