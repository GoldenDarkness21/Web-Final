import { useState, useEffect } from 'react'
import type { Coordinates } from '../types'

export interface GeolocationState {
  coordinates: Coordinates | null
  loading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener la ubicación geográfica del usuario.
 * Usa la API de Geolocation del navegador.
 * 
 * @returns {GeolocationState} Estado de la geolocalización
 */
export const useGeolocation = (): GeolocationState => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      setLoading(false)
      return
    }

    // Obtener la posición actual del usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
        setError(null)
      },
      (err) => {
        let errorMessage = 'Error al obtener la ubicación'
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, habilítalo en tu navegador.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible'
            break
          case err.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación'
            break
          default:
            errorMessage = 'Error desconocido al obtener la ubicación'
        }
        
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true, // Mayor precisión
        timeout: 10000, // 10 segundos de timeout
        maximumAge: 0, // No usar caché
      }
    )
  }, [])

  return { coordinates, loading, error }
}
