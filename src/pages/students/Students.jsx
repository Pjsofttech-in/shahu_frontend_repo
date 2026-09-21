import React, { useEffect, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import {
  studentService,
  districtService,
  talukasByDistrict,
  centersByTaluka,
  coordinatorService,
  schoolService,
} from '../../api/services.js'

const classOptions = ['4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'None'].map((s) => ({
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

const examModeOptions = [
  { label: 'Online', value: 'ONLINE' },
  { label: 'Offline', value: 'OFFLINE' },
]

const toList = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.content)) return response.content
  if (Array.isArray(response?.data)) return response.data
  return []
}

const loadDistrictOptions = async () => {
  const list = toList(await districtService.getAll())
  return list.map((d) => ({
    label: d?.name || d?.districtName || d?.fullName || d?.title || d?.label || `#${d?.id}`,
    value: d?.id,
  }))
}

const loadTalukaOptions = async (fv) => {
  if (!fv.districtId) return []
  const list = toList(await talukasByDistrict(fv.districtId))
  return list.map((t) => ({
    label: t?.name || t?.talukaName || t?.title || t?.label || `#${t?.id}`,
    value: t?.id ?? t?.talukaId ?? t?.taluka_id,
  }))
}

const loadCenterOptions = async (fv) => {
  if (!fv.talukaId) return []
  const list = toList(await centersByTaluka(fv.talukaId))
  return list.map((c) => {
    const name = c?.name || c?.centerName || c?.title || c?.label || `#${c?.id}`
    const taluka = c?.taluka?.name || c?.talukaName
    const district = c?.district?.name || c?.districtName
    const suffix = [taluka, district].filter(Boolean).join(', ')
    const label = suffix ? `${name} (${suffix})` : name
    return { label, value: c?.id ?? c?.centerId ?? c?.center_id }
  })
}

const loadCoordinatorOptions = async () => {
  const list = toList(await coordinatorService.getAll())
  return list.map((c) => ({
    label: c?.coordinatorName || c?.name || c?.fullName || c?.displayName || `#${c?.id}`,
    value: c?.id,
  }))
}

const loadSchoolOptions = async () => {
  const list = toList(await schoolService.getAll())
  return list.map((school) => ({
    label: school?.schoolName || school?.school_name || school?.name || school?.school?.schoolName || school?.school?.school_name || `#${school?.id}`,
    value: school?.schoolName || school?.school_name || school?.name || school?.school?.schoolName || school?.school?.school_name || '',
  })).filter((option) => option.value)
}

const isValidIndianMobile = (value) => {
  return /^[6-9]\d{9}$/.test(String(value ?? '').trim())
}

const enumValue = (value) => String(value ?? '').trim().toUpperCase()
const dateValue = (value) => String(value ?? '').slice(0, 10)

const FilterSelect = ({ children, ...props }) => (
  <div className="filter-select-wrap">
    <select {...props}>{children}</select>
    <FiChevronDown className="filter-select-icon" aria-hidden="true" />
  </div>
)

