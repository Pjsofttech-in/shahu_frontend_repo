import React from 'react'
import { FiFileText } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { answerKeyService, uploadFile } from '../../api/services.js'

export default function AnswerKey() {
  return (
    <CrudManager
        title="Answer Keys"
        subtitle="Publish answer keys with a title and optional PDF or link."
        service={answerKeyService}
        addLabel="Add Answer Key"
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
          { name: 'link', label: 'Link', type: 'url', placeholder: 'https://example.com/answer-key.pdf' },
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
            payload.fileUrl = (await uploadFile(values.file, 'sankalp/answer-key')).url
          }

          delete payload.file
          return payload
        }}
      />
  )
}
