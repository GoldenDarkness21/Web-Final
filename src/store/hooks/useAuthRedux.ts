import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../../supabaseClient'
import type { RootState } from '../store'
import { setUser } from '../slices/authSlice'

// Hook custom para acceder al estado de autenticación
export const useAuthRedux = () => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const session = useSelector((state: RootState) => state.auth.session)
  const loading = useSelector((state: RootState) => state.auth.loading)

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const refreshUser = useCallback(async () => {
    const { data: { user: refreshedUser } } = await supabase.auth.getUser()
    if (refreshedUser) {
      dispatch(setUser(refreshedUser))
    }
  }, [dispatch])

  return {
    user,
    session,
    loading,
    signOut,
    refreshUser,
  }
}
