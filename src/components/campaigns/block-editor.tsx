'use client'

import { useState } from 'react'
import {
  Type, Image, Square, Minus, AlignLeft, Columns, Trash2,
  Plus, ChevronUp, ChevronDown, Monitor, Smartphone, Code2, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Block, BlockType } from '@/lib/types/campaigns'

// ─── Merge tag helpers ───────────────────────────────────────────────────────

const MERGE_TAGS = [
  { label: 'First name', tag: '{{first_name}}' },
  { label: 'Last name', tag: '{{last_name}}' },
  { label: 'Full name', tag: '{{full_name}}' },
  { label: 'Email', tag: '{{email}}' },
  { label: 'Project name', tag: '{{project_name}}' },
  { label: 'Unsubscribe URL', tag: '{{unsubscribe_url}}' },
  { label: 'Manage preferences URL', tag: '{{preferences_url}}' },
]

// ─── Default block factories ─────────────────────────────────────────────────

function makeBlock(type: BlockType): Block {
  const id = Math.random().toString(36).slice(2)
  switch (type) {
    case 'header':
      return { type, id, background_color: '#4f46e5', text: 'Your Company', text_color: '#ffffff' }
    case 'text':
      return { type, id, content: 'Write your content here…', font_size: 15, text_color: '#334155', background_color: '#ffffff', padding: 20 }
    case 'button':
      return { type, id, label: 'Click here', url: '{{unsubscribe_url}}', background_color: '#4f46e5', text_color: '#ffffff', border_radius: 6, align: 'center' }
    case 'image':
      return { type, id, url: '', alt: '', align: 'center' }
    case 'divider':
      return { type, id, color: '#e2e8f0', thickness: 1, padding: 16 }
    case 'spacer':
      return { type, id, height: 24 }
    case 'footer':
      return { type, id, text: '© {{project_name}}. All rights reserved.', text_color: '#94a3b8', background_color: '#f8fafc', show_unsubscribe: true, unsubscribe_text: 'Unsubscribe' }
    case 'columns':
      return { type, id, ratio: '50/50', left: [], right: [] }
  }
}

// ─── Block type palette ───────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: 'header', icon: <AlignLeft className="h-4 w-4" />, label: 'Header' },
  { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  { type: 'button', icon: <Square className="h-4 w-4" />, label: 'Button' },
  { type: 'image', icon: <Image className="h-4 w-4" />, label: 'Image' },
  { type: 'divider', icon: <Minus className="h-4 w-4" />, label: 'Divider' },
  { type: 'spacer', icon: <AlignLeft className="h-4 w-4" />, label: 'Spacer' },
  { type: 'footer', icon: <AlignLeft className="h-4 w-4" />, label: 'Footer' },
  { type: 'columns', icon: <Columns className="h-4 w-4" />, label: 'Columns' },
]

// ─── Block renderers (preview) ────────────────────────────────────────────────

function renderBlock(block: Block, mobile: boolean): React.ReactNode {
  const maxW = mobile ? '375px' : '600px'
  switch (block.type) {
    case 'header':
      return (
        <div style={{ background: block.background_color, padding: '20px', maxWidth: maxW, margin: '0 auto' }}>
          {block.logo_url && <img src={block.logo_url} alt={block.logo_alt ?? ''} style={{ height: 32 }} />}
          {block.text && <p style={{ color: block.text_color, fontWeight: 700, margin: 0 }}>{block.text}</p>}
        </div>
      )
    case 'text':
      return (
        <div style={{ background: block.background_color, padding: block.padding, maxWidth: maxW, margin: '0 auto', color: block.text_color, fontSize: block.font_size, lineHeight: 1.6 }}>
          {block.content}
        </div>
      )
    case 'button':
      return (
        <div style={{ textAlign: block.align, padding: '12px', maxWidth: maxW, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: block.background_color, color: block.text_color, padding: '10px 24px', borderRadius: block.border_radius, fontWeight: 600 }}>
            {block.label}
          </span>
        </div>
      )
    case 'image':
      return (
        <div style={{ textAlign: block.align, maxWidth: maxW, margin: '0 auto', padding: '8px' }}>
          {block.url
            ? <img src={block.url} alt={block.alt} style={{ maxWidth: '100%', width: block.width }} />
            : <div className="bg-slate-100 rounded text-slate-400 text-sm py-8 text-center">Image placeholder</div>}
        </div>
      )
    case 'divider':
      return (
        <div style={{ padding: `${block.padding}px 20px`, maxWidth: maxW, margin: '0 auto' }}>
          <hr style={{ border: 'none', borderTop: `${block.thickness}px solid ${block.color}` }} />
        </div>
      )
    case 'spacer':
      return <div style={{ height: block.height, maxWidth: maxW, margin: '0 auto' }} />
    case 'footer':
      return (
        <div style={{ background: block.background_color, padding: '20px', maxWidth: maxW, margin: '0 auto', textAlign: 'center', color: block.text_color, fontSize: 12 }}>
          <p style={{ margin: '0 0 8px' }}>{block.text}</p>
          {block.show_unsubscribe && (
            <a href="#" style={{ color: block.text_color, textDecoration: 'underline' }}>{block.unsubscribe_text}</a>
          )}
          {block.address && <p style={{ margin: '8px 0 0', opacity: 0.7 }}>{block.address}</p>}
        </div>
      )
    case 'columns':
      return (
        <div style={{ display: 'flex', gap: 12, maxWidth: maxW, margin: '0 auto', padding: '8px', flexDirection: mobile ? 'column' : 'row' }}>
          <div style={{ flex: 1 }}>{block.left.map((b, i) => <div key={i}>{renderBlock(b, mobile)}</div>)}</div>
          <div style={{ flex: 1 }}>{block.right.map((b, i) => <div key={i}>{renderBlock(b, mobile)}</div>)}</div>
        </div>
      )
  }
}

