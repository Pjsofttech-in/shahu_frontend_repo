import React, { useState } from 'react'
import Layout from '../../components/layout/Layout.jsx'
import CrudManager from '../../components/common/CrudManager.jsx'
import {
  studentService, districtService, talukasByDistrict, centersByTaluka, coordinatorService, uploadFile,
} from '../../api/services.js'

const loadDistrictOptions = async () => {
  const list = await districtService.getAll()
  return list.map((d) => ({
    label: d?.name || d?.districtName || d?.fullName || d?.title || d?.label || `#${d?.id}`,
    value: d?.id,
  }))
}
const loadTalukaOptions = async (fv) => {
  if (!fv.districtId) return []
  const list = await talukasByDistrict(fv.districtId)
  return list.map((t) => ({
    label: t?.name || t?.talukaName || t?.title || t?.label || `#${t?.id}`,
    value: t?.id,
  }))
}
const loadCenterOptions = async (fv) => {
  if (!fv.talukaId) return []
  const list = await centersByTaluka(fv.talukaId)
  return list.map((c) => {
    const name = c?.name || c?.centerName || c?.title || c?.label || `#${c?.id}`
    const taluka = c?.taluka?.name || c?.talukaName
    const district = c?.district?.name || c?.districtName
    const suffix = [taluka, district].filter(Boolean).join(', ')
    const label = suffix ? `${name} (${suffix})` : name
    return { label, value: c?.id }
  })
}
const loadCoordinatorOptions = async () => {
  const list = await coordinatorService.getAll()
  return list.map((c) => ({
    label: c?.name || c?.fullName || c?.displayName || c?.coordinatorName || `#${c?.id}`,
    value: c?.id,
  }))
}

export default function Students() {
  // NOTE: field list below covers a typical school registration form
  // (name, DOB, gender, class, guardian info, contact, address, photo, location hierarchy).
  // Adjust names/labels to exactly match your registration form once confirmed.
  const [classFilter, setClassFilter] = useState('')

  return (
    <Layout title="Students">
      <CrudManager
        title="Students"
        subtitle="All students registered under Sankalp centers. Add students manually or review registrations."
        service={studentService}
        addLabel="Add Student"
        searchKeys={['name', 'rollNumber', 'mobile', 'email']}
        searchPlaceholder="Search by name, roll no, mobile…"
        columns={[
          { key: 'id', label: 'ID', width: 60 },
          { key: 'name', label: 'Student Name', render: (r) => r.name || r.fullName || r.studentName || `${r.firstName || ''} ${r.lastName || ''}` || '' },
          { key: 'standard', label: 'Class', render: (r) => r.standard || r.std || r.class || r.grade || r.className || '' },
          { key: 'schoolName', label: 'School' },
          { key: 'mobile', label: 'Mobile', render: (r) => r.mobile || r.phone || r.phoneNumber || r.contact || r.mobileNumber || '' },
          { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.district?.fullName || r.districtId || '' },
          { key: 'talukaName', label: 'Taluka', render: (r) => r.talukaName || r.taluka?.name || r.taluka?.talukaName || r.taluka?.fullName || r.talukaId || '' },
          { key: 'centerName', label: 'Center', render: (r) => r.centerName || r.center?.name || r.center?.centerName || r.centerId },
          {
            key: 'status', label: 'Status',
            render: (r) => <span className={`badge ${r.status === 'INACTIVE' ? 'badge-inactive' : 'badge-active'}`}>{r.status || 'ACTIVE'}</span>,
          },
        ]}
        fields={[
          { name: 'name', label: 'Student Full Name', type: 'text', required: true },
          { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
          { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
            { label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'OTHER' },
          ] },
          { name: 'standard', label: 'Class / Standard', type: 'select', required: true, options: [
            '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th',
          ].map((s) => ({ label: s, value: s })) },
          { name: 'schoolName', label: 'School Name', type: 'text', required: true },
          { name: 'fatherName', label: "Father's Name", type: 'text', required: true },
          { name: 'motherName', label: "Mother's Name", type: 'text' },
          { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
          { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions },
          { name: 'centerId', label: 'Center', type: 'select', required: true, dependsOn: 'talukaId', options: loadCenterOptions },
          { name: 'coordinatorId', label: 'Coordinator', type: 'select', options: loadCoordinatorOptions },
          { name: 'photo', label: 'Student Photo', type: 'file', accept: 'image/*' },
          { name: 'status', label: 'Status', type: 'select', default: 'ACTIVE', options: [
            { label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' },
          ] },
        ]}
        transformSubmit={async (fv, editing) => {
          // Map flat select ids into nested objects expected by backend (JPA entity children)
          const payload = {
            name: fv.name,
            dob: fv.dob,
            gender: fv.gender,
            standard: fv.standard,
            schoolName: fv.schoolName,
            fatherName: fv.fatherName,
            motherName: fv.motherName,
            mobile: fv.mobile,
            email: fv.email,
            address: fv.address,
            status: fv.status || 'ACTIVE',
            district: fv.districtId ? { id: Number(fv.districtId) } : undefined,
            taluka: fv.talukaId ? { id: Number(fv.talukaId) } : undefined,
            center: fv.centerId ? { id: Number(fv.centerId) } : undefined,
            coordinator: fv.coordinatorId ? { id: Number(fv.coordinatorId) } : undefined,
            // also include primitive/DB-style fields to satisfy controllers that expect ids or snake_case
            districtId: fv.districtId ? Number(fv.districtId) : undefined,
            talukaId: fv.talukaId ? Number(fv.talukaId) : undefined,
            centerId: fv.centerId ? Number(fv.centerId) : undefined,
            coordinatorId: fv.coordinatorId ? Number(fv.coordinatorId) : undefined,
            district_id: fv.districtId ? Number(fv.districtId) : undefined,
            taluka_id: fv.talukaId ? Number(fv.talukaId) : undefined,
            center_id: fv.centerId ? Number(fv.centerId) : undefined,
            coordinator_id: fv.coordinatorId ? Number(fv.coordinatorId) : undefined,
          }
          // Handle file upload for photo (development: replace file with uploaded URL)
          if (fv.photo && fv.photo instanceof File) {
            try {
              const res = await uploadFile(fv.photo, 'students')
              // backend might expect 'photoUrl' or 'photo' — send both fallback
              payload.photo = res.url || res.data?.url || res.fileUrl || res.photoUrl || null
            } catch (e) {
              // ignore upload error in submit mapping, allow backend to handle missing photo
              console.warn('Photo upload failed', e)
            }
          } else if (fv.photo && typeof fv.photo === 'string') {
            payload.photo = fv.photo
          }
          // If editing, ensure id is included
          if (editing && fv.id) payload.id = fv.id
          return payload
        }}
        extraToolbar={(
          <div className="form-group">
            <label>Filter by Class</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        filterFn={classFilter ? (r) => r.standard === classFilter : undefined}
      />
    </Layout>
  )
}
