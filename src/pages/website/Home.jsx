import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiImage, FiGrid, FiBookOpen, FiInfo, FiPhone, FiFileText } from 'react-icons/fi'

const homeModules = [
  { to: '/website/hero', label: 'Hero Section', description: 'Manage hero banner', icon: FiImage },
  { to: '/website/services', label: 'Services', description: 'Manage website services', icon: FiGrid },
  { to: '/website/sankalp-features', label: 'Sankalp Features', description: 'Manage Sankalp Features section', icon: FiBookOpen },
  { to: '/website/about', label: 'About', description: 'Manage about content', icon: FiInfo },
  { to: '/website/features', label: 'Features', description: 'Manage features & highlights', icon: FiPhone },
  { to: '/website/footer', label: 'Footer', description: 'Manage footer section', icon: FiFileText },
]

export default function Home() {
  return (
    <section className="website-home">
      <div className="page-header website-home-header">
        <div>
          <h1>Home Management</h1>
          <p>Select a section to manage your website.</p>
        </div>
      </div>
      <div className="website-home-grid">
        {homeModules.map(({ to, label, description, icon: Icon }) => (
          <NavLink key={to} to={to} className="website-home-card">
            <Icon className="website-home-card-icon" />
            <h2>{label}</h2>
            <p>{description}</p>
          </NavLink>
        ))}
      </div>
    </section>
  )
}