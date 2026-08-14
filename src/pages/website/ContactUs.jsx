import React from 'react'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { contactService } from '../../api/services.js'

export default function ContactUs() {
  return (
    <SingletonForm
        title="Contact Us"
        subtitle="Edit the contact details shown on the public website's Contact page."
        service={contactService}
        fields={[
          { name: 'address', label: 'Office Address', type: 'textarea', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'altPhone', label: 'Alternate Phone', type: 'tel' },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'mapEmbedUrl', label: 'Google Maps Embed URL', type: 'url' },
        ]}
      />
  )
}
