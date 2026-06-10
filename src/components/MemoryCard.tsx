import type { Memory } from '@/types/memory'
import TypeBadge from './TypeBadge'

interface MemoryCardProps {
  memory: Memory
  isSelected: boolean
  onClick: () => void
  searchQuery?: string
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-gray-900 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function MemoryCard({ memory, isSelected, onClick, searchQuery = '' }: MemoryCardProps) {
  const contentSnippet = searchQuery
    ? (() => {
        const q = searchQuery.toLowerCase()
        const idx = memory.content.toLowerCase().indexOf(q)
        if (idx === -1) return null
        const start = Math.max(0, idx - 30)
        const end = Math.min(memory.content.length, idx + searchQuery.length + 50)
        return (start > 0 ? '...' : '') + memory.content.slice(start, end) + (end < memory.content.length ? '...' : '')
      })()
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        isSelected
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-medium text-gray-900 text-sm leading-snug">
          <Highlight text={memory.name} query={searchQuery} />
        </span>
        <TypeBadge type={memory.type} />
      </div>
      {memory.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
          <Highlight text={memory.description} query={searchQuery} />
        </p>
      )}
      {contentSnippet && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">
          <Highlight text={contentSnippet} query={searchQuery} />
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2 font-mono truncate">{memory.projectSlug}</p>
    </button>
  )
}
