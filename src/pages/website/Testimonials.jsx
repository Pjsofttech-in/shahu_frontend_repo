import React from 'react'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { testimonialService, uploadFile } from '../../api/services.js'

export default function Testimonials() {
  return (
    <Layout title="Website · Testimonials">
      <CrudManager
        title="Testimonials"
        subtitle="Reviews and feedback shown on the public website."
        service={testimonialService}
        addLabel="Add Testimonial"
        searchKeys={['name']}
        searchPlaceholder="Search by name…"
        columns={[
          { key: 'photo', label: 'Photo', width: 70, render: (r) => r.photoUrl ? <img src={r.photoUrl} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} /> : '—' },
          { key: 'name', label: 'Name' },
          { key: 'designation', label: 'Designation' },
          { key: 'message', label: 'Message', render: (r) => (r.message || '').slice(0, 60) + ((r.message || '').length > 60 ? '…' : '') },
        ]}
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'designation', label: 'Designation (e.g. Parent, Student)', type: 'text' },
          { name: 'message', label: 'Testimonial Message', type: 'textarea', required: true },
          { name: 'photo', label: 'Photo', type: 'file', accept: 'image/*' },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.photo instanceof File) {
            payload.photoUrl = (await uploadFile(values.photo, 'testimonials')).url
          }
          delete payload.photo
          return payload
        }}
      />
    </Layout>
  )
}
