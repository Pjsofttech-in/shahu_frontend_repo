import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { galleryService, uploadFile } from '../../api/services.js'

export default function Gallery() {
  return (
    <CrudManager
        title="Gallery"
        subtitle="Photos shown in the public website gallery, grouped by category."
        service={galleryService}
        addLabel="Add Photo"
        searchKeys={['title', 'category']}
        searchPlaceholder="Search by title or category…"
        columns={[
          { key: 'preview', label: 'Preview', width: 80, render: (r) => r.imageUrl ? <img src={r.imageUrl} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '—' },
          { key: 'title', label: 'Title' },
          { key: 'category', label: 'Category' },
          { key: 'active', label: 'Status', render: (r) => <span className={`badge ${r.active === false ? 'badge-inactive' : 'badge-active'}`}>{r.active === false ? 'Hidden' : 'Visible'}</span> },
        ]}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'category', label: 'Category', type: 'select', required: true, options: [
            'Events', 'Achievements', 'Campus', 'Activities', 'Other',
          ].map((c) => ({ label: c, value: c })) },
          { name: 'image', label: 'Photo', type: 'file', accept: 'image/*' },
          { name: 'active', label: 'Visible on website', type: 'checkbox', default: true },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.image instanceof File) {
            const uploaded = await uploadFile(values.image, 'gallery')
            payload.imageUrl = uploaded.url
          }
          delete payload.image
          return payload
        }}
      />
  )
}
