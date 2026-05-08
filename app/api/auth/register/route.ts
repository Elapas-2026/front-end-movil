// TODO: Implementar endpoint de registro
// Este archivo está preparado para conectar con la API

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validar datos de entrada
    // TODO: Hashear contraseña con bcrypt
    // TODO: Guardar usuario en base de datos
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
