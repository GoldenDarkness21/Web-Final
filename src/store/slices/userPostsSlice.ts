import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Tipo para los posts del usuario
export type UserPost = {
  id: number | string
  title: string
  image?: string
  category: string
  condition: string
  location: string
  description?: string
  created_at?: string
}

interface UserPostsState {
  posts: Record<string, UserPost>
}

const initialState: UserPostsState = {
  posts: {},
}

// Slice para gestionar los posts creados por el usuario
const userPostsSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {
    // Establecer todos los posts del usuario (usado al cargar desde DB)
    setUserPosts: (state, action: PayloadAction<Record<string, UserPost>>) => {
      state.posts = action.payload
    },
    // Agregar un post individual
    addUserPost: (state, action: PayloadAction<UserPost>) => {
      const key = String(action.payload.id)
      state.posts[key] = action.payload
    },
    // Eliminar un post
    removeUserPost: (state, action: PayloadAction<number | string>) => {
      const key = String(action.payload)
      delete state.posts[key]
    },
    // Limpiar todos los posts
    clearUserPosts: (state) => {
      state.posts = {}
    },
  },
})

export const { setUserPosts, addUserPost, removeUserPost, clearUserPosts } = userPostsSlice.actions
export default userPostsSlice.reducer
