export interface BackupMetadata {
  id: string
  createdAt: string
  size: number
  status: 'success' | 'failed' | 'pending'
  filename?: string
}
