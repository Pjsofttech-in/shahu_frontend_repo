import React from 'react'
import { FiFileText } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { syllabusService, uploadFile } from '../../api/services.js'

export default function Syllabus() {
  return (
    <CrudManager
        title="Syllabus"
        subtitle="Upload syllabus documents with a title and optional PDF or link."
        service={syllabusService}
        addLabel="Add Syllabus"
        searchKeys={['title', 'link']}
        searchPlaceholder="Search by title or link…"
        columns={[
          { key: 'title', label: 'Title' },
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
          { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf' },
        ]}
        transformSubmit={async (values) => {
          const title = (values.title ?? '').trim()
          const link = (values.link ?? '').trim()

          if (!title) {
            throw new Error('Title is required')
          }
          let savedLink = link
          if (!savedLink && values.file instanceof File) {
            savedLink = (await uploadFile(values.file, 'sankalp/syllabus')).url
          }

          if (!savedLink) {
            throw new Error('Please provide either a PDF file or a link')
          }

          return { title, link: savedLink }
        }}
      />
  )
}
