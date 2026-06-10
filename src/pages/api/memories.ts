import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Memory, MemoryType } from '@/types/memory'

function findMemoryFiles(dir: string, insideMemoryDir = false): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results

  const isMemoryDir = insideMemoryDir || path.basename(dir) === 'memory'

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findMemoryFiles(fullPath, isMemoryDir))
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      entry.name !== 'MEMORY.md' &&
      isMemoryDir
    ) {
      results.push(fullPath)
    }
  }
  return results
}

function projectSlugFromPath(filePath: string): string {
  const home = process.env.HOME || '~'
  const globalMemoryDir = path.join(home, '.claude', 'memory')
  if (filePath.startsWith(globalMemoryDir)) return 'global'

  const claudeProjectsDir = path.join(home, '.claude', 'projects')
  const relative = path.relative(claudeProjectsDir, filePath)
  return relative.split(path.sep)[0] || 'unknown'
}

function parseMemoryType(raw: unknown): MemoryType {
  const valid: MemoryType[] = ['user', 'feedback', 'project', 'reference']
  if (typeof raw === 'string' && valid.includes(raw as MemoryType)) {
    return raw as MemoryType
  }
  return 'unknown'
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Memory[] | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const home = process.env.HOME || '~'
    const claudeProjectsDir = path.join(home, '.claude', 'projects')
    const globalMemoryDir = path.join(home, '.claude', 'memory')

    const files = [
      ...findMemoryFiles(globalMemoryDir),
      ...findMemoryFiles(claudeProjectsDir),
    ]

    const memories: Memory[] = files.map((filePath) => {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)

      const name: string = data.name ?? path.basename(filePath, '.md')
      const description: string = data.description ?? ''
      const type = parseMemoryType(data.metadata?.type)
      const projectSlug = projectSlugFromPath(filePath)

      return { name, description, type, projectSlug, filePath, content: content.trim() }
    })

    res.status(200).json(memories)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
