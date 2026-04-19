'use client'

import { useState } from 'react'
import { Plus, Globe, Users, List } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, ProjectTypeBadge } from '@/components/ui/badge'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { EUROPEAN_COUNTRIES, LANGUAGES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export default function ProjectsPage() {
  const active = MOCK_PROJECTS.filter(p => p.is_active)
  const inactive = MOCK_PROJECTS.filter(p => !p.is_active)

  const getLanguageName = (code: string) =>
    LANGUAGES.find(l => l.code === code)?.name ?? code

  const getCountryFlag = (code: string) =>
    EUROPEAN_COUNTRIES.find(c => c.code === code)?.flag ?? ''

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage brands and market projects. Each project has its own contacts, lists, and consent settings."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Active — {active.length}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {active.map(project => (
          <ProjectCard key={project.id} project={project} getLanguageName={getLanguageName} getCountryFlag={getCountryFlag} />
        ))}
      </div>

      {inactive.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Inactive — {inactive.length}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {inactive.map(project => (
              <ProjectCard key={project.id} project={project} getLanguageName={getLanguageName} getCountryFlag={getCountryFlag} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  getLanguageName,
  getCountryFlag,
}: {
  project: typeof MOCK_PROJECTS[0]
  getLanguageName: (code: string) => string
  getCountryFlag: (code: string) => string
}) {
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
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">v{project.privacy_notice_version}</span>
        </div>
      </div>
    </Card>
  )
}
