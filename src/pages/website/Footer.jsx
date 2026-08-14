import React from 'react'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { footerService } from '../../api/services.js'

const FooterPreview = (v) => (
  <div className="footer-preview">
    <div>
      <h4>{v.orgName || 'Shri Shahu Prabodhini'}</h4>
      <p style={{ margin: 0 }}>{v.aboutText || 'A brief description of the organization appears here.'}</p>
    </div>
    <div>
      <h4>Quick Links</h4>
      <p style={{ margin: 0 }}>Home · About · Courses · Gallery · Contact</p>
    </div>
    <div>
      <h4>Contact</h4>
      <p style={{ margin: 0 }}>{v.address || 'Address line'}</p>
      <p style={{ margin: 0 }}>{v.phone || 'Phone'} · {v.email || 'Email'}</p>
    </div>
    <div>
      <h4>Follow Us</h4>
      <p style={{ margin: 0 }}>{v.facebookUrl ? 'Facebook · ' : ''}{v.instagramUrl ? 'Instagram · ' : ''}{v.youtubeUrl ? 'YouTube' : ''}</p>
    </div>
    <div className="fp-bottom">© {new Date().getFullYear()} {v.orgName || 'Shri Shahu Prabodhini'}. All rights reserved.</div>
  </div>
)

export default function Footer() {
  return (
    <SingletonForm
        title="Footer Settings"
        subtitle="Edit the content shown in the website footer. Preview updates live below."
        service={footerService}
        preview={FooterPreview}
        fields={[
          { name: 'orgName', label: 'Organization Name', type: 'text', required: true },
          { name: 'aboutText', label: 'About / Tagline', type: 'textarea' },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'facebookUrl', label: 'Facebook URL', type: 'url' },
          { name: 'instagramUrl', label: 'Instagram URL', type: 'url' },
          { name: 'youtubeUrl', label: 'YouTube URL', type: 'url' },
        ]}
      />
  )
}
