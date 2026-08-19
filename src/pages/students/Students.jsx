import React, { useEffect, useState } from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import {
  studentService,
  districtService,
  talukasByDistrict,
  centersByTaluka,
  coordinatorService,
  userService,
} from '../../api/services.js'

const classOptions = ['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((s) => ({
  label: s,
  value: s,
}))

const paymentModeOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Online', value: 'ONLINE' },
]

const paymentStatusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
]

const loadUserOptions = async () => {
  const list = await userService.getAll()
  return list.map((u) => ({
    label: u?.fullName || u?.full_name || u?.name || u?.email || `User #${u?.id}`,
    value: u?.id,
  }))
}

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
    label: c?.coordinatorName || c?.name || c?.fullName || c?.displayName || `#${c?.id}`,
    value: c?.id,
  }))
}

const isValidIndianMobile = (value) => {
  const digits = String(value ?? '').replace(/\s+/g, '').replace(/\+/g, '')
  return /^9\d{9}$|^8\d{9}$|^7\d{9}$|^6\d{9}$/.test(digits)
}

export default function Students() {
  const [classFilter, setClassFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [talukaFilter, setTalukaFilter] = useState('')
  const [centerFilter, setCenterFilter] = useState('')
  const [coordinatorFilter, setCoordinatorFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [districtOptions, setDistrictOptions] = useState([])
  const [talukaOptions, setTalukaOptions] = useState([])
  const [centerOptions, setCenterOptions] = useState([])
  const [coordinatorOptions, setCoordinatorOptions] = useState([])

  useEffect(() => {
    Promise.all([loadDistrictOptions(), loadCoordinatorOptions()])
      .then(([districts, coordinators]) => {
        setDistrictOptions(districts)
        setCoordinatorOptions(coordinators)
      })
      .catch(() => {
        setDistrictOptions([])
        setCoordinatorOptions([])
      })
  }, [])

  useEffect(() => {
    setTalukaFilter('')
    setCenterFilter('')
    if (!districtFilter) {
      setTalukaOptions([])
      return
    }

    loadTalukaOptions({ districtId: districtFilter }).then(setTalukaOptions).catch(() => setTalukaOptions([]))
  }, [districtFilter])

  useEffect(() => {
    setCenterFilter('')
    if (!talukaFilter) {
      setCenterOptions([])
      return
    }

    loadCenterOptions({ talukaId: talukaFilter }).then(setCenterOptions).catch(() => setCenterOptions([]))
  }, [talukaFilter])

  const matchesFilter = (row, filter, idKeys, nameKeys) => {
    if (!filter) return true
    const values = [...idKeys, ...nameKeys].flatMap((key) => {
      const value = key.split('.').reduce((current, part) => current?.[part], row)
      return value === undefined || value === null ? [] : [String(value)]
    })
    return values.includes(String(filter))
  }

  const getPaymentStatus = (row) => row.paymentStatus || row.payment_status || (row.paymentDone ?? row.isPaymentDone ? 'COMPLETED' : 'PENDING')

  return (
    <CrudManager
      title="Students"
      subtitle="All students registered under Sankalp centers. Add students manually or review registrations."
      service={studentService}
      addLabel="Add Student"
      searchKeys={['studentName', 'schoolName', 'mobile', 'email']}
      searchPlaceholder="Search by name, school, mobile, email…"
      columns={[
        { key: 'id', label: 'ID', width: 60 },
        { key: 'studentName', label: 'Student Name', render: (r) => r.studentName || r.name || r.fullName || r.student?.name || '' },
        { key: 'schoolName', label: 'School Name', render: (r) => r.schoolName || r.school?.schoolName || r.school?.name || r.school_name || r.schoolName || '' },
        { key: 'studentClass', label: 'Class', render: (r) => r.studentClass || r.standard || r.std || '' },
        { key: 'mobile', label: 'Mobile', render: (r) => r.mobile || r.phone || r.phoneNumber || r.contact || '' },
        { key: 'districtName', label: 'District', render: (r) => r.districtName || r.district?.name || r.district?.districtName || r.districtId || '' },
        { key: 'talukaName', label: 'Taluka', render: (r) => r.talukaName || r.taluka?.name || r.taluka?.talukaName || r.talukaId || '' },
        { key: 'centerName', label: 'Center', render: (r) => r.centerName || r.center?.name || r.center?.centerName || r.centerId || '' },
        { key: 'coordinatorName', label: 'Coordinator', render: (r) => r.coordinatorName || r.coordinator?.name || r.coordinator?.fullName || r.coordinatorId || '' },
        {
          key: 'active',
          label: 'Status',
          render: (r) => {
            const isActive = r.active === true || r.status === 'ACTIVE' || r.status === 'active'
            return <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>{isActive ? 'Active' : 'Inactive'}</span>
          },
        },
        {
          key: 'paymentMode',
          label: 'Payment Mode',
          render: (r) => r.paymentMode || r.payment_mode || '—',
        },
        {
          key: 'paymentDone',
          label: 'Payment Status',
          render: (r) => {
            const paymentStatus = r.paymentStatus || r.payment_status || (r.paymentDone ?? r.isPaymentDone ? 'COMPLETED' : 'PENDING')
            const isCompleted = String(paymentStatus).toUpperCase() === 'COMPLETED' || !!(r.paymentDone ?? r.isPaymentDone)
            return <span className={`badge ${isCompleted ? 'badge-active' : 'badge-inactive'}`}>{isCompleted ? 'Completed' : 'Pending'}</span>
          },
        },
      ]}
      fields={[
        { name: 'studentName', label: 'Student Full Name', type: 'text', required: true },
        { name: 'schoolName', label: 'School Name', type: 'text', required: true },
        { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional; defaults to mobile number' },
        { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
          { label: 'Male', value: 'MALE' },
          { label: 'Female', value: 'FEMALE' },
          { label: 'Other', value: 'OTHER' },
        ] },
        { name: 'studentClass', label: 'Class / Standard', type: 'select', required: true, options: classOptions },
        { name: 'medium', label: 'Medium', type: 'select', required: true, options: [
          { label: 'English', value: 'English' },
          { label: 'Marathi', value: 'Marathi' },
          { label: 'Hindi', value: 'Hindi' },
        ] },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'village', label: 'Village', type: 'text' },
        { name: 'state', label: 'State', type: 'text', default: 'Maharashtra' },
        { name: 'pincode', label: 'Pincode', type: 'text' },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'userId', label: 'User', type: 'select', required: true, options: loadUserOptions },
        { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
        { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions },
        { name: 'centerId', label: 'Center', type: 'select', required: true, dependsOn: 'talukaId', options: loadCenterOptions },
        { name: 'coordinatorId', label: 'Coordinator', type: 'select', required: true, options: loadCoordinatorOptions },
        { name: 'status', label: 'Status', type: 'select', default: 'ACTIVE', options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ] },
        { name: 'paymentMode', label: 'Payment Mode', type: 'select', default: 'CASH', options: paymentModeOptions },
        { name: 'paymentStatus', label: 'Payment Status', type: 'select', default: 'PENDING', options: paymentStatusOptions },
      ]}
      transformSubmit={async (fv, editing) => {
        const userId = fv.userId !== undefined && fv.userId !== null && fv.userId !== '' ? Number(fv.userId) : null
        const districtId = fv.districtId !== undefined && fv.districtId !== null && fv.districtId !== '' ? Number(fv.districtId) : null
        const talukaId = fv.talukaId !== undefined && fv.talukaId !== null && fv.talukaId !== '' ? Number(fv.talukaId) : null
        const centerId = fv.centerId !== undefined && fv.centerId !== null && fv.centerId !== '' ? Number(fv.centerId) : null
        const coordinatorId = fv.coordinatorId !== undefined && fv.coordinatorId !== null && fv.coordinatorId !== '' ? Number(fv.coordinatorId) : null
        const schoolName = String(fv.schoolName ?? '').trim()

        if (!fv.studentName || !fv.studentName.trim()) throw new Error('Student Full Name is required')
        if (!schoolName) throw new Error('School Name is required')
        if (!fv.mobile || !isValidIndianMobile(fv.mobile)) throw new Error('Please enter a valid Indian mobile number')
        if (!fv.gender) throw new Error('Gender is required')
        if (!fv.studentClass) throw new Error('Class / Standard is required')
        if (!fv.medium) throw new Error('Medium is required')
        if (!fv.dateOfBirth) throw new Error('Date of Birth is required')
        if (!userId) throw new Error('User is required')
        if (!districtId) throw new Error('District is required')
        if (!talukaId) throw new Error('Taluka is required')
        if (!centerId) throw new Error('Center is required')
        if (!coordinatorId) throw new Error('Coordinator is required')

        if (fv.pincode && !/^\d{6}$/.test(String(fv.pincode).trim())) {
          throw new Error('Pincode must be a 6-digit number')
        }

        const paymentStatus = (fv.paymentStatus || 'PENDING').toUpperCase()
        const paymentMode = (fv.paymentMode || 'CASH').toUpperCase()

        const payload = {
          studentName: fv.studentName?.trim(),
          schoolName,
          mobile: fv.mobile?.trim(),
          email: fv.email?.trim() || null,
          password: (fv.password ?? '').trim() || fv.mobile?.trim(),
          gender: fv.gender,
          studentClass: fv.studentClass,
          medium: fv.medium,
          address: fv.address?.trim() || null,
          village: fv.village?.trim() || null,
          state: fv.state?.trim() || 'Maharashtra',
          pincode: fv.pincode?.trim() || null,
          dateOfBirth: fv.dateOfBirth || null,
          active: fv.status === 'ACTIVE',
          userId,
          districtId,
          talukaId,
          centerId,
          coordinatorId,
          paymentMode,
          paymentStatus,
          paymentDone: paymentStatus === 'COMPLETED',
        }

        if (editing?.userId !== undefined && editing?.userId !== null && editing.userId !== '') {
          payload.userId = Number(editing.userId)
        } else if (fv.userId !== undefined && fv.userId !== null && fv.userId !== '') {
          payload.userId = Number(fv.userId)
        }

        if (editing?.id) {
          payload.id = editing.id
        }

        return payload
      }}
      extraToolbar={(
        <>
          <div className="form-group">
            <label>District</label>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
              <option value="">All Districts</option>
              {districtOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Taluka</label>
            <select value={talukaFilter} onChange={(e) => setTalukaFilter(e.target.value)} disabled={!districtFilter}>
              <option value="">All Talukas</option>
              {talukaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Center</label>
            <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} disabled={!talukaFilter}>
              <option value="">All Centers</option>
              {centerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Coordinator</label>
            <select value={coordinatorFilter} onChange={(e) => setCoordinatorFilter(e.target.value)}>
              <option value="">All Coordinators</option>
              {coordinatorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
              <option value="">All Payment Statuses</option>
              {paymentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Class</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {classOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </>
      )}
      filterFn={(row) => (
        (!classFilter || (row.studentClass || row.standard || '') === classFilter) &&
        matchesFilter(row, districtFilter, ['districtId', 'district.id'], ['districtName', 'district.name', 'district.districtName']) &&
        matchesFilter(row, talukaFilter, ['talukaId', 'taluka.id'], ['talukaName', 'taluka.name', 'taluka.talukaName']) &&
        matchesFilter(row, centerFilter, ['centerId', 'center.id'], ['centerName', 'center.name', 'center.centerName']) &&
        matchesFilter(row, coordinatorFilter, ['coordinatorId', 'coordinator.id'], ['coordinatorName', 'coordinator.name', 'coordinator.fullName']) &&
        (!paymentStatusFilter || String(getPaymentStatus(row)).toUpperCase() === paymentStatusFilter)
      )}
    />
  )
}
