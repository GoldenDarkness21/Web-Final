import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { supabase } from '../../supabaseClient'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addUserPost } from '../../store/slices/userPostsSlice'
import type { UserPost } from '../../store/slices/userPostsSlice'
import './AddPostButton.css'

type PostFormData = {
  title: string
  category: string
  condition: string
  location: string
  image: string
  description: string
}

// Componente botón que abre modal para crear nuevos posts
export const AddPostButton = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    category: '',
    condition: '',
    location: '',
    image: '',
    description: '',
  })

  // Abrir/cerrar modal
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    // Resetear formulario al cerrar
    setFormData({
      title: '',
      category: '',
      condition: '',
      location: '',
      image: '',
      description: '',
    })
  }

  // Actualizar campos del formulario
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Enviar formulario e insertar en Supabase
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      alert('Debes estar autenticado para crear un post')
      return
    }

    // Validación básica
    if (!formData.title.trim() || !formData.category || !formData.condition || !formData.location.trim() || !formData.description.trim()) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      // Insertar nuevo post en la tabla user_posts
      const { data, error } = await supabase
        .from('user_posts')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          category: formData.category,
          condition: formData.condition,
          location: formData.location.trim(),
          image: formData.image.trim() || null,
          description: formData.description.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('[insert user_posts error]:', error)
        alert('Error al crear el post. Intenta nuevamente.')
        return
      }

      // Despachar acción Redux para añadir al store de posts del usuario
      const newPost: UserPost = {
        id: data.id,
        title: data.title,
        category: data.category,
        condition: data.condition,
        location: data.location,
        image: data.image ?? undefined,
        description: data.description ?? undefined,
        created_at: data.created_at,
      }

      dispatch(addUserPost(newPost))

      alert('¡Post creado exitosamente!')
      closeModal()
    } catch (err) {
      console.error('[unexpected error]:', err)
      alert('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Botón para abrir modal */}
      <button className="add-post-button" onClick={openModal} type="button">
        +
      </button>

      {/* Modal con formulario */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Post</h2>
              <button className="close-button" onClick={closeModal} type="button" aria-label="Cerrar">
                ×
              </button>
            </div>

            <form className="post-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Título *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Bicicleta de montaña"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Electrónica">Electrónica</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Moda">Moda</option>
                  <option value="Libros">Libros</option>
                  <option value="Juguetes">Juguetes</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condición *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona condición</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Como nuevo">Como nuevo</option>
                  <option value="Usado - Buen estado">Usado - Buen estado</option>
                  <option value="Usado - Aceptable">Usado - Aceptable</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Ubicación *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu producto en detalle..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Imagen (URL)</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
