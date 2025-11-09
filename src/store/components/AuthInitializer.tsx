import React, { useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useAppDispatch } from '../hooks'
import { setAuth } from '../slices/authSlice'

interface AuthInitializerProps {
  children: React.ReactNode
}

// Componente para sincronizar autenticación de Supabase con Redux
export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Cargar sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setAuth({
        session,
        user: session?.user ?? null,
      }))
    })

    // Suscribirse a cambios de autenticación (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setAuth({
        session,
        user: session?.user ?? null,
      }))
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  return <>{children}</>
}
