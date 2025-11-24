import React from 'react'
import './SuggestedCard.css'
import type { SuggestedCardProps } from '../../types'

const SuggestedCard: React.FC<SuggestedCardProps> = ({
    name,
    image,
    onClick,
    className,
    showName,
}) => {
    return (
        <div
            className={`card ${className ?? ''}`}
            onClick={onClick}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
                if (!onClick) return
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            aria-label={showName ? name : undefined}
        >
            <img 
                src={image} 
                alt={name} 
                className="card__img" 
                loading="lazy"
                decoding="async"
                width="120"
                height="120"
            />
            {showName && <p className="card__label">{name}</p>}
        </div>
    )
}

export default SuggestedCard
