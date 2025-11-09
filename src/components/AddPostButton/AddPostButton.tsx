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
  description: string
}

type ImageFile = {
  file: File | null
  preview: string | null
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
    description: '',
  })

  // Estados para las 4 imágenes
  const [images, setImages] = useState<ImageFile[]>([
    { file: null, preview: null },
    { file: null, preview: null },
    { file: null, preview: null },
    { file: null, preview: null },
  ])

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
      description: '',
    })
    // Limpiar previews de imágenes
    images.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview)
    })
    setImages([
      { file: null, preview: null },
      { file: null, preview: null },
      { file: null, preview: null },
      { file: null, preview: null },
    ])
  }

  // Actualizar campos del formulario
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar selección de imagen
  const handleImageChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB')
      return
    }

    // Crear preview
    const preview = URL.createObjectURL(file)

    // Limpiar preview anterior si existe
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview!)
    }

    setImages((prev) => {
      const newImages = [...prev]
      newImages[index] = { file, preview }
      return newImages
    })
  }

  // Eliminar imagen seleccionada
  const handleRemoveImage = (index: number) => {
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview!)
    }
    setImages((prev) => {
      const newImages = [...prev]
      newImages[index] = { file: null, preview: null }
      return newImages
    })
  }

  // Subir imagen a Supabase Storage
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('[upload error]:', uploadError)
        return null
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (err) {
      console.error('[unexpected upload error]:', err)
      return null
    }
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

    // Validar que al menos haya una imagen
    if (!images[0].file) {
      alert('Debes subir al menos una imagen principal')
      return
    }

    setIsSubmitting(true)

    try {
      // Subir imágenes a Supabase Storage
      const imageUrls: (string | null)[] = await Promise.all(
        images.map((img) => img.file ? uploadImageToSupabase(img.file) : Promise.resolve(null))
      )

      // Verificar que la imagen principal se subió correctamente
      if (!imageUrls[0]) {
        alert('Error al subir la imagen principal. Intenta nuevamente.')
        setIsSubmitting(false)
        return
      }

      // Insertar nuevo post en la tabla user_posts
      const { data, error } = await supabase
        .from('user_posts')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          category: formData.category,
          condition: formData.condition,
          location: formData.location.trim(),
          description: formData.description.trim(),
          image: imageUrls[0],
          img2: imageUrls[1],
          img3: imageUrls[2],
          img4: imageUrls[3],
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
        + Añadir Post
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

              {/* Sección de imágenes */}
              <div className="form-group">
                <label>Imágenes *</label>
                <p className="image-help-text">Primera imagen será la principal (máx 5MB cada una)</p>
                
                <div className="images-grid">
                  {images.map((img, index) => (
                    <div key={index} className="image-upload-box">
                      {img.preview ? (
                        <div className="image-preview-container">
                          <img src={img.preview} alt={`Preview ${index + 1}`} className="image-preview" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(index)}
                            aria-label="Eliminar imagen"
                          >
                            ×
                          </button>
                          {index === 0 && <span className="main-badge">Principal</span>}
                        </div>
                      ) : (
                        <label className="image-upload-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="image-input"
                          />
                          <div className="upload-placeholder">
                            <span className="upload-icon">📷</span>
                            <span className="upload-text">
                              {index === 0 ? 'Imagen Principal *' : `Imagen ${index + 1}`}
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
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
