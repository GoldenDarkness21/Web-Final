import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import SaveButton from '../../components/SaveButton/SaveButton'
import LocationMap from '../../components/LocationMap/LocationMap'
import RatingStars from '../../components/RatingStars/RatingStars'
import RatingModal from '../../components/RatingModal/RatingModal'
import './ProductDetailPage.css'

type PostDetail = {
  id: number
  title: string
  description: string
  category: string
  condition: string
  location: string
  status?: string
  preferences?: string
  image?: string
  img2?: string
  img3?: string
  img4?: string
  created_at: string
  user_id: string
  users?: {
    username?: string
    full_name?: string
    email?: string
  }
  user_info?: {
    username?: string
    average_rating?: number
    total_ratings?: number
  }
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadPostDetails = async () => {
      if (!id) return

      try {
        setLoading(true)
        
        // Cargar detalles del post
        const { data: postData, error: postError } = await supabase
          .from('user_posts')
          .select('*')
          .eq('id', id)
          .single()

        if (postError) {
          console.error('[load post details error]:', postError)
          return
        }

        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        // Cargar información del usuario dueño del post
        if (postData.user_id) {
          // Obtener info desde user_info
          const { data: userInfoData } = await supabase
            .from('user_info')
            .select('username, average_rating, total_ratings')
            .eq('id', postData.user_id)
            .maybeSingle()

          let userInfo = undefined
          
          // Si el post es del usuario actual, usar su información
          if (user && user.id === postData.user_id) {
            userInfo = {
              username: user.user_metadata?.username || userInfoData?.username,
              full_name: user.user_metadata?.full_name,
              email: user.email
            }
          }

          // Combinar datos
          setPost({
            ...postData,
            users: userInfo,
            user_info: userInfoData || undefined
          } as PostDetail)
        } else {
          setPost(postData as PostDetail)
        }

        setSelectedImage(postData.image || null)
      } catch (err) {
        console.error('[unexpected error]:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadPostDetails()
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  // Función para hacer trueque
  const handleTrade = () => {
    alert('Funcionalidad de trueque próximamente')
  }

  // Función para reportar
  const handleReport = () => {
    alert('Reportar post próximamente')
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="detail-loading">Cargando...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="product-detail-page">
        <div className="detail-error">Post no encontrado</div>
      </div>
    )
  }

  // Obtener todas las imágenes disponibles
  const images = [post.image, post.img2, post.img3, post.img4].filter(Boolean) as string[]

  return (
    <div className="product-detail-page">
      <div className="detail-container">
        {/* Botón de regresar */}
        <button className="back-button" onClick={handleBack}>
          ← 
        </button>

        {/* Sección de imágenes */}
        <div className="detail-images">
          {/* Imagen principal */}
          <div className="main-image-container">
            <img 
              src={selectedImage || post.image || '/placeholder.jpg'} 
              alt={post.title}
              className="main-image"
            />
            <div className="save-button-overlay">
              <SaveButton
                id={post.id}
                title={post.title}
                image={post.image}
                category={post.category}
                condition={post.condition}
                location={post.location}
                description={post.description}
                size={32}
              />
            </div>
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${post.title} - ${index + 1}`}
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contenido de detalles */}
        <div className="detail-content">
          {/* Encabezado con título */}
          <div className="detail-header">
            <h1 className="detail-title">{post.title}</h1>
            <div className="detail-meta">
              <span className="detail-category">{post.category}</span>
              <span className="detail-location">📍 {post.location}</span>
            </div>
          </div>

          {/* Sección de detalles */}
          <section className="detail-section">
            <h2 className="section-title">Detalles</h2>
            <p className="detail-description">{post.description}</p>
          </section>

          {/* Información del vendedor */}
          <section className="detail-section seller-info">
            <h2 className="section-title">Publicado por:</h2>
            <div className="seller-card">
              <div className="seller-avatar">
                {(post.user_info?.username || post.users?.username || post.users?.full_name || post.users?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="seller-details">
                <p className="seller-name">
                  {post.user_info?.username || post.users?.username || post.users?.full_name || 'Usuario'}
                </p>
                <div className="seller-rating">
                  {post.user_info && post.user_info.total_ratings !== undefined && post.user_info.total_ratings > 0 ? (
                    <RatingStars 
                      rating={post.user_info.average_rating || 0} 
                      readonly 
                      size="small"
                    />
                  ) : (
                    <span className="no-rating">Sin calificaciones aún</span>
                  )}
                </div>
              </div>
              <div className="seller-actions">
                <button className="contact-button" title="Contactar">💬</button>
                {currentUserId && currentUserId !== post.user_id && (
                  <button 
                    className="rate-button" 
                    onClick={() => setIsRatingModalOpen(true)}
                    title="Calificar usuario"
                  >
                    ⭐ Calificar
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Información del trueque */}
          <section className="detail-section trade-info">
            <h2 className="section-title">Información del trueque</h2>
            <div className="trade-details">
              <div className="trade-item">
                <span className="trade-label">Condición:</span>
                <span className="trade-value">{post.condition}</span>
              </div>
              <div className="trade-item">
                <span className="trade-label">Estado:</span>
                <span className="trade-value">{post.status || 'No especificado'}</span>
              </div>
              <div className="trade-item">
                <span className="trade-label">Preferencias:</span>
                <span className="trade-value">{post.preferences || 'Intercambio libre'}</span>
              </div>
            </div>
          </section>

          {/* Mapa de ubicación */}
          <section className="detail-section location-section">
            <h2 className="section-title">📍 Ubicación</h2>
            <LocationMap address={post.location} />
          </section>

          {/* Botones de acción */}
          <div className="action-buttons">
            <button className="btn-trade" onClick={handleTrade}>
              Hacer trueque
            </button>
            <button className="btn-report" onClick={handleReport}>
              Reportar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Rating */}
      {post && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          ratedUserId={post.user_id}
          postId={post.id}
          onRatingSubmitted={() => {
            setIsRatingModalOpen(false)
            // Recargar info del post para actualizar rating
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default ProductDetailPage