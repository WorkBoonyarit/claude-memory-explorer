import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type { ClaudeMdEntry } from './api/claude-mds'
import { getProjectLabel } from '@/utils/projectLabel'

export default function ClaudeMdPage() {
  const [entries, setEntries] = useState<ClaudeMdEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ClaudeMdEntry | null>(null)

  useEffect(() => {
    fetch('/api/claude-mds')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data)
          if (data.length > 0) setSelected(data[0])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const allSlugs = useMemo(() => entries.filter((e) => !e.isGlobal).map((e) => e.slug), [entries])

  function label(entry: ClaudeMdEntry) {
    if (entry.isGlobal) return 'Global (~/.claude)'
    return getProjectLabel(entry.slug, allSlugs)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CLAUDE.md Files</h1>
          <p className="text-sm text-gray-500 mt-0.5">Project instructions per project</p>
        </div>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">← Back to list</Link>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
          {loading && <p className="text-sm text-gray-400 text-center py-8">Loading...</p>}
          {!loading && entries.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No CLAUDE.md files found.</p>
          )}
          {entries.map((entry) => (
            <button
              key={entry.filePath}
              type="button"
              onClick={() => setSelected(entry)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                selected?.filePath === entry.filePath
                  ? 'bg-indigo-50 border-l-2 border-l-indigo-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <p className={`text-sm font-medium truncate ${selected?.filePath === entry.filePath ? 'text-indigo-700' : 'text-gray-800'}`}>
                {label(entry)}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5 font-mono" title={entry.filePath}>
                {entry.filePath.replace(process.env.HOME || '', '~')}
              </p>
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {selected ? (
            <div className="max-w-3xl mx-auto px-8 py-6">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{label(selected)}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selected.filePath}</p>
              </div>
              <div className="prose prose-sm prose-gray max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mt-6 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold text-gray-800 mt-5 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-1">{children}</h3>,
                    p: ({ children }) => <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    code: ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5 text-xs font-mono text-gray-800">{children}</code>,
                    pre: ({ children }) => <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto mb-3 text-xs">{children}</pre>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                    hr: () => <hr className="border-gray-200 my-4" />,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-3">{children}</blockquote>,
                  }}
                >
                  {selected.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a project to view its CLAUDE.md
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
