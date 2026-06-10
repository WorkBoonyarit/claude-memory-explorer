const SKIP_DIRS = new Set(['Documents', 'Desktop', 'Downloads', 'Projects', 'Code', 'dev', 'src', 'repos', 'workspace', 'work'])

export function getProjectLabel(slug: string, allSlugs: string[]): string {
  if (slug === 'global') return 'Global (~/.claude/memory)'
  const common = allSlugs.reduce((acc, s) => {
    let i = 0
    while (i < acc.length && i < s.length && acc[i] === s[i]) i++
    return acc.slice(0, i)
  }, allSlugs[0] ?? '')

  const remaining = (slug.startsWith(common) ? slug.slice(common.length) : slug).replace(/^-/, '')
  if (!remaining) return '~'

  const parts = remaining.split('-')
  while (parts.length > 1 && SKIP_DIRS.has(parts[0])) parts.shift()
  return parts.join('-') || '~'
}
