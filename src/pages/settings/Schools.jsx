import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { schoolService } from '../../api/services.js'

export default function Schools() {
  return (
    <CrudManager
        title="Schools"
        subtitle="Manage schools and their principal/contact details."
        service={schoolService}
        addLabel="Add School"
        searchKeys={['school_name', 'schoolName', 'principal_name', 'principalName', 'email', 'mobile', 'district', 'taluka']}
        searchPlaceholder="Search schools…"
        columns={[
          { key: 'id', label: 'ID', width: 70 },
          { key: 'school_name', label: 'School Name', render: (r) => r.school_name || r.schoolName || r.name || r.school?.school_name || r.school?.schoolName || '' },
          { key: 'principal_name', label: 'Principal', render: (r) => r.principal_name || r.principalName || r.principal?.name || '' },
          { key: 'district', label: 'District', render: (r) => r.district || r.districtName || r?.district?.name || '' },
          { key: 'taluka', label: 'Taluka', render: (r) => r.taluka || r.talukaName || r?.taluka?.name || '' },
          { key: 'email', label: 'Email', render: (r) => r.email || r.contactEmail || '' },
          { key: 'mobile', label: 'Mobile', render: (r) => r.mobile || r.phone || r.contactNumber || '' },
        ]}
        fields={[
          { name: 'school_name', label: 'School Name', type: 'text', required: true },
          { name: 'principal_name', label: 'Principal Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'mobile', label: 'Mobile', type: 'tel' },
          { name: 'district', label: 'District', type: 'text', required: true },
          { name: 'taluka', label: 'Taluka', type: 'text', required: true },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'village', label: 'Village', type: 'text' },
          { name: 'state', label: 'State', type: 'text' },
          { name: 'pincode', label: 'Pincode', type: 'text' },
        ]}
        transformSubmit={async (fv, editing) => {
          const schoolName = (fv.school_name ?? fv.schoolName ?? '').trim()
          const principalName = (fv.principal_name ?? fv.principalName ?? '').trim()
          const district = (fv.district ?? '').trim()
          const taluka = (fv.taluka ?? '').trim()

          if (!schoolName) {
            throw new Error('School Name is required')
          }
          if (!principalName) {
            throw new Error('Principal Name is required')
          }
          if (!district) {
            throw new Error('District is required')
          }
          if (!taluka) {
            throw new Error('Taluka is required')
          }

          const payload = {
            school_name: schoolName,
            schoolName,
            principal_name: principalName,
            principalName,
            email: fv.email?.trim() || null,
            mobile: fv.mobile?.trim() || null,
            district,
            taluka,
            address: fv.address?.trim() || null,
            village: fv.village?.trim() || null,
            state: fv.state?.trim() || null,
            pincode: fv.pincode?.trim() || null,
            active: true,
          }

          if (editing?.id) {
            payload.id = editing.id
          }

          return payload
        }}
      />
  )
}
