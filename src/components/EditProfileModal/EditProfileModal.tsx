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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadUserInfo = async () => {
      if (isOpen && user) {
        try {
          // Obtener datos de la tabla user_info
          const { data: userInfo, error: fetchError } = await supabase
            .from('user_info')
            .select('username, fullname, bio, location, phone')
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
          })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Intentar actualizar primero usando upsert (más eficiente)
      const { error: upsertError } = await supabase
        .from('user_info')
        .upsert({
          id: user.id,
          username: formData.username,
          fullname: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
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
