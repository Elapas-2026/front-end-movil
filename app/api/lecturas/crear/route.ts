// TODO: Implementar endpoint para crear lectura
// Este archivo está preparado para conectar con la API

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validar token JWT
    // TODO: Validar datos de entrada
    // TODO: Guardar lectura en base de datos
    // TODO: Retornar lectura creada con ID
    
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
