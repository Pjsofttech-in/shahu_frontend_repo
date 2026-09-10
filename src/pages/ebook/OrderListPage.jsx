import React, { useMemo, useState } from 'react'

const initialOrders = [
  { id: 1, buyer: 'Amit Shah', material: 'Science', total: '₹ 1500', status: 'Paid' },
  { id: 2, buyer: 'Priya Patil', material: 'Maths', total: '₹ 2200', status: 'Pending' },
  { id: 3, buyer: 'Mayur Kadam', material: 'English', total: '₹ 1800', status: 'Paid' },
  { id: 4, buyer: 'Ritika Jadhav', material: 'History', total: '₹ 1400', status: 'Shipped' },
]

export default function OrderListPage() {
  const [search, setSearch] = useState('')
  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return initialOrders
    return initialOrders.filter((row) =>
      String(row.buyer).toLowerCase().includes(value)
      || String(row.material).toLowerCase().includes(value)
      || String(row.status).toLowerCase().includes(value)
    )
  }, [search])

  return (
    <div className="ebook-list-page" style={{ width: '100%', maxWidth: '1220px', margin: '0 auto' }}>
      <div className="ebook-list-controls">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders"
          style={{ width: '320px', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d8e2ef', background: '#fff' }}
        />
      </div>
      <div className="ebook-list-count">Order Count: <span>{rows.length}</span></div>

      <div className="table-wrap" style={{ border: '1px solid #dfe5ee', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Order ID</th>
              <th>Buyer</th>
              <th>Material</th>
              <th style={{ width: '180px' }}>Total</th>
              <th style={{ width: '180px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No order found.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.buyer}</td>
                <td>{row.material}</td>
                <td>{row.total}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
