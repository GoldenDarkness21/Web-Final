import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuthContext'

export type SavedProduct = {
  id: number | string
  title: string
  image?: string
  category?: string
  condition?: string
  location?: string
}

type SavedState = { products: Record<string, SavedProduct> }

type SavedContextType = {
  saved: SavedState
  isProductSaved: (id: number | string) => boolean
  toggleProduct: (item: SavedProduct) => Promise<void>
}

const SavedContext = createContext<SavedContextType | undefined>(undefined)
const STORAGE_KEY = 'dandi:saved'

export const SavedProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()

  const [saved, setSaved] = useState<SavedState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedState) : { products: {} }
    } catch {
      return { products: {} }
    }
  })

  // Cargar guardados desde Supabase cuando hay usuario
  useEffect(() => {
    const loadSaved = async () => {
      if (!user) {
        setSaved({ products: {} })
        return
      }
      const { data: savedRows, error: savedErr } = await supabase
        .from('saved_post')
        .select('post_id')
        .eq('user_id', user.id)

      if (savedErr) {
        console.error('[saved_post select error]:', savedErr)
        return
      }

      const postIds = (savedRows ?? []).map(r => r.post_id)
      if (postIds.length === 0) {
        setSaved({ products: {} })
        return
      }

      const { data: posts, error: postsErr } = await supabase
        .from('user_posts')
        .select('id,title,category,condition,location,image')
        .in('id', postIds)

      if (postsErr) {
        console.error('[user_posts select error]:', postsErr)
        return
      }

      type DbPost = {
        id: number | string
        title: string
        category: string
        condition: string
        location: string
        image?: string | null
      }
      const products = Object.fromEntries(
        (posts ?? []).map((row: DbPost) => [
          String(row.id),
          {
            id: row.id,
            title: row.title,
            image: row.image ?? undefined,
            category: row.category,
            condition: row.condition,
            location: row.location,
          } as SavedProduct,
        ])
      )
      setSaved({ products })
    }
    void loadSaved()
  }, [user])

  // Persistencia local
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)) } catch { /* noop */ }
  }, [saved])

  const isProductSaved = useCallback((id: number | string) => Boolean(saved.products[String(id)]), [saved])

  const toggleProduct = useCallback(async (item: SavedProduct) => {
    if (!user) return
    const key = String(item.id)
    const currentlySaved = Boolean(saved.products[key])

    if (currentlySaved) {
      const postIdValue = Number.isNaN(Number(key)) ? key : Number(key)
      const { error } = await supabase
        .from('saved_post')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postIdValue)
      if (error) {
       
        return
      }
      setSaved(prev => {
        const next: SavedState = { products: { ...prev.products } }
        delete next.products[key]
        return next
      })
    } else {
      const postIdValue = Number.isNaN(Number(key)) ? key : Number(key)
      const insertPayload: Record<string, string | number> = {
        user_id: user.id,
        post_id: postIdValue,
        // Si la columna existe y no tiene default, esto la llena
        saved_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('saved_post')
        .insert({ ...insertPayload })
      if (error) {
       
        return
      }
      setSaved(prev => {
        const next: SavedState = { products: { ...prev.products } }
        next.products[key] = item
        return next
      })
    }
  }, [saved, user])

  const value = useMemo(() => ({ saved, isProductSaved, toggleProduct }), [saved, isProductSaved, toggleProduct])
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSaved = (): SavedContextType => {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used within <SavedProvider>')
  return ctx
}
