import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const nav = useNavigate()

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:20}}>
      <div style={{maxWidth:520,background:'#fff',padding:32,borderRadius:12,boxShadow:'0 6px 24px rgba(15,30,51,0.08)',textAlign:'center'}}>
        <h2 style={{marginTop:0}}>Unauthorized (401)</h2>
        <p>Your session has expired or you don't have permission to access this resource.</p>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:18}}>
          <button className="btn btn-primary" onClick={() => nav('/login')}>Go to Login</button>
          <button className="btn btn-outline" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    </div>
  )
}
