import React from 'react'
import { FiFileText } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { downloadService, uploadFile } from '../../api/services.js'

export default function Downloads() {
  return (
    <Layout title="Website · Downloads">
      <CrudManager
        title="Downloads"
        subtitle="Downloadable documents (name + PDF) shown on the public website."
        service={downloadService}
        addLabel="Add Download"
        searchKeys={['name']}
        searchPlaceholder="Search by name…"
        columns={[
          { key: 'name', label: 'Name' },
          {
            key: 'fileUrl', label: 'File',
            render: (r) => r.fileUrl ? <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><FiFileText /> View PDF</a> : '—',
          },
        ]}
        fields={[
          { name: 'name', label: 'Document Name', type: 'text', required: true },
          { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        ]}
        transformSubmit={async (values) => {
          const payload = { name: values.name, fileUrl: values.fileUrl }
          if (values.file instanceof File) {
            payload.fileUrl = (await uploadFile(values.file, 'downloads')).url
          }
          return payload
        }}
      />
    </Layout>
  )
}
