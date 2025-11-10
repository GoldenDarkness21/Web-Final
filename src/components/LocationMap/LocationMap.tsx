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
  height: '300px',
  borderRadius: '12px',
}

const defaultCenter = {
  lat: 3.4516, // Cali, Colombia (default)
  lng: -76.5320,
}

const LocationMap: React.FC<LocationMapProps> = ({ address }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [markerIcon, setMarkerIcon] = useState<google.maps.Icon | google.maps.Symbol | string | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Función que se ejecuta cuando Google Maps se carga completamente
  const handleMapLoad = () => {
    if (window.google && window.google.maps) {
      setMarkerIcon({
        url: '/marker-icon.png',
        scaledSize: new window.google.maps.Size(80, 80), // 25x25px
        anchor: new window.google.maps.Point(12, 25), // Centro-inferior
      })
    }
  }

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

        // Intentar primero con la dirección original
        let response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${apiKey}`
        )

        let data = await response.json()

        // Si no se encuentra, intentar agregando "Colombia"
        if (data.status === 'ZERO_RESULTS' && !address.toLowerCase().includes('colombia')) {
          console.log('Intentando con "Colombia" agregado...')
          response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              `${address}, Colombia`
            )}&key=${apiKey}`
          )
          data = await response.json()
        }

        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location
          setCoordinates({
            lat: location.lat,
            lng: location.lng,
          })
          setError(null)
        } else if (data.status === 'ZERO_RESULTS') {
          setError('No se encontró la dirección. Mostrando ubicación por defecto.')
          setCoordinates(defaultCenter)
        } else {
          setError(`No se pudo localizar la dirección. Mostrando ubicación por defecto.`)
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

      <LoadScript 
        googleMapsApiKey={apiKey}
        loadingElement={<div className="map-loading"><div className="spinner"></div></div>}
        onLoad={handleMapLoad}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coordinates || defaultCenter}
          zoom={15}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            mapId: 'DEMO_MAP_ID', // Añadido para preparación futura con AdvancedMarker
          }}
        >
          {coordinates && markerIcon && (
            <Marker
              position={coordinates}
              onClick={() => setShowInfo(!showInfo)}
              icon={markerIcon}
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
