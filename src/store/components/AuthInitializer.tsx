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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      dispatch(setAuth({
        session,
        user: session?.user ?? null,
      }))

      // Si hay un usuario autenticado, asegurar que tenga registro en user_info
      if (session?.user) {
        await ensureUserInfoExists(session.user)
      }
    })

    // Suscribirse a cambios de autenticación (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      dispatch(setAuth({
        session,
        user: session?.user ?? null,
      }))

      // Si hay un usuario autenticado, asegurar que tenga registro en user_info
      if (session?.user) {
        await ensureUserInfoExists(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  // Función para asegurar que el usuario tenga un registro en user_info
  const ensureUserInfoExists = async (user: any) => {
    try {
      // Usar upsert para evitar conflictos
      await supabase
        .from('user_info')
        .upsert({
          id: user.id,
          username: user.user_metadata?.username || '',
          fullname: user.user_metadata?.full_name || '',
          bio: '',
          location: '',
          phone: '',
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
    } catch (error) {
      console.error('Error ensuring user_info exists:', error)
    }
  }

  return <>{children}</>
}
