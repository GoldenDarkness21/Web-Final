import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthRedux } from '../../store/hooks/useAuthRedux'
import { useSavedProducts } from '../../store/hooks/useSavedProducts'
import { useUserPosts } from '../../store/hooks/useUserPosts'
import ProductCard from '../../components/ProductCard/ProductCard'
import { AddPostButton } from '../../components/AddPostButton/AddPostButton'
import { EditProfileModal } from '../../components/EditProfileModal/EditProfileModal'
import RatingStars from '../../components/RatingStars/RatingStars'
import RatingModal from '../../components/RatingModal/RatingModal'
import RatingsList from '../../components/RatingsList/RatingsList'
import { supabase } from '../../supabaseClient'
import './ProfilePage.css'

type UserInfo = {
  username: string
  fullname: string
  bio: string
  location: string
  phone: string
  avatar_url: string
  banner_url: string
  average_rating: number
  total_ratings: number
}

export const ProfilePage: React.FC = () => {
  const { user, signOut, refreshUser } = useAuthRedux()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId?: string }>()
  
  // Determinar si estamos viendo nuestro propio perfil o el de otro usuario
  const isOwnProfile = !userId || userId === user?.id
  const profileUserId = userId || user?.id
  
  const [activeTab, setActiveTab] = useState<'guardados' | 'posts' | 'ratings'>(
    isOwnProfile ? 'guardados' : 'posts'
  )
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [viewedUserPosts, setViewedUserPosts] = useState<any[]>([])
  const { saved } = useSavedProducts()
  const { posts } = useUserPosts()

  // Cargar información del usuario desde user_info
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!profileUserId) return

      try {
        const { data, error } = await supabase
          .from('user_info')
          .select('username, fullname, bio, location, phone, avatar_url, banner_url, average_rating, total_ratings')
          .eq('id', profileUserId)
          .maybeSingle()

        if (error) {
          console.error('Error loading user info:', error)
          return
        }

        if (data) {
          setUserInfo(data)
        }
      } catch (err) {
        console.error('Error:', err)
      }
    }

    loadUserInfo()
  }, [profileUserId])

  // Cargar posts del usuario visualizado (si no es el perfil propio)
  useEffect(() => {
    const loadUserPosts = async () => {
      if (isOwnProfile || !profileUserId) return

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileUserId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading user posts:', error)
          return
        }

        setViewedUserPosts(data || [])
      } catch (err) {
        console.error('Error:', err)
      }
    }

    loadUserPosts()
  }, [profileUserId, isOwnProfile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleProfileUpdated = async () => {
    // Recargar información del usuario desde user_info
    if (user) {
      const { data } = await supabase
        .from('user_info')
        .select('username, fullname, bio, location, phone, avatar_url, banner_url, average_rating, total_ratings')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setUserInfo(data)
      }
    }
    await refreshUser()
  }

  const handleRatingSubmitted = () => {
    handleProfileUpdated()
  }

  const handleMessage = () => {}

  const savedList = Object.values(saved.products)
  const userPostsList = Object.values(posts.posts)

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Botón de regreso si es perfil ajeno */}
        {!isOwnProfile && (
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
            style={{ 
              position: 'absolute', 
              top: '20px', 
              left: '20px', 
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            ←
          </button>
        )}
        
        {/* Banner */}
        <div className="profile-banner">
          {userInfo?.banner_url ? (
            <div className="banner-image" style={{ backgroundImage: `url(${userInfo.banner_url})` }}></div>
          ) : (
            <div className="banner-image"></div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="profile-info">
          <div className="profile-picture">
            {userInfo?.avatar_url ? (
              <div className="avatar-large" style={{ backgroundImage: `url(${userInfo.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              </div>
            ) : (
              <div className="avatar-large">
                {(userInfo?.username || userInfo?.fullname || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-details">
            <h1 className="profile-name">
              {userInfo?.username || userInfo?.fullname || user?.email || 'Usuario'}
            </h1>
            {userInfo?.bio && (
              <p className="profile-bio">{userInfo.bio}</p>
            )}
            <div className="profile-meta">
              {userInfo?.location && (
                <p className="profile-location">● {userInfo.location}</p>
              )}
              {userInfo?.phone && (
                <p className="profile-phone">● {userInfo.phone}</p>
              )}
            </div>
            <div className="profile-stats">
              <p className="profile-posts">
                {isOwnProfile ? userPostsList.length : viewedUserPosts.length} Posts
              </p>
              {userInfo && userInfo.total_ratings > 0 && (
                <div className="profile-rating">
                  <RatingStars 
                    rating={userInfo.average_rating || 0} 
                    readonly 
                    size="small" 
                  />
                  <span className="profile-rating-count">
                    ({userInfo.total_ratings})
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-actions">
            {isOwnProfile ? (
              <>
                <button onClick={handleSignOut} className="action-button logout">
                  Cerrar sesión
                </button>
                <button onClick={handleEdit} className="action-button edit">
                  Editar perfil
                </button>
                <AddPostButton />
              </>
            ) : (
              <>
                <button onClick={handleMessage} className="action-button message">
                  Mensaje
                </button>
                <button 
                  onClick={() => setIsRatingModalOpen(true)} 
                  className="action-button rate"
                >
                  Calificar
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="posts-section">
          <div className="posts-header">
            <h2 className="posts-title">Perfil</h2>
            <div className="posts-tabs">
              {isOwnProfile && (
                <button
                  className={`tab ${activeTab === 'guardados' ? 'active' : ''}`}
                  onClick={() => setActiveTab('guardados')}
                >
                  Guardados
                </button>
              )}
              <button
                className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Mis Posts
              </button>
              <button
                className={`tab ${activeTab === 'ratings' ? 'active' : ''}`}
                onClick={() => setActiveTab('ratings')}
              >
                Calificaciones
              </button>
            </div>
          </div>

          {activeTab === 'guardados' && isOwnProfile && (
            <div className="items-grid">
              {savedList.length === 0 ? (
                <p className="saved-empty">No has guardado ningún post.</p>
              ) : (
                savedList.map((p) => (
                  <ProductCard
                    key={String(p.id)}
                    id={Number(p.id)}
                    title={p.title}
                    image={p.image}
                    category={p.category ?? ''}
                    condition={p.condition ?? ''}
                    location={p.location ?? ''}
                    description={p.description}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="items-grid">
              {(isOwnProfile ? userPostsList : viewedUserPosts).length === 0 ? (
                <p className="saved-empty">
                  {isOwnProfile ? 'No has creado ningún post aún.' : 'Este usuario no tiene posts aún.'}
                </p>
              ) : (
                (isOwnProfile ? userPostsList : viewedUserPosts).map((p) => (
                  <ProductCard
                    key={String(p.id)}
                    id={Number(p.id)}
                    title={p.title}
                    image={p.image}
                    category={p.category}
                    condition={p.condition}
                    location={p.location}
                    description={p.description}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'ratings' && profileUserId && (
            <div className="ratings-container">
              <RatingsList userId={profileUserId} />
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {user && !isOwnProfile && profileUserId && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          ratedUserId={profileUserId}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}
