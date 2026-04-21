'use client'

import { useState, useEffect } from 'react'
import { Plus, Globe, Users, List, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProjectTypeBadge } from '@/components/ui/badge'
import { EUROPEAN_COUNTRIES, LANGUAGES } from '@/lib/constants'
import type { Project } from '@/lib/types'

function getLanguageName(code: string) {
  return LANGUAGES.find(l => l.code === code)?.name ?? code
}
function getCountryFlag(code: string) {
  return EUROPEAN_COUNTRIES.find(c => c.code === code)?.flag ?? ''
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Project) => void }) {
  const [name, setName]         = useState('')
  const [slug, setSlug]         = useState('')
  const [type, setType]         = useState<'b2c' | 'b2b' | 'hybrid'>('b2c')
  const [language, setLanguage] = useState('en')
  const [country, setCountry]   = useState('NL')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  function toSlug(s: string) {
    return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function handleNameChange(v: string) {
    setName(v)
    setSlug(toSlug(v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !slug) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, type, default_language: language, default_country: country }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create project'); setLoading(false); return }
      onCreated(data)
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">New project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="My Brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              required
              value={slug}
              onChange={e => setSlug(toSlug(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="my-brand"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'b2c' | 'b2b' | 'hybrid')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="b2c">B2C</option>
                <option value="b2b">B2B</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {EUROPEAN_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create project'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/projects?include_inactive=true')
      .then(r => r.json())
      .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleCreated(project: Project) {
    setProjects(prev => [project, ...prev])
    setShowModal(false)
  }

  const active   = projects.filter(p => p.is_active)
  const inactive = projects.filter(p => !p.is_active)

  return (
    <div>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <PageHeader
        title="Projects"
        description="Manage brands and market projects. Each project has its own contacts, lists, and consent settings."
        actions={
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-slate-500 mb-4">No projects yet.</p>
          <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Create your first project</Button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Active — {active.length}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {active.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </>
          )}
          {inactive.length > 0 && (
            <>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Inactive — {inactive.length}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                {inactive.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" padding={false}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCountryFlag(project.default_country)}</span>
            <div>
              <h3 className="font-semibold text-slate-900">{project.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{project.slug}</p>
            </div>
          </div>
          <ProjectTypeBadge type={project.type} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Contacts</span>
            </div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {(project.contact_count ?? 0).toLocaleString('en-GB')}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <List className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Lists</span>
            </div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {project.list_count ?? 0}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {getLanguageName(project.default_language)}
          </span>
          {project.sending_domain && (
            <span className="font-mono truncate max-w-[120px]">{project.sending_domain}</span>
          )}
        </div>
        <span className="text-xs text-slate-400">v{project.privacy_notice_version}</span>
      </div>
    </Card>
  )
}
