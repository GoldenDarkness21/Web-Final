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
                <h2 className="categories__title">Todas las categorías</h2>

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
                <section className="categories__container" style={{ marginTop: '2rem' }}>
                    <h2 className="categories__title">
                        {selectedCategory}
                        <button 
                            onClick={() => navigate('/categorias')} 
                            style={{ 
                                marginLeft: '1rem', 
                                padding: '0.5rem 1rem',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Ver todas las categorías
                        </button>
                    </h2>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando productos...</p>
                    ) : products.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem' }}>
                            No hay productos en esta categoría
                        </p>
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
