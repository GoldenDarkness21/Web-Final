import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
}

// Slice para manejo de autenticación con Supabase
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Actualizar usuario y sesión
    setAuth: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user
      state.session = action.payload.session
      state.loading = false
    },
    // Actualizar solo el usuario (útil para refresh después de editar perfil)
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    // Limpiar sesión al hacer logout
    clearAuth: (state) => {
      state.user = null
      state.session = null
      state.loading = false
    },
  },
})

export const { setAuth, setUser, setLoading, clearAuth } = authSlice.actions
export default authSlice.reducer
