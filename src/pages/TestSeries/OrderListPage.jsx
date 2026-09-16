import React, { useEffect, useMemo, useState } from 'react'
import { studentService } from '../../api/services.js'

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || data?.data || []
const valueOf = (row, keys) => keys.map((key) => key.split('.').reduce((value, part) => value?.[part], row)).find((value) => value !== undefined && value !== null && value !== '')
const paymentStatusOf = (row) => String(valueOf(row, ['paymentStatus', 'payment_status', 'payment.status', 'payment.paymentStatus', 'payment.payment_status', 'status']) || '').toUpperCase()
const paymentModeOf = (row) => valueOf(row, ['paymentMode', 'payment_mode', 'payment.mode', 'payment.paymentMode', 'payment.payment_mode', 'paymentType', 'payment.type']) || '-'
const paidOf = (row) => ['PAID', 'COMPLETED', 'SUCCESS', 'SUCCESSFUL', 'PAYMENT_SUCCESS'].includes(paymentStatusOf(row)) || Boolean(valueOf(row, ['paymentDone', 'isPaymentDone', 'payment.paid', 'payment.success']))
const amountOf = (row) => Number(valueOf(row, ['amount', 'paymentAmount', 'payment.amount', 'paidAmount', 'price'])) || 0
const formatAmount = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function OrderListPage() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setStudents(rowsOf(await studentService.getAll())) } catch (loadError) { setError(loadError?.response?.data?.message || loadError?.message || 'Could not load paid student orders.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filteredStudents = useMemo(() => students.filter((row) => {
    const query = search.trim().toLowerCase()
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'PAID' ? paidOf(row) : !paidOf(row))
    const matchesSearch = !query || [
      valueOf(row, ['id', 'studentId', 'student_id']),
      valueOf(row, ['studentName', 'name', 'fullName', 'student.name']),
      valueOf(row, ['lastName', 'student.lastName']),
      valueOf(row, ['school', 'schoolName', 'school.name']),
      paymentModeOf(row),
    ].some((value) => String(value || '').toLowerCase().includes(query))
    return matchesStatus && matchesSearch
  }), [students, search, statusFilter])
  const paidAmount = filteredStudents.filter(paidOf).reduce((total, row) => total + amountOf(row), 0)
  const pendingAmount = filteredStudents.filter((row) => !paidOf(row)).reduce((total, row) => total + amountOf(row), 0)

  return (
    <section className="series-manager test-series-orders-page">
      <div className="page-header"><div><h1>Order List</h1><p>Students with successful Test Series fee payments.</p></div></div>
      <div className="test-series-order-filters">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, school, or payment mode..." aria-label="Search student orders" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter payment status">
          <option value="ALL">Payment Status</option><option value="PAID">Paid</option><option value="PENDING">Pending</option>
        </select>
        <div className="order-inline-count">Showing <strong>{filteredStudents.length}</strong> of {students.length} orders</div>
        <div className="order-inline-total order-inline-paid">Paid: <strong>{formatAmount(paidAmount)}</strong></div>
        <div className="order-inline-total order-inline-pending">Pending: <strong>{formatAmount(pendingAmount)}</strong></div>
      </div>
      {error && <div className="login-alert">{error}</div>}
      <div className="card series-table-card"><div className="table-wrap"><table className="data-table"><thead><tr><th>Student ID</th><th>Student</th><th>School</th><th>Amount</th><th>Payment Mode</th><th>Payment Status</th><th>Transaction</th><th>Paid At</th></tr></thead><tbody>
        {loading && <tr className="empty-row"><td colSpan="8">Loading student orders...</td></tr>}
        {!loading && !filteredStudents.length && <tr className="empty-row"><td colSpan="8">No student orders found.</td></tr>}
        {!loading && filteredStudents.map((row) => <tr key={valueOf(row, ['id', 'studentId', 'student_id'])}><td>{valueOf(row, ['id', 'studentId', 'student_id']) || '-'}</td><td><strong>{[valueOf(row, ['studentName', 'name', 'fullName', 'student.name']), valueOf(row, ['lastName', 'student.lastName'])].filter(Boolean).join(' ') || '-'}</strong><small className="solved-paper-secondary">{valueOf(row, ['mobile', 'phone', 'email', 'student.email']) || ''}</small></td><td>{valueOf(row, ['school', 'schoolName', 'school.name']) || '-'}</td><td className="order-amount">{formatAmount(amountOf(row))}</td><td>{paymentModeOf(row)}</td><td><span className={`badge ${paidOf(row) ? 'badge-active' : 'badge-pending'}`}>{paidOf(row) ? 'PAID' : 'PENDING'}</span></td><td>{valueOf(row, ['transactionId', 'paymentId', 'payment.transactionId', 'payment.paymentId', 'orderId']) || '-'}</td><td>{valueOf(row, ['paidAt', 'paymentDate', 'payment.paidAt', 'createdAt']) || '-'}</td></tr>)}
      </tbody></table></div></div>
    </section>
  )
}