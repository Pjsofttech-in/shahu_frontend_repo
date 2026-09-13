import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { faqService } from '../../api/services.js'

export default function FAQ() {
  return (
    <CrudManager
      title="FAQ"
      subtitle="Manage frequently asked questions for the Sankalp exam from the live database."
      service={faqService}
      addLabel="Add FAQ"
      searchKeys={['question', 'answer']}
      searchPlaceholder="Search questions or answers..."
      columns={[
        { key: 'question', label: 'Question' },
        { key: 'answer', label: 'Answer', render: (row) => row.answer || '-' },
      ]}
      fields={[
        { name: 'question', label: 'Question', type: 'textarea', rows: 3, required: true, fullWidth: true },
        { name: 'answer', label: 'Answer', type: 'textarea', rows: 6, required: true, fullWidth: true },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ]}
      transformSubmit={(values, editing) => {
        const payload = {
          ...(editing || {}),
          question: String(values.question ?? '').trim(),
          answer: String(values.answer ?? '').trim(),
          active: values.active !== false,
        }
        if (!payload.question || !payload.answer) throw new Error('Question and answer are required.')
        return payload
      }}
    />
  )
}
