import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import SaveButton from '../../components/SaveButton/SaveButton'
import './ProductDetailPage.css'

type PostDetail = {
  id: number
  title: string
  description: string
  category: string
  condition: string
  location: string
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
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

        // Cargar información del usuario por separado
        if (postData.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('username, full_name, email')
            .eq('id', postData.user_id)
            .single()

          // Combinar datos
          setPost({
            ...postData,
            users: userData || undefined
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
                {(post.users?.username || post.users?.full_name || post.users?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="seller-details">
                <p className="seller-name">
                  {post.users?.username || post.users?.full_name || 'Usuario'}
                </p>
                <div className="seller-rating">
                  <span>⭐ 4.5/5</span>
                  <span className="seller-trades">• 14 de Ventas</span>
                </div>
              </div>
              <button className="contact-button">💬</button>
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
                <span className="trade-value">Disponible</span>
              </div>
              <div className="trade-item">
                <span className="trade-label">Preferencias:</span>
                <span className="trade-value">Intercambio libre</span>
              </div>
            </div>
          </section>

          {/* Mapa de ubicación */}
          <section className="detail-section location-section">
            <h2 className="section-title">📍 Ubicación</h2>
            <div className="location-map">
              <div className="map-placeholder">
                <p>{post.location}</p>
                <small>Mapa interactivo próximamente</small>
              </div>
            </div>
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
    </div>
  )
}

export default ProductDetailPage