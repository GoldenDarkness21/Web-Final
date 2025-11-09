import React, { useEffect, useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar/SearchBar'
import HeroBanner from '../../components/HeroBanner/HeroBanner'
import SuggestedCard from '../../components/SuggestedCard/SuggestedCard'
import ProductCard from '../../components/ProductCard/ProductCard'
import MapBanner from '../../components/MapBanner/MapBanner'
import Button from '../../components/Button/Button'
import { AddPostButton } from '../../components/AddPostButton/AddPostButton'
import type { CardItem } from '../../types'
import suggestedItemsData from '../../assets/suggestedItems.json'
import tradesItemsData from '../../assets/tradesItems.json'
import { supabase } from '../../supabaseClient'
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
}

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
          .from('user_posts')
          .select('id,title,category,condition,location,image')
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
  }, [])

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

  // Productos “Según tus intereses”
  const filteredProducts = useMemo(
    () => products.filter(p =>
      p.title?.toLowerCase().includes(query.toLowerCase())
    ),
    [products, query]
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

      {/* Trueques */}
      <section className="suggested">
        <header className="suggested__header">
          <h2 className="suggested__title">Trueques cerca de ti</h2>
          <Button to="/trueques">Ver más</Button>
        </header>
        <div className="suggested__row">
          {filteredTrades.map(({ id, name, image }) => (
            <SuggestedCard key={id} name={name} image={image} />
          ))}
        </div>
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
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                category={product.category}
                condition={product.condition}
                location={product.location}
                image={product.image}
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
