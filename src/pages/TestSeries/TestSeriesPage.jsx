import React from 'react'

export default function TestSeriesPage({ title, description }) {
  return (
    <section className="test-series-page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="test-series-empty card">
        <h2>{title}</h2>
        <p>This Test Series module is ready for its management workflow.</p>
      </div>
    </section>
  )
}
