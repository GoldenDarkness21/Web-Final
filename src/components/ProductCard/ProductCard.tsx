import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductCard.css'
import SaveButton from '../SaveButton/SaveButton'

type ProductCardProps = {
  id: number | string
  title: string
  category: string
  condition: string
  location: string
  image?: string
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  category,
  condition,
  location,
  image
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/producto/${id}`)
  }


  return (
    <div 
      className="product-card"
      onClick={handleClick}
    >
      <div className="product-card__image">
        <div 
          className="product-card__image-placeholder"
          style={{ 
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundColor: image ? 'transparent' : '#e9e6dc'
          }}
        ></div>
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title">{title}</h3>
        <div className="product-card__details">
          <span className="product-card__category">{category}</span>
          <span className="product-card__condition">Estado: {condition}</span>
          <span className="product-card__location">{location}</span>
        </div>
      </div>

      <SaveButton 
        id={id}
        title={title}
        image={image}
        category={category}
        condition={condition}
        location={location}
        />
    </div>
  )
}

export default ProductCard