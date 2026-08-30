import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiSettings,
  FiGlobe,
  FiHome,
  FiPhone,
  FiBookOpen,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi'

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')

  const isStudentsActive = location.pathname.startsWith('/students')
  const isSankalpActive = location.pathname.startsWith('/sankalp-exam')
  const isTestSeriesActive = location.pathname.startsWith('/test-series')
  const isEbookActive = location.pathname.startsWith('/ebook')
  const isSettingsActive = location.pathname.startsWith('/settings')
  const isWebsiteActive = location.pathname.startsWith('/website')
  const isWebsiteHomeActive = location.pathname === '/website/home'
  const isContactFormActive = location.pathname === '/website/contact-form'

  const toggleSidebar = () => {
    setCollapsed((current) => {
      localStorage.setItem('sidebar-collapsed', String(!current))
      return !current
    })
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="name">Shri Shahu Prabodhini</div>
        <div className="sub">Admin Panel</div>
      </div>
      <button className="sidebar-collapse-btn" type="button" onClick={toggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
      </button>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FiGrid /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/students" className={`sidebar-link ${isStudentsActive ? 'active' : ''}`}>
          <FiUsers /> <span>Students</span>
        </NavLink>

        <NavLink to="/sankalp-exam/syllabus" className={`sidebar-link ${isSankalpActive ? 'active' : ''}`}>
          <FiFileText /> <span>Sankalp Exam</span>
        </NavLink>

        <NavLink to="/ebook" className={`sidebar-link ${isEbookActive ? 'active' : ''}`}>
          <FiBookOpen /> <span>Ebook</span>
        </NavLink>

        <NavLink to="/test-series" className={`sidebar-link ${isTestSeriesActive ? 'active' : ''}`}>
          <FiBookOpen /> <span>Test Series</span>
        </NavLink>

        <NavLink to="/website/courses" className={`sidebar-link ${isWebsiteActive && !isWebsiteHomeActive && !isContactFormActive ? 'active' : ''}`}>
          <FiGlobe /> <span>Website Management</span>
        </NavLink>

        <NavLink to="/website/home" className={`sidebar-link ${isWebsiteHomeActive ? 'active' : ''}`}>
          <FiHome /> <span>Home</span>
        </NavLink>

        <NavLink to="/website/contact-form" className={`sidebar-link ${isContactFormActive ? 'active' : ''}`}>
          <FiPhone /> <span>Contact Form</span>
        </NavLink>

        <NavLink to="/settings/districts" className={`sidebar-link ${isSettingsActive ? 'active' : ''}`}>
          <FiSettings /> <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  )
}
