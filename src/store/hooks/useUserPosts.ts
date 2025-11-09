import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../../supabaseClient'
import { setUserPosts, addUserPost, removeUserPost, clearUserPosts } from '../slices/userPostsSlice'
import type { UserPost } from '../slices/userPostsSlice'
import type { RootState, AppDispatch } from '../store'

// Hook para gestionar los posts del usuario con sincronización a Supabase
export const useUserPosts = () => {
  const dispatch = useDispatch<AppDispatch>()
  const userPosts = useSelector((state: RootState) => state.userPosts)
  const user = useSelector((state: RootState) => state.auth.user)

  // Cargar posts del usuario desde la base de datos
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user) {
        dispatch(clearUserPosts())
        return
      }

      // Obtener todos los posts creados por el usuario
      const { data: posts, error } = await supabase
        .from('user_posts')
        .select('id,title,category,condition,location,image,description,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[user_posts select error]:', error)
        return
      }

      type DbPost = {
        id: number | string
        title: string
        category: string
        condition: string
        location: string
        image?: string | null
        description?: string | null
        created_at?: string
      }

      // Convertir array a objeto con IDs como keys
      const postsMap = Object.fromEntries(
        (posts ?? []).map((row: DbPost) => [
          String(row.id),
          {
            id: row.id,
            title: row.title,
            image: row.image ?? undefined,
            category: row.category,
            condition: row.condition,
            location: row.location,
            description: row.description ?? undefined,
            created_at: row.created_at,
          } as UserPost,
        ])
      )

      dispatch(setUserPosts(postsMap))
    }

    void loadUserPosts()
  }, [user, dispatch])

  // Agregar un post
  const addPost = useCallback(
    (post: UserPost) => {
      dispatch(addUserPost(post))
    },
    [dispatch]
  )

  // Eliminar un post
  const deletePost = useCallback(
    async (postId: number | string) => {
      if (!user) return

      const postIdValue = Number.isNaN(Number(postId)) ? postId : Number(postId)
      
      // Eliminar de la base de datos
      const { error } = await supabase
        .from('user_posts')
        .delete()
        .eq('id', postIdValue)
        .eq('user_id', user.id)

      if (error) {
        console.error('[delete user_posts error]:', error)
        alert('Error al eliminar el post')
        return
      }

      // Eliminar del estado de Redux
      dispatch(removeUserPost(postId))
    },
    [user, dispatch]
  )

  return {
    posts: userPosts,
    addPost,
    deletePost,
  }
}
