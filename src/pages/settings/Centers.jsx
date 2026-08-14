import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUserCheck } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { centerService, districtService, schoolService, talukasByDistrict } from '../../api/services.js'

const loadSchoolOptions = async () => {
  const list = await schoolService.getAll()
  return list.map((s) => ({
    label: s?.name || s?.schoolName || s?.title || s?.label || `#${s?.id}`,
    value: s?.id,
  }))
}

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
    <CrudManager
        title="Centers"
        subtitle="Each Center belongs to a Taluka, and has Coordinators assigned to it."
        service={centerService}
        addLabel="Add Center"
        searchKeys={['name', 'centerName']}
        searchPlaceholder="Search centers…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'name', label: 'Center Name', render: (r) => r.name || r.centerName || r.center?.name || r.title || r.label || '' },
          { key: 'centerCode', label: 'Code', render: (r) => r.centerCode || r.code || '' },
          { key: 'talukaName', label: 'Taluka', render: (r) => r.talukaName || r.taluka?.name || r.taluka?.talukaName || r.talukaId || '' },
          { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.districtId || '' },
          { key: 'address', label: 'Address' },
        ]}
        fields={[
          { name: 'schoolId', label: 'School', type: 'select', required: true, options: loadSchoolOptions },
          { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
          { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions },
          { name: 'name', label: 'Center Name', type: 'text', required: true },
          { name: 'centerCode', label: 'Center Code', type: 'text', required: true },
          { name: 'village', label: 'Village', type: 'text', required: true },
          { name: 'state', label: 'State', type: 'text', required: true },
          { name: 'pincode', label: 'Pincode', type: 'text', required: true },
          { name: 'address', label: 'Address', type: 'textarea' },
        ]}
        transformSubmit={async (fv, editing) => {
          const schoolId = fv.schoolId ? Number(fv.schoolId) : null
          const districtId = fv.districtId ? Number(fv.districtId) : null
          const talukaId = fv.talukaId ? Number(fv.talukaId) : null

          if (!schoolId) {
            throw new Error('School is required')
          }
          if (!districtId) {
            throw new Error('District is required')
          }
          if (!talukaId) {
            throw new Error('Taluka is required')
          }
          if (!fv.name || !fv.name.trim()) {
            throw new Error('Center Name is required')
          }
          if (!fv.centerCode || !fv.centerCode.trim()) {
            throw new Error('Center Code is required')
          }

          const village = (fv.village ?? '').trim() || 'NA'
          const state = (fv.state ?? '').trim() || 'Maharashtra'
          const pincode = (fv.pincode ?? '').trim() || '000000'

          const payload = {
            schoolId,
            districtId,
            talukaId,
            centerName: fv.name.trim(),
            centerCode: fv.centerCode.trim(),
            address: fv.address?.trim() || null,
            village,
            state,
            pincode,
            active: true,
          }

          if (editing?.id) {
            payload.id = editing.id
          }

          return payload
        }}
        extraRowAction={{
          label: 'Add Coordinator',
          icon: <FiUserCheck />,
          onClick: () => navigate('/settings/coordinators'),
        }}
      />
  )
}
