import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { talukaService, districtService } from '../../api/services.js'

const loadDistrictOptions = async () => {
  const list = await districtService.getAll()

  return list.map((d) => ({
    label:
      d?.districtName ||
      d?.name ||
      d?.fullName ||
      d?.title ||
      d?.label ||
      `#${d?.id}`,
    value: String(d?.id),
  }))
}

export default function Talukas() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedDistrictId = location.state?.districtId

  useEffect(() => {
    if (!location.state?.districtId) return
    const openCreate = document.querySelector('[data-open-create]')
    if (openCreate) {
      openCreate.click()
    }
  }, [location.state])

  const initialFormValues = {
    districtId:
      location.state?.districtId !== undefined && location.state?.districtId !== null && location.state?.districtId !== ''
        ? String(location.state.districtId)
        : '',
  }

  return (
    <CrudManager
        title="Talukas"
        subtitle="Each Taluka belongs to a District, and contains Centers."
        service={talukaService}
        addLabel="Add Taluka"
        initialFormValues={initialFormValues}
        showEditAction={false}
        searchKeys={['talukaName']}
        searchPlaceholder="Search talukas…"
        filterFn={(row) => {
          if (selectedDistrictId === undefined || selectedDistrictId === null || selectedDistrictId === '') return true

          const rowDistrictId = row?.districtId ?? row?.district_id ?? row?.district?.id ?? row?.district?.districtId
          return String(rowDistrictId) === String(selectedDistrictId)
        }}
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'talukaName', label: 'Taluka Name', render: (r) => r.talukaName || r.name || r.taluka?.name || r.talukaId || '' },
          { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.district?.fullName || r.district?.title || r.district?.label || r.districtId || '' },
        ]}
        fields={[
          { name: 'talukaName', label: 'Taluka Name', type: 'text', required: true },
          { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
        ]}
        transformSubmit={async (fv, editing) => {
          const rawDistrictId =
            fv?.districtId ??
            fv?.district_id ??
            location.state?.districtId ??
            initialFormValues?.districtId

          const districtId =
            typeof rawDistrictId === 'object'
              ? Number(rawDistrictId?.value)
              : Number(rawDistrictId)

          const talukaName = String(
            fv?.talukaName ?? fv?.name ?? ''
          ).trim()

          if (!Number.isInteger(districtId) || districtId <= 0) {
            throw new Error('Please select a valid District')
          }

          if (!talukaName) {
            throw new Error('Taluka name is required')
          }

          const payload = {
            talukaName,
            districtId,
            active: true,
          }

          if (editing?.id) {
            payload.id = editing.id
          }

          console.log('Taluka create payload:', payload)

          return payload
        }}
        extraRowAction={{
          label: 'Add Center',
          icon: <FiHome />,
          onClick: (row) => navigate('/settings/centers', { state: { districtId: row?.districtId || row?.district?.id, talukaId: row?.id, talukaName: row?.name || row?.talukaName || '' } }),
        }}
      />

  )
}
