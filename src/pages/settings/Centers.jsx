import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUserCheck } from 'react-icons/fi'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { centerService, districtService, talukasByDistrict } from '../../api/services.js'

const loadDistrictOptions = async () => {
  const list = await districtService.getAll()
  return list.map((d) => ({
    label: d?.name || d?.districtName || d?.fullName || d?.title || d?.label || `#${d?.id}`,
    value: d?.id,
  }))
}

const loadTalukaOptions = async (formValues) => {
  if (!formValues.districtId) return []
  const list = await talukasByDistrict(formValues.districtId)
  return list.map((t) => {
    const name = t?.name || t?.talukaName || t?.title || t?.label || `#${t?.id}`
    const district = t?.district?.name || t?.districtName
    const label = district ? `${name} (${district})` : name
    return { label, value: t?.id }
  })
}

export default function Centers() {
  const navigate = useNavigate()

  return (
    <Layout title="Settings · Centers">
      <CrudManager
        title="Centers"
        subtitle="Each Center belongs to a Taluka, and has Coordinators assigned to it."
        service={centerService}
        addLabel="Add Center"
        searchKeys={['name']}
        searchPlaceholder="Search centers…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'name', label: 'Center Name', render: (r) => r.name || r.centerName || r.center?.name || r.title || r.label || '' },
          { key: 'talukaName', label: 'Taluka', render: (r) => r.talukaName || r.taluka?.name || r.taluka?.talukaName || r.taluka?.fullName || r.taluka?.title || r.taluka?.label || r.talukaId || '' },
          { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.district?.fullName || r.district?.title || r.district?.label || r.districtId || '' },
          { key: 'address', label: 'Address' },
          { key: 'phone', label: 'Phone', render: (r) => r.phone || r.mobile || r.contactNumber || r.phoneNumber || r.mobileNumber || '' },
        ]}
        fields={[
          { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
          { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions },
          { name: 'name', label: 'Center Name', type: 'text', required: true },
          { name: 'address', label: 'Address', type: 'textarea' },
        ]}
        transformSubmit={async (fv, editing) => ({
          name: fv.name,
          centerName: fv.name,
          center_name: fv.name,
          address: fv.address,
          district: fv.districtId ? { id: Number(fv.districtId) } : undefined,
          taluka: fv.talukaId ? { id: Number(fv.talukaId) } : undefined,
          districtId: fv.districtId ? Number(fv.districtId) : undefined,
          talukaId: fv.talukaId ? Number(fv.talukaId) : undefined,
          district_id: fv.districtId ? Number(fv.districtId) : undefined,
          taluka_id: fv.talukaId ? Number(fv.talukaId) : undefined,
          id: editing ? fv.id : undefined,
        })}
        extraRowAction={{
          label: 'Add Coordinator',
          icon: <FiUserCheck />,
          onClick: () => navigate('/settings/coordinators'),
        }}
      />
    </Layout>
  )
}
