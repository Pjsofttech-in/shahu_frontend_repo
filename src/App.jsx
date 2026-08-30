import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'

// Section wrappers with horizontal navigation
import StudentsSection from './pages/students/StudentsSection.jsx'
import SankalpSection from './pages/sankalp/SankalpSection.jsx'
import TestSeriesSection from './pages/TestSeries/TestSeriesSection.jsx'
import EbookSection from './pages/ebook/EbookSection.jsx'
import SettingsSection from './pages/settings/SettingsSection.jsx'
import WebsiteSection from './pages/website/WebsiteSection.jsx'

import Unauthorized from './pages/Unauthorized.jsx'

const wrap = (Component) => (
  <ProtectedRoute><Component /></ProtectedRoute>
)

const HomeRoute = () => {
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={wrap(Dashboard)} />
      <Route path="/profile" element={wrap(Profile)} />

      {/* Students Section with horizontal nav */}
      <Route path="/students/*" element={wrap(StudentsSection)} />

      {/* Sankalp Section with horizontal nav */}
      <Route path="/sankalp-exam/*" element={wrap(SankalpSection)} />

      <Route path="/test-series/*" element={wrap(TestSeriesSection)} />
      <Route path="/ebook/*" element={wrap(EbookSection)} />

      {/* Settings Section with horizontal nav */}
      <Route path="/settings/*" element={wrap(SettingsSection)} />

      {/* Website Section with horizontal nav */}
      <Route path="/website/*" element={wrap(WebsiteSection)} />

      <Route path="/401" element={<Unauthorized />} />

      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<HomeRoute />} />
    </Routes>
  )
}
