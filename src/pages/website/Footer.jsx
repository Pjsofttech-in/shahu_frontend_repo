import React from 'react'
import SingletonForm from '../../components/common/SingletonForm.jsx'
import { footerService } from '../../api/services.js'

const FooterPreview = (v) => (
  <div className="footer-preview">
    <div>
      <h4>{v.title || 'Footer title'}</h4>
      <p style={{ margin: 0 }}>{v.address || 'Address line'}</p>
    </div>
    <div>
      <h4>Contact</h4>
      <p style={{ margin: 0 }}>{v.mobileNumber || 'Mobile number'} · {v.email || 'Email'}</p>
    </div>
    <div>
      <h4>Follow Us</h4>
      <p style={{ margin: 0 }}>{[
        v.instagramLink && 'Instagram',
        v.facebookLink && 'Facebook',
        v.twitterLink && 'Twitter',
        v.youtubeLink && 'YouTube',
        v.whatsappLink && 'WhatsApp',
      ].filter(Boolean).join(' · ') || 'Social links'}</p>
    </div>
    <div className="fp-bottom">{v.footerColor || 'Footer color'} · {new Date().getFullYear()}</div>
  </div>
)

export default function Footer() {
  return (
    <SingletonForm
        title="Footer Settings"
        subtitle="Edit the content shown in the website footer."
        service={footerService}
        preview={FooterPreview}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'footerColor', label: 'Footer Color', type: 'text' },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'mobileNumber', label: 'Mobile Number', type: 'tel' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'instagramLink', label: 'Instagram Link', type: 'url' },
          { name: 'facebookLink', label: 'Facebook Link', type: 'url' },
          { name: 'twitterLink', label: 'Twitter Link', type: 'url' },
          { name: 'youtubeLink', label: 'YouTube Link', type: 'url' },
          { name: 'whatsappLink', label: 'WhatsApp Link', type: 'url' },
        ]}
      />
  )
}
