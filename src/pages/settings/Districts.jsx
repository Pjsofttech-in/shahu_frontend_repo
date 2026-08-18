import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMap } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { districtService } from '../../api/services.js'

export default function Districts() {
  const navigate = useNavigate()

  return (
    <CrudManager
        title="Districts"
        subtitle="Top level of the location hierarchy — Districts contain Talukas."
        service={districtService}
        addLabel="Add District"
        showEditAction={false}
        searchKeys={['districtName']}
        searchPlaceholder="Search districts…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'districtName', label: 'District Name', render: (r) => r.districtName || r.name || r.district?.name || r.districtId || '' },
        ]}
        fields={[
          { name: 'districtName', label: 'District Name', type: 'text', required: true },
        ]}
        transformSubmit={async (fv, editing) => {
          const districtName = (fv.districtName ?? fv.name ?? '').trim()
          if (!districtName) {
            throw new Error('District name is required')
          }

          const payload = {
            districtName,
            active: true,
          }

          if (editing?.id) {
            payload.id = editing.id
          }

          return payload
        }}
        extraRowAction={{
          label: 'Add Taluka',
          icon: <FiMap />,
          onClick: (row) => navigate('/settings/talukas', { state: { districtId: row?.id, districtName: row?.name || row?.districtName || '' } }),
        }}
      />
  )
}
