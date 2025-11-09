export { useAppDispatch, useAppSelector } from './hooks'
export { useSavedProducts } from './hooks/useSavedProducts'
export { useAuthRedux } from './hooks/useAuthRedux'

export { setCurrentPage } from './slices/appSlice'
export { setAuth, setLoading, clearAuth } from './slices/authSlice'
export {
  setSavedProducts,
  addSavedProduct,
  removeSavedProduct,
  clearSaved,
} from './slices/savedSlice'

export type { RootState, AppDispatch } from './store'
export type { SavedProduct } from './slices/savedSlice'
