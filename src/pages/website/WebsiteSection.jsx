import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import HorizontalNav, { websiteLinks } from '../../components/layout/HorizontalNav.jsx'
import Footer from './Footer.jsx'
import Gallery from './Gallery.jsx'
import Toppers from './Toppers.jsx'
import Testimonials from './Testimonials.jsx'
import Faculty from './Faculty.jsx'
import Awards from './Awards.jsx'
import VisionMission from './VisionMission.jsx'
import Courses from './Courses.jsx'
import Downloads from './Downloads.jsx'
import ContactUs from './ContactUs.jsx'

export default function WebsiteSection() {
  return (
    <Layout
      title="Website Management"
      horizontalNav={<HorizontalNav links={websiteLinks} title="Website Management" />}
    >
      <Routes>
        <Route path="/footer" element={<Footer />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/toppers" element={<Toppers />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/vision-mission" element={<VisionMission />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/*" element={<Navigate to="/website/footer" replace />} />
      </Routes>
    </Layout>
  )
}
