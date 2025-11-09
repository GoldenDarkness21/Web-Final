import React from 'react'
import './PointCard.css'
import type { DandiPoint } from '../../types'

type Props = { point: DandiPoint }

const PointCard: React.FC<Props> = ({ point }) => {
    const isNearby = point.type === 'nearby'

    return (
        <article
            className={`point ${isNearby ? 'point--nearby' : 'point--regular'}`}
        >
            <div className="point__left">
                <img
                    className="point__logo"
                    src={point.logo}
                    alt={point.name}
                    loading="lazy"
                />
                <div className="point__text">
                    <h3 className="point__title">{point.name}</h3>
                    <div className="point__meta">
                        <span>+{point.newPosts} Publicaciones nuevas</span>
                        <span className="dot">•</span>
                        <span>+{point.activeUsers} Usuarios activos</span>
                    </div>
                </div>
            </div>

            <div
                className="point__right"
                aria-label={`Distancia ${point.distance}`}
            >
                <img
                    className="point__pin"
                    src={point.pin ?? '/imgMap/distance.png'}
                    alt=""
                    loading="lazy"
                />
                <span className="point__distance">{point.distance}</span>
            </div>
        </article>
    )
}

export default PointCard
