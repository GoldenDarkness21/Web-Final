import React, { useEffect, useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar/SearchBar'
import HeroBanner from '../../components/HeroBanner/HeroBanner'
import SuggestedCard from '../../components/SuggestedCard/SuggestedCard'
import ProductCard from '../../components/ProductCard/ProductCard'
import MapBanner from '../../components/MapBanner/MapBanner'
import Button from '../../components/Button/Button'
import { AddPostButton } from '../../components/AddPostButton/AddPostButton'
import NearbyCarousel from '../../components/NearbyCarousel/NearbyCarousel'
import type { CardItem, Coordinates } from '../../types'
import suggestedItemsData from '../../assets/suggestedItems.json'
import tradesItemsData from '../../assets/tradesItems.json'
import { supabase } from '../../supabaseClient'
import { useGeolocation } from '../../hooks/useGeolocation'
import { calculateDistance, geocodeAddress, formatDistance } from '../../utils/geolocation'
import '../../styles/products-grid.css'
import './suggested.css'

const suggestedItems: CardItem[] = suggestedItemsData
const tradesItems: CardItem[] = tradesItemsData

// Tipo local para los productos de la tarjeta
type Product = {
  id: number
  title: string
  category: string
  condition: string
  location: string
  image?: string
  description?: string
}

type ProductWithDistance = Product & {
  distance?: number
  coordinates?: Coordinates
}

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [productsWithDistance, setProductsWithDistance] = useState<ProductWithDistance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Obtener ubicación del usuario
  const { coordinates: userLocation, loading: locationLoading, error: locationError } = useGeolocation()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
          .from('user_posts')
          .select('id,title,category,condition,location,image,description')
          .order('id', { ascending: true })

        if (error) throw error
        setProducts((data ?? []) as unknown as Product[])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()

    // Suscripción en tiempo real para detectar nuevos posts
    const channel = supabase
      .channel('user_posts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_posts'
        },
        (payload) => {
          console.log('Nuevo post detectado:', payload)
          const newPost = payload.new as Product
          setProducts((prev) => [...prev, newPost])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_posts'
        },
        (payload) => {
          console.log('Post actualizado:', payload)
          const updatedPost = payload.new as Product
          setProducts((prev) =>
            prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_posts'
        },
        (payload) => {
          console.log('Post eliminado:', payload)
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Calcular distancias cuando tengamos ubicación del usuario y productos
  useEffect(() => {
    const calculateDistances = async () => {
      if (!userLocation || !apiKey || products.length === 0) {
        setProductsWithDistance(products.map(p => ({ ...p })))
        return
      }

      const productsWithCoords = await Promise.all(
        products.map(async (product) => {
          try {
            // Geocodificar la dirección del producto
            const productCoords = await geocodeAddress(product.location, apiKey)
            
            if (productCoords) {
              // Calcular distancia
              const distance = calculateDistance(userLocation, productCoords)
              return {
                ...product,
                distance,
                coordinates: productCoords,
              }
            }
            return { ...product }
          } catch (err) {
            console.error(`Error calculando distancia para producto ${product.id}:`, err)
            return { ...product }
          }
        })
      )

      setProductsWithDistance(productsWithCoords)
    }

    calculateDistances()
  }, [products, userLocation, apiKey])

  const filteredSuggested = useMemo(
    () => suggestedItems.filter(i =>
      i.name.toLowerCase().includes(query.toLowerCase())
    ),
    [query]
  )

  const filteredTrades = useMemo(
    () => tradesItems.filter(i =>
      i.name.toLowerCase().includes(query.toLowerCase())
    ),
    [query]
  )

  // Productos cercanos (dentro de 5 km, ordenados por distancia)
  const MAX_DISTANCE_KM = 5 // Radio máximo de búsqueda en kilómetros
  
  const nearbyProducts = useMemo(() => {
    const withDistance = productsWithDistance.filter(p => 
      p.distance !== undefined && 
      p.distance <= MAX_DISTANCE_KM && // Solo productos dentro del radio
      p.title?.toLowerCase().includes(query.toLowerCase())
    )
    return withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }, [productsWithDistance, query])

  // Productos "Según tus intereses" (todos los productos filtrados por búsqueda)
  const filteredProducts = useMemo(
    () => productsWithDistance.filter(p =>
      p.title?.toLowerCase().includes(query.toLowerCase())
    ),
    [productsWithDistance, query]
  )

  return (
    <main style={{ padding: 24 }}>
      <SearchBar onSearch={setQuery} placeholder="Buscar por nombre..." />

      <HeroBanner />

      {/* Sugeridos */}
      <section className="suggested">
        <header className="suggested__header">
          <h2 className="suggested__title">Sugeridos de hoy</h2>
          <Button to="/sugeridos">Ver más</Button>
        </header>
        <div className="suggested__row">
          {filteredSuggested.map(({ id, name, image }) => (
            <SuggestedCard key={id} name={name} image={image} />
          ))}
        </div>
      </section>

      {/* Trueques cercanos basados en ubicación del usuario */}
      <section className="suggested">
        <header className="suggested__header">
          <h2 className="suggested__title">Trueques cerca de ti</h2>
          {locationError && (
            <small style={{ color: '#f44336', fontSize: '0.85rem' }}>
              {locationError}
            </small>
          )}
          {locationLoading && (
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Obteniendo tu ubicación...
            </small>
          )}
          {userLocation && !locationLoading && nearbyProducts.length > 0 && (
            <small style={{ color: '#4caf50', fontSize: '0.85rem' }}>
              ● {nearbyProducts.length} trueque{nearbyProducts.length !== 1 ? 's' : ''} cercano{nearbyProducts.length !== 1 ? 's' : ''}
            </small>
          )}
        </header>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando trueques cercanos...</div>
        )}
        
        {!loading && nearbyProducts.length === 0 && userLocation && productsWithDistance.length > 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No hay trueques disponibles dentro de 5 km de tu ubicación.</p>
            <small style={{ color: '#666' }}>Intenta buscar en "Según tus intereses" más abajo.</small>
          </div>
        )}

        {!loading && nearbyProducts.length === 0 && userLocation && productsWithDistance.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            No hay trueques disponibles en este momento.
          </div>
        )}

        {!loading && !userLocation && !locationLoading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Habilita la ubicación en tu navegador para ver trueques cercanos.</p>
            <small style={{ color: '#666' }}>Mostraremos solo trueques dentro de 5 km de tu ubicación.</small>
          </div>
        )}

        {!loading && nearbyProducts.length > 0 && (
          <NearbyCarousel 
            products={nearbyProducts.map(p => ({
              id: p.id,
              title: p.title,
              image: p.image,
              distance: p.distance || 0
            }))}
          />
        )}
      </section>

      {/* Según tus intereses */}
      <section className="products-section">
        <header className="products-section__header">
          <h2 className="suggested__title">Según tus intereses</h2>
          <Button to="/productos">Ver más →</Button>
        </header>

        {loading && (
          <div className="products-section__list">Cargando productos...</div>
        )}
        {error && !loading && (
          <div className="products-section__list">Error: {error}</div>
        )}
        {!loading && !error && (
          <div className="products-section__list">
            {filteredProducts.map((product: ProductWithDistance) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                category={product.category}
                condition={product.condition}
                location={`${product.location}${product.distance ? ` - ${formatDistance(product.distance)}` : ''}`}
                image={product.image}
                description={product.description}
              />
            ))}
          </div>
        )}
      </section>

      {/* Banner del Mapa */}
      <MapBanner />

      {/* Botón flotante para añadir post */}
      <div className="floating-add-button">
        <AddPostButton />
      </div>
    </main>
  )
}

export default HomePage
