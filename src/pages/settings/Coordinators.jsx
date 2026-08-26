import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import CrudManager from '../../components/common/CrudManager.jsx'
import { coordinatorService, centerService, districtService, talukasByDistrict } from '../../api/services.js'

let cachedAssignedCenterIds = new Set()

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
  return list.map((t) => ({
    label: t?.name || t?.talukaName || t?.title || t?.label || `#${t?.id}`,
    value: String(t?.id),
  }))
}

const loadCenterOptions = async (formValues, editing) => {
  if (!formValues.talukaId) return []
  const list = await centerService.getAll()
  return list
    .filter((c) => String(c?.talukaId ?? c?.taluka?.id ?? '') === String(formValues.talukaId))
    .filter((c) => {
      const cId = Number(c?.id)
      // For NEW coordinator, exclude already-assigned centers
      if (!editing) {
        return !cachedAssignedCenterIds.has(cId)
      }
      // For EDIT, allow the currently-assigned center + unassigned centers
      return !cachedAssignedCenterIds.has(cId) || cId === Number(editing?.centerId)
    })
    .map((c) => {
      const name = c?.name || c?.centerName || c?.title || c?.label || `#${c?.id}`
      const district = c?.district?.name || c?.districtName
      const taluka = c?.taluka?.name || c?.talukaName
      const suffix = [taluka, district].filter(Boolean).join(', ')
      const label = suffix ? `${name} (${suffix})` : name
      return { label, value: String(c?.id) }
    })
}

export default function Coordinators() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  // Load assigned center IDs on mount
  useEffect(() => {
    const fetchAssignedCenters = async () => {
      try {
        const coordinators = await coordinatorService.getAll()
        const assignedIds = new Set(
          coordinators
            .map((c) => Number(c?.centerId))
            .filter((id) => Number.isInteger(id) && id > 0)
        )
        cachedAssignedCenterIds = assignedIds
      } catch (err) {
        console.error('Failed to load coordinators for assigned centers:', err)
        cachedAssignedCenterIds = new Set()
      } finally {
        setLoading(false)
      }
    }
    fetchAssignedCenters()
  }, [])

  useEffect(() => {
    if (!location.state?.centerId) return
    const openCreate = document.querySelector('[data-open-create]')
    if (openCreate) {
      openCreate.click()
    }
  }, [location.state])

  const initialFormValues = {
    districtId: location.state?.districtId ? String(location.state.districtId) : '',
    talukaId: location.state?.talukaId ? String(location.state.talukaId) : '',
    centerId: location.state?.centerId ? String(location.state.centerId) : '',
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>
  }

  return (
    <CrudManager
      title="Coordinators"
      subtitle="Coordinators are assigned to a Center and can manage students under it."
      service={coordinatorService}
      addLabel="Add Coordinator"
      initialFormValues={initialFormValues}
      showEditAction={false}
      uniqueFields={['email']}
      searchKeys={['fullName', 'full_name', 'name', 'email', 'mobile']}
      searchPlaceholder="Search coordinators…"
      columns={[
        { key: 'id', label: 'ID', width: 70 },
        { key: 'fullName', label: 'Name', render: (r) => r.fullName || r.full_name || r.name || r.coordinatorName || r.displayName || `${r.firstName || ''} ${r.lastName || ''}` || '' },
        { key: 'email', label: 'Email', render: (r) => r.email || r.user_email || '' },
        { key: 'mobile', label: 'Phone', render: (r) => r.mobile || r.phone || r.phoneNumber || r.contactNumber || r.mobileNumber || '' },
        { key: 'centerName', label: 'Center', render: (r) => r.centerName || r.center_name || r.center?.center_name || r.center?.centerName || r.center?.name || r.centerId || r.center_id || '' },
      ]}
      fields={[
        { name: 'districtId', label: 'District', type: 'select', required: true, options: loadDistrictOptions },
        { name: 'talukaId', label: 'Taluka', type: 'select', required: true, dependsOn: 'districtId', options: loadTalukaOptions },
        { name: 'centerId', label: 'Center', type: 'select', required: true, dependsOn: 'talukaId', options: loadCenterOptions },
        { name: 'fullName', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password', type: 'password', required: false },
        { name: 'mobile', label: 'Phone', type: 'tel', required: true },
        { name: 'address', label: 'Address', type: 'textarea' },
      ]}
      transformSubmit={async (fv, editing) => {
        const fullName = (fv.fullName ?? fv.full_name ?? '').trim()
        const email = (fv.email ?? '').trim()
        const password = (fv.password ?? '').trim()
        const mobile = (fv.mobile ?? '').trim()
        const address = fv.address?.trim() || null
        const centerId = Number(fv.centerId ?? fv.center_id ?? location.state?.centerId ?? 0)

        // Validation
        if (!fullName) {
          throw new Error('Full Name is required')
        }
        if (!email) {
          throw new Error('Email is required')
        }
        if (!mobile) {
          throw new Error('Phone is required')
        }
        if (!centerId || centerId <= 0) {
          throw new Error('Center is required')
        }

        // For CREATE, password is required
        if (!editing) {
          if (!password) {
            throw new Error('Password is required for new Coordinator')
          }
        }

        // Prevent duplicate center assignment (for CREATE only)
        if (!editing && cachedAssignedCenterIds.has(centerId)) {
          throw new Error('This Center already has a Coordinator. Please select another Center.')
        }

        // Build payload
        const payload = {
          fullName,
          email,
          mobile,
          address,
          centerId,
          active: true,
        }

        // For CREATE, do NOT send userId; backend will create new User
        // For EDIT, include userId if it exists
        if (editing) {
          const userId = Number(editing.userId ?? editing.user_id ?? 0)
          if (userId > 0) {
            payload.userId = userId
          }
        }

        // For CREATE, include password; for EDIT, only if provided
        if (!editing) {
          payload.password = password
        } else if (password) {
          payload.password = password
        }

        console.log('FINAL COORDINATOR PAYLOAD:', JSON.stringify(payload, null, 2))

        return payload
      }}
    />
  )
}
