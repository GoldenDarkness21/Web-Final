import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type SavedProduct = {
  id: number | string
  title: string
  image?: string
  category?: string
  condition?: string
  location?: string
}

interface SavedState {
  products: Record<string, SavedProduct>
}

const STORAGE_KEY = 'dandi:saved'

// Cargar productos guardados desde localStorage al iniciar
const loadInitialState = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedState) : { products: {} }
  } catch {
    return { products: {} }
  }
}

const initialState: SavedState = loadInitialState()

// Slice para productos guardados con persistencia en localStorage
const savedSlice = createSlice({
  name: 'saved',
  initialState,
  reducers: {
    // Establecer todos los productos (usado al cargar desde DB)
    setSavedProducts: (state, action: PayloadAction<Record<string, SavedProduct>>) => {
      state.products = action.payload
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {}
    },
    // Agregar un producto individual
    addSavedProduct: (state, action: PayloadAction<SavedProduct>) => {
      const key = String(action.payload.id)
      state.products[key] = action.payload
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {}
    },
    // Eliminar un producto específico
    removeSavedProduct: (state, action: PayloadAction<string | number>) => {
      const key = String(action.payload)
      delete state.products[key]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {}
    },
    // Limpiar todos los productos guardados
    clearSaved: (state) => {
      state.products = {}
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {}
    },
  },
})

export const { setSavedProducts, addSavedProduct, removeSavedProduct, clearSaved } = savedSlice.actions
export default savedSlice.reducer
