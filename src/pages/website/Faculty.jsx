import React from 'react'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { facultyService, uploadFile } from '../../api/services.js'

export default function Faculty() {
  return (
    <Layout title="Website · Faculty">
      <CrudManager
        title="Faculty"
        subtitle="Teaching staff profiles shown on the public website."
        service={facultyService}
        addLabel="Add Faculty"
        searchKeys={['name', 'subject']}
        searchPlaceholder="Search by name or subject…"
        columns={[
          { key: 'photo', label: 'Photo', width: 70, render: (r) => r.photoUrl ? <img src={r.photoUrl} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} /> : '—' },
          { key: 'name', label: 'Name' },
          { key: 'subject', label: 'Subject' },
          { key: 'qualification', label: 'Qualification' },
          { key: 'experience', label: 'Experience' },
        ]}
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'subject', label: 'Subject', type: 'text', required: true },
          { name: 'qualification', label: 'Qualification', type: 'text' },
          { name: 'experience', label: 'Experience (years)', type: 'text' },
          { name: 'bio', label: 'Short Bio', type: 'textarea' },
          { name: 'photo', label: 'Photo', type: 'file', accept: 'image/*' },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.photo instanceof File) {
            payload.photoUrl = (await uploadFile(values.photo, 'faculty')).url
          }
          delete payload.photo
          return payload
        }}
      />
    </Layout>
  )
}
