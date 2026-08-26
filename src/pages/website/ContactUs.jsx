import React from 'react'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { contactService } from '../../api/services.js'

export default function ContactUs({ title = 'Contact Us' }) {
  return (
    <SingletonForm
      title={title}
      subtitle="Manage contact details displayed on the public website."
      service={contactService}
      fields={[
        { name: 'address', label: 'Address', type: 'textarea', required: true },
        { name: 'contactNo', label: 'Contact Number', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'mapLink', label: 'Map Link', type: 'url', placeholder: 'https://maps.google.com/...' },
      ]}
      transformSubmit={(values) => {
        const payload = {
          id: values.id,
          address: String(values.address ?? '').trim(),
          contactNo: String(values.contactNo ?? '').trim(),
          email: String(values.email ?? '').trim(),
          mapLink: String(values.mapLink ?? '').trim(),
        }

        if (!payload.id) {
          throw new Error('Contact details could not be loaded. Please refresh and try again.')
        }

        if (!payload.address || !payload.contactNo || !payload.email) {
          throw new Error('Please complete all contact fields.')
        }

        return payload
      }}
    />
  )
}
