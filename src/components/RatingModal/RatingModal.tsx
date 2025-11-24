import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import RatingStars from '../RatingStars/RatingStars'
import './RatingModal.css'

type RatingModalProps = {
  isOpen: boolean
  onClose: () => void
  ratedUserId: string
  postId?: number
  onRatingSubmitted?: () => void
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  ratedUserId,
  postId,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setRating(0)
      setComment('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    if (!currentUserId) {
      setError('Debes iniciar sesión para calificar')
      return
    }

    if (currentUserId === ratedUserId) {
      setError('No puedes calificarte a ti mismo')
      return
    }

    setLoading(true)
    setError(null)

    try {

      // Verificar si ya existe un rating
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('rated_user_id', ratedUserId)
        .eq('rater_user_id', currentUserId)
        .eq('post_id', postId || null)
        .maybeSingle()

      let ratingError

      if (existingRating) {
        // Actualizar rating existente
        const { error } = await supabase
          .from('ratings')
          .update({
            rating: rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id)
        
        ratingError = error
      } else {
        // Insertar nuevo rating
        const { error } = await supabase
          .from('ratings')
          .insert({
            rated_user_id: ratedUserId,
            rater_user_id: currentUserId,
            post_id: postId || null,
            rating: rating,
            comment: comment.trim() || null
          })
        
        ratingError = error
      }

      if (ratingError) {
        console.error('Rating operation error:', ratingError)
        throw new Error(ratingError.message || 'Error al guardar la calificación')
      }

      // Calcular nuevo promedio
      const { data: ratings, error: fetchError } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_user_id', ratedUserId)

      if (fetchError) {
        console.error('Fetch ratings error:', fetchError)
        throw new Error('Error al calcular promedio')
      }

      if (ratings && ratings.length > 0) {
        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        
        // Actualizar user_info con el nuevo promedio
        const { error: updateError } = await supabase
          .from('user_info')
          .update({
            average_rating: parseFloat(avg.toFixed(1)),
            total_ratings: ratings.length
          })
          .eq('id', ratedUserId)

        if (updateError) {
          console.error('Update user_info error:', updateError)
          // No lanzar error aquí, el rating ya se guardó
        }
      }

      onRatingSubmitted?.()
      onClose()
    } catch (err) {
      console.error('Error submitting rating:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar calificación'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rating-modal__close" onClick={onClose}>
          ×
        </button>
        
        <h2 className="rating-modal__title">Calificar Usuario</h2>
        
        <form onSubmit={handleSubmit} className="rating-modal__form">
          <div className="rating-modal__field">
            <label>Tu calificación</label>
            <RatingStars 
              rating={rating} 
              onRate={setRating} 
              size="large"
            />
          </div>

          <div className="rating-modal__field">
            <label htmlFor="comment">Comentario (opcional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia..."
              rows={4}
              maxLength={500}
            />
            <span className="rating-modal__char-count">
              {comment.length}/500
            </span>
          </div>

          {error && (
            <div className="rating-modal__error">{error}</div>
          )}

          <div className="rating-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="rating-modal__button rating-modal__button--cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rating-modal__button rating-modal__button--submit"
              disabled={loading || rating === 0}
            >
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RatingModal
