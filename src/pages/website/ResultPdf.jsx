import React from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import CrudManager from '../../components/common/CrudManager.jsx'
import { resultsPdfManagementService } from '../../api/services.js'

const WATERMARK_TEXT = 'shrishahuprabodhinischool'

const getFileUrl = (row) => {
  const preferredKeys = [
    'fileUrl', 'pdfUrl', 'filePath', 'pdfPath', 'documentUrl', 'storageUrl',
    'resultsPdfUrl', 'resultsPdfPath', 'pdfFilePath', 'fileLocation',
    'filePdf', 'pdfFile', 'resultsPdfFile', 'file', 'pdf', 'fileName', 'pdfName', 'url',
  ]
  const visited = new Set()

  const findUrl = (value, key = '') => {
    if (typeof value === 'string') {
      const candidate = value.trim()
      if (!candidate) return ''
      const looksLikePdf = /\.pdf(?:[?#].*)?$/i.test(candidate)
      const looksLikeUrl = /^https?:\/\//i.test(candidate) || candidate.startsWith('/')
      return looksLikePdf || looksLikeUrl ? candidate : ''
    }
    if (!value || typeof value !== 'object' || visited.has(value)) return ''
    visited.add(value)

    for (const preferredKey of preferredKeys) {
      const result = findUrl(value[preferredKey], preferredKey)
      if (result) return result
    }
    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey !== key) {
        const result = findUrl(childValue, childKey)
        if (result) return result
      }
    }
    return ''
  }

  return findUrl(row)
}

const addWatermark = async (file) => {
  try {
    const pdf = await PDFDocument.load(await file.arrayBuffer())
    const font = await pdf.embedFont(StandardFonts.HelveticaBold)

    pdf.getPages().forEach((page) => {
      const { width, height } = page.getSize()
      const fontSize = Math.max(18, Math.min(width, height) / 24)
      const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, fontSize)

      page.drawText(WATERMARK_TEXT, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.45, 0.45, 0.45),
        opacity: 0.2,
        rotate: degrees(35),
      })
    })

    const bytes = await pdf.save()
    return new File([bytes], file.name, { type: 'application/pdf' })
  } catch (error) {
    throw new Error(`Could not add watermark to the PDF: ${error?.message || 'invalid PDF file'}`)
  }
}

export default function ResultPdf() {
  return (
    <CrudManager
      title="Result PDFs"
      subtitle="Upload result PDFs that should be available on the public website."
      service={resultsPdfManagementService}
      addLabel="Add Result PDF"
      searchKeys={['title', 'fileName']}
      searchPlaceholder="Search result PDFs..."
      columns={[
        { key: 'id', label: 'ID', width: 80 },
        { key: 'title', label: 'Title' },
        {
          key: 'fileUrl',
          label: 'PDF',
          render: (row) => {
            const fileUrl = getFileUrl(row)
            return fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                onClick={(event) => event.stopPropagation()}
              >
                <FiExternalLink /> View PDF
              </a>
            ) : (
              <span style={{ color: 'var(--text-400)' }}>No file</span>
            )
          },
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Sankalp Exam Result 2026' },
        {
          name: 'filePdf',
          label: 'PDF File',
          type: 'file',
          accept: 'application/pdf',
          currentUrl: (_values, row) => (row ? getFileUrl(row) : ''),
        },
      ]}
      transformSubmit={async (values, editing) => {
        const title = String(values.title ?? '').trim()
        if (!title) throw new Error('Title is required.')
        if (!editing && !(values.filePdf instanceof File)) {
          throw new Error('Please select a PDF file.')
        }
        if (values.filePdf instanceof File && !/\.pdf$/i.test(values.filePdf.name)) {
          throw new Error('Only PDF files are allowed.')
        }

        return {
          title,
          filePdf: values.filePdf instanceof File
            ? await addWatermark(values.filePdf)
            : values.filePdf,
        }
      }}
      getRowId={(row) => row.id ?? row.resultsPdfId}
      initialFormValues={{ filePdf: '' }}
    />
  )
}