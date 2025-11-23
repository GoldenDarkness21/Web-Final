import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthRedux } from '../../store/hooks/useAuthRedux'
import { useSavedProducts } from '../../store/hooks/useSavedProducts'
import { useUserPosts } from '../../store/hooks/useUserPosts'
import ProductCard from '../../components/ProductCard/ProductCard'
import { AddPostButton } from '../../components/AddPostButton/AddPostButton'
import { EditProfileModal } from '../../components/EditProfileModal/EditProfileModal'
import { supabase } from '../../supabaseClient'
import './ProfilePage.css'

type UserInfo = {
  username: string
  fullname: string
  bio: string
  location: string
  phone: string
  avatar_url?: string
  banner_url?: string
}

export const ProfilePage: React.FC = () => {
  const { user, signOut, refreshUser } = useAuthRedux()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'guardados' | 'posts'>('guardados')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const { saved } = useSavedProducts()
  const { posts } = useUserPosts()

  // Cargar información del usuario desde user_info
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!user) return

      // Pequeño delay para asegurar que AuthInitializer haya terminado
      await new Promise(resolve => setTimeout(resolve, 300))

      try {
        const { data, error } = await supabase
          .from('user_info')
          .select('username, fullname, bio, location, phone, avatar_url, banner_url')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Error loading user info:', error)
          return
        }

        if (data) {
          console.log('User info loaded:', data)
          setUserInfo(data)
        } else {
          // Si no hay datos después del delay, intentar crear el registro
          await supabase
            .from('user_info')
            .upsert({
              id: user.id,
              username: user.user_metadata?.username || '',
              fullname: user.user_metadata?.full_name || '',
              bio: '',
              location: '',
              phone: '',
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            })

          // Recargar después de crear
          const { data: newData } = await supabase
            .from('user_info')
            .select('username, fullname, bio, location, phone, avatar_url, banner_url')
            .eq('id', user.id)
            .maybeSingle()

          if (newData) {
            console.log('User info created and loaded:', newData)
            setUserInfo(newData)
          }
        }
      } catch (err) {
        console.error('Error:', err)
      }
    }

    loadUserInfo()
  }, [user])

  // Debug: Mostrar qué hay en userInfo
  useEffect(() => {
    console.log('Current userInfo state:', userInfo)
    console.log('Current user metadata:', user?.user_metadata)
  }, [userInfo, user])

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
        .select('username, fullname, bio, location, phone, avatar_url, banner_url')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setUserInfo(data)
      }
    }
    await refreshUser()
  }

  const handleMessage = () => {}

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-avatar.${fileExt}`
    const filePath = `avatars/${fileName}`

    try {
      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Actualizar user_info con la nueva URL
      await supabase
        .from('user_info')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      // Recargar información
      await handleProfileUpdated()
    } catch (error) {
      console.error('Error uploading avatar:', error)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-banner.${fileExt}`
    const filePath = `banners/${fileName}`

    try {
      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Actualizar user_info con la nueva URL
      await supabase
        .from('user_info')
        .update({ banner_url: urlData.publicUrl })
        .eq('id', user.id)

      // Recargar información
      await handleProfileUpdated()
    } catch (error) {
      console.error('Error uploading banner:', error)
    }
  }

  const savedList = Object.values(saved.products)
  const userPostsList = Object.values(posts.posts)

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Banner */}
        <div className="profile-banner">
          <div 
            className="banner-image" 
            style={userInfo?.banner_url ? { 
              backgroundImage: `url(${userInfo.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          ></div>
          <label htmlFor="banner-upload" className="upload-banner-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </label>
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        {/* Profile Info */}
        <div className="profile-info">
          <div className="profile-picture">
            <div className="avatar-large" style={userInfo?.avatar_url ? {
              backgroundImage: `url(${userInfo.avatar_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}>
              {!userInfo?.avatar_url && (userInfo?.fullname || user?.user_metadata?.full_name || userInfo?.username || user?.user_metadata?.username || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <label htmlFor="avatar-upload" className="upload-avatar-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="profile-details">
            <h1 className="profile-name">
              {userInfo?.fullname || user?.user_metadata?.full_name || userInfo?.username || user?.user_metadata?.username || user?.email || 'Usuario'}
            </h1>
            {(userInfo?.username || user?.user_metadata?.username) && (
              <p className="profile-username">@{userInfo?.username || user?.user_metadata?.username}</p>
            )}
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
