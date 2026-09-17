import React from 'react'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { examSectionService } from '../../api/services.js'

const normalizeExamInfo = (data = {}) => ({
  ...data,
  description: data.description ?? '',
  examTitle: data.examTitle ?? data.title ?? '',
  subtitle: data.subtitle ?? '',
  examDate: data.examDate ?? '',
  applicationClosingDate: data.applicationClosingDate ?? '',
  registrationFee: data.registrationFee ?? '',
  eligibleClasses: data.eligibleClasses ?? data.eligibility ?? '',
  examPattern: data.examPattern ?? '',
  centers: data.centers ?? '',
})

const toApiPayload = (values) => Object.fromEntries(
  ['id', 'description', 'examTitle', 'subtitle', 'examDate', 'applicationClosingDate', 'registrationFee', 'eligibleClasses', 'examPattern', 'centers']
    .filter((key) => values[key] !== undefined)
    .map((key) => [key, values[key]])
)

const examInfoService = {
  get: async () => normalizeExamInfo(await examSectionService.get()),
  update: async (values) => normalizeExamInfo(await examSectionService.update(toApiPayload(values))),
}

export default function ExamInfo() {
  return (
    <SingletonForm
      title="Exam Info"
      subtitle="Manage the premium Sankalp exam card from the live database."
      service={examInfoService}
      formClassName="exam-info-form"
      fields={[
        { name: 'examTitle', label: 'Exam Title', type: 'text', required: true, placeholder: 'Sankalp Scholarship Examination 2026-27' },
        { name: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Exam overview' },
        { name: 'description', label: 'Description', type: 'richtext', required: true, fullWidth: true, placeholder: 'Open to all students...' },
        { name: 'examDate', label: 'Exam Date', type: 'date' },
        { name: 'applicationClosingDate', label: 'Registration Deadline', type: 'date' },
        { name: 'registrationFee', label: 'Registration Fee', type: 'number', min: 0, placeholder: '5000' },
        { name: 'eligibleClasses', label: 'Eligible Classes', type: 'text', placeholder: 'Class 5 to Class 10' },
        { name: 'examPattern', label: 'Exam Pattern', type: 'textarea', rows: 3, fullWidth: true, placeholder: 'Mathematics, Science, English and General Knowledge...' },
        { name: 'centers', label: 'Centers Available', type: 'textarea', rows: 2, fullWidth: true, placeholder: 'Mumbai, Pune, Nashik, Nagpur' },
      ]}
      transformSubmit={(values) => {
        const payload = {
          ...values,
          examTitle: String(values.examTitle ?? '').trim(),
          subtitle: String(values.subtitle ?? '').trim(),
          description: String(values.description ?? '').trim(),
          eligibleClasses: String(values.eligibleClasses ?? '').trim(),
          examPattern: String(values.examPattern ?? '').trim(),
          centers: String(values.centers ?? '').trim(),
        }
        if (!payload.examTitle || !payload.description) throw new Error('Exam title and description are required.')
        ;['registrationFee'].forEach((key) => {
          if (payload[key] === '' || payload[key] === undefined) delete payload[key]
          else payload[key] = Number(payload[key])
        })
        return payload
      }}
    />
  )
}
