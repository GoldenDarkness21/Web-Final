import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthRedux } from '../../store/hooks/useAuthRedux'
import { useSavedProducts } from '../../store/hooks/useSavedProducts'
import { useUserPosts } from '../../store/hooks/useUserPosts'
import ProductCard from '../../components/ProductCard/ProductCard'
import { AddPostButton } from '../../components/AddPostButton/AddPostButton'
import { EditProfileModal } from '../../components/EditProfileModal/EditProfileModal'
import './ProfilePage.css'

export const ProfilePage: React.FC = () => {
  const { user, signOut, refreshUser } = useAuthRedux()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'guardados' | 'posts'>('guardados')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { saved } = useSavedProducts()
  const { posts } = useUserPosts()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleProfileUpdated = async () => {
    await refreshUser()
  }

  const handleMessage = () => {}

  const savedList = Object.values(saved.products)
  const userPostsList = Object.values(posts.posts)

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Banner */}
        <div className="profile-banner">
          <div className="banner-image"></div>
        </div>
        
        {/* Profile Info */}
        <div className="profile-info">
          <div className="profile-picture">
            <div className="avatar-large">
              {(user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-details">
            <h1 className="profile-name">
              {user?.user_metadata?.username || user?.user_metadata?.full_name || 'Usuario'}
            </h1>
            {user?.user_metadata?.bio && (
              <p className="profile-bio">{user.user_metadata.bio}</p>
            )}
            <div className="profile-meta">
              {user?.user_metadata?.location && (
                <p className="profile-location">● {user.user_metadata.location}</p>
              )}
              {user?.user_metadata?.phone && (
                <p className="profile-phone">● {user.user_metadata.phone}</p>
              )}
            </div>
            <p className="profile-posts">{userPostsList.length} Posts</p>
          </div>
          
          <div className="profile-actions">
            <button onClick={handleSignOut} className="action-button logout">
              Cerrar sesión
            </button>
            <button onClick={handleEdit} className="action-button edit">
              Editar perfil
            </button>
            <button onClick={handleMessage} className="action-button message">
              Message
            </button>
            <AddPostButton />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="posts-section">
          <div className="posts-header">
            <h2 className="posts-title">Perfil</h2>
            <div className="posts-tabs">
              <button
                className={`tab ${activeTab === 'guardados' ? 'active' : ''}`}
                onClick={() => setActiveTab('guardados')}
              >
                Guardados
              </button>
              <button
                className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Mis Posts
              </button>
            </div>
          </div>

          {activeTab === 'guardados' && (
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
              {userPostsList.length === 0 ? (
                <p className="saved-empty">No has creado ningún post aún.</p>
              ) : (
                userPostsList.map((p) => (
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
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}
