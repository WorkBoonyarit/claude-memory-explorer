import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Memory, MemoryType } from '@/types/memory'
import MemoryCard from '@/components/MemoryCard'
import MemoryDetail from '@/components/MemoryDetail'
import { getProjectLabel } from '@/utils/projectLabel'

type FilterType = 'all' | MemoryType

const TYPE_FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'User', value: 'user' },
  { label: 'Feedback', value: 'feedback' },
  { label: 'Project', value: 'project' },
  { label: 'Reference', value: 'reference' },
]

export default function HomePage() {
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [search, setSearch] = useState('')
  const [projectsExpanded, setProjectsExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/memories')
      .then((res) => res.json())
      .then((data: Memory[] | { error: string }) => {
        if (Array.isArray(data)) {
          setMemories(data)
          const file = router.query.file as string | undefined
          if (file) {
            const match = data.find((m) => m.filePath === file)
            if (match) setSelectedMemory(match)
          }
        } else {
          setError(data.error ?? 'Failed to load memories')
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router.query.file])

  const filtered = useMemo(() => {
    let result = activeFilter === 'all' ? memories : memories.filter((m) => m.type === activeFilter)
    if (activeProject) result = result.filter((m) => m.projectSlug === activeProject)
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q)
      )
    }
    return result
  }, [memories, activeFilter, activeProject, search])

  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    memories.forEach((m) => { counts[m.projectSlug] = (counts[m.projectSlug] ?? 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [memories])

  const allSlugs = useMemo(() => projectCounts.map(([slug]) => slug), [projectCounts])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Claude Memory Explorer</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse memory files from ~/.claude/projects/</p>
        <div className="flex gap-3 mt-1">
          <Link href="/graph" className="text-sm text-indigo-600 hover:underline">View graph →</Link>
          <Link href="/types" className="text-sm text-indigo-600 hover:underline">Memory types →</Link>
          <Link href="/claude-md" className="text-sm text-indigo-600 hover:underline">CLAUDE.md →</Link>
        </div>
      </header>

      <div className="flex" style={{ height: 'calc(100vh - 73px)' }}>
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Type filters */}
          <div className="px-4 pb-3 border-b border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}
              {search.trim() && ` matching "${search.trim()}"`}
            </p>
          </div>

          {/* Memory list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && <div className="text-sm text-gray-400 text-center py-8">Loading memories...</div>}
            {error && <div className="text-sm text-red-500 bg-red-50 rounded p-3">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-8">No memories found.</div>
            )}
            {filtered.map((memory) => (
              <MemoryCard
                key={memory.filePath}
                memory={memory}
                isSelected={selectedMemory?.filePath === memory.filePath}
                onClick={() => setSelectedMemory(memory)}
                searchQuery={search.trim()}
              />
            ))}
          </div>

          {/* Project filter */}
          {!loading && !error && projectCounts.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setProjectsExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700"
              >
                <span>Projects ({projectCounts.length})</span>
                <span>{projectsExpanded ? '▲' : '▼'}</span>
              </button>
              {projectsExpanded && (
                <div className="mt-2 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => { setActiveProject(null); setSelectedMemory(null) }}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                      activeProject === null
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>All projects</span>
                    <span className={`rounded-full px-2 py-0.5 ${activeProject === null ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                      {memories.length}
                    </span>
                  </button>
                  {projectCounts.map(([slug, count]) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => { setActiveProject(slug); setSelectedMemory(null) }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                        activeProject === slug
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate max-w-[180px] text-left" title={slug}>{getProjectLabel(slug, allSlugs)}</span>
                      <span className={`rounded-full px-2 py-0.5 ml-2 flex-shrink-0 ${activeProject === slug ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Detail panel */}
        <main className="flex-1 overflow-hidden bg-white">
          {selectedMemory ? (
            <div className="h-full p-6 overflow-hidden flex flex-col">
              <MemoryDetail
                memory={selectedMemory}
                onClose={() => setSelectedMemory(null)}
                searchQuery={search.trim()}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">&#128193;</p>
                <p className="text-sm">Select a memory to view its content</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
