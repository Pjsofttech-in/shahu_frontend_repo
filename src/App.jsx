import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'

import Districts from './pages/settings/Districts.jsx'
import Talukas from './pages/settings/Talukas.jsx'
import Centers from './pages/settings/Centers.jsx'
import Coordinators from './pages/settings/Coordinators.jsx'

import Students from './pages/students/Students.jsx'

import Footer from './pages/website/Footer.jsx'
import Gallery from './pages/website/Gallery.jsx'
import Toppers from './pages/website/Toppers.jsx'
import Testimonials from './pages/website/Testimonials.jsx'
import Faculty from './pages/website/Faculty.jsx'
import Awards from './pages/website/Awards.jsx'
import VisionMission from './pages/website/VisionMission.jsx'
import Courses from './pages/website/Courses.jsx'
import Downloads from './pages/website/Downloads.jsx'
import ContactUs from './pages/website/ContactUs.jsx'

import Syllabus from './pages/sankalp/Syllabus.jsx'
import AnswerKey from './pages/sankalp/AnswerKey.jsx'
import ResultCheck from './pages/sankalp/ResultCheck.jsx'
import ResultPdf from './pages/sankalp/ResultPdf.jsx'

const wrap = (Component) => (
  <ProtectedRoute><Component /></ProtectedRoute>
)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={wrap(Dashboard)} />
      <Route path="/profile" element={wrap(Profile)} />

      <Route path="/settings/districts" element={wrap(Districts)} />
      <Route path="/settings/talukas" element={wrap(Talukas)} />
      <Route path="/settings/centers" element={wrap(Centers)} />
      <Route path="/settings/coordinators" element={wrap(Coordinators)} />

      <Route path="/students" element={wrap(Students)} />

      <Route path="/website/footer" element={wrap(Footer)} />
      <Route path="/website/gallery" element={wrap(Gallery)} />
      <Route path="/website/toppers" element={wrap(Toppers)} />
      <Route path="/website/testimonials" element={wrap(Testimonials)} />
      <Route path="/website/faculty" element={wrap(Faculty)} />
      <Route path="/website/awards" element={wrap(Awards)} />
      <Route path="/website/vision-mission" element={wrap(VisionMission)} />
      <Route path="/website/courses" element={wrap(Courses)} />
      <Route path="/website/downloads" element={wrap(Downloads)} />
      <Route path="/website/contact-us" element={wrap(ContactUs)} />

      <Route path="/sankalp-exam/syllabus" element={wrap(Syllabus)} />
      <Route path="/sankalp-exam/answer-key" element={wrap(AnswerKey)} />
      <Route path="/sankalp-exam/result-check" element={wrap(ResultCheck)} />
      <Route path="/sankalp-exam/result-pdf" element={wrap(ResultPdf)} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
