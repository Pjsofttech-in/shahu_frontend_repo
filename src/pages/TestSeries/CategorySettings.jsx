import React from 'react'
import CrudManager from '../../components/common/CrudManager.jsx'
import { categoryService } from '../../api/services.js'

export default function CategorySettings() {
  return (
    <CrudManager
      title="Categories"
      subtitle="Manage the categories used by your test series."
      service={categoryService}
      addLabel="Add Category"
      searchKeys={['categoryName']}
      searchPlaceholder="Search categories…"
      columns={[
        { key: 'id', label: 'ID', width: 70 },
        { key: 'categoryName', label: 'Category', render: (row) => row.categoryName || row.name || '' },
      ]}
      fields={[
        { name: 'categoryName', label: 'Category Name', type: 'text', required: true },
      ]}
      transformSubmit={async (values, editing) => {
        const categoryName = String(values.categoryName ?? values.name ?? '').trim()
        if (!categoryName) throw new Error('Category name is required')

        const payload = {
          categoryName,
        }
        if (editing?.id) payload.id = editing.id
        return payload
      }}
      rowClickEdit={false}
    />
  )
}
