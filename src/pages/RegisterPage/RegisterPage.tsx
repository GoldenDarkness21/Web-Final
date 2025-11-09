import React from 'react'
import { Link } from 'react-router-dom'
import { AuthForm } from '../../components/AuthForm/AuthForm'
import '../../styles/auth-common.css'
import './RegisterPage.css'

export const RegisterPage: React.FC = () => {
  return (
    <div className="auth-page register-page">
      <div className="auth-container register-container">
        <div className="logo-container">
          <img src="/registerlogo.png" alt="Dandi" className="logo-image" />
        </div>
        <div className="welcome-message">
          <p>Regístrate para ver los trueques que están cerca de tí</p>
        </div>
        <AuthForm mode="register" />
        <div className="auth-switch">
          <p>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión aquí</Link></p>
        </div>
      </div>
    </div>
  )
}
