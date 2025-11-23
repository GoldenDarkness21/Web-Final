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
    if (isOpen && user) {
      setFormData({
        username: user.user_metadata?.username || '',
        full_name: user.user_metadata?.full_name || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || '',
        phone: user.user_metadata?.phone || '',
      })
      setError(null)
      setSuccess(false)
    }
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
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
        },
      })

      if (updateError) throw updateError

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
