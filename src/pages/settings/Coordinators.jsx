import React from 'react'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import { coordinatorService, centerService } from '../../api/services.js'

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

export default function Coordinators() {
  return (
    <Layout title="Settings · Coordinators">
      <CrudManager
        title="Coordinators"
        subtitle="Coordinators are assigned to a Center and can manage students under it."
        service={coordinatorService}
        addLabel="Add Coordinator"
        searchKeys={['name', 'email', 'phone']}
        searchPlaceholder="Search coordinators…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'name', label: 'Name', render: (r) => r.name || r.fullName || r.coordinatorName || r.displayName || `${r.firstName || ''} ${r.lastName || ''}` || '' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone', render: (r) => r.phone || r.mobile || r.phoneNumber || r.contactNumber || r.mobileNumber || '' },
          { key: 'centerName', label: 'Center', render: (r) => r.centerName || r.center?.name || r.center?.centerName || r.center?.title || r.center?.label || r.centerId || '' },
        ]}
        fields={[
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true },
          { name: 'centerId', label: 'Center', type: 'select', required: true, options: loadCenterOptions },
        ]}
        transformSubmit={async (fv, editing) => ({
          name: fv.name,
          fullName: fv.name,
          email: fv.email,
          phone: fv.phone,
          center: fv.centerId ? { id: Number(fv.centerId) } : undefined,
          centerId: fv.centerId ? Number(fv.centerId) : undefined,
          center_id: fv.centerId ? Number(fv.centerId) : undefined,
          id: editing ? fv.id : undefined,
        })}
      />
    </Layout>
  )
}
