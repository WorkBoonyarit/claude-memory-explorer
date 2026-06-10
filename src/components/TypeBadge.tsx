import type { MemoryType } from '@/types/memory'

const badgeStyles: Record<MemoryType, string> = {
  user: 'bg-blue-100 text-blue-700',
  feedback: 'bg-orange-100 text-orange-700',
  project: 'bg-green-100 text-green-700',
  reference: 'bg-purple-100 text-purple-700',
  unknown: 'bg-gray-100 text-gray-600',
}

interface TypeBadgeProps {
  type: MemoryType
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badgeStyles[type]}`}>
      {type}
    </span>
  )
}
