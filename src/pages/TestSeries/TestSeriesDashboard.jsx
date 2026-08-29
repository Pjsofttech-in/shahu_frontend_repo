import React from 'react'
import { FiMapPin, FiHome, FiUserCheck, FiUsers, FiActivity, FiArrowUpRight } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'

const StatCard = ({ icon, label, value, color }) => (
  <div className="card stat-card">
    <div className="stat-card-top">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <FiArrowUpRight className="stat-trend" />
    </div>
    <div className="stat-num">{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
  </div>
)

export default function TestSeriesDashboard() {
  return (
    <Layout title="Test Series Dashboard">
      <div className="page-header">
        <div>
          <h1>Good afternoon, Admin</h1>
          <p>Here is your live operations snapshot for Shri Shahu Prabodhini.</p>
        </div>
      </div>

      <div className="grid-4">
        <StatCard icon={<FiUsers />} label="Students" value={10} color="#2f74c0" />
        <StatCard icon={<FiHome />} label="Centers" value={5} color="#d99a2b" />
        <StatCard icon={<FiUserCheck />} label="Coordinators" value={3} color="#2a9d5c" />
        <StatCard icon={<FiActivity />} label="Active Tests" value={0} color="#d64545" />
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div>
              <h3>Student reach</h3>
              <p>Illustrative monthly activity</p>
            </div>
            <span className="chart-badge">+18.4%</span>
          </div>

          <div className="line-chart" aria-label="Illustrative student reach chart">
            <div className="chart-y-labels">
              <span>800</span>
              <span>600</span>
              <span>400</span>
              <span>200</span>
              <span>0</span>
            </div>
            <svg viewBox="0 0 640 220" role="img" aria-hidden="true" preserveAspectRatio="none">
              <defs>
                <linearGradient id="reachFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#4f91df" stopOpacity=".35" />
                  <stop offset="1" stopColor="#4f91df" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="chart-area" d="M0 180 L80 155 L160 165 L240 112 L320 130 L400 78 L480 96 L560 45 L640 62 L640 220 L0 220 Z" />
              <path className="chart-line" d="M0 180 L80 155 L160 165 L240 112 L320 130 L400 78 L480 96 L560 45 L640 62" />
              <circle cx="560" cy="45" r="5" className="chart-point" />
            </svg>
            <div className="chart-x-labels">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>
        </div>

        <div className="card dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div>
              <h3>Program activity</h3>
              <p>Current distribution</p>
            </div>
            <span className="chart-badge neutral">Live view</span>
          </div>

          <div className="bar-chart">
            {[
              ['Sankalp Exam', 82, 'blue'],
              ['School Network', 68, 'gold'],
              ['Centers', 54, 'green'],
              ['Community', 42, 'red'],
            ].map(([label, value, tone]) => (
              <div className="bar-row" key={label}>
                <div className="bar-label">
                  <span>{label}</span>
                  <strong>{value}%</strong>
                </div>
                <div className="bar-track">
                  <span className={`bar-fill ${tone}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-footnote">
            <span className="status-dot" /> Data refreshed from the admin workspace
          </div>
        </div>
      </div>
    </Layout>
  )
}
