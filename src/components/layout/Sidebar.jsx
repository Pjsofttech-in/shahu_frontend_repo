import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid, FiSettings, FiUsers, FiGlobe, FiFileText, FiChevronDown,
  FiMapPin, FiMap, FiHome, FiUserCheck, FiImage, FiAward, FiStar,
  FiUser, FiTarget, FiBook, FiDownload, FiPhone, FiLayers,
} from 'react-icons/fi'

const settingsLinks = [
  { to: '/settings/districts', label: 'Districts', icon: <FiMapPin /> },
  { to: '/settings/talukas', label: 'Talukas', icon: <FiMap /> },
  { to: '/settings/centers', label: 'Centers', icon: <FiHome /> },
  { to: '/settings/coordinators', label: 'Coordinators', icon: <FiUserCheck /> },
]

const websiteLinks = [
  { to: '/website/footer', label: 'Footer', icon: <FiLayers /> },
  { to: '/website/gallery', label: 'Gallery', icon: <FiImage /> },
  { to: '/website/toppers', label: 'Toppers', icon: <FiAward /> },
  { to: '/website/testimonials', label: 'Testimonials', icon: <FiStar /> },
  { to: '/website/faculty', label: 'Faculty', icon: <FiUser /> },
  { to: '/website/awards', label: 'Awards', icon: <FiAward /> },
  { to: '/website/vision-mission', label: 'Vision & Mission', icon: <FiTarget /> },
  { to: '/website/courses', label: 'Courses', icon: <FiBook /> },
  { to: '/website/downloads', label: 'Downloads', icon: <FiDownload /> },
  { to: '/website/contact-us', label: 'Contact Us', icon: <FiPhone /> },
]

const sankalpLinks = [
  { to: '/sankalp-exam/syllabus', label: 'Syllabus', icon: <FiBook /> },
  { to: '/sankalp-exam/answer-key', label: 'Answer Key', icon: <FiFileText /> },
  { to: '/sankalp-exam/result-check', label: 'Result Check', icon: <FiUserCheck /> },
  { to: '/sankalp-exam/result-pdf', label: 'Result PDF', icon: <FiDownload /> },
]

function Group({ label, icon, links, defaultOpen }) {
  const location = useLocation()
  const isActiveGroup = links.some((l) => location.pathname.startsWith(l.to))
  const [open, setOpen] = useState(defaultOpen || isActiveGroup)

  return (
    <div>
      <button className={`sidebar-toggle ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{icon} {label}</span>
        <FiChevronDown style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {open && (
        <div className="sidebar-sub">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="name">Shri Shahu Prabodhini</div>
        <div className="sub">Admin Panel</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FiGrid /> Dashboard
        </NavLink>

        <div className="sidebar-group-label">Management</div>
        <Group label="Settings" icon={<FiSettings />} links={settingsLinks} defaultOpen />

        <NavLink to="/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FiUsers /> Students
        </NavLink>

        <div className="sidebar-group-label">Website</div>
        <Group label="Website Management" icon={<FiGlobe />} links={websiteLinks} />

        <div className="sidebar-group-label">Exam</div>
        <Group label="Sankalp Exam" icon={<FiFileText />} links={sankalpLinks} />
      </nav>
    </aside>
  )
}
