import React from 'react'
import { Link } from 'react-router-dom'
import './EmailConfirmation.css'

export const EmailConfirmation: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="email-confirmation-container">
        <div className="confirmation-icon">
          <div className="checkmark">✓</div>
        </div>
        <h2 className="confirmation-title">¡Registro exitoso!</h2>
        <p className="confirmation-message">
          Te hemos enviado un enlace de confirmación a tu correo electrónico.
        </p>
        <p className="confirmation-submessage">
          Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
        </p>
        <div className="confirmation-actions">
          <Link to="/login" className="confirmation-button">
            Ir al inicio de sesión
          </Link>
          <Link to="/" className="confirmation-link">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
