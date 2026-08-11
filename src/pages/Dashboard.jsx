import React, { useEffect, useState } from 'react'
import { FiMapPin, FiHome, FiUserCheck, FiUsers } from 'react-icons/fi'
import Layout from '../components/layout/Layout.jsx'
import { districtService, talukaService, centerService, studentService } from '../api/services.js'

const StatCard = ({ icon, label, value, color }) => (
  <div className="card stat-card">
    <div style={{ color, fontSize: 22 }}>{icon}</div>
    <div className="stat-num">{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
  </div>
)

export default function Dashboard() {
  const [counts, setCounts] = useState({ districts: null, talukas: null, centers: null, students: null })

  useEffect(() => {
    const loadCount = async (service, key) => {
      try {
        const data = await service.getAll()
        const list = Array.isArray(data) ? data : data?.content || []
        setCounts((prev) => ({ ...prev, [key]: list.length }))
      } catch {
        setCounts((prev) => ({ ...prev, [key]: 0 }))
      }
    }
    loadCount(districtService, 'districts')
    loadCount(talukaService, 'talukas')
    loadCount(centerService, 'centers')
    loadCount(studentService, 'students')
  }, [])

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome back 👋</h1>
          <p>Here's a quick snapshot of Shri Shahu Prabodhini's data.</p>
        </div>
      </div>
      <div className="grid-4">
        <StatCard icon={<FiMapPin />} label="Districts" value={counts.districts} color="#1e4d8f" />
        <StatCard icon={<FiHome />} label="Centers" value={counts.centers} color="#d99a2b" />
        <StatCard icon={<FiUserCheck />} label="Talukas" value={counts.talukas} color="#2a9d5c" />
        <StatCard icon={<FiUsers />} label="Students" value={counts.students} color="#d64545" />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Getting started</h3>
        <p style={{ color: 'var(--text-600)', fontSize: 13.5, lineHeight: 1.7 }}>
         
        </p>
      </div>
    </Layout>
  )
}
