'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Code2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlockEditor } from '@/components/campaigns/block-editor'
import { MOCK_TEMPLATES } from '@/lib/mock-data-campaigns'
import { cn } from '@/lib/utils'
import type { Block, TemplateCategory } from '@/lib/types/campaigns'

const CATEGORY_COLOR: Record<TemplateCategory, 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'gray'> = {
  newsletter: 'blue', promotional: 'green', transactional: 'yellow',
  winback: 'purple', welcome: 'indigo', blank: 'gray',
}

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const source = MOCK_TEMPLATES.find(t => t.id === id)

  const [blocks, setBlocks] = useState<Block[]>(source?.blocks ?? [])
  const [subject, setSubject] = useState(source?.subject_default ?? '')
  const [preheader, setPreheader] = useState(source?.preheader_default ?? '')
  const [htmlContent, setHtmlContent] = useState(source?.html_override ?? '')
  const [htmlMode, setHtmlMode] = useState(source?.content_mode === 'html')
  const [saving, setSaving] = useState(false)

  if (!source) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Template not found.</p>
        <Button variant="secondary" size="sm" onClick={() => router.push('/templates')} className="mt-4">
          Back to templates
        </Button>
      </div>
    )
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks,
        subject_default: subject,
        preheader_default: preheader,
        html_override: htmlMode ? htmlContent : null,
        content_mode: htmlMode ? 'html' : 'blocks',
      }),
    })
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-40px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/templates')} className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-slate-900">{source.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge color={CATEGORY_COLOR[source.category]}>{source.category}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 rounded p-0.5 gap-0.5">
            <button
              onClick={() => setHtmlMode(false)}
              className={cn('px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors', !htmlMode ? 'bg-white shadow text-slate-800' : 'text-slate-500')}
            >
              <Layers className="h-3.5 w-3.5" /> Blocks
            </button>
            <button
              onClick={() => setHtmlMode(true)}
              className={cn('px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors', htmlMode ? 'bg-white shadow text-slate-800' : 'text-slate-500')}
            >
              <Code2 className="h-3.5 w-3.5" /> HTML
            </button>
          </div>
          <Button size="sm" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          htmlMode={htmlMode}
          htmlContent={htmlContent}
          onHtmlChange={setHtmlContent}
          subject={subject}
          preheader={preheader}
          onSubjectChange={setSubject}
          onPreheaderChange={setPreheader}
        />
      </div>
    </div>
  )
}
