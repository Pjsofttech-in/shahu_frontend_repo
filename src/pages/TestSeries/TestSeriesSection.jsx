import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import HorizontalNav, { testSeriesLinks, testSeriesSettingsLinks, VerticalNav } from '../../components/layout/HorizontalNav.jsx'
import TestSeriesPage from './TestSeriesPage.jsx'
import SeriesManager from './SeriesManager.jsx'
import CategorySettings from './CategorySettings.jsx'
import SectionSettings from './SectionSettings.jsx'

const pages = {
  series: ['Series', 'Create and manage your test series.'],
  paper: ['Paper', 'Create and organize papers for each test series.'],
  questions: ['Question Bank', 'Manage reusable questions for your papers.'],
  addQuestion: ['Add Question', 'Add questions to the Test Series question bank.'],
  solved: ['Solved Paper', 'Review and manage solved papers.'],
}

export default function TestSeriesSection() {
  const location = useLocation()
  const isSettings = location.pathname.startsWith('/test-series/settings')

  return (
    <Layout
      title="Test Series"
      horizontalNav={<HorizontalNav links={testSeriesLinks} title="Test Series" />}
      verticalNav={isSettings ? <VerticalNav links={testSeriesSettingsLinks} title="Settings" className="test-series-settings-nav" /> : null}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/test-series/settings" replace />} />
        <Route path="/series" element={<SeriesManager />} />
        <Route path="/paper" element={<TestSeriesPage title={pages.paper[0]} description={pages.paper[1]} />} />
        <Route path="/question-bank" element={<TestSeriesPage title={pages.questions[0]} description={pages.questions[1]} />} />
        <Route path="/add-question" element={<TestSeriesPage title={pages.addQuestion[0]} description={pages.addQuestion[1]} />} />
        <Route path="/solved-paper" element={<TestSeriesPage title={pages.solved[0]} description={pages.solved[1]} />} />
        <Route path="/settings" element={<Navigate to="/test-series/settings/categories" replace />} />
        <Route path="/settings/categories" element={<CategorySettings />} />
        <Route path="/settings/sections" element={<SectionSettings />} />
        <Route path="/*" element={<Navigate to="/test-series/settings" replace />} />
      </Routes>
    </Layout>
  )
}
