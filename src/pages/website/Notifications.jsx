import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { notificationService } from '../../api/services.js'

export default function Notifications() {
  return (
    <CrudManager
      title="Notifications"
      subtitle="Manage notifications displayed on the public website."
      service={notificationService}
      addLabel="Add Notification"
      searchPlaceholder="Search notifications..."
      searchKeys={['title', 'description']}
      showEditAction={false}
      columns={[
        { key: 'id', label: 'ID', width: 80 },
        { key: 'title', label: 'Title' },
        {
          key: 'description',
          label: 'Description',
          render: (row) => (
            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420 }}>
              {row.description || '-'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  )
}
