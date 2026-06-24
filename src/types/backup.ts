import type { Response } from './response'

export interface BackupMetadata {
  id: string
  filename: string
  size: number
  durationSeconds: number
  createdAt: string
}

export type BackupURLResponse = Response<{ url: string }>

export type BackupCleanupResponse = Response<{
  deletedCount: number
  retentionDays: number
}>

export type BackupListResponse = Response<BackupMetadata[]>
export type BackupMetadataResponse = Response<BackupMetadata>
