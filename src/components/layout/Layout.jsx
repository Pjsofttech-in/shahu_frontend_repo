import React from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import officeLogo from '../../asset/image.png'

export default function Layout({ title, children, horizontalNav, verticalNav, className = '' }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar title={title} />
        {horizontalNav && (
          <div className="horizontal-nav-container">
            {horizontalNav}
          </div>
        )}
        <div className={`${verticalNav ? 'workspace-with-nav' : ''} ${className}`.trim()}>
          {verticalNav && <div className="vertical-nav-container">{verticalNav}</div>}
          <div className="workspace-main">
            <main className="content">{children}</main>
            <footer className="app-footer">
              <img src={officeLogo} alt="PJSOFTTECH logo" className="app-footer-logo" />
              <span>Designed by <a href="https://pjsofttech.com/" target="_blank" rel="noreferrer">PJSOFTTECH</a> Pvt. Ltd. © All Rights Reserved</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
