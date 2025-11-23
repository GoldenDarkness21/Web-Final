import type { Coordinates } from '../types'

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine.
 * Esta fórmula considera la curvatura de la Tierra para calcular distancias más precisas.
 * 
 * @param coord1 - Primer punto (coordenadas del usuario)
 * @param coord2 - Segundo punto (coordenadas del post)
 * @returns Distancia en kilómetros
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371 // Radio de la Tierra en kilómetros

  const lat1 = toRadians(coord1.lat)
  const lat2 = toRadians(coord2.lat)
  const deltaLat = toRadians(coord2.lat - coord1.lat)
  const deltaLng = toRadians(coord2.lng - coord1.lng)

  // Fórmula de Haversine
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // Distancia en kilómetros

  return distance
}

/**
 * Convierte grados a radianes
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * Geocodifica una dirección de texto a coordenadas usando Google Maps API
 * 
 * @param address - Dirección en formato texto
 * @param apiKey - API Key de Google Maps
 * @returns Coordenadas o null si no se pudo geocodificar
 */
export const geocodeAddress = async (
  address: string,
  apiKey: string
): Promise<Coordinates | null> => {
  try {
    // Intentar primero con la dirección original
    let response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    )

    let data = await response.json()

    // Si no se encuentra, intentar agregando "Colombia"
    if (data.status === 'ZERO_RESULTS' && !address.toLowerCase().includes('colombia')) {
      response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${address}, Colombia`
        )}&key=${apiKey}`
      )
      data = await response.json()
    }

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
      }
    }

    return null
  } catch (error) {
    console.error('Error geocodificando dirección:', error)
    return null
  }
}

/**
 * Formatea la distancia para mostrar al usuario
 * 
 * @param distance - Distancia en kilómetros
 * @returns String formateado (ej: "2.5 km" o "500 m")
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  return `${distance.toFixed(1)} km`
}
