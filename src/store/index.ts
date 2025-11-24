// Re-export hooks
export { useAppDispatch, useAppSelector } from './hooks'
export { useSavedProducts } from './hooks/useSavedProducts'
export { useAuthRedux } from './hooks/useAuthRedux'

// Re-export types
export type { RootState, AppDispatch } from './store'
export type { SavedProduct } from './slices/savedSlice'

// Re-export actions if needed by components
export { setCurrentPage } from './slices/appSlice'
export { setAuth, setLoading, clearAuth } from './slices/authSlice'
