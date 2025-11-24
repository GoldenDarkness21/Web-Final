import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import RatingStars from '../RatingStars/RatingStars'
import './RatingsList.css'

type Rating = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  rater_user_id: string
  rater_info?: {
    username: string
    avatar_url: string | null
  }
}

type RatingsListProps = {
  userId: string
  limit?: number
}

const RatingsList: React.FC<RatingsListProps> = ({ userId, limit = 10 }) => {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true)
        const { data: ratingsData, error } = await supabase
          .from('ratings')
          .select('*')
          .eq('rated_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        // Obtener info de los usuarios que calificaron
        if (ratingsData && ratingsData.length > 0) {
          const raterIds = ratingsData.map(r => r.rater_user_id)
          const { data: usersInfo } = await supabase
            .from('user_info')
            .select('id, username, avatar_url')
            .in('id', raterIds)

          const ratingsWithUsers = ratingsData.map(rating => ({
            ...rating,
            rater_info: usersInfo?.find(u => u.id === rating.rater_user_id)
          }))

          setRatings(ratingsWithUsers)
        } else {
          setRatings([])
        }
      } catch (err) {
        console.error('Error fetching ratings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [userId, limit])

  if (loading) {
    return <div className="ratings-list__loading">Cargando calificaciones...</div>
  }

  if (ratings.length === 0) {
    return (
      <div className="ratings-list__empty">
        Aún no hay calificaciones para este usuario.
      </div>
    )
  }

  return (
    <div className="ratings-list">
      <h3 className="ratings-list__title">Calificaciones ({ratings.length})</h3>
      <div className="ratings-list__items">
        {ratings.map((rating) => (
          <div key={rating.id} className="rating-item">
            <div className="rating-item__header">
              <div className="rating-item__user">
                {rating.rater_info?.avatar_url ? (
                  <img
                    src={rating.rater_info.avatar_url}
                    alt={rating.rater_info.username}
                    className="rating-item__avatar"
                    loading="lazy"
                    width="40"
                    height="40"
                  />
                ) : (
                  <div className="rating-item__avatar rating-item__avatar--placeholder">
                    {rating.rater_info?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="rating-item__username">
                  {rating.rater_info?.username || 'Usuario'}
                </span>
              </div>
              <RatingStars rating={rating.rating} readonly size="small" />
            </div>
            {rating.comment && (
              <p className="rating-item__comment">{rating.comment}</p>
            )}
            <span className="rating-item__date">
              {new Date(rating.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RatingsList
