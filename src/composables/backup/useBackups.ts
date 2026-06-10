import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { BackupMetadata } from '@/types/backup'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

const API_BASE = '/api/backups'

export function useBackups() {
  const queryClient = useQueryClient()
  const selectedBackupId = ref<string | null>(null)
  const isDownloading = ref(false)

  // Fetch backups list
  const backupsQuery = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/list`)
      if (!response.ok) throw new Error('Failed to fetch backups')
      const data: ApiResponse<BackupMetadata[]> = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to fetch backups')
      return data.data || []
    },
    staleTime: 30000,
  })

  const backups = computed(() => backupsQuery.data.value || [])

  // Create backup
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to create backup')
      const data: ApiResponse<BackupMetadata> = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to create backup')
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })

  // Delete backup
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await fetch(`${API_BASE}/${backupId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete backup')
      const data: ApiResponse = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to delete backup')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })

  // Download backup
  const downloadBackup = async (backupId: string) => {
    try {
      isDownloading.value = true
      const response = await fetch(`${API_BASE}/download/${backupId}`)
      if (!response.ok) throw new Error('Failed to download backup')
      const data: ApiResponse<{ url: string; filename?: string }> = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to download backup')

      const downloadUrl = data.data?.url
      if (!downloadUrl) throw new Error('No download URL provided')

      // Create and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = data.data?.filename || `backup-${backupId}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      isDownloading.value = false
    }
  }

  return {
    backups,
    backupsQuery,
    createBackupMutation,
    deleteBackupMutation,
    selectedBackupId,
    isDownloading,
    downloadBackup,
  }
}
