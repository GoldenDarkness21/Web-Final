import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../../supabaseClient'
import type { RootState } from '../store'

// Hook custom para acceder al estado de autenticación
export const useAuthRedux = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const session = useSelector((state: RootState) => state.auth.session)
  const loading = useSelector((state: RootState) => state.auth.loading)

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    user,
    session,
    loading,
    signOut,
  }
}
