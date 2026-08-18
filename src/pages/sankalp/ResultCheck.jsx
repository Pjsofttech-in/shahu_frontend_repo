import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { resultCheckService, uploadFile } from '../../api/services.js'

export default function ResultCheck() {
  return (
    <CrudManager
        title="Result Check"
        subtitle="Add result-check entries with a title and optional PDF or external link."
        service={resultCheckService}
        addLabel="Add Result"
        searchKeys={['title', 'link']}
        searchPlaceholder="Search by title or link…"
        columns={[
          { key: 'title', label: 'Title' },
          {
            key: 'fileUrl', label: 'File / Link',
            render: (r) => {
              if (r.fileUrl) return <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a>
              if (r.link) return <a href={r.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Open Link</a>
              return '—'
            },
          },
        ]}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'link', label: 'Link', type: 'url', placeholder: 'https://example.com/result-check.pdf' },
          { name: 'file', label: 'Upload PDF / Image', type: 'file', accept: 'application/pdf,image/*' },
        ]}
        transformSubmit={async (values) => {
          const title = (values.title ?? '').trim()
          const link = (values.link ?? '').trim()

          if (!title) {
            throw new Error('Title is required')
          }
          if (!values.file && !link) {
            throw new Error('Please provide either a file or a link')
          }

          const payload = { title, link: link || null }

          if (values.file instanceof File) {
            payload.fileUrl = (await uploadFile(values.file, 'sankalp/result-check')).url
          }

          delete payload.file
          return payload
        }}
      />
  )
}
