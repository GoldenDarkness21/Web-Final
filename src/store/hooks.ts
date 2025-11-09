import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Hooks tipados de Redux para garantizar type safety
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <TSelected,>(
  selector: (state: RootState) => TSelected
): TSelected => {
  return useSelector<RootState, TSelected>(selector)
}
