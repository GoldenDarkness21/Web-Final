import React, { useState } from 'react'
import './RatingStars.css'

type RatingStarsProps = {
  rating: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRate,
  readonly = false,
  size = 'medium'
}) => {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  return (
    <div className={`rating-stars rating-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rating-stars__star ${
            star <= displayRating ? 'rating-stars__star--filled' : ''
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
        >
          ★
        </button>
      ))}
      {rating > 0 && (
        <span className="rating-stars__value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default RatingStars
