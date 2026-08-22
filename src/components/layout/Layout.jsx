import React from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout({ title, children, horizontalNav, verticalNav }) {
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
        <div className={verticalNav ? 'workspace-with-nav' : ''}>
          {verticalNav && <div className="vertical-nav-container">{verticalNav}</div>}
          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  )
}
