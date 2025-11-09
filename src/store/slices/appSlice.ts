import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PageId } from '../../types'

interface AppState {
  currentPage: PageId
}

const initialState: AppState = {
  currentPage: 'home',
}

// Slice para el estado general de la aplicación
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<PageId>) => {
      state.currentPage = action.payload
    },
  },
})

export const { setCurrentPage } = appSlice.actions
export default appSlice.reducer
