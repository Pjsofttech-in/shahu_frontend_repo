import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { contactFormService } from '../../api/services.js'

export default function ContactForm() {
  return (
    <CrudManager
      title="Contact Form"
      subtitle="View messages submitted through the public website."
      service={contactFormService}
      fields={[]}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'mobileNo', label: 'Mobile Number' },
        { key: 'email', label: 'Email' },
        { key: 'subject', label: 'Subject' },
        { key: 'description', label: 'Message' },
      ]}
      searchKeys={['name', 'mobileNo', 'email', 'subject', 'description']}
      searchPlaceholder="Search contact messages..."
      showCreateAction={false}
      showEditAction={false}
      showDeleteAction={false}
      rowClickEdit={false}
    />
  )
}