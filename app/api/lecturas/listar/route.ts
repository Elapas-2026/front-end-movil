// TODO: Implementar endpoint para listar lecturas
// Este archivo está preparado para conectar con la API

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // TODO: Validar token JWT del header Authorization
    // TODO: Obtener lecturas del usuario desde base de datos
    // TODO: Retornar lecturas con paginación
    
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
