import React, { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import './LocationMap.css'

type LocationMapProps = {
  address: string
}

type Coordinates = {
  lat: number
  lng: number
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
}

const defaultCenter = {
  lat: 14.6349, // San Salvador, El Salvador (default)
  lng: -90.5069,
}

const LocationMap: React.FC<LocationMapProps> = ({ address }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address || !apiKey) {
        setLoading(false)
        setError('API key o dirección no disponible')
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Usar la API de Geocoding de Google Maps
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${apiKey}`
        )

        const data = await response.json()

        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location
          setCoordinates({
            lat: location.lat,
            lng: location.lng,
          })
        } else if (data.status === 'ZERO_RESULTS') {
          setError('No se encontró la dirección. Mostrando ubicación por defecto.')
          setCoordinates(defaultCenter)
        } else {
          setError(`Error al geocodificar: ${data.status}`)
          setCoordinates(defaultCenter)
        }
      } catch (err) {
        console.error('Error al geocodificar:', err)
        setError('Error al cargar el mapa')
        setCoordinates(defaultCenter)
      } finally {
        setLoading(false)
      }
    }

    geocodeAddress()
  }, [address, apiKey])

  if (!apiKey) {
    return (
      <div className="map-error">
        <p>⚠️ Google Maps API key no configurada</p>
        <p className="map-error-details">
          Agrega VITE_GOOGLE_MAPS_API_KEY a tu archivo .env
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="location-map-container">
      {error && (
        <div className="map-warning">
          <span>⚠️ {error}</span>
        </div>
      )}

      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coordinates || defaultCenter}
          zoom={15}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {coordinates && (
            <Marker
              position={coordinates}
              onClick={() => setShowInfo(!showInfo)}
            />
          )}

          {showInfo && coordinates && (
            <InfoWindow
              position={coordinates}
              onCloseClick={() => setShowInfo(false)}
            >
              <div className="info-window-content">
                <h4>📍 Ubicación</h4>
                <p>{address}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

export default LocationMap
