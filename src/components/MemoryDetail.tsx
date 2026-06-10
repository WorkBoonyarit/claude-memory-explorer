import ReactMarkdown from 'react-markdown'
import type { Memory } from '@/types/memory'
import TypeBadge from './TypeBadge'

interface MemoryDetailProps {
  memory: Memory
  onClose: () => void
  searchQuery?: string
}

export default function MemoryDetail({ memory, onClose }: MemoryDetailProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{memory.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <TypeBadge type={memory.type} />
            <span className="text-xs text-gray-400 font-mono">{memory.projectSlug}</span>
          </div>
          {memory.description && (
            <p className="text-sm text-gray-600 mt-2">{memory.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto border-t border-gray-100 pt-4">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1">{children}</h3>,
            p: ({ children }) => <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-')
              return isBlock ? (
                <code className="block bg-gray-100 text-gray-800 rounded p-3 text-xs font-mono overflow-x-auto mb-3 whitespace-pre">
                  {children}
                </code>
              ) : (
                <code className="bg-gray-100 text-gray-800 rounded px-1 py-0.5 text-xs font-mono">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => <pre className="bg-gray-100 text-gray-800 rounded p-3 text-xs font-mono overflow-x-auto mb-3 whitespace-pre">{children}</pre>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
                {children}
              </blockquote>
            ),
          }}
        >
          {memory.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