// ─── Block editor form ────────────────────────────────────────────────────────

function BlockForm({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  function field(key: string, label: string, value: string | number | boolean, type = 'text') {
    return (
      <label key={key} className="block mb-3">
        <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
        {type === 'checkbox' ? (
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={e => onChange({ ...block, [key]: e.target.checked } as Block)}
            className="rounded border-slate-300"
          />
        ) : (
          <input
            type={type}
            value={value as string | number}
            onChange={e => onChange({ ...block, [key]: type === 'number' ? Number(e.target.value) : e.target.value } as Block)}
            className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </label>
    )
  }

  function select(key: string, label: string, value: string, options: string[]) {
    return (
      <label key={key} className="block mb-3">
        <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
        <select
          value={value}
          onChange={e => onChange({ ...block, [key]: e.target.value } as Block)}
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    )
  }

  switch (block.type) {
    case 'header':
      return <>{field('text', 'Text', block.text ?? '')}{field('text_color', 'Text color', block.text_color, 'color')}{field('background_color', 'Background', block.background_color, 'color')}{field('logo_url', 'Logo URL', block.logo_url ?? '')}</>
    case 'text':
      return <>{field('font_size', 'Font size', block.font_size, 'number')}{field('text_color', 'Text color', block.text_color, 'color')}{field('background_color', 'Background', block.background_color, 'color')}{field('padding', 'Padding (px)', block.padding, 'number')}</>
    case 'button':
      return <>{field('label', 'Label', block.label)}{field('url', 'URL / merge tag', block.url)}{field('background_color', 'Background', block.background_color, 'color')}{field('text_color', 'Text color', block.text_color, 'color')}{field('border_radius', 'Border radius', block.border_radius, 'number')}{select('align', 'Alignment', block.align, ['left', 'center', 'right'])}</>
    case 'image':
      return <>{field('url', 'Image URL', block.url)}{field('alt', 'Alt text', block.alt)}{field('link_url', 'Link URL', block.link_url ?? '')}{select('align', 'Alignment', block.align, ['left', 'center', 'right'])}</>
    case 'divider':
      return <>{field('color', 'Color', block.color, 'color')}{field('thickness', 'Thickness (px)', block.thickness, 'number')}{field('padding', 'Padding (px)', block.padding, 'number')}</>
    case 'spacer':
      return <>{field('height', 'Height (px)', block.height, 'number')}</>
    case 'footer':
      return <>{field('text', 'Footer text', block.text)}{field('text_color', 'Text color', block.text_color, 'color')}{field('background_color', 'Background', block.background_color, 'color')}{field('address', 'Physical address', block.address ?? '')}{field('show_unsubscribe', 'Show unsubscribe link', block.show_unsubscribe, 'checkbox')}{field('unsubscribe_text', 'Unsubscribe text', block.unsubscribe_text)}</>
    case 'columns':
      return <>{select('ratio', 'Column ratio', block.ratio, ['50/50', '33/67', '67/33'])}</>
  }
}

// ─── Main BlockEditor ─────────────────────────────────────────────────────────

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  htmlMode?: boolean
  htmlContent?: string
  onHtmlChange?: (html: string) => void
  subject: string
  preheader: string
  onSubjectChange: (v: string) => void
  onPreheaderChange: (v: string) => void
}

export function BlockEditor({
  blocks,
  onChange,
  htmlMode = false,
  htmlContent = '',
  onHtmlChange,
  subject,
  preheader,
  onSubjectChange,
  onPreheaderChange,
}: BlockEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [showMergeTags, setShowMergeTags] = useState(false)

  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null

  function addBlock(type: BlockType) {
    onChange([...blocks, makeBlock(type)])
  }

  function updateBlock(updated: Block) {
    onChange(blocks.map(b => b.id === updated.id ? updated : b))
  }

  function removeBlock(id: string) {
    onChange(blocks.filter(b => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex(b => b.id === id)
    if (idx === -1) return
    const next = idx + dir
    if (next < 0 || next >= blocks.length) return
    const arr = [...blocks]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    onChange(arr)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Subject / Preheader */}
      <div className="border-b border-slate-200 px-4 py-3 space-y-2 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-20 shrink-0">Subject</span>
          <input
            value={subject}
            onChange={e => onSubjectChange(e.target.value)}
            placeholder="Email subject line…"
            className="flex-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-20 shrink-0">Preheader</span>
          <input
            value={preheader}
            onChange={e => onPreheaderChange(e.target.value)}
            placeholder="Preview text shown in inbox…"
            className="flex-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreview(false)}
            className={cn('px-3 py-1.5 text-xs rounded font-medium', !preview ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800')}
          >
            Edit
          </button>
          <button
            onClick={() => setPreview(true)}
            className={cn('px-3 py-1.5 text-xs rounded font-medium flex items-center gap-1', preview ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800')}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobile(false)}
            className={cn('p-1.5 rounded', !mobile ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-700')}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobile(true)}
            className={cn('p-1.5 rounded', mobile ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-700')}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMergeTags(v => !v)}
            className="px-3 py-1.5 text-xs rounded font-medium text-slate-500 hover:text-slate-800 border border-slate-200 bg-white"
          >
            Merge tags
          </button>
          {showMergeTags && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-48 py-1">
              {MERGE_TAGS.map(m => (
                <button
                  key={m.tag}
                  onClick={() => { navigator.clipboard.writeText(m.tag); setShowMergeTags(false) }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between gap-4"
                >
                  <span className="text-slate-700">{m.label}</span>
                  <code className="text-indigo-600">{m.tag}</code>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {htmlMode ? (
          <div className="flex-1 p-4">
            <textarea
              value={htmlContent}
              onChange={e => onHtmlChange?.(e.target.value)}
              className="w-full h-full text-sm font-mono border border-slate-200 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Paste your HTML email here…"
            />
          </div>
        ) : preview ? (
          /* Preview pane */
          <div className="flex-1 overflow-auto bg-slate-100 p-6">
            <div
              className="mx-auto bg-white shadow-sm rounded overflow-hidden transition-all duration-300"
              style={{ maxWidth: mobile ? 375 : 600 }}
            >
              {blocks.map(b => (
                <div key={b.id}>{renderBlock(b, mobile)}</div>
              ))}
              {blocks.length === 0 && (
                <div className="py-20 text-center text-slate-400 text-sm">No blocks yet — switch to edit mode to add content</div>
              )}
            </div>
          </div>
        ) : (
          /* Edit pane */
          <>
            {/* Block list */}
            <div className="flex-1 overflow-auto bg-slate-50 p-4 space-y-2">
              {blocks.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Add blocks from the palette below
                </div>
              )}
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedId(block.id)}
                  className={cn(
                    'bg-white border rounded-lg p-3 cursor-pointer transition-colors',
                    selectedId === block.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 capitalize">{block.type}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1) }} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1) }} disabled={idx === blocks.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); removeBlock(block.id) }} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="pointer-events-none scale-75 origin-top-left" style={{ width: '133%' }}>
                    {renderBlock(block, false)}
                  </div>
                </div>
              ))}

              {/* Add block palette */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-medium text-slate-400 mb-2">Add block</p>
                <div className="grid grid-cols-4 gap-2">
                  {BLOCK_TYPES.map(({ type, icon, label }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="flex flex-col items-center gap-1 p-2 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Block settings panel */}
            {selectedBlock && (
              <div className="w-64 shrink-0 border-l border-slate-200 bg-white overflow-auto p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 capitalize">{selectedBlock.type} settings</h3>
                <BlockForm block={selectedBlock} onChange={updateBlock} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
