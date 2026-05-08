import axios from 'axios'

export interface ReverseGeocodeResult {
  address: string
  city?: string
  street?: string
  country?: string
}

/**
 * Obtiene la dirección desde coordenadas usando Nominatim (OpenStreetMap)
 * @param lat Latitud
 * @param lng Longitud
 * @returns Dirección formateada
 */
export async function getReverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'ELAPAS-Mobile-App/1.0',
        },
      }
    )

    const address = response.data.address
    const fullAddress = response.data.display_name || 'Dirección desconocida'

    return {
      address: fullAddress,
      street: address?.road || address?.pedestrian || '',
      city: address?.city || address?.town || address?.village || '',
      country: address?.country || '',
    }
  } catch (error) {
    console.error('[v0] Error en geocoding inverso:', error)
    throw new Error('No se pudo obtener la dirección. Intenta ingresar manualmente.')
  }
}

/**
 * Obtiene coordenadas desde una dirección usando Nominatim
 * @param address Dirección en texto
 * @returns Coordenadas {lat, lng}
 */
export async function getGeocodeFromAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'ELAPAS-Mobile-App/1.0',
      },
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('Dirección no encontrada')
    }

    const result = response.data[0]
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
  } catch (error) {
    console.error('[v0] Error en geocoding:', error)
    throw new Error('No se pudo encontrar la dirección.')
  }
}
