import React from 'react'
import { FiFileText } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { syllabusService } from '../../api/services.js'

export default function Syllabus() {
  return (
    <CrudManager
        title="Syllabus"
        subtitle="Manage syllabus documents from the live database."
        service={syllabusService}
        addLabel="Add Syllabus"
        searchKeys={['title', 'description', 'link']}
        searchPlaceholder="Search by title, description or link…"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description', render: (r) => r.description || '—' },
          {
            key: 'fileUrl', label: 'File / Link',
            render: (r) => {
              if (r.fileUrl) return <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><FiFileText /> View</a>
              if (r.link) return <a href={r.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Open Link</a>
              return '—'
            },
          },
        ]}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'link', label: 'Link', type: 'url', placeholder: 'https://example.com/syllabus.pdf' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'Add a short description for this syllabus…', fullWidth: true },
          { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        ]}
        transformSubmit={async (values) => {
          const title = (values.title ?? '').trim()
          const link = (values.link ?? '').trim()
          const description = (values.description ?? '').trim()

          if (!title) {
            throw new Error('Title is required')
          }
          if (!(values.file instanceof File)) {
            throw new Error('Please select a PDF file')
          }

          return {
            title,
            link,
            description,
            syllabusFile: values.file,
          }
        }}
      />
  )
}
