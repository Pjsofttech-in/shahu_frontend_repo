import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout.jsx'
import { VerticalNav, websiteLinks } from '../../components/layout/HorizontalNav.jsx'
import Home from './Home.jsx'
import ModulePlaceholder from './ModulePlaceholder.jsx'
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
import ContactForm from './ContactForm.jsx'
import AboutUs from './AboutUs.jsx'
import Notifications from './Notifications.jsx'
import WebsiteUrl from './WebsiteUrl.jsx'

export default function WebsiteSection() {
  return (
    <Layout
      title="Website Management"
      verticalNav={<VerticalNav links={websiteLinks} title="Website Management" />}
    >
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/url" element={<WebsiteUrl />} />
        {/* <Route path="/sidebar" element={<ModulePlaceholder title="Sidebar" />} />
        <Route path="/settings" element={<ModulePlaceholder title="Website Settings" />} /> */}
        <Route path="/hero" element={<ModulePlaceholder title="Hero Section" />} />
        <Route path="/services" element={<ModulePlaceholder title="Services" />} />
        <Route path="/sankalp-features" element={<ModulePlaceholder title="Sankalp Features" />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<ModulePlaceholder title="Features" />} />
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
        <Route path="/contact-form" element={<ContactForm />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/*" element={<Navigate to="/website/home" replace />} />
      </Routes>
    </Layout>
  )
}
