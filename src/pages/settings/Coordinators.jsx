import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { coordinatorService, centerService, schoolService } from '../../api/services.js'
import { useAuth } from '../../context/AuthContext.jsx'

const loadCenterOptions = async () => {
  const list = await centerService.getAll()
  return list.map((c) => {
    const name = c?.name || c?.centerName || c?.title || c?.label || `#${c?.id}`
    const taluka = c?.taluka?.name || c?.talukaName
    const district = c?.district?.name || c?.districtName
    const suffix = [taluka, district].filter(Boolean).join(', ')
    const label = suffix ? `${name} (${suffix})` : name
    return { label, value: c?.id }
  })
}

const loadSchoolOptions = async () => {
  const list = await schoolService.getAll()
  return list.map((s) => ({
    label: s?.school_name || s?.schoolName || s?.name || s?.title || `#${s?.id}`,
    value: s?.id,
  }))
}

export default function Coordinators() {
  const { user } = useAuth()

  return (
    <CrudManager
        title="Coordinators"
        subtitle="Coordinators are assigned to a Center and can manage students under it."
        service={coordinatorService}
        addLabel="Add Coordinator"
        searchKeys={['fullName', 'full_name', 'name', 'email', 'mobile']}
        searchPlaceholder="Search coordinators…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'fullName', label: 'Name', render: (r) => r.fullName || r.full_name || r.name || r.coordinatorName || r.displayName || `${r.firstName || ''} ${r.lastName || ''}` || '' },
          { key: 'email', label: 'Email', render: (r) => r.email || r.user_email || '' },
          { key: 'mobile', label: 'Phone', render: (r) => r.mobile || r.phone || r.phoneNumber || r.contactNumber || r.mobileNumber || '' },
          { key: 'schoolName', label: 'School', render: (r) => r.schoolName || r.school_name || r.school?.school_name || r.school?.schoolName || r.school?.name || r.schoolId || r.school_id || '' },
          { key: 'centerName', label: 'Center', render: (r) => r.centerName || r.center_name || r.center?.center_name || r.center?.centerName || r.center?.name || r.centerId || r.center_id || '' },
        ]}
        fields={[
          { name: 'full_name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'mobile', label: 'Phone', type: 'tel', required: true },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'school_id', label: 'School', type: 'select', required: true, options: loadSchoolOptions },
          { name: 'center_id', label: 'Center', type: 'select', required: true, options: loadCenterOptions },
        ]}
        transformSubmit={async (fv, editing) => {
          const fullName = (fv.full_name ?? fv.fullName ?? '').trim()
          const userId = Number(fv.user_id ?? fv.userId ?? user?.userId ?? user?.id ?? user?.user?.id ?? 0)
          const schoolId = Number(fv.school_id ?? fv.schoolId ?? 0)
          const centerId = Number(fv.center_id ?? fv.centerId ?? 0)

          if (!userId) {
            throw new Error('User is required')
          }
          if (!schoolId) {
            throw new Error('School is required')
          }
          if (!centerId) {
            throw new Error('Center is required')
          }
          if (!fullName) {
            throw new Error('Full Name is required')
          }
          if (!fv.email || !fv.email.trim()) {
            throw new Error('Email is required')
          }
          if (!fv.mobile || !fv.mobile.trim()) {
            throw new Error('Phone is required')
          }

          const payload = {
            fullName,
            full_name: fullName,
            email: fv.email.trim(),
            mobile: fv.mobile.trim(),
            address: fv.address?.trim() || null,
            schoolId,
            school_id: schoolId,
            userId,
            user_id: userId,
            centerId,
            center_id: centerId,
          }

          if (editing?.id) {
            payload.id = editing.id
          }

          return payload
        }}
      />
  )
}
