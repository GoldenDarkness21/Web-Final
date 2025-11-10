import React, { useEffect, useState, useMemo } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../../components/SearchBar/SearchBar'
import { supabase } from '../../supabaseClient'
import './map.css'

type PostLocation = {
  id: number
  title: string
  category: string
  location: string
  image?: string
  lat: number
  lng: number
}

type LocationGroup = {
  location: string
  lat: number
  lng: number
  posts: PostLocation[]
  distance?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 3.4516, // Cali, Colombia
  lng: -76.5320,
}

const MapPage: React.FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<PostLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Cargar posts y geocodificar ubicaciones
  useEffect(() => {
    const fetchPostsWithLocations = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('user_posts')
          .select('id, title, category, location, image')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Geocodificar cada ubicación
        const postsWithCoords = await Promise.all(
          (data || []).map(async (post) => {
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  post.location + ', Colombia'
                )}&key=${apiKey}`
              )
              const geoData = await response.json()

              if (geoData.status === 'OK' && geoData.results.length > 0) {
                const { lat, lng } = geoData.results[0].geometry.location
                return {
                  ...post,
                  lat,
                  lng,
                }
              }
              return null
            } catch (err) {
              console.error('Error geocoding:', err)
              return null
            }
          })
        )

        setPosts(postsWithCoords.filter((p) => p !== null) as PostLocation[])
      } catch (err) {
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    if (apiKey) {
      fetchPostsWithLocations()
    }
  }, [apiKey])

  // Agrupar posts por ubicación
  const locationGroups = useMemo(() => {
    const groups: { [key: string]: LocationGroup } = {}

    posts.forEach((post) => {
      if (!groups[post.location]) {
        groups[post.location] = {
          location: post.location,
          lat: post.lat,
          lng: post.lng,
          posts: [],
        }
      }
      groups[post.location].posts.push(post)
    })

    return Object.values(groups)
  }, [posts])

  // Filtrar por búsqueda
  const filteredGroups = useMemo(() => {
    if (!query) return locationGroups
    return locationGroups.filter(
      (group) =>
        group.location.toLowerCase().includes(query.toLowerCase()) ||
        group.posts.some((post) =>
          post.title.toLowerCase().includes(query.toLowerCase())
        )
    )
  }, [locationGroups, query])

  const handleLocationClick = (group: LocationGroup) => {
    setSelectedLocation(group.location)
    setMapCenter({ lat: group.lat, lng: group.lng })
  }

  const handlePostClick = (postId: number) => {
    navigate(`/producto/${postId}`)
  }

  return (
    <main className="map-layout">
      {/* Panel izquierdo */}
      <section className="map-left">
        <SearchBar
          onSearch={setQuery}
          placeholder="Buscar punto Dandi..."
        />

        {loading ? (
          <div className="map-loading-panel">
            <p>Cargando ubicaciones...</p>
          </div>
        ) : (
          <>
            {filteredGroups.length > 0 && (
              <div className="map-section">
                <h2 className="map-section__title">Puntos Dandi</h2>
                {filteredGroups.map((group) => (
                  <div
                    key={group.location}
                    className={`location-card ${
                      selectedLocation === group.location ? 'selected' : ''
                    }`}
                    onClick={() => handleLocationClick(group)}
                  >
                    <div className="location-header">
                      <span className="location-icon">📍</span>
                      <div className="location-info">
                        <h3 className="location-name">
                          {group.location.split(',')[0]}
                        </h3>
                        <p className="location-meta">
                          +{group.posts.length} Publicaciones nuevas • +
                          {group.posts.length} Usuarios activos
                        </p>
                      </div>
                      <span className="location-badge">
                        🏷️ {group.posts.length}
                      </span>
                    </div>

                    {selectedLocation === group.location && (
                      <div className="location-posts">
                        {group.posts.map((post) => (
                          <div
                            key={post.id}
                            className="mini-post-card"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePostClick(post.id)
                            }}
                          >
                            {post.image && (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="mini-post-image"
                              />
                            )}
                            <div className="mini-post-info">
                              <h4>{post.title}</h4>
                              <span className="mini-post-category">
                                {post.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Panel derecho (mapa) */}
      <section className="map-right">
        {apiKey ? (
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={selectedLocation ? 15 : 12}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {filteredGroups.map((group) => (
                <Marker
                  key={group.location}
                  position={{ lat: group.lat, lng: group.lng }}
                  onClick={() => handleLocationClick(group)}
                  icon="/marker-icon.png"
                  label={{
                    text: group.posts.length.toString(),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        ) : (
          <div className="map-error">
            <p>Google Maps API key no configurada</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default MapPage
