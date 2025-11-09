import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthRedux } from '../../store/hooks/useAuthRedux'
import { useSavedProducts } from '../../store/hooks/useSavedProducts'
import { useUserPosts } from '../../store/hooks/useUserPosts'
import ProductCard from '../../components/ProductCard/ProductCard'
import { AddPostButton } from '../../components/AddPostButton/AddPostButton'
import './ProfilePage.css'

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuthRedux()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'guardados' | 'posts'>('guardados')
  const { saved } = useSavedProducts()
  const { posts } = useUserPosts()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleEdit = () => {}
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
            <p className="profile-posts">20 Posts</p>
            <div className="profile-rating">
              <span>Rating: 4.5</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button onClick={handleSignOut} className="action-button logout">
              Cerrar sesión
            </button>
            <button onClick={handleEdit} className="action-button edit">
              Edit
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
    </div>
  )
}
