import React from 'react'
import DynamicMediaManager from './DynamicMediaManager.jsx'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { heroSectionService, marqueeService } from '../../api/services.js'

export default function HomeSec() {
  return (
    <section>
      <SingletonForm
        // title="Home Sec"
        subtitle="Manage the announcement marquee displayed on the home page."
        service={marqueeService}
        showHeader={false}
        fields={[
          {
            name: 'name',
            label: 'Marquee Text',
            type: 'textarea',
            required: true,
            rows: 3,
            placeholder: 'Enter the announcement shown in the scrolling marquee',
          },
        ]}
        transformSubmit={(values) => {
          const name = String(values.name ?? '').trim()
          if (!name) throw new Error('Marquee text is required.')
          return { ...(values.id ? { id: values.id } : {}), name }
        }}
      />

      <div style={{ marginTop: 12 }}>
        <DynamicMediaManager
          title="Home Hero Sections"
          subtitle="Manage the three rotating hero sections shown on the website."
          service={heroSectionService}
          maxRecords={3}
          recordLabel="Hero Section"
          imageLabel="Hero Image"
          priority
          showTitle={false}
        />
      </div>
    </section>
  )
}