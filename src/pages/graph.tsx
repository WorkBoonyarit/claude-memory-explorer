import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Memory } from '@/types/memory'
import TypeBadge from '@/components/TypeBadge'
import ReactMarkdown from 'react-markdown'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

const TYPE_COLORS: Record<string, string> = {
  user: '#3b82f6',
  feedback: '#f97316',
  project: '#22c55e',
  reference: '#a855f7',
  unknown: '#9ca3af',
}

function normalize(name: string) {
  return name.toLowerCase().replace(/[-_]/g, '')
}

function parseLinks(content: string): string[] {
  const matches = content.matchAll(/\[\[([^\]]+)\]\]/g)
  return [...matches].map((m) => m[1])
}

interface GraphNode {
  id: string
  name: string
  type: string
  projectSlug: string
  description: string
  content: string
  val: number
  x?: number
  y?: number
}

interface GraphLink {
  source: string
  target: string
}

export default function GraphPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Memory | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    fetch('/api/memories')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMemories(data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight })
    })
    ro.observe(el)
    setDimensions({ width: el.clientWidth, height: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const { nodes, links } = (() => {
    const nodes: GraphNode[] = memories.map((m) => ({
      id: m.name,
      name: m.name,
      type: m.type,
      projectSlug: m.projectSlug,
      description: m.description,
      content: m.content,
      val: 4,
    }))

    const nameMap = new Map(memories.map((m) => [normalize(m.name), m.name]))
    const links: GraphLink[] = []

    memories.forEach((m) => {
      parseLinks(m.content).forEach((ref) => {
        const target = nameMap.get(normalize(ref))
        if (target && target !== m.name) {
          links.push({ source: m.name, target })
        }
      })
    })

    return { nodes, links }
  })()

  const handleNodeClick = useCallback((node: GraphNode) => {
    const mem = memories.find((m) => m.name === node.id)
    setSelected(mem ?? null)
  }, [memories])

  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D) => {
    const r = 6
    ctx.beginPath()
    ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI)
    ctx.fillStyle = TYPE_COLORS[node.type] ?? TYPE_COLORS.unknown
    ctx.fill()
    ctx.font = '4px sans-serif'
    ctx.fillStyle = '#374151'
    ctx.textAlign = 'center'
    ctx.fillText(node.name.replace(/-|_/g, ' '), node.x ?? 0, (node.y ?? 0) + r + 5)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Memory Graph</h1>
          <p className="text-sm text-gray-500 mt-0.5">{nodes.length} nodes · {links.length} links</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'unknown').map(([type, color]) => (
              <span key={type} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                {type}
              </span>
            ))}
          </div>
          <Link href="/" className="text-sm text-indigo-600 hover:underline">← Back to list</Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
        {/* Graph canvas */}
        <div ref={containerRef} className="flex-1 bg-gray-50">
          {!loading && (
            <ForceGraph2D
              graphData={{ nodes: nodes as never[], links: links as never[] }}
              width={dimensions.width}
              height={dimensions.height}
              nodeCanvasObject={paintNode as never}
              nodeCanvasObjectMode={() => 'replace'}
              onNodeClick={handleNodeClick as never}
              linkColor={() => '#d1d5db'}
              linkWidth={1}
              backgroundColor="#f9fafb"
              nodePointerAreaPaint={((node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(node.x ?? 0, node.y ?? 0, 8, 0, 2 * Math.PI)
                ctx.fill()
              }) as never}
            />
          )}
          {loading && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Loading graph...
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <aside className="w-96 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TypeBadge type={selected.type} />
                  <span className="text-xs text-gray-400 font-mono">{selected.projectSlug}</span>
                </div>
                {selected.description && (
                  <p className="text-xs text-gray-600 mt-1">{selected.description}</p>
                )}
                <Link
                  href={`/?file=${encodeURIComponent(selected.filePath)}`}
                  className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                >
                  View in list →
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  code: ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5 text-xs font-mono text-gray-800">{children}</code>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                }}
              >
                {selected.content}
              </ReactMarkdown>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
