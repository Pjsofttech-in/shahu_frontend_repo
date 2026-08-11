import React from 'react'
import Layout from '../../components/layout/Layout.jsx'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { visionMissionService } from '../../api/services.js'

export default function VisionMission() {
  return (
    <Layout title="Website · Vision & Mission">
      <SingletonForm
        title="Vision & Mission"
        subtitle="Edit the Vision, Mission, and About text shown on the public website."
        service={visionMissionService}
        fields={[
          { name: 'vision', label: 'Vision Statement', type: 'textarea', required: true, rows: 4 },
          { name: 'mission', label: 'Mission Statement', type: 'textarea', required: true, rows: 4 },
          { name: 'aboutUs', label: 'About Us', type: 'textarea', rows: 5 },
        ]}
      />
    </Layout>
  )
}
