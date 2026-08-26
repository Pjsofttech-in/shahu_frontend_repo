import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import Students from './Students.jsx'

export default function StudentsSection() {
  return (
    <Layout title="Students">
      <Routes>
        <Route path="/*" element={<Students />} />
      </Routes>
    </Layout>
  )
}
