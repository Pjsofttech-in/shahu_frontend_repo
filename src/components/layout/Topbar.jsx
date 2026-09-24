import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Topbar({ title }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()

  return (
    <header className="topbar">
      <div className="page-title">{title}</div>
      <div className="topbar-right" ref={ref}>
        <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
        <button className="avatar-btn" onClick={() => setOpen((o) => !o)}>
          <span className="avatar-circle">{initials}</span>
          <span style={{ fontSize: 13.5 }}>{user?.name || 'Admin'}</span>
          <FiChevronDown />
        </button>
        {open && (
          <div className="dropdown-menu">
            <button onClick={() => { setOpen(false); navigate('/profile') }}><FiUser /> View Profile</button>
            <button onClick={() => { logout(); navigate('/login') }}><FiLogOut /> Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}
