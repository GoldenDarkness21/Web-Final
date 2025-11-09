import React from 'react'
import './Input.css'

interface InputProps {
  type: 'email' | 'password' | 'text'
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
  icon?: string
}

export const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  icon,
}) => {
  return (
    <div className="input-container">
      {icon && <span className="input-icon">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`input ${className}`}
      />
    </div>
  )
}
