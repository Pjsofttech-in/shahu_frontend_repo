import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { sectionService } from '../../api/services.js'

export default function SectionSettings() {
  return (
    <CrudManager
      title="Test Sections"
      subtitle="Manage the sections used to organize your test papers."
      service={sectionService}
      addLabel="Add Section"
      showEditAction={false}
      rowClickEdit={false}
      searchKeys={['name']}
      searchPlaceholder="Search sections…"
      columns={[
        { key: 'id', label: 'ID', width: 70 },
        { key: 'name', label: 'Section', render: (row) => row.name || row.sectionName || '' },
      ]}
      fields={[
        { name: 'name', label: 'Section Name', type: 'text', required: true },
      ]}
      transformSubmit={async (values, editing) => {
        const name = String(values.name ?? values.sectionName ?? '').trim()
        if (!name) throw new Error('Section name is required')

        const payload = {
          name,
        }
        if (editing?.id) payload.id = editing.id
        return payload
      }}
    />
  )
}
