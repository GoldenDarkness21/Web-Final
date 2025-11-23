import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import './EditProfileModal.css'

type EditProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  user: any
  onProfileUpdated: () => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    phone: '',
    avatar_url: '',
    banner_url: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadUserInfo = async () => {
      if (isOpen && user) {
        try {
          // Obtener datos de la tabla user_info
          const { data: userInfo, error: fetchError } = await supabase
            .from('user_info')
            .select('username, fullname, bio, location, phone, avatar_url, banner_url')
            .eq('id', user.id)
            .maybeSingle()

          if (fetchError) {
            console.error('Error loading user info:', fetchError)
          }

          setFormData({
            username: userInfo?.username || '',
            full_name: userInfo?.fullname || '',
            bio: userInfo?.bio || '',
            location: userInfo?.location || '',
            phone: userInfo?.phone || '',
            avatar_url: userInfo?.avatar_url || '',
            banner_url: userInfo?.banner_url || '',
          })

          // Cargar previews de imágenes existentes
          if (userInfo?.avatar_url) {
            setAvatarPreview(userInfo.avatar_url)
          }
          if (userInfo?.banner_url) {
            setBannerPreview(userInfo.banner_url)
          }
        } catch (err) {
          console.error('Error:', err)
        }
        setError(null)
        setSuccess(false)
      }
    }

    loadUserInfo()
  }, [isOpen, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('El avatar no puede superar los 5MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('El banner no puede superar los 5MB')
        return
      }
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File, type: 'avatar' | 'banner'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (err) {
      console.error(`Error uploading ${type}:`, err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let avatarUrl = formData.avatar_url
      let bannerUrl = formData.banner_url

      // Subir avatar si se seleccionó uno nuevo
      if (avatarFile) {
        setUploadingAvatar(true)
        const url = await uploadImage(avatarFile, 'avatar')
        if (url) avatarUrl = url
        setUploadingAvatar(false)
      }

      // Subir banner si se seleccionó uno nuevo
      if (bannerFile) {
        setUploadingBanner(true)
        const url = await uploadImage(bannerFile, 'banner')
        if (url) bannerUrl = url
        setUploadingBanner(false)
      }

      // Actualizar información en user_info
      const { error: upsertError } = await supabase
        .from('user_info')
        .upsert({
          id: user.id,
          username: formData.username,
          fullname: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        }, {
          onConflict: 'id'
        })

      if (upsertError) throw upsertError

      setSuccess(true)
      setTimeout(() => {
        onProfileUpdated()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Banner */}
          <div className="form-group">
            <label>Banner del perfil</label>
            <div className="image-upload-container">
              {bannerPreview && (
                <div className="image-preview banner-preview">
                  <img src={bannerPreview} alt="Banner preview" />
                </div>
              )}
              <input
                type="file"
                id="banner"
                accept="image/*"
                onChange={handleBannerChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="banner" className="upload-button">
                {uploadingBanner ? 'Subiendo...' : bannerPreview ? 'Cambiar banner' : 'Subir banner'}
              </label>
            </div>
          </div>

          {/* Avatar */}
          <div className="form-group">
            <label>Foto de perfil</label>
            <div className="image-upload-container">
              {avatarPreview && (
                <div className="image-preview avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="avatar" className="upload-button">
                {uploadingAvatar ? 'Subiendo...' : avatarPreview ? 'Cambiar foto' : 'Subir foto'}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej: johndoe"
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Nombre completo</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Ej: John Doe"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Biografía</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti..."
              maxLength={200}
              rows={3}
            />
            <small>{formData.bio.length}/200 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="location">Ubicación</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Cali, Colombia"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: +57 300 123 4567"
              maxLength={20}
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">¡Perfil actualizado exitosamente!</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
