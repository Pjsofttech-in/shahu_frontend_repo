import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiBook, FiFileText, FiMapPin, FiMap, FiHome, FiUserCheck,
  FiLayers, FiImage, FiAward, FiStar, FiUser, FiTarget, FiDownload, FiPhone
} from 'react-icons/fi'

export const dashboardLinks = [
  { to: '/dashboard', label: 'Dashboard' },
]

// Students Submenu
export const studentLinks = [
  { to: '/students', label: 'Student Manager', icon: <FiUser /> },
]

// Sankalp Exam Submenu
export const sankalpLinks = [
  { to: '/sankalp-exam/syllabus', label: 'Syllabus', icon: <FiBook /> },
  { to: '/sankalp-exam/answer-key', label: 'Answer Key', icon: <FiFileText /> },
  { to: '/sankalp-exam/result-check', label: 'Result Check', icon: <FiUserCheck /> },
  { to: '/sankalp-exam/result-pdf', label: 'Result PDF', icon: <FiDownload /> },
]

// Settings Submenu
export const settingsLinks = [
  { to: '/settings/districts', label: 'Districts', icon: <FiMapPin /> },
]

// Website Management Submenu
export const homeLinks = [
  { to: '/website/url', label: 'Website URL', icon: <FiPhone />, group: 'home' },
  { to: '/website/hero', label: 'Hero Section', icon: <FiImage />, group: 'home' },
  { to: '/website/about', label: 'About Us', icon: <FiFileText />, group: 'home' },
  { to: '/website/features', label: 'Features', icon: <FiTarget />, group: 'home' },
  { to: '/website/footer', label: 'Footer', icon: <FiLayers />, group: 'home' },
  { to: '/website/contact-us', label: 'Contact Us', icon: <FiPhone />, group: 'home' },
]

export const websiteLinks = [
  { to: '/website/courses', label: 'Courses', icon: <FiBook />, group: 'management' },
  { to: '/website/awards', label: 'Awards', icon: <FiAward />, group: 'management' },
  { to: '/website/toppers', label: 'Toppers', icon: <FiAward />, group: 'management' },
  { to: '/website/gallery', label: 'Gallery', icon: <FiImage />, group: 'management' },
  { to: '/website/faculty', label: 'Faculty', icon: <FiUser />, group: 'management' },
  { to: '/website/testimonials', label: 'Testimonials', icon: <FiStar />, group: 'management' },
  { to: '/website/contact-us', label: 'Contact Us', icon: <FiPhone />, group: 'management' },
  { to: '/website/about', label: 'About Us', icon: <FiFileText />, group: 'management' },
  { to: '/website/vision-mission', label: 'Vision & Mission', icon: <FiTarget />, group: 'management' },
  { to: '/website/downloads', label: 'Downloads', icon: <FiDownload />, group: 'management' },
  { to: '/website/notifications', label: 'Notifications', icon: <FiFileText />, group: 'management' },
]

/**
 * Horizontal Navigation Bar Component
 * Displays sub-menu items as a horizontal navbar
 */
export default function HorizontalNav({ links, title }) {
  return (
    <div className="horizontal-nav">
      {title && <div className="horizontal-nav-title">{title}</div>}
      <div className="horizontal-nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            state={{ websiteNavGroup: link.group }}
            className={({ isActive }) => `horizontal-nav-link ${isActive ? 'active' : ''}`}
          >
            {link.icon && <span className="nav-icon">{link.icon}</span>}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export function VerticalNav({ links, title }) {
  return (
    <nav className="vertical-nav">
      {title && <div className="vertical-nav-title">{title}</div>}
      <div className="vertical-nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            state={{ websiteNavGroup: link.group }}
            className={({ isActive }) => `vertical-nav-link ${isActive ? 'active' : ''}`}
          >
            {link.icon && <span className="nav-icon">{link.icon}</span>}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
