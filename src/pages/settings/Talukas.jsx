import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { talukaService, districtService } from '../../api/services.js'

const loadDistrictOptions = async () => {
  const list = await districtService.getAll()
  return list.map((d) => {
    const name = d?.name || d?.districtName || d?.fullName || d?.title || d?.label || `#${d?.id}`
    const state = d?.state || d?.stateName || d?.state?.name
    const label = state ? `${name} (${state})` : name
    return { label, value: d?.id }
  })
}

export default function Talukas() {
  const navigate = useNavigate()

  return (
    <Layout title="Settings · Talukas">
      <CrudManager
        title="Talukas"
        subtitle="Each Taluka belongs to a District, and contains Centers."
        service={talukaService}
        addLabel="Add Taluka"
        searchKeys={['name']}
        searchPlaceholder="Search talukas…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'name', label: 'Taluka Name', render: (r) => r.name || r.talukaName || r.taluka?.name || r.talukaId || '' },
          { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.district?.fullName || r.district?.title || r.district?.label || r.districtId || '' },
        ]}
        fields={[
          { name: 'name', label: 'Taluka Name', type: 'text', required: true },
          { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
        ]}
        transformSubmit={async (fv, editing) => ({
          name: fv.name,
          talukaName: fv.name,
          taluka_name: fv.name,
          district: fv.districtId ? { id: Number(fv.districtId) } : undefined,
          districtId: fv.districtId ? Number(fv.districtId) : undefined,
          district_id: fv.districtId ? Number(fv.districtId) : undefined,
          id: editing ? fv.id : undefined,
        })}
        extraRowAction={{
          label: 'Add Center',
          icon: <FiHome />,
          onClick: () => navigate('/settings/centers'),
        }}
      />
    </Layout>
  )
}
