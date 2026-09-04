import React, { useEffect, useMemo, useState } from 'react'
import { FiHome, FiUserCheck, FiUsers, FiActivity, FiArrowUpRight } from 'react-icons/fi'
import { centerService, coordinatorService, examService, studentService, testSeriesService } from '../../api/services.js'

const rowsOf = (value) => Array.isArray(value) ? value : value?.content || value?.data || []

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
  const [data, setData] = useState({ students: [], centers: [], coordinators: [], exams: [], series: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([studentService.getAll(), centerService.getAll(), coordinatorService.getAll(), examService.getAll(), testSeriesService.getAll()])
      .then(([students, centers, coordinators, exams, series]) => setData({ students: rowsOf(students), centers: rowsOf(centers), coordinators: rowsOf(coordinators), exams: rowsOf(exams), series: rowsOf(series) }))
      .catch(() => setError('Could not load live dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const activeExams = data.exams.filter((exam) => exam.active !== false && !exam.resultFinalized).length
  const periodCount = (days) => data.exams.filter((exam) => {
    const date = new Date(exam.examDate || exam.testStartDate)
    return !Number.isNaN(date.getTime()) && (Date.now() - date.getTime()) <= days * 86400000
  }).length
  const monthlyExams = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - 5 + index, 1)
    return { label: date.toLocaleString('en', { month: 'short' }), value: data.exams.filter((exam) => { const examDate = new Date(exam.examDate || exam.testStartDate); return examDate.getMonth() === date.getMonth() && examDate.getFullYear() === date.getFullYear() }).length }
  }), [data.exams])
  const maxMetric = Math.max(1, data.students.length, data.series.length, data.exams.length, data.centers.length)
  const completedExams = data.exams.filter((exam) => exam.resultFinalized).length
  const draftExams = Math.max(0, data.exams.length - completedExams)
  const dailyExams = Array.from({ length: new Date().getDate() }, (_, index) => ({
    day: index + 1,
    value: data.exams.filter((exam) => {
      const date = new Date(exam.examDate || exam.testStartDate)
      const today = new Date()
      return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === index + 1
    }).length,
  }))
  const stats = [
    { icon: <FiActivity />, label: 'TODAY', value: periodCount(1), color: '#2f74c0' },
    { icon: <FiActivity />, label: 'LAST 7 DAYS', value: periodCount(7), color: '#b34db8' },
    { icon: <FiActivity />, label: 'LAST 30 DAYS', value: periodCount(30), color: '#31aeb4' },
    { icon: <FiActivity />, label: 'LAST 365 DAYS', value: periodCount(365), color: '#2a9d5c' },
    { icon: <FiActivity />, label: 'TOTAL', value: data.exams.length, color: '#d99a2b' },
  ]

  return (
    <section className="test-series-dashboard">
      <div className="page-header">
        <div>
          <h1>Good afternoon, Admin</h1>
          <p>Here is your live operations snapshot for Shri Shahu Prabodhini.</p>
        </div>
      </div>

      {error && <div className="login-alert">{error}</div>}

      <div className="grid-5 dashboard-period-cards">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} value={loading ? '...' : stat.value} />)}
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div>
              <h3>Student reach</h3>
              <p>Illustrative monthly activity</p>
            </div>
              <span className="chart-badge">{data.exams.length} total</span>
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
              <path className="chart-area" d={`M0 220 ${monthlyExams.map((item, index) => `L${index * 128} ${220 - Math.min(item.value / Math.max(1, ...monthlyExams.map((entry) => entry.value)) * 180, 180)}`).join(' ')} L640 220 Z`} />
              <polyline className="chart-line" points={monthlyExams.map((item, index) => `${index * 128},${220 - Math.min(item.value / Math.max(1, ...monthlyExams.map((entry) => entry.value)) * 180, 180)}`).join(' ')} />
            </svg>
            <div className="chart-x-labels">
              {monthlyExams.map((item) => <span key={item.label}>{item.label}</span>)}
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
              ['Students', data.students.length, 'blue'],
              ['Test Series', data.series.length, 'gold'],
              ['Exams', data.exams.length, 'green'],
              ['Centers', data.centers.length, 'red'],
            ].map(([label, value, tone]) => (
              <div className="bar-row" key={label}>
                <div className="bar-label">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="bar-track">
                  <span className={`bar-fill ${tone}`} style={{ width: `${value / Math.max(1, data.students.length, data.series.length, data.exams.length, data.centers.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-footnote">
            <span className="status-dot" /> Data refreshed from the admin workspace
          </div>
        </div>
      </div>

      <div className="dashboard-report-grid">
        <div className="card dashboard-chart-card report-card">
          <div className="dashboard-card-heading"><div><h3>Test Series Distribution</h3><p>Live exam status breakdown</p></div><span className="chart-badge neutral">Live view</span></div>
          <div className="pie-report"><div className="dashboard-pie" style={{ background: `conic-gradient(#218cf0 0 ${data.exams.length ? completedExams / data.exams.length * 360 : 0}deg, #39c4c5 0 360deg)` }} /><div className="pie-legend"><span><i className="pie-dot blue" /> Completed <b>{completedExams}</b></span><span><i className="pie-dot teal" /> Active / Draft <b>{draftExams}</b></span></div></div>
        </div>
        <div className="card dashboard-chart-card report-card">
          <div className="dashboard-card-heading"><div><h3>Daily Exam Activity</h3><p>Current month from live exam dates</p></div><span className="chart-badge">{dailyExams.reduce((total, item) => total + item.value, 0)} exams</span></div>
          <div className="daily-chart" role="img" aria-label="Daily exam activity"><div className="daily-bars">{dailyExams.map((item) => <span key={item.day} title={`${item.day}: ${item.value}`} style={{ height: `${item.value ? Math.max(8, item.value / Math.max(1, ...dailyExams.map((entry) => entry.value)) * 100) : 2}%` }} />)}</div><div className="daily-labels"><span>1</span><span>{Math.ceil(dailyExams.length / 2)}</span><span>{dailyExams.length}</span></div></div>
        </div>
      </div>
    </section>
  )
}
