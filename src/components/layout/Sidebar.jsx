import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid, FiUsers, FiFileText, FiSettings, FiGlobe, FiHome, FiPhone
} from 'react-icons/fi'

export default function Sidebar() {
  const location = useLocation()

  // Check if current path matches a section
  const isStudentsActive = location.pathname.startsWith('/students')
  const isSankalpActive = location.pathname.startsWith('/sankalp-exam')
  const isSettingsActive = location.pathname.startsWith('/settings')
  const isWebsiteActive = location.pathname.startsWith('/website')
  const isWebsiteHomeActive = location.pathname === '/website/home'
  const isContactFormActive = location.pathname === '/website/contact-form'
  const isDashboardActive = location.pathname === '/dashboard'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="name">Shri Shahu Prabodhini</div>
        <div className="sub">Admin Panel</div>
      </div>
      <nav className="sidebar-nav">
        {/* Dashboard */}
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FiGrid /> Dashboard
        </NavLink>

        {/* Students */}
        <NavLink 
          to="/students" 
          className={`sidebar-link ${isStudentsActive ? 'active' : ''}`}
        >
          <FiUsers /> Students
        </NavLink>

        {/* Sankalp Exam */}
        <NavLink 
          to="/sankalp-exam/syllabus" 
          className={`sidebar-link ${isSankalpActive ? 'active' : ''}`}
        >
          <FiFileText /> Sankalp Exam
        </NavLink>

        {/* Settings */}
        <NavLink 
          to="/settings/districts" 
          className={`sidebar-link ${isSettingsActive ? 'active' : ''}`}
        >
          <FiSettings /> Settings
        </NavLink>

        {/* Website Management */}
        <NavLink 
          to="/website/footer" 
          className={`sidebar-link ${isWebsiteActive && !isWebsiteHomeActive && !isContactFormActive ? 'active' : ''}`}
        >
          <FiGlobe /> Website Management
        </NavLink>

        {/* Website Home */}
        <NavLink
          to="/website/home"
          className={`sidebar-link ${isWebsiteHomeActive ? 'active' : ''}`}
        >
          <FiHome /> Home
        </NavLink>

        {/* Contact Form */}
        <NavLink
          to="/website/contact-form"
          className={`sidebar-link ${isContactFormActive ? 'active' : ''}`}
        >
          <FiPhone /> Contact Form
        </NavLink>
      </nav>
    </aside>
  )
}
