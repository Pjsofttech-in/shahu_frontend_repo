import React from 'react'
import { FiMail, FiShield, FiUser } from 'react-icons/fi'
import Layout from '../components/layout/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user } = useAuth()

  return (
    <Layout title="My Profile">
      <div className="page-header">
        <div>
          <h1>Admin Profile</h1>
          <p>Your account details for the admin panel.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>
            {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name || 'Admin User'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-600)' }}>{user?.role || 'Administrator'}</div>
          </div>
        </div>

        <div className="form-group">
          <label><FiUser /> Name</label>
          <input value={user?.name || ''} disabled />
        </div>
        <div className="form-group">
          <label><FiMail /> Email</label>
          <input value={user?.email || ''} disabled />
        </div>
        <div className="form-group">
          <label><FiShield /> Role</label>
          <input value={user?.role || 'ADMIN'} disabled />
        </div>
      </div>
    </Layout>
  )
}
