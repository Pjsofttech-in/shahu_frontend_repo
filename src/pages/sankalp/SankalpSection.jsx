import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import HorizontalNav, { sankalpLinks } from '../../components/layout/HorizontalNav.jsx'
import Syllabus from './Syllabus.jsx'
import AnswerKey from './AnswerKey.jsx'
import ResultCheck from './ResultCheck.jsx'
import ResultPdf from './ResultPdf.jsx'

export default function SankalpSection() {
  return (
    <Layout
      title="Sankalp Exam"
      horizontalNav={<HorizontalNav links={sankalpLinks} title="Sankalp Exam" />}
    >
      <Routes>
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/answer-key" element={<AnswerKey />} />
        <Route path="/result-check" element={<ResultCheck />} />
        <Route path="/result-pdf" element={<ResultPdf />} />
        <Route path="/*" element={<Navigate to="/sankalp-exam/syllabus" replace />} />
      </Routes>
    </Layout>
  )
}
