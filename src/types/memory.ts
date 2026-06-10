export type MemoryType = 'user' | 'feedback' | 'project' | 'reference' | 'unknown'

export interface Memory {
  name: string
  description: string
  type: MemoryType
  projectSlug: string
  filePath: string
  content: string
}
