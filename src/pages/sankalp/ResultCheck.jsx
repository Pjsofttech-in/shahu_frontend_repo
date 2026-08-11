import React from 'react'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { resultCheckService } from '../../api/services.js'

export default function ResultCheck() {
  return (
    <Layout title="Sankalp Exam · Result Check">
      <CrudManager
        title="Result Check"
        subtitle="Per-student results — students use these to check their result on the public website using Roll Number."
        service={resultCheckService}
        addLabel="Add Result"
        searchKeys={['rollNumber', 'studentName']}
        searchPlaceholder="Search by roll number or name…"
        columns={[
          { key: 'rollNumber', label: 'Roll No.' },
          { key: 'studentName', label: 'Student Name' },
          { key: 'standard', label: 'Class' },
          { key: 'marksObtained', label: 'Marks' },
          { key: 'totalMarks', label: 'Out of' },
          { key: 'rank', label: 'Rank' },
          { key: 'year', label: 'Year' },
        ]}
        fields={[
          { name: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
          { name: 'studentName', label: 'Student Name', type: 'text', required: true },
          { name: 'standard', label: 'Class / Standard', type: 'select', options: [
            '5th', '6th', '7th', '8th', '9th', '10th',
          ].map((s) => ({ label: s, value: s })) },
          { name: 'marksObtained', label: 'Marks Obtained', type: 'number', required: true },
          { name: 'totalMarks', label: 'Total Marks', type: 'number', required: true },
          { name: 'rank', label: 'Rank', type: 'text' },
          { name: 'year', label: 'Exam Year', type: 'number', required: true },
        ]}
      />
    </Layout>
  )
}
