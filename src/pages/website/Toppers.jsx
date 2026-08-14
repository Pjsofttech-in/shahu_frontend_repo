import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { topperService, uploadFile } from '../../api/services.js'

export default function Toppers() {
  return (
    <CrudManager
        title="Toppers"
        subtitle="Highlight top-performing students on the public website."
        service={topperService}
        addLabel="Add Topper"
        searchKeys={['name', 'examName']}
        searchPlaceholder="Search by name or exam…"
        columns={[
          { key: 'photo', label: 'Photo', width: 70, render: (r) => r.photoUrl ? <img src={r.photoUrl} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} /> : '—' },
          { key: 'name', label: 'Name' },
          { key: 'examName', label: 'Exam' },
          { key: 'rank', label: 'Rank / Score' },
          { key: 'year', label: 'Year' },
        ]}
        fields={[
          { name: 'name', label: 'Student Name', type: 'text', required: true },
          { name: 'examName', label: 'Exam Name', type: 'text', required: true },
          { name: 'rank', label: 'Rank / Score', type: 'text' },
          { name: 'year', label: 'Year', type: 'number' },
          { name: 'photo', label: 'Photo', type: 'file', accept: 'image/*' },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.photo instanceof File) {
            payload.photoUrl = (await uploadFile(values.photo, 'toppers')).url
          }
          delete payload.photo
          return payload
        }}
      />
  )
}
