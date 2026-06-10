import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export interface ClaudeMdEntry {
  slug: string
  filePath: string
  content: string
  isGlobal: boolean
}

function slugFromDir(dirPath: string): string {
  return dirPath.replace(/\//g, '-')
}

// Resolve @filename references relative to the file's directory
function resolveContent(filePath: string, content: string): string {
  const dir = path.dirname(filePath)
  return content.replace(/^@(.+)$/gm, (_, ref) => {
    const refPath = path.join(dir, ref.trim())
    if (fs.existsSync(refPath)) {
      return fs.readFileSync(refPath, 'utf-8').trim()
    }
    return `<!-- @${ref.trim()} not found -->`
  })
}

function scanForClaudeMd(baseDir: string, maxDepth: number): string[] {
  const results: string[] = []
  if (!fs.existsSync(baseDir)) return results

  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return
    let entries: fs.Dirent[]
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full, depth + 1)
      } else if (entry.isFile() && entry.name === 'CLAUDE.md') {
        results.push(full)
      }
    }
  }

  walk(baseDir, 0)
  return results
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ClaudeMdEntry[] | { error: string }>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const home = process.env.HOME || '~'
    const entries: ClaudeMdEntry[] = []

    // Global ~/.claude/CLAUDE.md
    const globalPath = path.join(home, '.claude', 'CLAUDE.md')
    if (fs.existsSync(globalPath)) {
      const raw = fs.readFileSync(globalPath, 'utf-8')
      entries.push({
        slug: 'global',
        filePath: globalPath,
        content: resolveContent(globalPath, raw),
        isGlobal: true,
      })
    }

    // Scan ~/Documents up to depth 3 for CLAUDE.md files
    const docsDir = path.join(home, 'Documents')
    const found = scanForClaudeMd(docsDir, 3)

    for (const filePath of found) {
      const dir = path.dirname(filePath)
      const slug = slugFromDir(dir)
      const raw = fs.readFileSync(filePath, 'utf-8')
      entries.push({
        slug,
        filePath,
        content: resolveContent(filePath, raw),
        isGlobal: false,
      })
    }

    res.status(200).json(entries)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
