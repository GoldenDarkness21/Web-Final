import React from 'react'
import './HeroBanner.css'

const HeroBanner: React.FC = () => {
    return (
        <div className="hero-banner">
            <div className="hero-text">
                <h2>
                    En <strong>Dandi</strong>, no solo cambias objetos:
                </h2>
                <h1>¡Cambias realidades!</h1>
            </div>
            <div className="hero-image">
                <img 
                    src="imgBanner.png" 
                    alt="Compradora feliz con bolsas" 
                    loading="eager"
                    fetchPriority="high"
                    width="400"
                    height="360"
                />
            </div>
        </div>
    )
}

export default HeroBanner
