import React from 'react'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { examSectionService } from '../../api/services.js'

export default function ExamInfo() {
  return (
    <SingletonForm
      title="Exam Info"
      subtitle="Manage the Sankalp exam information displayed from the live database."
      service={examSectionService}
      formClassName="exam-info-form"
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Sankalp Exam' },
        { name: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Exam overview' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 5, required: true, fullWidth: true },
        { name: 'eligibility', label: 'Eligibility', type: 'textarea', rows: 3, fullWidth: true },
        { name: 'instructions', label: 'Instructions', type: 'textarea', rows: 5, fullWidth: true },
        { name: 'examDate', label: 'Exam Date', type: 'date' },
        { name: 'duration', label: 'Duration (minutes)', type: 'number', min: 1 },
        { name: 'totalMarks', label: 'Total Marks', type: 'number', min: 1 },
        { name: 'totalQuestions', label: 'Total Questions', type: 'number', min: 1 },
      ]}
      transformSubmit={(values) => {
        const payload = {
          ...values,
          title: String(values.title ?? '').trim(),
          subtitle: String(values.subtitle ?? '').trim(),
          description: String(values.description ?? '').trim(),
          eligibility: String(values.eligibility ?? '').trim(),
          instructions: String(values.instructions ?? '').trim(),
        }
        if (!payload.title || !payload.description) throw new Error('Title and description are required.')
        ;['duration', 'totalMarks', 'totalQuestions'].forEach((key) => {
          if (payload[key] === '' || payload[key] === undefined) delete payload[key]
          else payload[key] = Number(payload[key])
        })
        return payload
      }}
    />
  )
}
