import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { awardService, uploadFile } from '../../api/services.js'

export default function Awards() {
  return (
    <CrudManager
        title="Awards & Recognition"
        subtitle="Awards and achievements displayed on the public website."
        service={awardService}
        addLabel="Add Award"
        searchKeys={['title']}
        searchPlaceholder="Search by title…"
        columns={[
          { key: 'photo', label: 'Image', width: 80, render: (r) => r.imageUrl ? <img src={r.imageUrl} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '—' },
          { key: 'title', label: 'Title' },
          { key: 'year', label: 'Year' },
          { key: 'description', label: 'Description', render: (r) => (r.description || '').slice(0, 50) },
        ]}
        fields={[
          { name: 'title', label: 'Award Title', type: 'text', required: true },
          { name: 'year', label: 'Year', type: 'number' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'file', accept: 'image/*' },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.image instanceof File) {
            payload.imageUrl = (await uploadFile(values.image, 'awards')).url
          }
          delete payload.image
          return payload
        }}
      />
  )
}
