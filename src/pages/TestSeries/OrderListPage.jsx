import React, { useEffect, useMemo, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { studentService } from '../../api/services.js'

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || data?.data || []
const valueOf = (row, keys) => keys.map((key) => key.split('.').reduce((value, part) => value?.[part], row)).find((value) => value !== undefined && value !== null && value !== '')
const paymentStatusOf = (row) => String(valueOf(row, ['paymentStatus', 'payment_status', 'payment.status', 'payment.paymentStatus', 'payment.payment_status', 'status']) || '').toUpperCase()
const paymentModeOf = (row) => valueOf(row, ['paymentMode', 'payment_mode', 'payment.mode', 'payment.paymentMode', 'payment.payment_mode', 'paymentType', 'payment.type']) || '-'
const paidOf = (row) => ['PAID', 'COMPLETED', 'SUCCESS', 'SUCCESSFUL', 'PAYMENT_SUCCESS'].includes(paymentStatusOf(row)) || Boolean(valueOf(row, ['paymentDone', 'isPaymentDone', 'payment.paid', 'payment.success']))

export default function OrderListPage() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setStudents(rowsOf(await studentService.getAll())) } catch (loadError) { setError(loadError?.response?.data?.message || loadError?.message || 'Could not load paid student orders.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const paidStudents = useMemo(() => students.filter(paidOf).filter((row) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return [
      valueOf(row, ['id', 'studentId', 'student_id']),
      valueOf(row, ['studentName', 'name', 'fullName', 'student.name']),
      valueOf(row, ['lastName', 'student.lastName']),
      valueOf(row, ['school', 'schoolName', 'school.name']),
      valueOf(row, ['testSeriesName', 'testSeries.title', 'seriesName', 'courseName']),
      paymentModeOf(row),
    ].some((value) => String(value || '').toLowerCase().includes(query))
  }), [students, search])

  return (
    <section className="series-manager test-series-orders-page">
      <div className="page-header"><div><h1>Order List</h1><p>Students with successful Test Series fee payments.</p></div></div>
      <div className="solved-paper-toolbar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, school, series, or payment mode..." aria-label="Search paid student orders" /><button className="btn btn-outline" type="button" onClick={load} disabled={loading}><FiRefreshCw /> Refresh</button></div>
      {error && <div className="login-alert">{error}</div>}
      <div className="result-count">Showing <strong>{paidStudents.length}</strong> paid students of {students.filter(paidOf).length}</div>
      <div className="card series-table-card"><div className="table-wrap"><table className="data-table"><thead><tr><th>Student ID</th><th>Student</th><th>School</th><th>Test Series</th><th>Amount</th><th>Payment Mode</th><th>Payment Status</th><th>Transaction</th><th>Paid At</th></tr></thead><tbody>
        {loading && <tr className="empty-row"><td colSpan="9">Loading paid students...</td></tr>}
        {!loading && !paidStudents.length && <tr className="empty-row"><td colSpan="9">No successful paid students found.</td></tr>}
        {!loading && paidStudents.map((row) => <tr key={valueOf(row, ['id', 'studentId', 'student_id'])}><td>{valueOf(row, ['id', 'studentId', 'student_id']) || '-'}</td><td><strong>{[valueOf(row, ['studentName', 'name', 'fullName', 'student.name']), valueOf(row, ['lastName', 'student.lastName'])].filter(Boolean).join(' ') || '-'}</strong><small className="solved-paper-secondary">{valueOf(row, ['mobile', 'phone', 'email', 'student.email']) || ''}</small></td><td>{valueOf(row, ['school', 'schoolName', 'school.name']) || '-'}</td><td>{valueOf(row, ['testSeriesName', 'testSeries.title', 'seriesName', 'courseName', 'testSeries.name']) || '-'}</td><td>{valueOf(row, ['amount', 'paymentAmount', 'payment.amount', 'paidAmount', 'price']) ?? '-'}</td><td>{paymentModeOf(row)}</td><td><span className="badge badge-active">{paymentStatusOf(row) || 'PAID'}</span></td><td>{valueOf(row, ['transactionId', 'paymentId', 'payment.transactionId', 'payment.paymentId', 'orderId']) || '-'}</td><td>{valueOf(row, ['paidAt', 'paymentDate', 'payment.paidAt', 'createdAt']) || '-'}</td></tr>)}
      </tbody></table></div></div>
    </section>
  )
}