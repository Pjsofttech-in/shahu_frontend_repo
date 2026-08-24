import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiImage, FiTarget, FiInfo, FiPhone, FiFileText, FiGlobe } from 'react-icons/fi'

const homeModules = [
  { to: '/website/url', label: 'Website URL', description: 'Manage website URL', icon: FiGlobe },
  { to: '/website/hero', label: 'Hero Section', description: 'Manage hero banner', icon: FiImage },
  { to: '/website/features', label: 'Features', description: 'Manage features & highlights', icon: FiTarget },
  { to: '/website/footer', label: 'Footer', description: 'Manage footer section', icon: FiFileText },
  { to: '/website/about', label: 'About Us', description: 'Manage about content', icon: FiInfo },
  { to: '/website/contact-us', label: 'Contact Us', description: 'Manage contact details', icon: FiPhone },
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
          <NavLink key={to} to={to} state={{ websiteNavGroup: 'home' }} className="website-home-card">
            <Icon className="website-home-card-icon" />
            <h2>{label}</h2>
            <p>{description}</p>
          </NavLink>
        ))}
      </div>
    </section>
  )
}