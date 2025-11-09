import React from 'react'
import { useSavedProducts } from '../../store/hooks/useSavedProducts'
import './SaveButton.css'

type SaveButtonProps = {
  id: number | string
  title: string
  image?: string
  category?: string
  condition?: string
  location?: string
  description?: string
  className?: string
  size?: number
}

const SaveButton: React.FC<SaveButtonProps> = ({
  id, title, image, category, condition, location, description, className, size = 22
}) => {
  const { isProductSaved, toggleProduct } = useSavedProducts()
  const saved = isProductSaved(id)

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()              // no dispara navegación al hacer click
    toggleProduct({ id, title, image, category, condition, location, description })
  }

  return (
    <button
      className={`save-btn ${saved ? 'is-saved' : ''} ${className ?? ''}`}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
        
      <svg viewBox="0 0 384 512" width={size} height={size} aria-hidden="true">
        <path d="M64 0H320C355.3 0 384 28.7 384 64V512L192 400 0 512V64C0 28.7 28.7 0 64 0Z" />
      </svg>
    </button>
  )
}

export default SaveButton
