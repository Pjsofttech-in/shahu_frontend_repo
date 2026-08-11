import React from 'react'
import { FiFileText } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { syllabusService, uploadFile } from '../../api/services.js'

export default function Syllabus() {
  return (
    <Layout title="Sankalp Exam · Syllabus">
      <CrudManager
        title="Syllabus"
        subtitle="Upload class-wise / subject-wise syllabus documents for the Sankalp Exam."
        service={syllabusService}
        addLabel="Add Syllabus"
        searchKeys={['title', 'standard']}
        searchPlaceholder="Search by title or class…"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'standard', label: 'Class' },
          { key: 'year', label: 'Exam Year' },
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
          { name: 'file', label: 'Syllabus PDF', type: 'file', accept: 'application/pdf', required: true },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.file instanceof File) {
            payload.fileUrl = (await uploadFile(values.file, 'sankalp/syllabus')).url
          }
          delete payload.file
          return payload
        }}
      />
    </Layout>
  )
}
