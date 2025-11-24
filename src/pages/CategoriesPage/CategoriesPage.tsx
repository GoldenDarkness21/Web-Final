import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SuggestedCard from '../../components/SuggestedCard/SuggestedCard'
import ProductCard from '../../components/ProductCard/ProductCard'
import type { Category } from '../../types'
import categoriesData from '../../assets/categories.json'
import { supabase } from '../../supabaseClient'
import './Categories.css'

const CATEGORIES: Category[] = categoriesData as Category[]

type Product = {
  id: number
  title: string
  category: string
  condition: string
  location: string
  image?: string
  description?: string
}

const CategoriesPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const selectedCategory = searchParams.get('cat')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedCategory) {
                setProducts([])
                return
            }

            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('user_posts')
                    .select('id,title,category,condition,location,image,description')
                    .eq('category', selectedCategory)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setProducts((data ?? []) as unknown as Product[])
            } catch (err) {
                console.error('Error fetching products:', err)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [selectedCategory])

    const handleCategoryClick = (categoryName: string) => {
        navigate(`/categorias?cat=${encodeURIComponent(categoryName)}`)
    }

    return (
        <div className="categories__page">
            <section className="categories__container">
                <div className="categories__header">
                    <h2 className="categories__title">Todas las categorías</h2>
                    <p className="categories__subtitle">Explora y encuentra lo que necesitas</p>
                </div>

                <div className="categories__grid">
                    {CATEGORIES.map((cat) => (
                        <SuggestedCard
                            key={cat.id}
                            name={cat.name}
                            image={cat.image}
                            showName
                            className="category-card"
                            onClick={() => handleCategoryClick(cat.name)}
                        />
                    ))}
                </div>
            </section>

            {selectedCategory && (
                <section className="categories__products-section">
                    <div className="products-header">
                        <div className="products-header-content">
                            <h2 className="products-title">{selectedCategory}</h2>
                            <p className="products-count">
                                {loading ? 'Cargando...' : `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`}
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/categorias')} 
                            className="back-to-categories-btn"
                        >
                            ← Ver todas las categorías
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <p>Cargando productos...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-state-icon">📦</p>
                            <p className="empty-state-text">No hay productos en esta categoría aún</p>
                            <p className="empty-state-subtext">Sé el primero en publicar algo</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    title={product.title}
                                    category={product.category}
                                    condition={product.condition}
                                    location={product.location}
                                    image={product.image}
                                    description={product.description}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}

export default CategoriesPage
