import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { courseService, uploadFile } from '../../api/services.js'

export default function Courses() {
  return (
    <CrudManager
        title="Courses"
        subtitle="Courses offered, shown on the public website."
        service={courseService}
        addLabel="Add Course"
        searchKeys={['title']}
        searchPlaceholder="Search by course title…"
        columns={[
          { key: 'icon', label: 'Icon', width: 70, render: (r) => r.imageUrl ? <img src={r.imageUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '—' },
          { key: 'title', label: 'Course Title' },
          { key: 'duration', label: 'Duration' },
          { key: 'fees', label: 'Fees' },
        ]}
        fields={[
          { name: 'title', label: 'Course Title', type: 'text', required: true },
          { name: 'duration', label: 'Duration', type: 'text' },
          { name: 'fees', label: 'Fees', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image', label: 'Icon / Image', type: 'file', accept: 'image/*' },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.image instanceof File) {
            payload.imageUrl = (await uploadFile(values.image, 'courses')).url
          }
          delete payload.image
          return payload
        }}
      />
  )
}
