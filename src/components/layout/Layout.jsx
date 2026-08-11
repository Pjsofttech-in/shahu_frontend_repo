import React from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout({ title, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar title={title} />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
