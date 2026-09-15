import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { FiMail, FiLock, FiGlobe } from 'react-icons/fi'
import logoImage from '../asset/logo.png'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message =
        err?.response?.status === 401
          ? 'Invalid live admin email or password.'
          :
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        'Invalid email or password. Please try again.'

      setError(typeof message === 'string' ? message : 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header-row">
          <div className="login-language-picker" aria-label={t('language')}>
            <FiGlobe />
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
            <button type="button" className={language === 'mr' ? 'active' : ''} onClick={() => setLanguage('mr')}>मराठी</button>
          </div>
        </div>
        <img src={logoImage} alt="Shri Shahu Prabodhini logo" className="login-brand-logo" />
        <p className="sub">{t('signIn')}</p>

        {error && <div className="login-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email"><FiMail /> {t('adminEmail')}</label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@shrishahuprabodhini.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password"><FiLock /> {t('password')}</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (language === 'mr' ? 'साइन इन होत आहे…' : 'Signing in…') : t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}
