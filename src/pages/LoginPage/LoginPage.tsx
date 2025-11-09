import React from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuthRedux } from '../../store/hooks/useAuthRedux'
import { AuthForm } from '../../components/AuthForm/AuthForm'
import DandiLogo from '../../assets/loginlogo.png'
import LargeDandiLogo from '../../assets/largeloginlogo.png'
import './LoginPage.css'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuthRedux()

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="auth-page login-page">
      <div className="login-left-section">
        <div className="logo-container">
          <img src={LargeDandiLogo} alt="Dandi" className="logo-image-large" />
        </div>
        <div className="login-text">
          <p>Una app para intercambiar lo que ya no usas y encontrar lo que necesitas.</p>
        </div>
      </div>
      
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="form-logo-container">
            <img src={DandiLogo} alt="Dandi" className="form-logo" />
          </div>
          
          <div className="login-title">
            <h2>Inicia sesión y empieza a descubrir trueques cerca de ti.</h2>
          </div>
          <AuthForm mode="login" onSuccess={() => navigate('/')} />
          <div className="forgot-password">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="auth-switch">
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
