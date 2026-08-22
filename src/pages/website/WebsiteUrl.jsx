import React, { useState } from 'react'
import { FiCheck, FiCopy, FiExternalLink, FiGlobe } from 'react-icons/fi'

const WEBSITE_URL = 'http://shrishahuprabodhini.in/'

export default function WebsiteUrl() {
  const [copied, setCopied] = useState(false)

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(WEBSITE_URL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="website-url-page">
      <div className="page-header">
        <div>
          <h1>Website URL</h1>
          <p>Use this address to open the public website.</p>
        </div>
      </div>
      <div className="website-url-card card">
        <div className="website-url-icon"><FiGlobe /></div>
        <span className="website-url-label">Public website address</span>
        <a className="website-url-value" href={WEBSITE_URL} target="_blank" rel="noreferrer">
          {WEBSITE_URL}
        </a>
        <div className="website-url-actions">
          <button className="btn btn-primary" type="button" onClick={copyUrl}>
            {copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied' : 'Copy URL'}
          </button>
          <a className="btn btn-outline" href={WEBSITE_URL} target="_blank" rel="noreferrer">
            <FiExternalLink /> Open website
          </a>
        </div>
      </div>
    </section>
  )
}