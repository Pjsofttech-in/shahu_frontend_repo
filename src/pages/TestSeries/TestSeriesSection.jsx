import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import HorizontalNav, { testSeriesLinks, testSeriesSettingsLinks, VerticalNav } from '../../components/layout/HorizontalNav.jsx'
import SeriesManager from './SeriesManager.jsx'
import CategorySettings from './CategorySettings.jsx'
import SectionSettings from './SectionSettings.jsx'
import ExamManager from './ExamManager.jsx'
import QuestionManager from './QuestionManager.jsx'
import ExamQuestionsPage from './ExamQuestionsPage.jsx'
import TestSeriesPage from './TestSeriesPage.jsx'

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
        <Route path="/" element={<TestSeriesPage title="Test Series" description="" />} />
        <Route path="/series" element={<SeriesManager />} />
        <Route path="/questions" element={<QuestionManager />} />
        <Route path="/exam" element={<ExamManager />} />
        <Route path="/exam/:examId/questions" element={<ExamQuestionsPage />} />
        <Route path="/solved-paper" element={<ExamManager solvedOnly />} />
        <Route path="/settings" element={<Navigate to="/test-series/settings/categories" replace />} />
        <Route path="/settings/categories" element={<CategorySettings />} />
        <Route path="/settings/sections" element={<SectionSettings />} />
        <Route path="/*" element={<Navigate to="/test-series" replace />} />
      </Routes>
    </Layout>
  )
}
