import React from 'react'
import SuggestedCard from '../../components/SuggestedCard/SuggestedCard'
import type { Category } from '../../types'
import categoriesData from '../../assets/categories.json'
import './Categories.css'

const CATEGORIES: Category[] = categoriesData as Category[]

const CategoriesPage: React.FC = () => {
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
                            onClick={() => console.log('click:', cat.name)}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default CategoriesPage
