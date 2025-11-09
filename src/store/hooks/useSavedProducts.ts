import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../../supabaseClient'
import { setSavedProducts, addSavedProduct, removeSavedProduct, clearSaved } from '../slices/savedSlice'
import type { SavedProduct } from '../slices/savedSlice'
import type { RootState, AppDispatch } from '../store'

// Hook para gestionar productos guardados con sincronización a Supabase
export const useSavedProducts = () => {
  const dispatch = useDispatch<AppDispatch>()
  const saved = useSelector((state: RootState) => state.saved)
  const user = useSelector((state: RootState) => state.auth.user)

  // Cargar productos guardados desde la base de datos al iniciar sesión
  useEffect(() => {
    const loadSaved = async () => {
      if (!user) {
        dispatch(clearSaved())
        return
      }

      // Obtener IDs de posts guardados por el usuario
      const { data: savedRows, error: savedErr } = await supabase
        .from('saved_post')
        .select('post_id')
        .eq('user_id', user.id)

      if (savedErr) {
        console.error('[saved_post select error]:', savedErr)
        return
      }

      const postIds = (savedRows ?? []).map((r) => r.post_id)
      if (postIds.length === 0) {
        dispatch(clearSaved())
        return
      }

      // Obtener detalles completos de los posts guardados
      const { data: posts, error: postsErr } = await supabase
        .from('user_posts')
        .select('id,title,category,condition,location,image')
        .in('id', postIds)

      if (postsErr) {
        console.error('[user_posts select error]:', postsErr)
        return
      }

      type DbPost = {
        id: number | string
        title: string
        category: string
        condition: string
        location: string
        image?: string | null
      }

      // Convertir array a objeto con IDs como keys
      const products = Object.fromEntries(
        (posts ?? []).map((row: DbPost) => [
          String(row.id),
          {
            id: row.id,
            title: row.title,
            image: row.image ?? undefined,
            category: row.category,
            condition: row.condition,
            location: row.location,
          } as SavedProduct,
        ])
      )

      dispatch(setSavedProducts(products))
    }

    void loadSaved()
  }, [user, dispatch])

  // Verificar si un producto está guardado
  const isProductSaved = useCallback(
    (id: number | string) => Boolean(saved.products[String(id)]),
    [saved]
  )

  // Guardar o quitar un producto (toggle)
  const toggleProduct = useCallback(
    async (item: SavedProduct) => {
      if (!user) return

      const key = String(item.id)
      const currentlySaved = Boolean(saved.products[key])

      if (currentlySaved) {
        // Eliminar de la base de datos
        const postIdValue = Number.isNaN(Number(key)) ? key : Number(key)
        const { error } = await supabase
          .from('saved_post')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postIdValue)

        if (error) {
          console.error('[Error eliminando producto guardado]:', error)
          return
        }

        dispatch(removeSavedProduct(key))
      } else {
        // Guardar en la base de datos
        const postIdValue = Number.isNaN(Number(key)) ? key : Number(key)
        const insertPayload: Record<string, string | number> = {
          user_id: user.id,
          post_id: postIdValue,
          saved_at: new Date().toISOString(),
        }

        const { error } = await supabase
          .from('saved_post')
          .insert({ ...insertPayload })

        if (error) {
          console.error('[Error guardando producto]:', error)
          return
        }

        dispatch(addSavedProduct(item))
      }
    },
    [saved, user, dispatch]
  )

  return {
    saved,
    isProductSaved,
    toggleProduct,
  }
}
