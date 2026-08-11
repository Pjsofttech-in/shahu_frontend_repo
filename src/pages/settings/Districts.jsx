import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMap } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { districtService } from '../../api/services.js'

export default function Districts() {
  const navigate = useNavigate()

  return (
    <Layout title="Settings · Districts">
      <CrudManager
        title="Districts"
        subtitle="Top level of the location hierarchy — Districts contain Talukas."
        service={districtService}
        addLabel="Add District"
        searchKeys={['name']}
        searchPlaceholder="Search districts…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'name', label: 'District Name', render: (r) => r.name || r.districtName || r.district?.name || r.districtId || '' },
        ]}
        fields={[
          { name: 'name', label: 'District Name', type: 'text', required: true },
        ]}
        transformSubmit={async (fv, editing) => ({
          // send minimal name + id when editing
          name: fv.name,
          districtName: fv.name,
          district_name: fv.name,
          id: editing ? fv.id : undefined,
        })}
        extraRowAction={{
          label: 'Add Taluka',
          icon: <FiMap />,
          onClick: () => navigate('/settings/talukas'),
        }}
      />
    </Layout>
  )
}
