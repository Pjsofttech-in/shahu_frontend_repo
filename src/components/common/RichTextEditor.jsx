import React, { useEffect, useRef } from 'react'

const commands = [
  { label: 'B', command: 'bold', title: 'Bold' },
  { label: 'I', command: 'italic', title: 'Italic' },
  { label: 'U', command: 'underline', title: 'Underline' },
  { label: '• List', command: 'insertUnorderedList', title: 'Bulleted list' },
  { label: '1. List', command: 'insertOrderedList', title: 'Numbered list' },
]

export default function RichTextEditor({ id, value, onChange, placeholder, compact = false }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const runCommand = (command) => {
    editorRef.current?.focus()
    document.execCommand(command, false)
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div className={`rich-text-editor${compact ? ' rich-text-editor-compact' : ''}`}>
      <div className="rich-text-toolbar" role="toolbar" aria-label="Text formatting">
        {commands.map((item) => (
          <button
            key={item.command}
            type="button"
            title={item.title}
            aria-label={item.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(item.command)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id={id}
        ref={editorRef}
        className="rich-text-content"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder || 'Enter text'}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  )
}