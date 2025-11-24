import React from 'react'
import { useNavigate } from 'react-router-dom'
import './MapBanner.css'

const MapBanner: React.FC = () => {
  const navigate = useNavigate()
  const handleMapClick = () => navigate('/mapa')

  return (
    <div className="map-banner" role="region" aria-label="Intercambia cerca">
      <img
        src="/bannermap.svg"
        alt=""
        className="map-banner__bg"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      <div className="map-banner__content">
        <h2 className="map-banner__title">
          Intercambia cerca de donde te encuentres
        </h2>
        <button className="map-banner__button" onClick={handleMapClick}>
          Ver mapa →
        </button>
      </div>
    </div>
  )
}

export default MapBanner