export default function Students() {
  const [classFilter, setClassFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [talukaFilter, setTalukaFilter] = useState('')
  const [centerFilter, setCenterFilter] = useState('')
  const [coordinatorFilter, setCoordinatorFilter] = useState('')
  const [examModeFilter, setExamModeFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [districtOptions, setDistrictOptions] = useState([])
  const [talukaOptions, setTalukaOptions] = useState([])
  const [centerOptions, setCenterOptions] = useState([])
  const [coordinatorOptions, setCoordinatorOptions] = useState([])

  useEffect(() => {
    loadDistrictOptions().then(setDistrictOptions).catch(() => setDistrictOptions([]))
    loadCoordinatorOptions().then(setCoordinatorOptions).catch(() => setCoordinatorOptions([]))
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
      getRowId={(row) => row?.id ?? row?.studentId ?? row?.student_id}
      formColumns={4}
      searchKeys={['studentName', 'fatherName', 'lastName', 'school', 'schoolName', 'mobile', 'email']}
      searchPlaceholder="Search by name, school, mobile, email…"
      columns={[
        { key: 'id', label: 'ID', width: 60 },
        { key: 'studentName', label: 'Student Name', render: (r) => r.studentName || r.name || r.fullName || r.student?.name || '' },
        { key: 'fatherName', label: 'Father Name', render: (r) => r.fatherName || r.father_name || r.father?.name || r.student?.fatherName || '' },
        { key: 'lastName', label: 'Last Name', render: (r) => r.lastName || r.last_name || r.student?.lastName || '' },
        { key: 'school', label: 'School Name', render: (r) => r.school || r.schoolName || r.school_name || r.school?.schoolName || r.school?.name || '' },
        { key: 'studentClass', label: 'Class', render: (r) => r.studentClass || r.standard || r.std || '' },
        { key: 'examMode', label: 'Exam Mode', render: (r) => String(r.examMode || r.exam_mode || '').toUpperCase() || '—' },
        { key: 'mobile', label: 'Mobile', render: (r) => r.mobile || r.phone || r.phoneNumber || r.contact || '' },
        { key: 'paymentAmount', label: 'Payment Amount', render: (r) => r.paymentAmount ?? r.amount ?? r.payment_amount ?? r.payment?.paymentAmount ?? r.payment?.amount ?? '0' },
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
          render: (r) => r.paymentMode || r.payment_mode || r.paymentModeName || r.payment_mode_name || r.paymentType || r.payment_type || r.mode || r.payment?.paymentMode || r.payment?.payment_mode || r.payment?.paymentModeName || r.payment?.mode || r.payment?.paymentType || r.payment?.type || '—',
        },
        {
          key: 'paymentDone',
          label: 'Payment Status',
          render: (r) => {
            const paymentStatus = r.paymentStatus || r.payment_status || r.payment?.paymentStatus || r.payment?.payment_status || r.payment?.status || (r.paymentDone ?? r.isPaymentDone ? 'COMPLETED' : 'PENDING')
            const isCompleted = String(paymentStatus).toUpperCase() === 'COMPLETED' || !!(r.paymentDone ?? r.isPaymentDone)
            return <span className={`badge ${isCompleted ? 'badge-active' : 'badge-inactive'}`}>{isCompleted ? 'Completed' : 'Pending'}</span>
          },
        },
      ]}
      fields={[
        { name: 'studentName', label: 'Student Name', type: 'text', required: true, editAliases: ['name'] },
        { name: 'fatherName', label: "Father's Name", type: 'text', required: true, editValue: (row) => row.fatherName ?? row.father_name ?? row.father?.name },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true, editValue: (row) => row.lastName ?? row.last_name ?? row.student?.lastName },
        { name: 'schoolName', label: 'School Name', type: 'text', required: true, editAliases: ['school', 'school_name'] },
        { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true, maxLength: 10, inputMode: 'numeric', editAliases: ['phone', 'phoneNumber', 'contact'] },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional; defaults to mobile number' },
        { name: 'gender', label: 'Gender', type: 'select', required: true, editValue: (row) => enumValue(row.gender), options: [
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
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, editValue: (row) => dateValue(row.dateOfBirth ?? row.date_of_birth ?? row.dob) },
        { name: 'examMode', label: 'Exam Mode', type: 'select', required: true, editValue: (row) => enumValue(row.examMode ?? row.exam_mode), options: examModeOptions },
        { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions, editValue: (row) => row.districtId ?? row.district_id ?? row.district?.id },
        { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions, editValue: (row) => row.talukaId ?? row.taluka_id ?? row.taluka?.id },
        { name: 'centerId', label: 'Center', type: 'select', required: true, dependsOn: 'talukaId', hidden: (fv) => fv.examMode === 'ONLINE', options: loadCenterOptions, editValue: (row) => row.centerId ?? row.center_id ?? row.center?.id },
        { name: 'coordinatorId', label: 'Coordinator', type: 'select', required: true, hidden: (fv) => fv.examMode === 'ONLINE', options: loadCoordinatorOptions, editValue: (row) => row.coordinatorId ?? row.coordinator_id ?? row.coordinator?.id },
        { name: 'status', label: 'Status', type: 'select', default: 'ACTIVE', editValue: (row) => row.status || (row.active === false ? 'INACTIVE' : 'ACTIVE'), options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ] },
        { name: 'amount', label: 'Payment Amount', type: 'number', required: true, default: '0', placeholder: 'Enter amount', editAliases: ['paymentAmount', 'payment_amount'] },
        { name: 'paymentStatus', label: 'Payment Status', type: 'select', default: 'PENDING', editValue: (row) => enumValue(row.paymentStatus ?? row.payment_status), options: paymentStatusOptions },
        { name: 'paymentMode', label: 'Payment Mode', type: 'select', default: 'CASH', editValue: (row) => enumValue(row.paymentMode ?? row.payment_mode), options: paymentModeOptions },
      ]}
      transformSubmit={async (fv, editing) => {
        const districtId = fv.districtId !== undefined && fv.districtId !== null && fv.districtId !== '' ? Number(fv.districtId) : null
        const talukaId = fv.talukaId !== undefined && fv.talukaId !== null && fv.talukaId !== '' ? Number(fv.talukaId) : null
        const centerId = fv.centerId !== undefined && fv.centerId !== null && fv.centerId !== '' ? Number(fv.centerId) : null
        const coordinatorId = fv.coordinatorId !== undefined && fv.coordinatorId !== null && fv.coordinatorId !== '' ? Number(fv.coordinatorId) : null
        const examMode = String(fv.examMode || '').toUpperCase()
        const schoolName = String(fv.schoolName ?? '').trim()

        if (!fv.studentName || !fv.studentName.trim()) throw new Error('Student Name is required')
        if (!fv.fatherName || !fv.fatherName.trim()) throw new Error("Father's Name is required")
        if (!fv.lastName || !fv.lastName.trim()) throw new Error('Last Name is required')
        if (!schoolName) throw new Error('School Name is required')
        if (!fv.mobile || !isValidIndianMobile(fv.mobile)) throw new Error('Please enter a valid Indian mobile number')
        if (!fv.gender) throw new Error('Gender is required')
        if (!fv.studentClass) throw new Error('Class / Standard is required')
        if (!fv.medium) throw new Error('Medium is required')
        if (!fv.dateOfBirth) throw new Error('Date of Birth is required')
        if (!examMode || !['ONLINE', 'OFFLINE'].includes(examMode)) throw new Error('Exam Mode is required')
        if (!districtId) throw new Error('District is required')
        if (!talukaId) throw new Error('Taluka is required')
        if (examMode === 'OFFLINE' && !centerId) throw new Error('Center is required for offline exams')
        if (examMode === 'OFFLINE' && !coordinatorId) throw new Error('Coordinator is required for offline exams')

        if (fv.pincode && !/^\d{6}$/.test(String(fv.pincode).trim())) {
          throw new Error('Pincode must be a 6-digit number')
        }

        const amount = Number(fv.amount ?? editing?.paymentAmount ?? editing?.payment_amount ?? 0)
        if (!Number.isFinite(amount) || amount < 0) throw new Error('Payment Amount must be zero or greater')

        const paymentStatus = String(fv.paymentStatus || editing?.paymentStatus || editing?.payment_status || 'PENDING').toUpperCase()
        const paymentMode = String(fv.paymentMode || editing?.paymentMode || editing?.payment_mode || 'CASH').toUpperCase()

        const payload = {
          studentName: fv.studentName?.trim(),
          fatherName: fv.fatherName?.trim(),
          lastName: fv.lastName?.trim(),
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
          examMode,
          active: fv.status === 'ACTIVE',
          districtId,
          talukaId,
          centerId: examMode === 'OFFLINE' ? centerId : null,
          coordinatorId: examMode === 'OFFLINE' ? coordinatorId : null,
          amount,
          paymentMode,
          paymentStatus,
        }

        return payload
      }}
      extraToolbar={(
        <div className="student-filters">
          <div className="form-group">
            <label>District</label>
            <FilterSelect value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
              <option value="">District</option>
              {districtOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
          <div className="form-group">
            <label>Taluka</label>
            <FilterSelect value={talukaFilter} onChange={(e) => setTalukaFilter(e.target.value)} disabled={!districtFilter}>
              <option value="">Taluka</option>
              {talukaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
          <div className="form-group">
            <label>Center</label>
            <FilterSelect value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} disabled={!talukaFilter}>
              <option value="">Center</option>
              {centerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
          <div className="form-group">
            <label>Coordinator</label>
            <FilterSelect value={coordinatorFilter} onChange={(e) => setCoordinatorFilter(e.target.value)}>
              <option value="">Coordinator</option>
              {coordinatorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <FilterSelect value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
              <option value="">Payment Status</option>
              {paymentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
          <div className="form-group">
            <label>Exam Mode</label>
            <FilterSelect value={examModeFilter} onChange={(e) => setExamModeFilter(e.target.value)}>
              <option value="">Exam Mode</option>
              {examModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
          <div className="form-group">
            <label>Class</label>
            <FilterSelect value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">Class</option>
              {classOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FilterSelect>
          </div>
        </div>
      )}
      onResetFilters={() => {
        setClassFilter('')
        setDistrictFilter('')
        setTalukaFilter('')
        setCenterFilter('')
        setCoordinatorFilter('')
        setExamModeFilter('')
        setPaymentStatusFilter('')
      }}
      filterFn={(row) => (
        (!classFilter || (row.studentClass || row.standard || '') === classFilter) &&
        (!examModeFilter || String(row.examMode || row.exam_mode || '').toUpperCase() === examModeFilter) &&
        matchesFilter(row, districtFilter, ['districtId', 'district.id'], ['districtName', 'district.name', 'district.districtName']) &&
        matchesFilter(row, talukaFilter, ['talukaId', 'taluka_id', 'taluka.id', 'taluka.talukaId', 'taluka.taluka_id'], ['talukaName', 'taluka_name', 'taluka.name', 'taluka.talukaName', 'taluka.taluka_name']) &&
        matchesFilter(row, centerFilter, ['centerId', 'center_id', 'center.id', 'center.centerId', 'center.center_id'], ['centerName', 'center_name', 'center.name', 'center.centerName', 'center.center_name']) &&
        matchesFilter(row, coordinatorFilter, ['coordinatorId', 'coordinator.id'], ['coordinatorName', 'coordinator.name', 'coordinator.fullName']) &&
        (!paymentStatusFilter || String(getPaymentStatus(row)).toUpperCase() === paymentStatusFilter)
      )}
    />
  )
}
