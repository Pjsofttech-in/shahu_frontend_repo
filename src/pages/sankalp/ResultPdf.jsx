import React from 'react'
import { FiFileText } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { resultPdfService, uploadFile } from '../../api/services.js'

export default function ResultPdf() {
  return (
    <CrudManager
        title="Result PDFs"
        subtitle="Upload consolidated result sheets (center-wise / class-wise) for download on the public website."
        service={resultPdfService}
        addLabel="Add Result PDF"
        searchKeys={['title', 'standard']}
        searchPlaceholder="Search by title or class…"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'standard', label: 'Class' },
          { key: 'year', label: 'Year' },
          {
            key: 'fileUrl', label: 'File',
            render: (r) => r.fileUrl ? <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><FiFileText /> View</a> : '—',
          },
        ]}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'standard', label: 'Class / Standard', type: 'select', options: [
            '5th', '6th', '7th', '8th', '9th', '10th',
          ].map((s) => ({ label: s, value: s })) },
          { name: 'year', label: 'Exam Year', type: 'number', required: true },
          { name: 'file', label: 'Result PDF', type: 'file', accept: 'application/pdf', required: true },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.file instanceof File) {
            payload.fileUrl = (await uploadFile(values.file, 'sankalp/result-pdf')).url
          }
          delete payload.file
          return payload
        }}
      />
  )
}
