import React, { useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import CrudManager from '../../components/common/CrudManager.jsx'
import { contactFormService } from '../../api/services.js'

export default function ContactForm() {
  const [replyStates, setReplyStates] = useState({})
  const contactId = (row) => row?.id ?? row?.contactId ?? row?.contact_id ?? `${row?.email || row?.name}-${row?.subject || row?.description}`
  const isReplied = (row) => {
    const value = row?.replied ?? row?.isReplied ?? row?.replyStatus ?? row?.reply_status
    return value === true || String(value || '').toUpperCase() === 'REPLIED'
  }
  const rowIsReplied = (row) => replyStates[contactId(row)] ?? isReplied(row)

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
        {
          key: 'replyStatus',
          label: 'Reply Status',
          render: (row) => {
            const replied = rowIsReplied(row)
            return <span className={`badge ${replied ? 'badge-active' : 'badge-pending'}`}>{replied ? 'Replied' : 'Not Replied'}</span>
          },
        },
      ]}
      searchKeys={['name', 'mobileNo', 'email', 'subject', 'description']}
      searchPlaceholder="Search contact messages..."
      showCreateAction={false}
      showEditAction={false}
      showDeleteAction={false}
      rowClickEdit={false}
      extraRowAction={{
        icon: <FiCheckCircle />,
        label: (row) => rowIsReplied(row) ? 'Mark Not Replied' : 'Mark Replied',
        onClick: (row) => setReplyStates((current) => ({ ...current, [contactId(row)]: !rowIsReplied(row) })),
      }}
    />
  )
}