import React, { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiPlus } from 'react-icons/fi'
import { categoryService, examQuestionService, examService, questionService, testSeriesService } from '../../api/services.js'

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || data?.data || []
const idOf = (row) => row?.id ?? row?.categoryId ?? row?.testSeriesId ?? row?.examId
const categoryIdOf = (row) => row?.categoryId ?? row?.category?.id
const seriesIdOf = (row) => row?.testSeriesId ?? row?.seriesId ?? row?.testSeries?.id ?? row?.series?.id
const examIdOf = (row) => row?.examId ?? row?.exam?.id ?? row?.id
const examEntriesOf = (row) => Array.isArray(row?.exams) ? row.exams : Array.isArray(row?.testSeriesExams) ? row.testSeriesExams : Array.isArray(row?.assignedExams) ? row.assignedExams : []
const errorOf = (error) => String(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Could not load the Add Question page.')
const labelOf = (row, fallback) => row?.categoryName || row?.name || row?.title || row?.examName || `${fallback} #${idOf(row)}`

export default function AddQuestionPage() {
  const [categories, setCategories] = useState([])
  const [series, setSeries] = useState([])
  const [papers, setPapers] = useState([])
  const [questions, setQuestions] = useState([])
  const [assigned, setAssigned] = useState(new Set())
  const [filters, setFilters] = useState({ categoryId: '', seriesId: '', paperId: '' })
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [categoryData, seriesData, paperData, questionData] = await Promise.all([categoryService.getAll(), testSeriesService.getAll(), examService.getAll(), questionService.getAll()])
        const seriesRows = rowsOf(seriesData)
        const paperMap = new Map()
        rowsOf(paperData).forEach((paper) => paperMap.set(String(examIdOf(paper)), { ...paper, id: examIdOf(paper) }))
        seriesRows.forEach((seriesRow) => examEntriesOf(seriesRow).forEach((entry) => {
          const paper = entry.exam || entry
          const paperId = examIdOf(paper)
          if (paperId != null) paperMap.set(String(paperId), { ...(paperMap.get(String(paperId)) || {}), ...paper, id: paperId, seriesId: idOf(seriesRow), categoryId: categoryIdOf(seriesRow) })
        }))
        setCategories(rowsOf(categoryData)); setSeries(seriesRows); setPapers([...paperMap.values()]); setQuestions(rowsOf(questionData)); setError('')
      } catch (loadError) { setError(errorOf(loadError)) } finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (!filters.paperId) { setAssigned(new Set()); return }
    examQuestionService.getAll(filters.paperId)
      .then((data) => setAssigned(new Set(rowsOf(data).map((row) => Number(row.questionId ?? row.question?.id ?? row.id)).filter(Number.isFinite))))
      .catch((loadError) => setError(errorOf(loadError)))
  }, [filters.paperId])

  const filteredSeries = useMemo(() => series.filter((row) => !filters.categoryId || String(categoryIdOf(row)) === String(filters.categoryId)), [series, filters.categoryId])
  const filteredPapers = useMemo(() => papers.filter((row) => !filters.categoryId || !categoryIdOf(row) || String(categoryIdOf(row)) === String(filters.categoryId)), [papers, filters.categoryId])
  const availableQuestions = useMemo(() => filters.paperId ? questions.filter((row) => !assigned.has(Number(idOf(row)))) : [], [questions, assigned, filters.paperId])

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, ...(name === 'categoryId' ? { seriesId: '', paperId: '' } : {}), ...(name === 'seriesId' ? { paperId: '' } : {}) }))
    setSelected(new Set()); setSuccess(''); setError('')
  }
  const toggleQuestion = (id) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  const addQuestions = async () => {
    if (!filters.paperId) { setError('Select a paper before adding questions.'); return }
    if (!selected.size) { setError('Select at least one question.'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      for (const [index, questionId] of [...selected].entries()) await examQuestionService.add(filters.paperId, { questionId, sequence: assigned.size + index + 1, marks: 1 })
      setAssigned((current) => new Set([...current, ...selected])); setSelected(new Set()); setSuccess('Questions added successfully.')
    } catch (saveError) { setError(errorOf(saveError)) } finally { setSaving(false) }
  }

  return (
    <section className="series-manager add-question-page">
      <div className="card add-question-card">
        <div className="add-question-filters">
          <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)} aria-label="Select category"><option value="">Select Category</option>{categories.map((row) => <option key={idOf(row)} value={idOf(row)}>{labelOf(row, 'Category')}</option>)}</select>
          <select value={filters.seriesId} onChange={(event) => updateFilter('seriesId', event.target.value)} disabled={!filters.categoryId} aria-label="Select series"><option value="">Select Series</option>{filteredSeries.map((row) => <option key={idOf(row)} value={idOf(row)}>{labelOf(row, 'Series')}</option>)}</select>
          <select value={filters.paperId} onChange={(event) => updateFilter('paperId', event.target.value)} disabled={!filters.categoryId} aria-label="Select paper"><option value="">Select Paper</option>{filteredPapers.map((row) => <option key={idOf(row)} value={idOf(row)}>{labelOf(row, 'Paper')}</option>)}</select>
        </div>
        {success && <div className="add-question-success"><FiCheckCircle /> {success}</div>}
        {error && <div className="login-alert">{error}</div>}
        <div className="add-question-heading"><h2>Select Questions</h2><p>{loading ? 'Loading questions...' : <>Questions available: <strong>{availableQuestions.length}</strong></>}</p></div>
        <div className="question-picker">
          {!loading && !availableQuestions.length && <div className="empty-row">{filters.paperId ? 'No questions found for the selected paper.' : 'Select Category, Series, and Paper to view questions.'}</div>}
          {availableQuestions.map((row) => <label className="question-picker-row" key={idOf(row)}><input type="checkbox" checked={selected.has(Number(idOf(row)))} onChange={() => toggleQuestion(Number(idOf(row)))} /><span>[{idOf(row)}] {row.question || row.text || `Question #${idOf(row)}`}</span></label>)}
        </div>
        <button className="btn btn-primary" type="button" onClick={addQuestions} disabled={saving || !filters.paperId || !selected.size}><FiPlus /> {saving ? 'Adding...' : 'Add Questions To Test Paper'}</button>
      </div>
    </section>
  )
}
