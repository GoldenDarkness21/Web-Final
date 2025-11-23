import { useState } from 'react'
import { supabase } from '../supabaseClient'

interface AuthData {
  email: string
  password: string
  fullName?: string
  username?: string
}

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async ({ email, password, fullName, username }: AuthData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Agregar un pequeño delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          }
        }
      })

      if (error) {
        let errorMessage = error.message
        if (error.message.includes('429')) {
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.'
        }
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Si el registro fue exitoso y tenemos un usuario, crear registro en user_info
      if (data.user) {
        try {
          const { error: insertError } = await supabase
            .from('user_info')
            .insert({
              id: data.user.id,
              username: username || '',
              fullname: fullName || '',
              bio: '',
              location: '',
              phone: '',
            })

          if (insertError) {
            console.error('Error creating user_info record:', insertError)
            // No bloqueamos el registro si falla esto, solo lo logueamos
          }
        } catch (insertErr) {
          console.error('Error inserting user_info:', insertErr)
        }
      }

      return { success: true, data }
    } catch (err) {
      let errorMessage = 'Error desconocido'
      if (err instanceof Error) {
        if (err.message.includes('429')) {
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.'
        } else {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: AuthData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Agregar un pequeño delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let errorMessage = error.message
        if (error.message.includes('429')) {
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.'
        }
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      return { success: true, data }
    } catch (err) {
      let errorMessage = 'Error desconocido'
      if (err instanceof Error) {
        if (err.message.includes('429')) {
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.'
        } else {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    signUp,
    signIn,
    signOut,
    loading,
    error,
    clearError: () => setError(null),
  }
}
