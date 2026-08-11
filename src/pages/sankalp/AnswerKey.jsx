import React from 'react'
import { FiFileText } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { answerKeyService, uploadFile } from '../../api/services.js'

export default function AnswerKey() {
  return (
    <Layout title="Sankalp Exam · Answer Key">
      <CrudManager
        title="Answer Keys"
        subtitle="Publish answer keys for each Sankalp Exam set / class."
        service={answerKeyService}
        addLabel="Add Answer Key"
        searchKeys={['title', 'standard']}
        searchPlaceholder="Search by title or class…"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'standard', label: 'Class' },
          { key: 'examSet', label: 'Set' },
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
          { name: 'examSet', label: 'Exam Set (A/B/C…)', type: 'text' },
          { name: 'year', label: 'Exam Year', type: 'number', required: true },
          { name: 'file', label: 'Answer Key PDF', type: 'file', accept: 'application/pdf', required: true },
        ]}
        transformSubmit={async (values) => {
          const payload = { ...values }
          if (values.file instanceof File) {
            payload.fileUrl = (await uploadFile(values.file, 'sankalp/answer-key')).url
          }
          delete payload.file
          return payload
        }}
      />
    </Layout>
  )
}
