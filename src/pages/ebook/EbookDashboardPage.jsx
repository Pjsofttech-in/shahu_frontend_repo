import React from 'react'

const statCards = [
  { label: 'TODAY', value: '0', amount: '₹ 0', tone: '#dfeafc', accent: '#2f74c0' },
  { label: 'LAST 7 DAYS', value: '0', amount: '₹ 0', tone: '#f3dff1', accent: '#d79ad4' },
  { label: 'LAST 30 DAYS', value: '2', amount: '₹ 18', tone: '#d8edf9', accent: '#39a7d7' },
  { label: 'LAST 365 DAYS', value: '31', amount: '₹ 939', tone: '#dff5e1', accent: '#5bc26a' },
  { label: 'TOTAL', value: '34', amount: '₹ 999', tone: '#f9e8cb', accent: '#e3a14b' },
]

const chartBars = [
  { label: 'Jan', value: 5 },
  { label: 'Feb', value: 8 },
  { label: 'Mar', value: 6 },
  { label: 'Apr', value: 10 },
  { label: 'May', value: 7 },
  { label: 'Jun', value: 9 },
]

export default function EbookDashboardPage() {
  return (
    <div className="test-series-page">
      <div className="card test-series-card">
        <div className="test-series-card-header" style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Dashboard</h1>
        </div>

        <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(120px, 1fr))', gap: '16px' }}>
          {statCards.map((card) => (
            <div key={card.label} className="card stat-card" style={{ background: card.tone, borderColor: 'rgba(0,0,0,0.04)' }}>
              <div className="stat-card-top">
                <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.52)', color: card.accent }}>
                  {card.label.includes('DAY') ? '📅' : card.label === 'TOTAL' ? '✓' : '₹'}
                </div>
                <span className="stat-trend">↗</span>
              </div>
              <div className="stat-num" style={{ fontSize: '17px', lineHeight: 1.2 }}>{card.value}</div>
              <div className="stat-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>{card.label}</span>
                <strong style={{ fontSize: '13px', color: '#0f1e33' }}>{card.amount}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{ marginTop: '24px' }}>
          <div className="card dashboard-chart-card">
            <div className="dashboard-card-heading">
              <div>
                <h3>Compare Orders &amp; Revenue</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value="2025" style={{ width: '100px', padding: '8px 10px', border: '1px solid #dbe3ee', borderRadius: '6px', background: '#fff' }}>
                  <option>2025</option>
                  <option>2026</option>
                </select>
                <select value="2026" style={{ width: '100px', padding: '8px 10px', border: '1px solid #dbe3ee', borderRadius: '6px', background: '#fff' }}>
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', color: '#4c5d75' }}>
              <span style={{ width: '14px', height: '14px', background: '#b8adb4', borderRadius: '50%', display: 'inline-block' }} />
              <span>Orders</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
              <div style={{ width: '260px', height: '260px', borderRadius: '50%', background: 'conic-gradient(#2f74c0 0 72%, #42b6c0 72% 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '24px', borderRadius: '50%', background: '#fff' }} />
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: '26px', fontWeight: 700, color: '#1f2d3d' }}>9</div>
              </div>
            </div>
          </div>

          <div className="card dashboard-chart-card">
            <div className="dashboard-card-heading">
              <div>
                <h3>Monthly Orders Report</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select value="2026" style={{ width: '110px', padding: '8px 10px', border: '1px solid #dbe3ee', borderRadius: '6px', background: '#fff' }}>
                  <option>2026</option>
                  <option>2025</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4c5d75' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#4e90da', width: '18px', height: '18px' }} />
                  Orders
                </label>
              </div>
            </div>

            <div style={{ height: '250px', display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '12px', padding: '20px 0 8px', borderLeft: '1px solid #dfe5ee', borderBottom: '1px solid #dfe5ee' }}>
              {chartBars.map((bar) => (
                <div key={bar.label} style={{ width: '52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <div style={{ height: `${bar.value * 22}px`, width: '42px', background: '#4cb7b8', borderRadius: '4px 4px 0 0', boxShadow: '0 6px 12px rgba(76, 183, 184, 0.2)' }} />
                  <span style={{ fontSize: '12px', color: '#6a7788' }}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
