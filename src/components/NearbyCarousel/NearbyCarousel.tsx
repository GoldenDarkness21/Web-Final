import React from 'react'
import './NearbyCarousel.css'

type NearbyProduct = {
  id: number
  title: string
  image?: string
  distance: number
}

type NearbyCarouselProps = {
  products: NearbyProduct[]
}

const NearbyCarousel: React.FC<NearbyCarouselProps> = ({ products }) => {
  if (products.length === 0) {
    return null
  }

  // Duplicar los productos para crear efecto de carrusel infinito
  const duplicatedProducts = [...products, ...products]

  return (
    <div className="nearby-carousel">
      <div className="nearby-carousel__track">
        {duplicatedProducts.map((product, index) => (
          <div key={`${product.id}-${index}`} className="nearby-carousel__item">
            <div className="nearby-carousel__image-wrapper">
              <img
                src={product.image || '/placeholder.png'}
                alt={product.title}
                className="nearby-carousel__image"
              />
            </div>
            <p className="nearby-carousel__title">{product.title}</p>
            <span className="nearby-carousel__distance">
              {product.distance < 1 
                ? `${Math.round(product.distance * 1000)} m` 
                : `${product.distance.toFixed(1)} km`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NearbyCarousel
