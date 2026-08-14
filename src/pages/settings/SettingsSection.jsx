import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import HorizontalNav, { settingsLinks } from '../../components/layout/HorizontalNav.jsx'
import Districts from './Districts.jsx'
import Talukas from './Talukas.jsx'
import Centers from './Centers.jsx'
import Coordinators from './Coordinators.jsx'

export default function SettingsSection() {
  return (
    <Layout
      title="Settings"
      horizontalNav={<HorizontalNav links={settingsLinks} title="Settings" />}
    >
      <Routes>
        <Route path="/districts" element={<Districts />} />
        <Route path="/talukas" element={<Talukas />} />
        <Route path="/centers" element={<Centers />} />
        <Route path="/coordinators" element={<Coordinators />} />
        <Route path="/*" element={<Navigate to="/settings/districts" replace />} />
      </Routes>
    </Layout>
  )
}
