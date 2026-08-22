import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiUserCheck } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { centerService, districtService, talukasByDistrict } from '../../api/services.js'

const loadDistrictOptions = async () => {
  const list = await districtService.getAll()
  return list.map((d) => ({
    label: d?.name || d?.districtName || d?.fullName || d?.title || d?.label || `#${d?.id}`,
    value: String(d?.id),
  }))
}

const loadTalukaOptions = async (formValues) => {
  if (!formValues.districtId) return []
  const list = await talukasByDistrict(formValues.districtId)
  return list.map((t) => {
    const name = t?.name || t?.talukaName || t?.title || t?.label || `#${t?.id}`
    const district = t?.district?.name || t?.districtName
    const label = district ? `${name} (${district})` : name
    return { label, value: String(t?.id) }
  })
}

export default function Centers() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.state?.talukaId) return
    const openCreate = document.querySelector('[data-open-create]')
    if (openCreate) {
      openCreate.click()
    }
  }, [location.state])

  const initialFormValues = {
    districtId: location.state?.districtId ? String(location.state.districtId) : '',
    talukaId: location.state?.talukaId ? String(location.state.talukaId) : '',
  }

  return (
    <CrudManager
        title="Centers"
        subtitle="Each Center belongs to a Taluka, and has Coordinators assigned to it."
        service={centerService}
        addLabel="Add Center"
        initialFormValues={initialFormValues}
        showEditAction={false}
        searchKeys={['centerName', 'centerCode']}
        searchPlaceholder="Search centers…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'centerName', label: 'Center Name', render: (r) => r.centerName || r.name || r.center?.name || r.title || r.label || '' },
          { key: 'centerCode', label: 'Code', render: (r) => r.centerCode || r.code || '' },
          { key: 'talukaName', label: 'Taluka', render: (r) => r.talukaName || r.taluka?.name || r.taluka?.talukaName || r.talukaId || '' },
          { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.districtId || '' },
        ]}
        fields={[
          { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
          { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions },
          { name: 'pincode', label: 'Pincode', type: 'text', required: false },
          { name: 'centerName', label: 'Exam Center', type: 'text', required: true },
          { name: 'centerCode', label: 'Center Code', type: 'text', required: true },
          { name: 'address', label: 'Address', type: 'text', required: true },
          { name: 'village', label: 'Village', type: 'text', required: false },
          { name: 'state', label: 'State', type: 'text', default: 'Maharashtra', required: false },
        ]}
        transformSubmit={async (fv, editing) => {
          const districtId = Number(fv.districtId ?? fv.district_id ?? location.state?.districtId ?? 0)
          const talukaId = Number(fv.talukaId ?? fv.taluka_id ?? location.state?.talukaId ?? 0)
          const centerName = String(fv.centerName ?? fv.name ?? '').trim()
          const centerCode = String(fv.centerCode ?? '').trim()
          const address = String(fv.address ?? '').trim()
          const village = String(fv.village ?? '').trim()
          const state = String(fv.state ?? '').trim()
          const pincode = String(fv.pincode ?? '').trim()

          if (!Number.isInteger(Number(fv.districtId)) || Number(fv.districtId) <= 0) {
            throw new Error('District is required')
          }

          if (!Number.isInteger(Number(fv.talukaId)) || Number(fv.talukaId) <= 0) {
            throw new Error('Taluka is required')
          }

          if (!centerName) {
            throw new Error('Center name is required')
          }

          if (!centerCode) {
            throw new Error('Center code is required')
          }

          if (!address) {
            throw new Error('Address is required')
          }

          const payload = {
            centerName,
            centerCode,
            address,
            active: true,
            districtId: Number(fv.districtId),
            talukaId: Number(fv.talukaId),
          }

          if (village) payload.village = village
          payload.state = state || 'Maharashtra'
          if (pincode) payload.pincode = pincode

          if (editing?.id) {
            payload.id = editing.id
          }

          return payload
        }}
        extraRowAction={{
          label: 'Add Coordinator',
          icon: <FiUserCheck />,
          onClick: (row) => navigate('/settings/coordinators', { state: { districtId: row?.districtId || row?.district?.id, talukaId: row?.talukaId || row?.taluka?.id, centerId: row?.id, centerName: row?.name || row?.centerName || '' } }),
        }}
      />
  )
}
