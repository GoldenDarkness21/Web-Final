import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import authReducer from './slices/authSlice'
import savedReducer from './slices/savedSlice'

// Configuración del store principal de Redux
export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    saved: savedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar validaciones para objetos de Supabase que no son serializables
        ignoredActions: ['auth/setAuth', 'auth/setLoading'],
        ignoredPaths: ['auth.user', 'auth.session'],
      },
    }),
})

// Tipos inferidos del store para TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
